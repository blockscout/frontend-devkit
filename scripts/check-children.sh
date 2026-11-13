#!/bin/sh

# Fails when the children block in .gitignore or .ignore disagrees with children.txt.
# .gitignore keeps each child out of home's history; .ignore lets search from the home root reach it,
# since ripgrep (Claude Code's Grep and Glob) otherwise skips gitignored paths.

set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
marker='# Children, as listed in children.txt (npm run lint:children)'
children=$("$root/scripts/children.sh")
names=$(printf '%s\n' "$children" | cut -d ' ' -f 1)
status=0

# The block is the lines after the marker, up to the next blank line.
block() {
  awk -v marker="$marker" '$0 == marker { on = 1; next } on && NF == 0 { exit } on { print }' "$1"
}

check() {
  file=$1 prefix=$2
  expected=$(printf '%s\n' "$names" | awk -v prefix="$prefix" '{ print prefix "/" $0 "/" }')
  if [ "$(block "$root/$file")" != "$expected" ]; then
    printf '%s: the children block does not match children.txt. Expected:\n\n%s\n%s\n\n' "$file" "$marker" "$expected" >&2
    status=1
  fi
}

check .gitignore ''
check .ignore '!'

[ "$status" -eq 0 ] && echo "children: .gitignore and .ignore match children.txt"
exit "$status"
