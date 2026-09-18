#!/usr/bin/env bash
# ============================================================================
# Keeps raw colours out of the markup.
#
# The tokens in app/globals.css only stay useful if new code uses them. A linter
# cannot express "#84cc16 should have been text-brand", so this greps for the
# specific shapes that have a token.
#
# The rule earns its keep from a real incident: the previous site had the brand
# lime written as a literal in eleven files, and changing it meant finding all
# eleven. With tokens, a rebrand is a one-file diff.
#
# It is intentionally narrow — it flags hex colours and arbitrary-value colour
# classes, not every number in the codebase. A guard that cries wolf gets
# switched off, and then it protects nothing. If it blocks you and the rule is
# wrong, change the rule in the same pull request and say why in the PR body.
# Do not add a quiet exemption.
# ============================================================================
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

RED=$'\033[0;31m'; NC=$'\033[0m'
fail=0

report() {
  echo "${RED}[DESIGN-TOKENS] $1${NC}"
  fail=1
}

# globals.css is where the tokens are defined rather than used, so it is the one
# file allowed to contain a hex colour.
SCAN=(app components --include=*.tsx --include=*.ts)

# A hex colour anywhere in the markup.
hits=$(grep -rnE '#[0-9a-fA-F]{3,8}\b' "${SCAN[@]}" 2>/dev/null || true)
if [ -n "$hits" ]; then
  report "Hex colour in markup — add a token to app/globals.css and use it"
  echo "$hits" | sed 's/^/  /'
fi

# Tailwind arbitrary values for colour, e.g. `bg-[#84cc16]` or `text-[rgb(...)]`.
hits=$(grep -rnE '(bg|text|border|fill|stroke|ring|shadow)-\[' "${SCAN[@]}" 2>/dev/null || true)
if [ -n "$hits" ]; then
  report "Tailwind arbitrary value — use a token class instead"
  echo "$hits" | sed 's/^/  /'
fi

# Physical direction properties break Arabic. `pl-4` stays on the left when the
# page flips; `ps-4` follows the reading direction. This is the single most
# common RTL bug and it is invisible unless you load the Arabic page.
hits=$(grep -rnE '\b(class|className)="[^"]*\b(p|m)(l|r)-[0-9]' "${SCAN[@]}" 2>/dev/null || true)
if [ -n "$hits" ]; then
  report "Physical padding/margin (pl-/pr-/ml-/mr-) breaks RTL — use ps-/pe-/ms-/me-"
  echo "$hits" | sed 's/^/  /'
fi

exit $fail
