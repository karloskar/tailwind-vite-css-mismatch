#!/usr/bin/env bash
# Check whether SSR bundles reference the same CSS filename that exists in the client output.
# Usage: bash check-hashes.sh [output-dir]
#   output-dir defaults to .output

set -euo pipefail

OUTPUT="${1:-.output}"

# Find the actual client CSS file
CLIENT_CSS=$(find "$OUTPUT/public/assets" -name 'styles-*.css' 2>/dev/null | head -1)
if [ -z "$CLIENT_CSS" ]; then
  echo "SKIP: No styles-*.css found in $OUTPUT/public/assets/"
  exit 0
fi
CLIENT_HASH=$(basename "$CLIENT_CSS")
echo "Client CSS file: $CLIENT_HASH"

# Find CSS references in SSR bundles
SSR_REFS=$(grep -roh '/assets/styles-[^"]*\.css' "$OUTPUT/server/" 2>/dev/null | sort -u || true)
if [ -z "$SSR_REFS" ]; then
  echo "SKIP: No CSS references found in SSR bundles"
  exit 0
fi

MISMATCH=0
while IFS= read -r ref; do
  SSR_HASH=$(basename "$ref")
  if [ "$SSR_HASH" = "$CLIENT_HASH" ]; then
    echo "SSR ref: $ref -> MATCH"
  else
    echo "SSR ref: $ref -> MISMATCH (expected $CLIENT_HASH)"
    MISMATCH=1
  fi
done <<< "$SSR_REFS"

if [ "$MISMATCH" -eq 1 ]; then
  echo ""
  echo "FAIL: CSS hash mismatch between client and SSR bundles"
  exit 1
else
  echo ""
  echo "PASS: All CSS hashes match"
  exit 0
fi
