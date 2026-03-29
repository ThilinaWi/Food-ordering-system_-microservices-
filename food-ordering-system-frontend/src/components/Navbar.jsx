
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, Utensils, LayoutDashboard, Menu as MenuIcon, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = (
    <>
      {(!user || user.role !== 'admin') && (
        <Link to="/cart" className="relative group flex items-center" onClick={() => setMobileOpen(false)}>
          <ShoppingCart className="h-6 w-6 text-slate-600 group-hover:text-primary-600 transition-colors" />
          {cart.items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold border-2 border-white">
              {cart.items.length}
            </span>
          )}
        </Link>
      )}
      {user ? (
        <>
          {user.role === 'admin' && (
            <Link to="/admin/categories" className="flex items-center text-sm font-bold text-slate-700 hover:text-primary-600 bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-full hover:shadow-md transition-all" onClick={() => setMobileOpen(false)}>
              <LayoutDashboard className="w-4 h-4 mr-2 text-primary-500" />
              Admin Panel
            </Link>
          )}
          {user.role !== 'admin' && (
            <Link to="/orders" className={`text-sm font-semibold transition-colors ${isActive('/orders') ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'}`} onClick={() => setMobileOpen(false)}>
              My Orders
            </Link>
          )}
          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
          <div className="relative group flex items-center cursor-pointer select-none">
            <div className="w-9 h-9 bg-gradient-to-tr from-slate-800 to-slate-700 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
              {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
              <div className="p-4 border-b border-slate-50">
                <p className="text-sm font-bold text-slate-800 truncate">{user.name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <div className="p-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors" onClick={() => setMobileOpen(false)}>
            Sign In
          </Link>
          <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" onClick={() => setMobileOpen(false)}>
            Get Started
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group" onClick={() => setMobileOpen(false)}>
          <div className="bg-gradient-to-br from-primary-500 to-orange-500 p-2 rounded-xl shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
            <Utensils className="h-6 w-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">
            QuickCrave
          </span>
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          {navLinks}
        </div>
        <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur border-b border-slate-100 shadow-lg px-4 py-6 space-y-6 flex flex-col items-start animate-fade-in-down">
          {navLinks}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
