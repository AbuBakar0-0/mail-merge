import { supabase } from "@/lib/supabase";

export async function addTemplate(user_id, name, content) {

  // Validate input
  if (!name || !content) {
    console.error("Template name and content are required.");
    return { success: false, error: "Template name and content are required." };
  }

  // Insert new template into the database
  const { data, error } = await supabase
    .from("templates")
    .insert([
      {
        user_id: user_id,
        name: name,
        content: content,
      },
    ])
    .single(); // .single() returns a single object instead of an array

  if (error) {
    console.error("Error adding template:", error);
    return { success: false, error: error.message };
  }

  // Return the added template data if successful
  return {
    success: true,
    template: data,
  };
}
