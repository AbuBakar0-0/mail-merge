"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const links = [
    {
      name: "Dashboard",
      link: "/Dashboard",
    },
    {
      name: "Templates",
      link: "/Templates",
    },
    {
      name: "Accounts List",
      link: "/AccountsList",
    },
    {
      name: "Settings",
      link: "/Settings",
    },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Topbar */}
      <header className=" text-primary w-full p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <button
          className="md:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
        <div className="hidden md:flex items-center space-x-4">
          <span>Welcome, User</span>
          <button className=" text-primary px-4 py-2 rounded">
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar & Content Wrapper */}
      <div className="flex flex-1 flex-col md:flex-row ">
        {/* Sidebar */}
        <aside
          className={`bg-primary w-full md:w-64 text-white transform transition-transform duration-300 shadow-lg ${
            isSidebarOpen ? "block" : "hidden"
          } md:block`}
        >
          <nav className="p-4 space-y-4">
            {links.map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className="block px-4 py-2 rounded hover:bg-secondary hover:text-white"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
