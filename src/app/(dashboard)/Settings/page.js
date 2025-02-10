"use client";

import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import bcrypt from "bcryptjs";

export default function Settings() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    host: "",
    sender_email: "",
    sender_password: "",
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingMail, setLoadingMail] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();
      if (error) {
        console.error("Error fetching data:", error);
        return;
      }
      setFormData((prev) => ({ ...prev, ...data }));
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setLoadingProfile(false);
      return;
    }

    let updatedData = {
      full_name: formData.full_name,
      email: formData.email,
    };

    if (formData.password) {
      updatedData.password = await bcrypt.hash(formData.password, 10);
    }

    const { error } = await supabase.from("users").update(updatedData).eq("id", userId);

    if (error) {
      toast.error("Error updating profile. Please try again.");
      console.error("Update Error:", error);
    } else {
      toast.success("Profile updated successfully.");
    }
    setLoadingProfile(false);
  };

  const updateMailingSettings = async (e) => {
    e.preventDefault();
    setLoadingMail(true);

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setLoadingMail(false);
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({
        host: formData.host,
        sender_email: formData.sender_email,
        sender_password: formData.sender_password,
      })
      .eq("id", userId);

    if (error) {
      toast.error("Error updating mailing settings. Please try again.");
      console.error("Update Error:", error);
    } else {
      toast.success("Mailing settings updated successfully.");
    }
    setLoadingMail(false);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold text-left">User Profile</h2>
      <form onSubmit={updateProfile} className="mt-4">
        <div className="mb-4">
          <label className="block text-gray-600">Full Name</label>
          <Input type="text" name="full_name" value={formData.full_name || ""} onChange={handleChange} placeholder="Full Name" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600">Email</label>
          <Input type="email" name="email" value={formData.email || ""} onChange={handleChange} placeholder="name@company.com" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600">Password</label>
          <Input type="password" name="password" value={formData.password || ""} onChange={handleChange} placeholder="New Password" />
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600" disabled={loadingProfile}>
          {loadingProfile ? "Updating..." : "Update Profile"}
        </button>
      </form>

      <h2 className="text-2xl font-semibold text-left mt-8">Mailing Server Settings</h2>
      <hr className="my-4" />
      <form onSubmit={updateMailingSettings}>
        <div className="mb-4">
          <label className="block text-gray-600">Mailing Server</label>
          <Input type="text" name="host" value={formData.host || ""} onChange={handleChange} placeholder="Mailing Server" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600">Sender Email</label>
          <Input type="email" name="sender_email" value={formData.sender_email || ""} onChange={handleChange} placeholder="Sender Email" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600">Sender Password</label>
          <Input type="password" name="sender_password" value={formData.sender_password || ""} onChange={handleChange} placeholder="Sender Password" />
        </div>

        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600" disabled={loadingMail}>
          {loadingMail ? "Updating..." : "Update Mailing Settings"}
        </button>
      </form>
    </div>
  );
}