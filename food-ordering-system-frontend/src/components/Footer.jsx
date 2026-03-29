import React from "react";
import { Link } from "react-router-dom";
import { Utensils, MapPin, Mail, Phone, ArrowUpRight, Heart } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 overflow-hidden bg-slate-900 text-slate-100">
      {/* Decorative top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-60" />

      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(249,115,22,0.06)_0%,_transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(99,102,241,0.05)_0%,_transparent_60%)] pointer-events-none" />

      <div className="container relative z-10 px-6 pt-16 pb-8 mx-auto">

        {/* Top Section */}
        <div className="grid grid-cols-1 gap-12 pb-12 border-b md:grid-cols-2 lg:grid-cols-4 border-slate-800">

          {/* Brand Column */}
          <div className="space-y-5 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2.5 group w-fit">
              <div className="bg-gradient-to-br from-primary-500 to-orange-500 p-2.5 rounded-xl shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white transition-colors group-hover:text-primary-400">
                QuickCrave
              </span>
            </Link>
            <p className="text-sm font-medium leading-relaxed text-slate-400">
              Discover the best local restaurants and get your favourite meals delivered fast — right to your door.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1">
              {[
                { icon: <FaInstagram className="w-4 h-4" />, href: "#", label: "Instagram" },
                { icon: <FaTwitter className="w-4 h-4" />, href: "#", label: "Twitter" },
                { icon: <FaFacebook className="w-4 h-4" />, href: "#", label: "Facebook" },
              ].map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center transition-all duration-200 border w-9 h-9 bg-slate-800 hover:bg-primary-600 border-slate-700 hover:border-primary-500 rounded-xl text-slate-400 hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-primary-500/20"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Explore</h4>
            <ul className="space-y-3">
              {[
                { label: "Home", to: "/" },
                { label: "Browse Restaurants", to: "/" },
                { label: "Your Cart", to: "/cart" },
                { label: "Order History", to: "/orders" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="flex items-center text-sm font-medium transition-colors duration-200 group text-slate-400 hover:text-white"
                  >
                    <span className="w-0 mr-0 overflow-hidden transition-all duration-200 group-hover:w-3 group-hover:mr-2">
                      <ArrowUpRight className="flex-shrink-0 w-3 h-3 text-primary-400" />
                    </span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support */}
          <div className="space-y-5">
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Company</h4>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Cookie Policy", href: "#" },
                { label: "Help Center", href: "#" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="flex items-center text-sm font-medium transition-colors duration-200 group text-slate-400 hover:text-white"
                  >
                    <span className="w-0 mr-0 overflow-hidden transition-all duration-200 group-hover:w-3 group-hover:mr-2">
                      <ArrowUpRight className="flex-shrink-0 w-3 h-3 text-primary-400" />
                    </span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 border rounded-lg bg-slate-800 border-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-primary-400" />
                </div>
                <span className="text-sm font-medium leading-snug text-slate-400">
                  123 Food Street,<br />Kandy, Sri Lanka
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 border rounded-lg bg-slate-800 border-slate-700">
                  <Mail className="w-3.5 h-3.5 text-primary-400" />
                </div>
                <a href="mailto:hello@quickcrave.lk" className="text-sm font-medium transition-colors text-slate-400 hover:text-white">
                  hello@quickcrave.lk
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 border rounded-lg bg-slate-800 border-slate-700">
                  <Phone className="w-3.5 h-3.5 text-primary-400" />
                </div>
                <a href="tel:+94112345678" className="text-sm font-medium transition-colors text-slate-400 hover:text-white">
                  +94 11 234 5678
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 sm:flex-row">
          <p className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
            © {currentYear} QuickCrave. Made with
            <Heart className="inline w-3 h-3 text-red-500 fill-current" />
            in Sri Lanka. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Powered by</span>
            <span className="text-xs font-black text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full">
              React + Vite
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
