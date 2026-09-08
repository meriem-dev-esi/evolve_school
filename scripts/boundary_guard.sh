#!/usr/bin/env bash
# ============================================================================
# The dependency rule, as four greps.
#
# The shape this repository holds:
#
#     app/         routes and pages       may import components/ and lib/
#     components/  presentation           may import lib/, never app/
#     lib/         data and plumbing      imports neither
#
# Each check below exists because breaking it produces a bug that is hard to
# trace back to the import that caused it. The reasons are on each one.
# ============================================================================
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

RED=$'\033[0;31m'; NC=$'\033[0m'
fail=0

report() {
  echo "${RED}[BOUNDARY] $1${NC}"
  fail=1
}

check() { # description  grep-pattern  paths...
  local description="$1" pattern="$2"; shift 2
  local hits
  hits=$(grep -rnE "$pattern" "$@" --include=*.ts --include=*.tsx 2>/dev/null || true)
  if [ -n "$hits" ]; then
    report "$description"
    echo "$hits" | sed 's/^/  /'
  fi
}

# 1. lib/ is the bottom of the stack. A data function importing a component is
#    the beginning of a cycle, and the symptom is a build error three files away.
check "lib/ imports a component — the dependency rule points the other way" \
  '^import .* from "@/(components|app)/' lib

# 2. Supabase is reached through lib/supabase, never constructed ad hoc. A
#    second client built in a component gets its own cookie handling, which is
#    how a page ends up querying as `anon` for a user who is signed in.
check "Supabase client built outside lib/supabase — import from @/lib/supabase" \
  'from "@supabase/(ssr|supabase-js)"' app components

# 3. next/link drops the locale segment, so an Arabic reader is silently moved
#    to the French site by clicking a link. Use the Link from @/i18n/navigation.
check "next/link import — use { Link } from \"@/i18n/navigation\"" \
  'from "next/link"' app components

# 4. process.env outside lib/env.ts. A missing variable read inline is
#    `undefined` at runtime and renders an empty page rather than an error; read
#    through lib/env.ts it throws on import, naming the variable.
hits=$(grep -rn 'process\.env' app components lib --include=*.ts --include=*.tsx 2>/dev/null \
  | grep -v '^lib/env.ts:' || true)
if [ -n "$hits" ]; then
  report "process.env read outside lib/env.ts"
  echo "$hits" | sed 's/^/  /'
fi

# 5. Every data module must declare itself server-only, so importing one from a
#    Client Component is a build error rather than a query shipped to the
#    browser with the anon key attached.
for f in lib/data/*.ts; do
  [ -e "$f" ] || continue
  if ! head -5 "$f" | grep -q 'server-only'; then
    report "$f does not import \"server-only\""
  fi
done

exit $fail
