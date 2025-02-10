import { supabase } from "@/lib/supabase";

export async function getTemplates(user_id) {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    console.error("Error fetching templates:", error);
    return null;
  }

  return data;
}
