"use client";

import { login } from "@/actions/auth/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaFacebook } from "react-icons/fa";

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    const { email, password } = formData;

    // Basic validation
    if (!email || !password) {
      toast.error("Email and Password is required ");
      return;
    }

    toast.loading("Logging In");
    const response = await login(email, password);
    toast.dismiss();

    if (response.id != undefined) {
      toast.success("Successfully Logged In");
      Cookies.set("user_id", response.id, { expires: 7 }); // Expires in 7 days
      localStorage.setItem("user_id", response.id);
      router.push("/Dashboard");
    } else {
      toast.error("Error Logging In");
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-primary to-secondary flex justify-center items-center">
      <div className="w-1/3 flex flex-col justify-between items-center gap-4 bg-white rounded-lg shadow-xl p-10">
        <div className="w-full flex flex-col gap-4 justify-center items-center">
          <h1 className="text-3xl font-semibold">Login</h1>
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
          <div className="flex justify-end items-end w-full text-xs text-gray-600">
            Forgot Password?
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="outline"
            className="bg-gradient-to-tl from-primary to-secondary text-white rounded-full w-full hover:text-white py-5"
          >
            {loading ? "Logging in..." : "LOGIN"}
          </Button>
          <div className="bg-gray-400 w-full h-[1px]" />

          {/* <p>Or Sign up Using</p> */}
          {/* <div className="flex flex-row justify-center items-center gap-4">
            <button>
              <img src="/assets/google.png" alt="google" className="w-8 h-8" />
            </button>
            <FaFacebook className="size-8 text-blue-700 " />
          </div> */}
        </div>
        <div>
          <Link href="/Signup" className="text-gray-600">
            SIGNUP
          </Link>
        </div>
      </div>
    </div>
  );
}
