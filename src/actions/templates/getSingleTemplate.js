import { supabase } from "@/lib/supabase";

export async function getTemplate(id) {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching templates:", error);
    return null;
  }

  return data;
}
