import React from "react";
import { Link } from "react-router-dom";
import {
  Utensils, MapPin, Mail, Phone, Heart,
  ArrowRight, ChevronRight, Send
} from "lucide-react";

/* ─── Injected Styles ─── */
const FOOTER_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=DM+Sans:wght@400;500;600;700&display=swap');

  .footer-root { font-family: 'DM Sans', sans-serif; }

  /* Fix: use CSS transition on max-width instead of Tailwind w-0/w-3 trick */
  .footer-link-arrow {
    display: inline-flex;
    align-items: center;
    gap: 0;
    max-width: 0;
    overflow: hidden;
    transition: max-width 0.22s ease, gap 0.22s ease;
  }
  .footer-link:hover .footer-link-arrow {
    max-width: 1rem;
    gap: 0.4rem;
  }

  /* Social icon hover ring */
  .social-btn {
    position: relative;
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease, box-shadow 0.2s ease;
  }
  .social-btn:hover { transform: translateY(-3px) scale(1.12); }
  .social-btn::after {
    content: '';
    position: absolute; inset: -3px;
    border-radius: 14px;
    border: 1.5px solid transparent;
    transition: border-color 0.2s ease;
  }
  .social-btn:hover::after { border-color: rgba(239,68,68,0.4); }

  /* Newsletter input focus ring */
  .nl-wrap { transition: box-shadow 0.25s ease; }
  .nl-wrap:focus-within {
    box-shadow: 0 0 0 3px rgba(239,68,68,0.25), 0 8px 24px rgba(0,0,0,0.18);
  }

  /* Top gradient shimmer bar */
  @keyframes shimmer-bar {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  .shimmer-bar {
    background: linear-gradient(
      90deg,
      transparent 0%, rgba(239,68,68,0.5) 40%,
      rgba(251,146,60,0.7) 50%, rgba(239,68,68,0.5) 60%, transparent 100%
    );
    background-size: 200% auto;
    animation: shimmer-bar 4s linear infinite;
  }

  /* App badge hover */
  .app-badge {
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
  }
  .app-badge:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.28);
  }
`;

/* ─── SVG Social Icons (no react-icons dependency needed) ─── */
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const IconTwitter = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

/* ─── Newsletter Component ─── */
const Newsletter = () => {
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    setEmail('');
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">
        Stay in the Loop
      </h4>
      <p className="text-sm leading-relaxed text-slate-400">
        New restaurants, exclusive deals and weekly specials — straight to your inbox.
      </p>

      {sent ? (
        <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold border text-emerald-400 bg-emerald-400/10 border-emerald-400/20 rounded-xl">
          <svg viewBox="0 0 20 20" fill="currentColor" className="flex-shrink-0 w-4 h-4">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
          </svg>
          You're subscribed — thanks!
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex items-center overflow-hidden transition-colors duration-200 border nl-wrap bg-slate-800 border-slate-700 rounded-xl focus-within:border-primary-500">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 text-sm bg-transparent outline-none text-slate-300 placeholder-slate-600"
            />
            <button
              type="submit"
              className="flex items-center justify-center flex-shrink-0 w-10 h-10 m-1 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-500"
              aria-label="Subscribe"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

/* ─── Main Footer ─── */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const EXPLORE_LINKS = [
    { label: "Home",              to: "/" },
    { label: "Browse Restaurants",to: "/" },
    { label: "Your Cart",         to: "/cart" },
    { label: "Order History",     to: "/orders" },
  ];

  const COMPANY_LINKS = [
    { label: "Privacy Policy",  href: "#" },
    { label: "Terms of Service",href: "#" },
    { label: "Cookie Policy",   href: "#" },
    { label: "Help Center",     href: "#" },
  ];

  const SOCIALS = [
    { icon: <IconInstagram />, href: "#", label: "Instagram" },
    { icon: <IconTwitter />,   href: "#", label: "Twitter / X" },
    { icon: <IconFacebook />,  href: "#", label: "Facebook" },
  ];

  return (
    <>
      <style>{FOOTER_STYLE}</style>
      <footer className="relative overflow-hidden footer-root bg-slate-900 text-slate-100">

        {/* Animated shimmer top bar — fixes the static opacity-60 gradient */}
        <div className="absolute inset-x-0 top-0 h-px shimmer-bar" />

        {/* Subtle background glows */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 80% 0%, rgba(239,68,68,0.07) 0%, transparent 70%)," +
              "radial-gradient(ellipse 50% 50% at 10% 100%, rgba(99,102,241,0.05) 0%, transparent 70%)"
          }}
        />

        <div className="container relative z-10 px-6 pt-16 pb-8 mx-auto max-w-7xl">

          {/* ── 5-column grid ── */}
          <div className="grid grid-cols-1 gap-10 pb-12 border-b border-slate-800 sm:grid-cols-2 lg:grid-cols-5">

            {/* Brand — spans 2 cols on lg */}
            <div className="space-y-5 lg:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 group w-fit">
                <div className="bg-gradient-to-br from-primary-500 to-orange-500 p-2.5 rounded-xl
                                shadow-lg shadow-primary-500/20 transition-transform duration-300 group-hover:scale-105">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-white transition-colors group-hover:text-primary-400"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
                  QuickCrave
                </span>
              </Link>

              <p className="max-w-xs text-sm leading-relaxed text-slate-400">
                Discover the best local restaurants and get your favourite meals delivered fast — right to your door.
              </p>

              {/* Social icons — uses inline SVGs, no react-icons dep */}
              <div className="flex items-center gap-2.5 pt-1">
                {SOCIALS.map(({ icon, href, label }) => (
                  <a key={label} href={href} aria-label={label}
                    className="flex items-center justify-center border social-btn w-9 h-9 rounded-xl bg-slate-800 hover:bg-primary-600 border-slate-700 hover:border-primary-500 text-slate-400 hover:text-white hover:shadow-lg hover:shadow-primary-500/20">
                    {icon}
                  </a>
                ))}
              </div>

              {/* Contact block inside brand col for better space usage */}
              <div className="pt-2 space-y-3">
                {[
                  { Icon: MapPin, content: <span>123 Food Street, Kandy, Sri Lanka</span> },
                  {
                    Icon: Mail,
                    content: (
                      <a href="mailto:hello@quickcrave.lk"
                        className="transition-colors hover:text-white">
                        hello@quickcrave.lk
                      </a>
                    )
                  },
                  {
                    Icon: Phone,
                    content: (
                      <a href="tel:+94112345678"
                        className="transition-colors hover:text-white">
                        +94 11 234 5678
                      </a>
                    )
                  },
                ].map(({ Icon, content }, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="flex items-center justify-center flex-shrink-0 w-7 h-7
                                    rounded-lg bg-slate-800 border border-slate-700 mt-0.5">
                      <Icon className="w-3 h-3 text-primary-400" />
                    </div>
                    <span className="text-sm leading-snug text-slate-400">{content}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Explore Links */}
            <div className="space-y-5">
              <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">
                Explore
              </h4>
              <ul className="space-y-3">
                {EXPLORE_LINKS.map(({ label, to }) => (
                  <li key={label}>
                    {/* Fix: CSS max-width transition instead of broken w-0/w-3 trick */}
                    <Link to={to}
                      className="flex items-center text-sm font-medium transition-colors duration-200 footer-link text-slate-400 hover:text-white">
                      <span className="footer-link-arrow">
                        <ChevronRight className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                      </span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-5">
              <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">
                Company
              </h4>
              <ul className="space-y-3">
                {COMPANY_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href}
                      className="flex items-center text-sm font-medium transition-colors duration-200 footer-link text-slate-400 hover:text-white">
                      <span className="footer-link-arrow">
                        <ChevronRight className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                      </span>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>

              {/* App download badges */}
              <div className="pt-4 space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-500 mb-3">
                  Get the App
                </h4>
                {[
                  { store: "App Store",     sub: "Download on the",   path: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" },
                  { store: "Google Play",   sub: "Get it on",         path: "M3.18 23.76c.31.17.66.19 1.01.04l12.62-7.29-2.75-2.75-10.88 9.99v.01zM.5 1.48C.19 1.83 0 2.36 0 3.05v17.9c0 .69.19 1.22.5 1.57l.08.08 10.02-10.02v-.24L.58 1.4.5 1.48zM20.37 10.43l-2.61-1.51-3.07 3.08 3.07 3.07 2.63-1.52c.75-.43.75-1.13-.02-1.56v-.56zM4.19.2L16.81 7.49l-2.75 2.75L4.18.2 4.19.2z" },
                ].map(({ store, sub, path }) => (
                  <a key={store} href="#"
                    className="app-badge flex items-center gap-3 bg-slate-800 hover:bg-slate-700
                               border border-slate-700 hover:border-slate-600 rounded-xl
                               px-3.5 py-2.5 transition-colors duration-200">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 w-5 h-5 text-white">
                      <path d={path} />
                    </svg>
                    <div>
                      <p className="text-[10px] text-slate-500 leading-none">{sub}</p>
                      <p className="text-sm font-semibold text-white leading-tight mt-0.5">{store}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <Newsletter />
            </div>
          </div>

          {/* ── Bottom Bar ── */}
          <div className="flex flex-col items-center justify-between gap-3 pt-8 sm:flex-row">
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              © {currentYear} QuickCrave. Made with
              <Heart className="inline w-3 h-3 text-red-500 fill-current" />
              in Sri Lanka. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {["Privacy", "Terms", "Cookies"].map((label) => (
                <a key={label} href="#"
                  className="text-xs transition-colors text-slate-600 hover:text-slate-300">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;