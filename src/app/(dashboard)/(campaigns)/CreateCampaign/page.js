"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function CreateCampaign() {
  const [campaignName, setCampaignName] = useState("");
  const [accountsList, setAccountsList] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const { data: accounts, error: accountsError } = await supabase
          .from("accounts_list")
          .select("id, name");

        const { data: templates, error: templatesError } = await supabase
          .from("templates")
          .select("*");

        if (accountsError || templatesError) {
          console.error("Error fetching data:", accountsError || templatesError);
          toast.error("Error loading data.");
        }

        setAccountsList(accounts || []);
        setTemplates(templates || []);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load data.");
      }
    };

    fetchDropdownData();
  }, []);

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleSubmit = async () => {
    if (!campaignName || !selectedAccount || !selectedTemplate) {
      return toast.error("All fields are required!");
    }

    try {
      toast.loading("Starting campaign...");

      // Fetch emails for the selected account
      const { data: emails, error: emailsError } = await supabase
        .from("list_emails")
        .select("*")
        .eq("accounts_list_id", selectedAccount);

      if (emailsError || !emails || emails.length === 0) {
        toast.dismiss();
        return toast.error("No emails found for the selected account list.");
      }

      // Get selected template
      const template = templates.find((t) => t.id === parseInt(selectedTemplate));
      if (!template) {
        toast.dismiss();
        return toast.error("Template not found.");
      }

      // Store campaign info in Supabase
      const { error: campaignError } = await supabase.from("campaigns").insert([
        {
          name: campaignName,
          accounts_list_id: selectedAccount,
          template_id: selectedTemplate,
          user_id: userId,
        },
      ]);

      if (campaignError) {
        toast.dismiss();
        return toast.error("Failed to create campaign.");
      }

      // Prepare FormData for file uploads
      const formData = new FormData();
      formData.append("host", "billingcaresolutions.com");
      formData.append("sender_email", "abubakar@billingcaresolutions.com");
      formData.append("password", "404@urbanloop");
      formData.append("subject", template.name);
      formData.append("text", template.content);

      // Attach files
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("attachments", selectedFiles[i]);
      }

      // Send emails
      await Promise.all(
        emails.map(async (email) => {
          formData.set("to", email.email); // Update recipient email for each request
          await axios.post("/api/sendEmail", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        })
      );

      toast.dismiss();
      toast.success("Campaign started successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Error starting campaign.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex flex-col justify-start items-center gap-4">
      <h1 className="w-full text-left text-3xl font-semibold">
        Create New Campaign
      </h1>
      <div className="w-full flex flex-wrap justify-between items-center gap-4">
        <Input
          placeholder="Campaign Name"
          className="w-[32%]"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
        />

        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="w-[32%] border rounded-md p-2"
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
          className="w-[32%] border rounded-md p-2"
        >
          <option value="">Select Template</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-[32%] border rounded-md p-2"
        />

        <Button onClick={handleSubmit} className="text-white">
          Start Campaign
        </Button>
      </div>
    </div>
  );
}

export default CreateCampaign;
