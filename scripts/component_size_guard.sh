#!/usr/bin/env bash
# ============================================================================
# No component or page file over 300 lines.
#
# The number is arbitrary; having a number is not. A 700-line page component is
# not reviewable — a reviewer skims it, approves it, and the defect ships. It is
# also unmergeable when two people touch it in the same sprint, which with four
# people working in one app is most sprints.
#
# The fix is always the same and always available: pull a section out into
# components/. If a file is 310 lines of genuinely irreducible markup, say so in
# the pull request and raise the limit in the same diff. What is not allowed is
# an exemption list that grows quietly.
# ============================================================================
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

RED=$'\033[0;31m'; YELLOW=$'\033[0;33m'; NC=$'\033[0m'
LIMIT=300
WARN=250
fail=0

while IFS= read -r file; do
  lines=$(wc -l < "$file" | tr -d ' ')
  if [ "$lines" -gt "$LIMIT" ]; then
    echo "${RED}[SIZE] $file — $lines lines (limit $LIMIT)${NC}"
    fail=1
  elif [ "$lines" -gt "$WARN" ]; then
    echo "${YELLOW}[SIZE] $file — $lines lines, approaching the $LIMIT limit${NC}"
  fi
done < <(find app components -name '*.tsx' -type f 2>/dev/null)

exit $fail
