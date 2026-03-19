# cidr-wildcard-cli

[![npm version](https://img.shields.io/npm/v/@kszongic/cidr-wildcard-cli)](https://www.npmjs.com/package/@kszongic/cidr-wildcard-cli)
[![npm downloads](https://img.shields.io/npm/dm/@kszongic/cidr-wildcard-cli)](https://www.npmjs.com/package/@kszongic/cidr-wildcard-cli)
[![license](https://img.shields.io/npm/l/@kszongic/cidr-wildcard-cli)](./LICENSE)
[![node](https://img.shields.io/node/v/@kszongic/cidr-wildcard-cli)](https://nodejs.org)
![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![cross-platform](https://img.shields.io/badge/platform-win%20%7C%20mac%20%7C%20linux-informational)

> Convert between CIDR notation, subnet masks, and wildcard masks from the terminal. **Zero dependencies**, cross-platform.

```
$ cidr-wildcard 10.0.0.0/22
Prefix:    /22
Subnet:    255.255.252.0
Wildcard:  0.0.3.255
Hosts:     1022
Network:   10.0.0.0
Broadcast: 10.0.3.255
First:     10.0.0.1
Last:      10.0.3.254
```

## Why?

- **No more Googling subnet tables.** Get instant CIDR ↔ wildcard ↔ subnet conversions.
- **Accepts any format** — CIDR (`/24`), subnet mask (`255.255.255.0`), wildcard mask (`0.0.0.255`), or full network (`10.0.0.0/8`). It figures out what you gave it.
- **JSON output** for scripting and automation.
- **Zero dependencies** — installs instantly, no supply chain risk.
- **Works everywhere** — Windows, macOS, Linux. No native tools required.

## Install

```bash
npm install -g @kszongic/cidr-wildcard-cli
```

Or use directly with `npx`:

```bash
npx @kszongic/cidr-wildcard-cli 192.168.1.0/24
```

## Usage

```bash
# Full network breakdown from CIDR
cidr-wildcard 192.168.1.0/24
# Prefix:    /24
# Subnet:    255.255.255.0
# Wildcard:  0.0.0.255
# Hosts:     254
# Network:   192.168.1.0
# Broadcast: 192.168.1.255
# First:     192.168.1.1
# Last:      192.168.1.254

# From just a prefix length
cidr-wildcard /16
# Prefix:    /16
# Subnet:    255.255.0.0
# Wildcard:  0.0.255.255
# Hosts:     65534

# From a subnet mask
cidr-wildcard 255.255.252.0
# Prefix:    /22
# Subnet:    255.255.252.0
# Wildcard:  0.0.3.255
# Hosts:     1022

# From a wildcard mask (Cisco ACL style)
cidr-wildcard 0.0.0.31
# Prefix:    /27
# Subnet:    255.255.255.224
# Wildcard:  0.0.0.31
# Hosts:     30

# JSON output for scripting
cidr-wildcard 10.0.0.0/8 --json
```

## Options

| Flag | Description |
|------|-------------|
| `-j, --json` | Output as JSON (pipe to `jq`, use in scripts) |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

## Recipes

### Quick subnet reference

```bash
# Common subnets at a glance
for p in /8 /16 /20 /22 /24 /27 /28 /30 /32; do
  echo "--- $p ---"
  cidr-wildcard $p
done
```

### Cisco ACL wildcard lookup

```bash
# "What wildcard mask do I need for a /22?"
cidr-wildcard /22 --json | jq -r .wildcard
# 0.0.3.255
```

### Validate subnets in a script

```bash
# Check how many hosts a CIDR gives you
HOSTS=$(cidr-wildcard 10.100.0.0/20 --json | jq .hosts)
echo "Subnet has $HOSTS usable hosts"
# Subnet has 4094 usable hosts
```

### Network documentation

```bash
# Generate a quick reference for your VPC ranges
for cidr in 10.0.0.0/16 10.1.0.0/20 10.1.16.0/22 10.1.20.0/24; do
  echo "=== $cidr ==="
  cidr-wildcard "$cidr"
  echo
done > network-ranges.txt
```

### Pipe JSON into other tools

```bash
# Feed into a provisioning script
cidr-wildcard 172.16.0.0/12 --json | jq '{
  network: .network,
  first_ip: .first,
  last_ip: .last,
  capacity: .hosts
}'
```

## Use Cases

- **Network engineers** — quick CIDR/wildcard reference without leaving the terminal
- **DevOps/cloud** — validate VPC, subnet, and firewall CIDR blocks
- **Cisco admins** — convert between subnet masks and wildcard masks for ACLs
- **Students** — learn subnetting with instant visual feedback
- **Scripting** — JSON output makes it easy to integrate into automation pipelines

## How It Works

1. **Detects input type** — prefix length (`/24`), dotted-quad subnet (`255.255.255.0`), wildcard (`0.0.0.255`), or CIDR (`10.0.0.0/24`)
2. **Converts to a 32-bit mask** internally
3. **Derives all fields** — prefix, subnet, wildcard, host count, network/broadcast/first/last addresses
4. Uses only Node.js built-ins (`Buffer`, bitwise math) — no dependencies at all

## Comparison

| Feature | `cidr-wildcard-cli` | `ipcalc` | `sipcalc` | Online calculators |
|---------|---------------------|----------|-----------|-------------------|
| Cross-platform | ✅ | ❌ (Linux) | ❌ (Linux) | ✅ |
| Zero dependencies | ✅ | N/A (system) | N/A (system) | N/A |
| Accepts CIDR | ✅ | ✅ | ✅ | ✅ |
| Accepts wildcard mask | ✅ | ❌ | ❌ | Some |
| Accepts subnet mask | ✅ | ✅ | ✅ | ✅ |
| JSON output | ✅ | ❌ | ❌ | ❌ |
| No install (`npx`) | ✅ | ❌ | ❌ | ✅ |
| Works offline | ✅ | ✅ | ✅ | ❌ |

## Related Tools

- [`@kszongic/checksum-verify-cli`](https://www.npmjs.com/package/@kszongic/checksum-verify-cli) — Verify files against checksums, cross-platform
- [`@kszongic/pwd-entropy-cli`](https://www.npmjs.com/package/@kszongic/pwd-entropy-cli) — Calculate password entropy
- [`@kszongic/string-hash-cli`](https://www.npmjs.com/package/@kszongic/string-hash-cli) — Hash strings from the terminal
- [`@kszongic/bar-chart-cli`](https://www.npmjs.com/package/@kszongic/bar-chart-cli) — Render bar charts in the terminal
- [`@kszongic/env-lint-cli`](https://www.npmjs.com/package/@kszongic/env-lint-cli) — Lint and validate .env files

## License

MIT © kszongic
