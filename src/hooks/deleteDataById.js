import { supabase } from "@/lib/supabase";

export const deleteDataById = async ({ table_name, id }) => {
  // Delete template from the database
  const { data, error } = await supabase
    .from(table_name)
    .delete()
    .eq("id", id)
    .single(); // .single() ensures we handle one row (template)

  if (error) {
    console.error("Error deleting Data:", error);
    return { success: false, error: error.message };
  }

  // Return success message if deletion is successful
  return {
    success: true,
    message: "Data deleted successfully",
  };
};
