#!/bin/sh

# Clones every child listed in children.txt that is missing from this home clone.
# A child already present is left as it is, so a second run changes nothing.

set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
children=$("$root/scripts/children.sh")

printf '%s\n' "$children" | while read -r name url; do
  dest="$root/$name"
  if [ -e "$dest/.git" ]; then
    echo "$name: present"
  elif [ -e "$dest" ]; then
    echo "$name: $dest exists but is not a git clone; move it aside and run again" >&2
    exit 1
  else
    echo "$name: cloning $url"
    git clone "$url" "$dest"
  fi
done
