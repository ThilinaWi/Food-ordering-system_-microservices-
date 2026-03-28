import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Layers, Store, UtensilsCrossed, FileText } from 'lucide-react';

const AdminDashboard = () => {
  const navItems = [
    { name: 'Categories', path: '/admin/categories', icon: <Layers className="w-5 h-5 mr-3" /> },
    { name: 'Restaurants', path: '/admin/restaurants', icon: <Store className="w-5 h-5 mr-3" /> },
    { name: 'Menu Items', path: '/admin/menu', icon: <UtensilsCrossed className="w-5 h-5 mr-3" /> },
    { name: 'Orders', path: '/admin/orders', icon: <FileText className="w-5 h-5 mr-3" /> },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-shrink-0">
        <h2 className="text-xl font-black text-gray-800 mb-6 px-2">Admin Panel</h2>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[600px]">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
