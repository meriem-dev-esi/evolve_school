import { createClient } from "@/lib/supabase/server";
export interface Discipline {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
}

export async function getDisciplines(): Promise<Discipline[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, description, image_url")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Could not read disciplines: ${error.message}`);
  }

  return (data ?? []).map((category: {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}) => ({
    id: category.id,
    title: category.name,
    description: category.description,
    image_url: category.image_url,
  }));
}