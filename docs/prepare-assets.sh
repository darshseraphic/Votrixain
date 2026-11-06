#!/usr/bin/env sh
set -eu

# Run this script from the Votrixain repository root after adding the website files.
# It copies the original extension logo byte-for-byte into the website assets folder.
if [ ! -f "icons/logo.svg" ]; then
  echo "Error: icons/logo.svg was not found. Run this from the Votrixain repository root." >&2
  exit 1
fi
mkdir -p assets
cp icons/logo.svg assets/logo.svg
echo "Copied icons/logo.svg to assets/logo.svg"
