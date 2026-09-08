#!/usr/bin/env bash
# ============================================================================
# Everything that must pass before a push.
#
#     make ci-local          (or: bash scripts/local_ci.sh)
#
# Ordered so the cheapest check fails first. The four greps below run in under a
# second, so a boundary violation or a hex colour is reported long before the
# slow typecheck and build. CI runs this same script, then adds a production
# build — so a green run here means a green pull request, and a red pull request
# costs four minutes to learn what one minute would have told you.
#
# It does not stop at the first failure. Being told about three problems in one
# run beats three round trips.
# ============================================================================
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

GREEN=$'\033[0;32m'; RED=$'\033[0;31m'; BOLD=$'\033[1m'; NC=$'\033[0m'

failed=()

step() { # label  command...
  local label="$1"; shift
  printf '%s\n' "▸ ${label}"
  if "$@" > /tmp/evolve-web-ci.log 2>&1; then
    echo "  ${GREEN}✓ ${label}${NC}"
  else
    echo "  ${RED}✗ ${label}${NC}"
    sed 's/^/    /' /tmp/evolve-web-ci.log
    failed+=("$label")
  fi
}

echo "${BOLD}Local CI${NC}"

# Fast greps first.
step "Secrets"        bash scripts/secret_guard.sh
step "Boundaries"     bash scripts/boundary_guard.sh
step "Design tokens"  bash scripts/design_token_guard.sh
step "Component size" bash scripts/component_size_guard.sh

# Then the slow ones.
step "Format and lint" pnpm lint
step "Typecheck"       pnpm typecheck

echo
if [ ${#failed[@]} -eq 0 ]; then
  echo "${GREEN}${BOLD}All checks passed.${NC} Push it."
  exit 0
fi

echo "${RED}${BOLD}${#failed[@]} check(s) failed:${NC}"
printf '  - %s\n' "${failed[@]}"
echo
echo "Most formatting and import-order problems fix themselves:  pnpm lint:fix"
exit 1
