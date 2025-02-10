import { supabase } from "@/lib/supabase";

export async function getEmails(id) {
  const { data, error } = await supabase
    .from("list_emails")
    .select("*")
    .eq("accounts_list_id", id).order("id");

  if (error) {
    console.error("Error fetching templates:", error);
    return null;
  }

  return data;
}
