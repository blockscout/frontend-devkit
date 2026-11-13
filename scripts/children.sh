#!/bin/sh

# Prints children.txt as `<name> <url>` lines, one per child, and fails on a malformed list.
# The one parser of the list: every script that needs the children reads them through this one.

set -eu

root=$(cd "$(dirname "$0")/.." && pwd)

awk '
  /^[[:space:]]*(#|$)/ { next }
  NF != 2 { printf "children.txt:%d: expected `<name> <url>`, got: %s\n", NR, $0 > "/dev/stderr"; bad = 1; next }
  $1 !~ /^[a-z0-9][a-z0-9._-]*$/ { printf "children.txt:%d: not a directory name: %s\n", NR, $1 > "/dev/stderr"; bad = 1; next }
  seen[$1]++ { printf "children.txt:%d: listed twice: %s\n", NR, $1 > "/dev/stderr"; bad = 1; next }
  { print $1, $2 }
  END { exit bad }
' "$root/children.txt"
