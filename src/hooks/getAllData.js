import { supabase } from "@/lib/supabase";

export async function getAllData({ table_name, user_id }) {
  const { data, error } = await supabase
    .from(table_name)
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    console.error("Error fetching Data:", error);
    return null;
  }

  return data;
}
