#!/usr/bin/env bash
# ============================================================================
# Fails if a live credential is about to enter the repository.
#
# This repository has never carried one, and the point of this guard is to keep
# that true. Rotation cleans up an exposure; only a gate stops the next one. The
# moment a secret reaches a shared branch it has to be rotated whether or not
# anybody noticed, so the cheap place to catch it is before the push.
#
#     bash scripts/secret_guard.sh
#
# Scans *tracked* files only. Untracked work in progress is your own business;
# what matters is what git is carrying.
#
# The Supabase anon key is deliberately NOT a finding. It is compiled into the
# JavaScript bundle by design and is protected by row-level security rather than
# by secrecy. A guard that flagged it would be switched off inside a week, and
# then it would protect nothing. What it looks for is the service-role key,
# which bypasses RLS entirely and must never be in this app at all.
# ============================================================================
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

RED=$'\033[0;31m'; NC=$'\033[0m'

# Files that legitimately describe secrets without containing any.
EXCLUDE_RE='^(\.env\.example|scripts/secret_guard\.sh|CONTRIBUTING\.md|docs/)'

# name=<32+ chars> where the name itself says it is a secret. The length floor
# is what separates a real key from `AUTH_CALLBACK_PATH=/auth/callback`.
#
# The whitespace before `[:=]` is load-bearing and was missing at first. This
# pattern was carried over from a repository of JSON and Dart, where an
# assignment is written tight (`"key":"value"`). TypeScript is not: `const
# SERVICE_ROLE_KEY = "..."` has spaces around the `=`, so every assignment this
# guard exists to catch slipped straight past it. Found by planting one.
ASSIGNMENT_RE='(SECRET|TOKEN|PASSWORD|PRIVATE_KEY|SERVICE_ROLE|API_KEY)[A-Z_]*["'"'"']?[[:space:]]*[:=][[:space:]]*["'"'"']?[A-Za-z0-9+/_-]{32,}'

# Vendor-shaped credentials, unambiguous wherever they appear. The last branch
# is a JWT whose payload declares the service_role, raw or base64-encoded.
VENDOR_RE='(sb_secret_[A-Za-z0-9_-]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]*(service_role|c2VydmljZV9yb2xl))'

fail=0

scan() { # description regex
  local description="$1" regex="$2" hits
  hits=$(git grep -I -n -E "$regex" -- . 2>/dev/null | grep -Ev "$EXCLUDE_RE" || true)
  if [ -n "$hits" ]; then
    echo "${RED}[SECRET-GUARD] $description${NC}"
    # The matched value is deliberately not printed. Echoing it into a CI log
    # would leak the thing being caught into a second place.
    echo "$hits" | sed -E 's/:([0-9]+):.*/:\1/' | sort -u | sed 's/^/  /'
    fail=1
  fi
}

scan "A variable named like a secret is assigned a long literal" "$ASSIGNMENT_RE"
scan "A vendor-shaped credential is present" "$VENDOR_RE"

# `.env.local` holds the real values and must never be tracked. Checking the
# index rather than the filesystem: the file existing is correct, the file being
# staged is the failure.
if git ls-files --error-unmatch .env.local >/dev/null 2>&1; then
  echo "${RED}[SECRET-GUARD] .env.local is tracked by git${NC}"
  echo "  Run: git rm --cached .env.local"
  fail=1
fi

exit $fail
