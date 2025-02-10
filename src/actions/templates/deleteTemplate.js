import { supabase } from "@/lib/supabase";

export async function deleteTemplate(template_id) {
  // Validate input
  if (!template_id) {
    console.error("Template ID is required.");
    return { success: false, error: "Template ID is required." };
  }

  // Delete template from the database
  const { data, error } = await supabase
    .from("templates")
    .delete()
    .eq("id", template_id)
    .single(); // .single() ensures we handle one row (template)

  if (error) {
    console.error("Error deleting template:", error);
    return { success: false, error: error.message };
  }

  // Return success message if deletion is successful
  return {
    success: true,
    message: "Template deleted successfully",
  };
}
