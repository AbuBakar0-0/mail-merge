"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

function CreateCampaign() {
  const [campaignName, setCampaignName] = useState("");
  const [accountsList, setAccountsList] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [progress, setProgress] = useState(0); // Added progress state
  const [isSending, setIsSending] = useState(false); // Added sending status
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    files: [],
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const { data: accounts, error: accountsError } = await supabase
          .from("accounts_list")
          .select("id, name").eq("user_id",localStorage.getItem("user_id"));

        const { data: templates, error: templatesError } = await supabase
          .from("templates")
          .select("id, name, content").eq("user_id",localStorage.getItem("user_id"));

        if (accountsError) throw accountsError;
        if (templatesError) throw templatesError;

        setAccountsList(accounts || []);
        setTemplates(templates || []);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load data.");
      }
    };

    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "files" && files) {
      const fileArray = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        files: fileArray,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedAccount || !selectedTemplate) {
      return toast.error("All fields are required!");
    }

    try {
      setIsSending(true);
      setProgress(0);
      toast.loading("Starting campaign...");

      const { data: emails, error: emailsError } = await supabase
        .from("list_emails")
        .select("*")
        .eq("accounts_list_id", parseInt(selectedAccount));

      if (emailsError) throw emailsError;
      if (!emails || emails.length === 0) {
        setIsSending(false);
        toast.dismiss();
        return toast.error("No emails found for the selected account list.");
      }

      const template = templates.find(
        (t) => t.id === parseInt(selectedTemplate)
      );
      if (!template) {
        setIsSending(false);
        toast.dismiss();
        return toast.error("Template not found.");
      }

      const { data: hosting, error: hostingError } = await supabase
        .from("users")
        .select("*")
        .eq("id", localStorage.getItem("user_id"))
        .single();
      if (hostingError) throw hostingError;

      toast.dismiss();
      toast.success("Campaign started!");

      for (let i = 0; i < emails.length; i++) {
        const body = template.content.replaceAll(
          "{{full_name}}",
          emails[i].full_name
        );
        await sendEmail({
          subject: template.name,
          body: body,
          to: emails[i].email,
          host: hosting.host,
          sender_email: hosting.sender_email,
          sender_password: hosting.sender_password,
        });

        setProgress(((i + 1) / emails.length) * 100); // Update progress
      }

      toast.success("All emails sent successfully!");
      setIsSending(false);
    } catch (error) {
      setIsSending(false);
      toast.dismiss();
      toast.error("Error starting campaign.");
      console.error("Error:", error);
    }
  };

  const sendEmail = async ({
    subject,
    body,
    to,
    host,
    sender_email,
    sender_password,
  }) => {
    try {
      const form = new FormData();

      form.append("subject", subject);
      form.append("body", body);
      form.append("to", to);
      form.append("host", host);
      form.append("sender_email", sender_email);
      form.append("sender_password", sender_password);

      formData.files.forEach((file) => {
        form.append("files", file);
      });

      const response = await fetch("/api/sendEmail", {
        method: "POST",
        body: form,
      });

      if (!response.ok) throw new Error("Failed to send email");
    } catch (error) {
      toast.error("Failed to send some emails");
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex flex-col justify-start items-center gap-4">
      <div className="w-full flex flex-row justify-between items-center">
        <h1 className="w-full text-left text-3xl font-semibold">Bulker</h1>
        <Button className="text-white" asChild>
          <Link href="/Settings">Configure Server</Link>
        </Button>
      </div>

      <div className="w-full flex flex-wrap justify-between items-center gap-4">
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="w-full border rounded-md p-2"
        >
          <option value="">Select Accounts List</option>
          {accountsList.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>

        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="w-full border rounded-md p-2"
        >
          <option value="">Select Template</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>

        <div>
          <label className="block text-sm font-medium mb-2">
            Attachments
            <input
              type="file"
              name="files"
              onChange={handleChange}
              ref={fileInputRef}
              multiple
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </label>
        </div>

        <Button onClick={handleSubmit} className="text-white" disabled={isSending}>
          {isSending ? "Sending..." : "Send Emails"}
        </Button>
      </div>

      {isSending && (
        <div className="w-full mt-4">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center mt-2">{Math.round(progress)}% Completed</p>
        </div>
      )}
    </div>
  );
}

export default CreateCampaign;
