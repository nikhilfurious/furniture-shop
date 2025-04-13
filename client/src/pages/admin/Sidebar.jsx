import React from 'react';
import { Home, Package, Plus, User, LogOut } from 'lucide-react';

export const Sidebar = ({ activeView, handleNavigation, sidebarOpen }) => {
  return (
    <div className={`${sidebarOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden'} md:flex md:relative md:z-auto w-64 flex-shrink-0 bg-white shadow-md transition-all duration-300 ease-in-out`}>
      <div className="flex flex-col h-full">
        <div className="p-6 bg-blue-600">
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <button 
            onClick={() => handleNavigation('dashboard')}
            className={`flex items-center px-6 py-3 w-full text-left ${activeView === 'dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
          >
            <Home size={18} className="mr-3" />
            Dashboard
          </button>
          <button 
            onClick={() => handleNavigation('products')}
            className={`flex items-center px-6 py-3 w-full text-left ${activeView === 'products' ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
          >
            <Package size={18} className="mr-3" />
            Products
          </button>
          <button 
            onClick={() => handleNavigation('addProduct')}
            className={`flex items-center px-6 py-3 w-full text-left ${activeView === 'addProduct' ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
          >
            <Plus size={18} className="mr-3" />
            Add Product
          </button>
        </nav>
        <div className="mt-auto pt-6 border-t border-gray-200 pb-4">
          <button className="flex items-center px-6 py-3 w-full text-left text-gray-700">
            <User size={18} className="mr-3" />
            Profile
          </button>
          <button className="flex items-center px-6 py-3 w-full text-left text-gray-700">
            <LogOut size={18} className="mr-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
