import { supabase } from "@/lib/supabase";

export async function updateTemplate(template_id, name, content) {
  // Validate input
  if (!template_id || !name || !content) {
    console.error("Template ID, name, and content are required.");
    return {
      success: false,
      error: "Template ID, name, and content are required.",
    };
  }

  // Update template in the database
  const { data, error } = await supabase
    .from("templates")
    .update({ name: name, content: content })
    .eq("id", template_id)
    .single(); // .single() returns a single object instead of an array

  if (error) {
    console.error("Error updating template:", error);
    return { success: false, error: error.message };
  }

  // Return the updated template data if successful
  return {
    success: true,
    template: data,
  };
}
