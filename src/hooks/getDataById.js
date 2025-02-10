import { supabase } from "@/lib/supabase";

export const getDataById = async ({ table_name, id }) => {
  const { data, error } = await supabase
    .from(table_name)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching Data:", error);
    return null;
  }

  return data;
};
