import React from 'react';
import { Menu, X } from 'lucide-react';

export const MobileHeader = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="md:hidden bg-white p-4 shadow-md flex items-center justify-between">
      <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-md focus:outline-none"
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
};