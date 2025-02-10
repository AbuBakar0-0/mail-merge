"use client";

import { getEmails } from "@/actions/emailsList/getEmails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdDeleteOutline, MdOutlineEdit, MdSave, MdAdd } from "react-icons/md";

function AccountsListId() {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedData, setEditedData] = useState({ full_name: "", email: "" });
  const [newData, setNewData] = useState({ full_name: "", email: "" });

  // Fetch emails from Supabase
  const fetchData = async () => {
    try {
      const response = await getEmails(id);
      setData(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle edit button click
  const handleEdit = (index, item) => {
    setEditingIndex(index);
    setEditedData({ full_name: item.full_name, email: item.email });
  };

  // Handle save button click (Update data in Supabase)
  const handleSave = async (index, emailId) => {
    try {
      toast.loading("Updating...");

      const { error } = await supabase
        .from("list_emails")
        .update(editedData)
        .eq("id", emailId);

      if (error) throw error;

      const updatedData = [...data];
      updatedData[index] = { ...updatedData[index], ...editedData };
      setData(updatedData);
      setEditingIndex(null);

      toast.dismiss();
      toast.success("Updated successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Error updating data.");
      console.error("Error updating email:", error);
    }
  };

  // Handle delete button click (Remove data from Supabase)
  const handleDelete = async (emailId) => {
    try {
      toast.loading("Deleting...");

      const { error } = await supabase
        .from("list_emails")
        .delete()
        .eq("id", emailId);

      if (error) throw error;

      setData(data.filter((item) => item.id !== emailId));
      toast.dismiss();
      toast.success("Deleted successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Error deleting data.");
      console.error("Error deleting email:", error);
    }
  };

  // Handle input change for editing
  const handleChange = (e, field) => {
    setEditedData({ ...editedData, [field]: e.target.value });
  };

  // Handle input change for new entry
  const handleNewChange = (e, field) => {
    setNewData({ ...newData, [field]: e.target.value });
  };

  // Handle add new email to Supabase
  const handleAdd = async () => {
    try {
      toast.loading("Adding...");
      const { data: insertedData, error } = await supabase
        .from("list_emails")
        .insert({
          accounts_list_id: id,
          email: newData.email,
          full_name: newData.full_name,
        })
        .select();

      if (error) throw error;

      setData([...data, insertedData[0]]);
      setNewData({ full_name: "", email: "" });

      toast.dismiss();
      toast.success("Added successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Error adding data.");
      console.error("Error adding email:", error);
    }
  };

  return (
    <>
      <div className="w-full flex flex-row justify-between items-center mb-5">
        <h1 className="text-3xl font-bold text-gray-800">Emails List</h1>
      </div>

      <div className="flex gap-3 mb-5">
        <Input
          placeholder="Full Name"
          value={newData.full_name}
          onChange={(e) => handleNewChange(e, "full_name")}
        />
        <Input
          placeholder="Email"
          value={newData.email}
          onChange={(e) => handleNewChange(e, "email")}
        />
        <Button className="text-white" onClick={handleAdd}>
          Add +
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 border border-gray-300 text-left">
                Full Name
              </th>
              <th className="p-3 border border-gray-300 text-left">Email</th>
              <th className="p-3 border border-gray-300 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr
                  key={index}
                  className="border border-gray-300 hover:bg-gray-50 transition"
                >
                  <td className="p-3 border border-gray-300">
                    {editingIndex === index ? (
                      <Input
                        value={editedData.full_name}
                        onChange={(e) => handleChange(e, "full_name")}
                      />
                    ) : (
                      item.full_name
                    )}
                  </td>
                  <td className="p-3 border border-gray-300">
                    {editingIndex === index ? (
                      <Input
                        value={editedData.email}
                        onChange={(e) => handleChange(e, "email")}
                      />
                    ) : (
                      item.email
                    )}
                  </td>
                  <td className="p-3 flex justify-center items-center gap-3">
                    {editingIndex === index ? (
                      <button
                        className="text-blue-500 hover:text-blue-700 transition"
                        onClick={() => handleSave(index, item.id)}
                      >
                        <MdSave size={20} />
                      </button>
                    ) : (
                      <button
                        className="text-green-500 hover:text-green-700 transition"
                        onClick={() => handleEdit(index, item)}
                      >
                        <MdOutlineEdit size={20} />
                      </button>
                    )}
                    <button
                      className="text-red-500 hover:text-red-700 transition"
                      onClick={() => handleDelete(item.id)}
                    >
                      <MdDeleteOutline size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AccountsListId;
