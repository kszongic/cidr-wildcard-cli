# @kszongic/cidr-wildcard-cli

[![npm version](https://img.shields.io/npm/v/@kszongic/cidr-wildcard-cli)](https://www.npmjs.com/package/@kszongic/cidr-wildcard-cli)
[![license](https://img.shields.io/npm/l/@kszongic/cidr-wildcard-cli)](./LICENSE)

Convert between CIDR notation, subnet masks, and wildcard masks from the command line. Zero dependencies.

## Install

```bash
npm install -g @kszongic/cidr-wildcard-cli
```

## Usage

```bash
# From CIDR notation (full network info)
cidr-wildcard 192.168.1.0/24
# Prefix:    /24
# Subnet:    255.255.255.0
# Wildcard:  0.0.0.255
# Hosts:     254
# Network:   192.168.1.0
# Broadcast: 192.168.1.255
# First:     192.168.1.1
# Last:      192.168.1.254

# From prefix length
cidr-wildcard /16
# Prefix:    /16
# Subnet:    255.255.0.0
# Wildcard:  0.0.255.255
# Hosts:     65534

# From subnet mask
cidr-wildcard 255.255.252.0
# Prefix:    /22
# Subnet:    255.255.252.0
# Wildcard:  0.0.3.255
# Hosts:     1022

# From wildcard mask
cidr-wildcard 0.0.0.31
# Prefix:    /27
# Subnet:    255.255.255.224
# Wildcard:  0.0.0.31
# Hosts:     30

# JSON output
cidr-wildcard 10.0.0.0/8 --json
```

## Options

| Flag | Description |
|------|-------------|
| `-h, --help` | Show help |
| `-v, --version` | Show version |
| `-j, --json` | Output as JSON |

## License

MIT © kszongic
