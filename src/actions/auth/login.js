"use server";

import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs"; // Correct import for bcrypt

export async function login(email, password) {
  try {
    // Validate input
    if (!email || !password) {
      return "Email and password are required!";
    }

    // Retrieve user from the database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError || !userData) {
      return "User Not Found";
    }

    // Compare the password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return "Invalid Password";
    }

    // If authentication is successful, return user details
    return userData;
  } catch (error) {
    return error;
  }
}
