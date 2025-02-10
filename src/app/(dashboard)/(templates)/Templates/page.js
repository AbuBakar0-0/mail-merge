"use client";

import { deleteTemplate } from "@/actions/templates/deleteTemplate";
import { getTemplates } from "@/actions/templates/getTemplates";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";

function Templates() {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const response = await getTemplates(localStorage.getItem("user_id"));
    setData(response);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const response = await deleteTemplate(id);
    await fetchData();
  };
  return (
    <>
      <div className="w-full flex flex-row justify-between items-center mb-5">
        <h1 className="text-3xl font-semibold">Templates</h1>
        <Button className="text-white" asChild>
          <Link href="/AddTemplate/new_template">Add +</Link>
        </Button>
      </div>
      <div className="flex flex-wrap justify-start items-center gap-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="w-72 h-20 shadow-xl border-2 border-gray-400 rounded-xl flex flex-row justify-between items-center p-5"
          >
            <p>{item.name}</p>
            <div className="flex gap-2">
              <Link href={`/AddTemplate/${item.id}`}>
                <MdOutlineEdit className="text-green-400" />
              </Link>
              <button onClick={() => handleDelete(item.id)}>
                <MdDeleteOutline className="text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Templates;
