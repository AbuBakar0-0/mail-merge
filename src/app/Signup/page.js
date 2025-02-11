"use client";

import { signup } from "@/actions/auth/signup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import bcrypt from "bcryptjs"; // For hashing passwords
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaFacebook } from "react-icons/fa";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false); // Track signup status

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validate email format
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSignup = async () => {
    const { full_name, email, password } = formData;

    // Basic Validation
    if (!full_name || !email || !password) {
      toast.error("All fields are required!");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Invalid email format!");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    setLoading(true); // Start loading

    try {
      // Hash the password before sending
      const hashedPassword = await bcrypt.hash(password, 10);

      // Call signup API
      const response = await signup(full_name, email, hashedPassword);
      if (response == "User registered successfully!") {
        toast.success("Signup successful! Please check your email.");
        router.push("/");
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <>
      <div className="w-full h-screen bg-gradient-to-br from-primary to-secondary flex justify-center items-center">
        <div className="w-1/3 flex flex-col justify-between items-center gap-4 bg-white rounded-lg shadow-xl p-10">
          <div className="w-full flex flex-col gap-4 justify-center items-center">
            <h1 className="text-3xl font-semibold">Signup</h1>
            <Input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Full Name"
            />
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
            />
            <Button
              variant="outline"
              className="bg-gradient-to-tl from-primary to-secondary text-white rounded-full w-full hover:text-white py-5"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Signing up..." : "SIGNUP"}
            </Button>
            <div className="bg-gray-400 w-full h-[1px]" />
          </div>
          <div>
            <Link href="/" className="text-gray-600">
              SIGNIN
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
