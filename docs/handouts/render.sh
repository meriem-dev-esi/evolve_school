#!/usr/bin/env bash
# Render the handouts to PDF.
#
#     bash docs/handouts/render.sh
#
# The HTML is the source and is tracked; the PDFs are output and are gitignored,
# for the same reason the docs repository does it — a binary in git diffs as "a
# binary changed", so the two copies drift and nobody can tell which is current.
# Re-render before you hand one out.
#
# Uses headless Chrome, which is the only thing on a standard Mac that renders
# CSS paged media properly. `--no-pdf-header-footer` suppresses the browser's
# own URL-and-date furniture, which otherwise prints on every page.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
if [ ! -x "$CHROME" ]; then
  echo "Chrome not found at: $CHROME" >&2
  echo "Set CHROME=/path/to/chrome and run again." >&2
  exit 1
fi

for doc in intern-handbook manager-brief; do
  "$CHROME" --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
    --print-to-pdf="${doc}.pdf" "file://$PWD/${doc}.html" 2>/dev/null
  echo "✓ ${doc}.pdf"
done
