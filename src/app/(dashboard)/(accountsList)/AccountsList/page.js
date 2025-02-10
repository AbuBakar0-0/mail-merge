"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteDataById } from "@/hooks/deleteDataById";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import readXlsxFile from "read-excel-file";

export default function AccountsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const [fileData, setFileData] = useState([]);
  const [name, setName] = useState("");

  const handleChange = (event) => {
    setName(event.target.value);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    try {
      if (fileExtension === "csv") {
        // Parse CSV file
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const rows = result.data.map((row) => ({
              full_name: row.full_name || "",
              email: row.email || "",
            }));
            setFileData(rows);
          },
        });
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        // Parse XLSX file
        const rows = await readXlsxFile(file);
        const headers = rows[0]; // First row contains headers
        const formattedData = rows.slice(1).map((row) => ({
          full_name: row[headers.indexOf("full_name")] || "",
          email: row[headers.indexOf("email")] || "",
        }));
        setFileData(formattedData);
      } else {
        toast.error("Invalid file format. Upload CSV or XLSX.");
      }
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Error reading file.");
    }
  };

  const handleSubmit = async () => {
    if (!name) {
      toast.error("Please enter a name for the account list.");
      return;
    }

    if (fileData.length === 0) {
      toast.error("No valid data to upload.");
      return;
    }

    toast.loading("Uploading data...");

    // Insert into accounts_list table
    const { data: insertedAccount, error: accountError } = await supabase
      .from("accounts_list")
      .insert({ name })
      .select("id")
      .single();

    if (accountError) {
      toast.dismiss();
      console.error("Error inserting into accounts_list:", accountError);
      toast.error("Failed to create account list.");
      return;
    }

    const accountId = insertedAccount.id;

    // Prepare data for list_emails table
    const emailsData = fileData.map((item) => ({
      accounts_list_id: accountId,
      full_name: item.full_name,
      email: item.email,
    }));

    alert(JSON.stringify(fileData));

    // Insert data into list_emails table
    const { error: emailsError } = await supabase
      .from("list_emails")
      .insert(emailsData);

    toast.dismiss();

    if (emailsError) {
      console.error("Error inserting into list_emails:", emailsError);
      toast.error("Failed to upload email list.");
    } else {
      toast.success("Data uploaded successfully!");
      setIsModalOpen(false);
      fetchData();
    }
  };

  const fetchData = async () => {
    const { data, error } = await supabase.from("accounts_list").select("*");
    if (!error) setData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const response = await deleteDataById({
      table_name: "accounts_list",
      id: id,
    });
    await fetchData();
  };

  return (
    <>
      {/* Header */}
      <div className="w-full flex flex-row justify-between items-center mb-5">
        <h1 className="text-3xl font-semibold">Accounts List</h1>
        <Button className="text-white" onClick={() => setIsModalOpen(true)}>
          Add +
        </Button>
      </div>

      {/* Table */}
      <div className="flex flex-wrap justify-start items-center gap-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="w-72 h-20 shadow-xl border-2 border-gray-400 rounded-xl flex flex-row justify-between items-center p-5"
          >
            <p>{item.name}</p>
            <div className="flex gap-2 justify-start items-center">
              <Link href={`/AccountsList/${item.id}`}>
                <MdOutlineEdit className="text-green-500" />
              </Link>
              /
              <button onClick={() => handleDelete(item.id)}>
                <MdDeleteOutline className="text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>Upload Accounts List</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Label>Name</Label>
            <Input
              type="text"
              onChange={handleChange}
              placeholder="Enter account list name"
            />
            <Label>Upload CSV or XLSX</Label>
            <Input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileUpload}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button className="text-white" onClick={handleSubmit}>
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
