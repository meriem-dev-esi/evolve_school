import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Two middlewares, composed in one place.
 *
 * Order matters and is not arbitrary. The i18n middleware may answer with a
 * redirect (`/disciplines` → `/fr/disciplines`); the Supabase session refresh
 * then sets its cookies on whatever response that produced. Run them the other
 * way around and the refreshed auth cookies are attached to a response that is
 * thrown away by the redirect, so the user is signed out by navigating.
 */
const handleI18n = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = handleI18n(request);
  return await updateSession(request, response);
}

export const config = {
  matcher: [
    // Everything except Next internals and static files.
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
