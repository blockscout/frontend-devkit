#!/bin/bash

# Compile-on-run wrapper for the doc-link checker.
# Checks the repository the command is run in; resolves its own location, so it works from a
# submodule at any depth.
#
# Usage: <path-to-devkit>/tools/doc-links/run.sh

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(git rev-parse --show-toplevel)"

# The TypeScript compiler is the consumer's: this repository ships no node_modules.
"$ROOT/node_modules/.bin/tsc" -p "$DIR/tsconfig.json"
node "$DIR/dist/index.js" "$@"
