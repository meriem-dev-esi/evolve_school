import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * The creative disciplines, read from the same Postgres the Flutter dashboard
 * writes to.
 *
 * This is the reference example for every data function in this app. Four
 * things about it are deliberate, and a reviewer should expect to see them
 * repeated:
 *
 *   1. `import "server-only"` — importing this from a Client Component is a
 *      build error rather than a leaked query.
 *   2. The columns are named explicitly. `select("*")` ships columns nobody
 *      renders and quietly changes shape when a migration adds one.
 *   3. There is no permission filter. `categories_select_all` grants select to
 *      `anon` and `authenticated` alike, so the database has already applied
 *      the rule. Restating it here would put it in two places, and the second
 *      one is the one that goes stale.
 *   4. The error is thrown, not swallowed into an empty array. An empty array
 *      renders as "no disciplines yet", which is a sentence about content, not
 *      about a broken connection.
 */

export interface Discipline {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  /** A lucide icon name, e.g. "palette". Written by the dashboard. */
  icon: string | null;
}

export async function getDisciplines(): Promise<Discipline[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, title, slug, description, icon")
    // `ascending: true` is not redundant. postgrest-js defaults it to false,
    // which is how the dashboard's category menu came to open at "Web
    // Development".
    .order("title", { ascending: true });

  if (error) {
    throw new Error(`Could not read disciplines: ${error.message}`);
  }

  return data ?? [];
}
