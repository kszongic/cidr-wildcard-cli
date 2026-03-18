#!/usr/bin/env node
'use strict';

const args = process.argv.slice(2);

function usage() {
  console.log(`Usage: cidr-wildcard <CIDR | prefix-length | subnet-mask | wildcard-mask>

Convert between CIDR prefix length, subnet mask, and wildcard mask.

Examples:
  cidr-wildcard 192.168.1.0/24
  cidr-wildcard /16
  cidr-wildcard 255.255.255.0
  cidr-wildcard 0.0.0.255

Options:
  -h, --help       Show this help message
  -v, --version    Show version
  -j, --json       Output as JSON`);
}

function version() {
  const pkg = require('./package.json');
  console.log(pkg.version);
}

function prefixToSubnet(prefix) {
  if (prefix < 0 || prefix > 32) throw new Error('Prefix must be 0-32');
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return mask;
}

function maskToOctets(mask) {
  return [
    (mask >>> 24) & 0xff,
    (mask >>> 16) & 0xff,
    (mask >>> 8) & 0xff,
    mask & 0xff
  ];
}

function octetsToStr(o) {
  return o.join('.');
}

function isValidMask(mask) {
  // Valid subnet mask: contiguous 1s followed by 0s
  if (mask === 0) return true;
  const inverted = (~mask) >>> 0;
  return (inverted & (inverted + 1)) === 0;
}

function maskToPrefix(mask) {
  let n = mask;
  let count = 0;
  for (let i = 31; i >= 0; i--) {
    if ((n >>> i) & 1) count++;
    else break;
  }
  return count;
}

function parseInput(input) {
  // CIDR notation: x.x.x.x/N
  const cidrMatch = input.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
  if (cidrMatch) {
    const network = cidrMatch[1];
    const prefix = parseInt(cidrMatch[2], 10);
    return { type: 'cidr', network, prefix };
  }

  // Just prefix: /N or N (if 0-32)
  const prefixMatch = input.match(/^\/?(\d{1,2})$/);
  if (prefixMatch) {
    const prefix = parseInt(prefixMatch[1], 10);
    if (prefix >= 0 && prefix <= 32) {
      return { type: 'prefix', prefix };
    }
  }

  // Dotted quad: could be subnet or wildcard
  const quadMatch = input.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (quadMatch) {
    const octets = [1,2,3,4].map(i => parseInt(quadMatch[i], 10));
    if (octets.some(o => o > 255)) throw new Error('Invalid octet (>255)');
    const mask = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;

    if (isValidMask(mask)) {
      return { type: 'subnet', mask };
    }

    // Try as wildcard (invert and check)
    const inverted = (~mask) >>> 0;
    if (isValidMask(inverted)) {
      return { type: 'wildcard', mask: inverted };
    }

    throw new Error(`"${input}" is not a valid subnet or wildcard mask`);
  }

  throw new Error(`Cannot parse input: "${input}"`);
}

function compute(input) {
  const parsed = parseInput(input);
  let prefix, network = null;

  if (parsed.type === 'cidr') {
    prefix = parsed.prefix;
    network = parsed.network;
  } else if (parsed.type === 'prefix') {
    prefix = parsed.prefix;
  } else {
    // subnet or wildcard — mask is already the subnet mask
    prefix = maskToPrefix(parsed.mask);
  }

  const subnetInt = prefixToSubnet(prefix);
  const wildcardInt = (~subnetInt) >>> 0;
  const subnet = octetsToStr(maskToOctets(subnetInt));
  const wildcard = octetsToStr(maskToOctets(wildcardInt));
  const hosts = prefix === 32 ? 1 : prefix === 31 ? 2 : Math.pow(2, 32 - prefix) - 2;

  const result = { prefix, subnet, wildcard, hosts };
  if (network) {
    result.network = network;
    // Calculate network address, broadcast, first/last usable
    const octets = network.split('.').map(Number);
    const ipInt = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
    const netAddr = (ipInt & subnetInt) >>> 0;
    const broadcast = (netAddr | wildcardInt) >>> 0;
    result.networkAddress = octetsToStr(maskToOctets(netAddr));
    result.broadcast = octetsToStr(maskToOctets(broadcast));
    if (prefix <= 30) {
      result.firstUsable = octetsToStr(maskToOctets(netAddr + 1));
      result.lastUsable = octetsToStr(maskToOctets(broadcast - 1));
    }
  }

  return result;
}

// Main
const jsonMode = args.includes('-j') || args.includes('--json');
const filtered = args.filter(a => a !== '-j' && a !== '--json' && a !== '-h' && a !== '--help' && a !== '-v' && a !== '--version');

if (args.includes('-h') || args.includes('--help') || filtered.length === 0) {
  usage();
  process.exit(filtered.length === 0 && !args.includes('-h') && !args.includes('--help') ? 1 : 0);
}

if (args.includes('-v') || args.includes('--version')) {
  version();
  process.exit(0);
}

try {
  const result = compute(filtered[0]);

  if (jsonMode) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Prefix:    /${result.prefix}`);
    console.log(`Subnet:    ${result.subnet}`);
    console.log(`Wildcard:  ${result.wildcard}`);
    console.log(`Hosts:     ${result.hosts}`);
    if (result.network) {
      console.log(`Network:   ${result.networkAddress}`);
      console.log(`Broadcast: ${result.broadcast}`);
      if (result.firstUsable) {
        console.log(`First:     ${result.firstUsable}`);
        console.log(`Last:      ${result.lastUsable}`);
      }
    }
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
