import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware replacements for Next's navigation primitives.
 *
 * Import `Link` from here, never from `next/link`. Next's own `Link` drops the
 * locale segment, so a visitor reading the Arabic site is silently moved to the
 * French one by clicking a link. `scripts/boundary_guard.sh` fails the build on
 * a `next/link` import for exactly that reason.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
