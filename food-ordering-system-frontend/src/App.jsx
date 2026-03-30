import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import Payment from './pages/Payment';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './admin/AdminDashboard';
import AdminCategories from './admin/AdminCategories';
import AdminRestaurants from './admin/AdminRestaurants';
import AdminMenu from './admin/AdminMenu';
import AdminOrders from './admin/AdminOrders';

function AppLayout() {
  const { pathname } = useLocation();
  const isFullBleed = pathname === '/' || pathname.startsWith('/menu/');

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 text-stone-900">
      <Navbar />

      {isFullBleed ? (
        <main className="flex-grow">
          <Routes>
            <Route path="/"                   element={<Home />} />
            <Route path="/menu/:restaurantId" element={<Menu />} />
            <Route path="*"                   element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      ) : (
        <main className="flex-grow px-6 py-10 mx-auto md:px-10 lg:px-16 max-w-7xl">
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart"     element={<Cart />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/orders"           element={<OrderHistory />} />
              <Route path="/payment/:orderId" element={<Payment />} />
            </Route>

            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/admin" element={<AdminDashboard />}>
                <Route path="categories"  element={<AdminCategories />} />
                <Route path="restaurants" element={<AdminRestaurants />} />
                <Route path="menu"        element={<AdminMenu />} />
                <Route path="orders"      element={<AdminOrders />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      )}

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
}