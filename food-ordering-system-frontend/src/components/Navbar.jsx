import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingCart, User, LogOut, Utensils,
  LayoutDashboard, Menu as MenuIcon, X, ChevronRight
} from 'lucide-react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=DM+Sans:wght@400;500;600;700&display=swap');

  .nav-root { font-family: 'DM Sans', sans-serif; }

  /* Transparent on hero, solid when scrolled */
  .nav-scrolled {
    background: rgba(255,255,255,0.92) !important;
    backdrop-filter: blur(20px) !important;
    border-bottom: 1px solid rgba(0,0,0,0.06) !important;
    box-shadow: 0 4px 32px rgba(0,0,0,0.06) !important;
  }
  .nav-top {
    background: transparent !important;
    border-bottom: 1px solid rgba(255,255,255,0.06) !important;
    box-shadow: none !important;
  }

  /* Logo italic wordmark */
  .nav-logo-word {
    font-family: 'Playfair Display', Georgia, serif;
    font-style: italic;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  /* Cart badge pop */
  @keyframes badge-pop { 0%{transform:scale(0)} 60%{transform:scale(1.3)} 100%{transform:scale(1)} }
  .badge-pop { animation: badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  /* Mobile panel slide */
  @keyframes slide-down { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
  .mobile-panel { animation: slide-down 0.25s cubic-bezier(0.16,1,0.3,1) both; }

  /* User dropdown */
  .user-dropdown {
    transform-origin: top right;
    transition: opacity 0.18s ease, transform 0.18s cubic-bezier(0.16,1,0.3,1);
  }
  .user-dropdown.hidden-drop { opacity:0; transform:scale(0.94) translateY(-6px); pointer-events:none; }
  .user-dropdown.shown-drop  { opacity:1; transform:scale(1)    translateY(0);    pointer-events:auto; }
`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);

  const isHome = location.pathname === '/';

  /* Scroll listener */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close mobile on route change */
  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
    setDropOpen(false);
  };

  /* Colors flip based on scroll + page */
  const onHero   = isHome && !scrolled;
  const textBase = onHero ? 'text-white/80'   : 'text-stone-600';
  const textHov  = onHero ? 'hover:text-white' : 'hover:text-stone-900';
  const logoCol  = onHero ? 'text-white'        : 'text-stone-900';
  const divider  = onHero ? 'bg-white/15'       : 'bg-stone-200';

  return (
    <>
      <style>{STYLE}</style>

      <nav
        className={`nav-root fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'nav-scrolled' : 'nav-top'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 mx-auto max-w-7xl md:px-10 lg:px-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="p-2 transition-colors bg-red-600 shadow-lg group-hover:bg-red-500 rounded-xl shadow-red-900/30">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <span className={`nav-logo-word text-2xl transition-colors duration-300 ${logoCol}`}>
              QuickCrave
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="items-center hidden md:flex gap-7">

            {/* Cart — non-admin */}
            {(!user || user.role !== 'admin') && (
              <Link to="/cart" className="relative group">
                <div className={`flex items-center gap-1.5 text-base font-semibold ${textBase} ${textHov} transition-colors duration-200`}>
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {cart.items.length > 0 && (
                      <span key={cart.items.length} className="badge-pop absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white/30">
                        {cart.items.length}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:inline">Cart</span>
                </div>
              </Link>
            )}

            {user ? (
              <>
                {/* Admin panel link */}
                {user.role === 'admin' && (
                  <Link to="/admin/categories"
                    className={`flex items-center gap-1.5 text-base font-semibold ${textBase} ${textHov} transition-colors duration-200`}>
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </Link>
                )}

                {/* My orders */}
                {user.role !== 'admin' && (
                  <Link to="/orders"
                    className={`text-base font-semibold transition-colors duration-200 ${
                      location.pathname === '/orders'
                        ? 'text-red-500'
                        : `${textBase} ${textHov}`
                    }`}>
                    My Orders
                  </Link>
                )}

                {/* Divider */}
                <div className={`w-px h-5 ${divider}`} />

                {/* User avatar + dropdown */}
                <div className="relative" onMouseLeave={() => setDropOpen(false)}>
                  <button
                    onMouseEnter={() => setDropOpen(true)}
                    onClick={() => setDropOpen(v => !v)}
                    className="flex items-center gap-2 group focus:outline-none"
                  >
                    <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white transition-colors border-2 rounded-full shadow-md bg-stone-900 border-red-600/50 group-hover:border-red-500">
                      {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <span className={`hidden lg:block text-base font-semibold ${textBase} ${textHov} transition-colors max-w-[96px] truncate`}>
                      {user.name?.split(' ')[0] || 'Account'}
                    </span>
                  </button>

                  {/* Dropdown */}
                  <div className={`user-dropdown absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden ${dropOpen ? 'shown-drop' : 'hidden-drop'}`}>
                    <div className="px-4 py-3.5 border-b border-stone-50 bg-stone-50">
                      <p className="text-base font-bold truncate text-stone-900">{user.name || 'User'}</p>
                      <p className="text-sm text-stone-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-base font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login"
                  className={`text-base font-semibold transition-colors duration-200 ${textBase} ${textHov}`}>
                  Sign In
                </Link>

                {/* CTA button — style shifts on hero vs scrolled */}
                <Link to="/register"
                  className={`text-base font-bold px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 ${
                    onHero
                      ? 'bg-white text-stone-900 hover:bg-stone-100 shadow-lg shadow-black/20'
                      : 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/30'
                  }`}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className={`md:hidden p-2 rounded-xl transition-colors ${onHero ? 'text-white hover:bg-white/10' : 'text-stone-700 hover:bg-stone-100'}`}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>

        {/* ── Mobile panel ── */}
        {mobileOpen && (
          <div className="bg-white border-t shadow-2xl mobile-panel md:hidden border-stone-100">
            <div className="px-6 py-6 space-y-1">

              {/* User info */}
              {user && (
                <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-stone-50 rounded-2xl">
                  <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-sm font-bold text-white border-2 rounded-full bg-stone-900 border-red-600/40">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold truncate text-stone-900">{user.name || 'User'}</p>
                    <p className="text-sm truncate text-stone-400">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Nav items */}
              {(!user || user.role !== 'admin') && (
                <MobileLink to="/cart" onClick={() => setMobileOpen(false)}>
                  <ShoppingCart className="w-4 h-4" />
                  Cart
                  {cart.items.length > 0 && (
                    <span className="ml-auto bg-red-600 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.items.length}
                    </span>
                  )}
                </MobileLink>
              )}

              {user?.role === 'admin' && (
                <MobileLink to="/admin/categories" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" /> Admin Panel
                </MobileLink>
              )}

              {user && user.role !== 'admin' && (
                <MobileLink to="/orders" onClick={() => setMobileOpen(false)}>
                  My Orders
                </MobileLink>
              )}

              {!user && (
                <>
                  <MobileLink to="/login" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </MobileLink>
                  <div className="pt-2">
                    <Link to="/register" onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-lg shadow-red-900/20 text-base">
                      Get Started <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </>
              )}

              {user && (
                <div className="pt-2 mt-2 border-t border-stone-100">
                  <button onClick={handleLogout}
                    className="flex items-center w-full gap-2 px-3 py-3 text-base font-semibold text-red-600 transition-colors hover:bg-red-50 rounded-xl">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

/* Helper: mobile nav link */
const MobileLink = ({ to, onClick, children }) => (
  <Link to={to} onClick={onClick}
    className="flex items-center gap-2.5 px-3 py-3 text-base font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors w-full">
    {children}
  </Link>
);

export default Navbar;