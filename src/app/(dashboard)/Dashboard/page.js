"use client";

import { Button } from "@/components/ui/button";
import { getAllData } from "@/hooks/getAllData";
import Link from "next/link";
import { useEffect, useState } from "react";

function Dashboard() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await getAllData({
        table_name: "campaigns",
        user_id: localStorage.getItem("user_id"),
      });
      setData(response);
    };

    fetchData();
  }, []);
  return (
    <>
      <div className="w-full flex flex-row justify-between items-center mb-5">
        <h1 className="text-3xl font-semibold">Campaings</h1>
        <Button className="text-white" asChild>
          <Link href="/CreateCampaign">Add +</Link>
        </Button>
      </div>
      {data.length != 0 ? (
        data.map((item, index) => (
          <Link
            href="/"
            key={index}
            className="w-60 h-20 shadow-xl border-2 border-gray-400 rounded-xl flex justify-center items-center"
          >
            {item.name}
          </Link>
        ))
      ) : (
        <p>No Records Found</p>
      )}
    </>
  );
}

export default Dashboard;
