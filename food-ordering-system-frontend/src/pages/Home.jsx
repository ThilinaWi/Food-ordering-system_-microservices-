import React, { useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MapPin, ArrowRight, Utensils, Star, LocateFixed,
  Loader, X, ChevronRight, Search, Clock, Flame, TrendingUp
} from 'lucide-react';

/* ─── Injected styles (fonts + extras) ─── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@300;400;500;600&display=swap');

  .home-root { font-family: 'DM Sans', sans-serif; }
  .font-display { font-family: 'Playfair Display', Georgia, serif; }

  .hero-grain::after {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:3;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
  }

  .card-shine { position:relative; }
  .card-shine::after {
    content:''; position:absolute; inset:0; border-radius:1.5rem;
    background:linear-gradient(135deg,rgba(255,255,255,0.07) 0%,transparent 60%);
    opacity:0; transition:opacity 0.3s ease; z-index:5; pointer-events:none;
  }
  .card-shine:hover::after { opacity:1; }

  .marquee-wrap { overflow:hidden; }
  .marquee-track { display:flex; gap:1.5rem; animation:marquee 30s linear infinite; width:max-content; }
  @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }

  @keyframes heroReveal { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  .h1 { animation:heroReveal 0.9s cubic-bezier(0.16,1,0.3,1) 0.05s both }
  .h2 { animation:heroReveal 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s both }
  .h3 { animation:heroReveal 0.9s cubic-bezier(0.16,1,0.3,1) 0.35s both }
  .h4 { animation:heroReveal 0.9s cubic-bezier(0.16,1,0.3,1) 0.5s both }
  .h5 { animation:heroReveal 0.9s cubic-bezier(0.16,1,0.3,1) 0.65s both }
  .h6 { animation:heroReveal 0.9s cubic-bezier(0.16,1,0.3,1) 0.8s both }

  @keyframes subtle-zoom { from{transform:scale(1.04)} to{transform:scale(1.12)} }
  .hero-img { animation:subtle-zoom 18s ease-in-out infinite alternate; }

  .rcard {
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease;
    will-change: transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: translateZ(0);
  }
  .rcard:hover { transform:translateY(-10px) scale(1.015); box-shadow:0 32px 80px -16px rgba(0,0,0,0.22); }

  .search-bar { transition:box-shadow 0.3s ease; }
  .search-bar:focus-within { box-shadow:0 0 0 3px rgba(239,68,68,0.25), 0 24px 64px rgba(0,0,0,0.18); }

  .star-btn { transition:transform 0.15s cubic-bezier(0.34,1.56,0.64,1); }
  .star-btn:hover { transform:scale(1.35) translateY(-4px); }

  @keyframes scroll-dot { 0%,100%{transform:translateY(0);opacity:1} 50%{transform:translateY(7px);opacity:0.2} }

  .stat-glass {
    background:rgba(255,255,255,0.07);
    backdrop-filter:blur(14px);
    border:1px solid rgba(255,255,255,0.1);
  }

  .section-ghost {
    font-family:'Playfair Display',serif;
    font-size:9rem; font-weight:900; line-height:1;
    color:transparent; -webkit-text-stroke:1px rgba(239,68,68,0.12);
    user-select:none; pointer-events:none;
  }
`;

const CUISINES = ['🍕 Italian','🍜 Asian','🌮 Mexican','🍔 American','🥗 Healthy','🍱 Japanese','🍛 Indian','🥙 Mediterranean','🥩 Steakhouse','🦞 Seafood'];

export default function Home() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [location, setLocation]       = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [ratingModal, setRatingModal] = useState({ isOpen: false, restaurantId: null, restaurantName: '' });
  const [hoveredStar, setHoveredStar] = useState(0);

  const filtered = restaurants.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.name?.toLowerCase().includes(q) || r.address?.toLowerCase().includes(q) || r.cuisineType?.toLowerCase().includes(q);
  });

  const handleSearch = () => {
    setSearchQuery(location);
    setTimeout(() => document.getElementById('spots')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const d = await r.json();
          setLocation(d?.display_name || `${latitude}, ${longitude}`);
        } catch { setLocation(`${latitude}, ${longitude}`); }
        finally { setLocationLoading(false); }
      },
      () => { alert('Location permission denied.'); setLocationLoading(false); }
    );
  };

  const handleOpenRating = (e, restaurant) => {
    e.preventDefault(); e.stopPropagation();
    if (!localStorage.getItem('userId')) return alert('Please sign in to rate.');
    setRatingModal({ isOpen: true, restaurantId: restaurant._id, restaurantName: restaurant.name });
  };

  const submitRating = async (score) => {
    try {
      const res = await api.post(`/restaurants/${ratingModal.restaurantId}/rate`, { userId: localStorage.getItem('userId'), score });
      setRestaurants(prev => prev.map(r => r._id === ratingModal.restaurantId ? { ...r, averageRating: res.data.averageRating } : r));
      setRatingModal({ isOpen: false, restaurantId: null, restaurantName: '' });
    } catch { alert('Failed to submit rating.'); }
  };

  useEffect(() => {
    api.get('/restaurants')
      .then(r => setRestaurants(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-stone-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-red-800 rounded-full border-t-red-500 animate-spin" />
        <p className="text-stone-600 text-xs tracking-[0.2em] uppercase">Loading</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{STYLE}</style>
      <div className="home-root bg-stone-50">

        {/* ══════════════════════════════════════
            H E R O
        ══════════════════════════════════════ */}
        <section className="relative flex flex-col justify-end min-h-screen overflow-hidden hero-grain bg-stone-950">

          {/* BG photo */}
          <div className="absolute inset-0 bg-center bg-cover hero-img"
            style={{ backgroundImage:"url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=95&w=2400&auto=format&fit=crop')" }} />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/55 to-stone-900/10" style={{zIndex:1}} />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/75 via-stone-950/20 to-transparent" style={{zIndex:1}} />

          {/* Glow blobs */}
          <div className="absolute rounded-full opacity-25 pointer-events-none top-16 right-12 w-80 h-80 blur-3xl"
            style={{ background:'radial-gradient(circle,#ef4444,transparent 70%)', zIndex:1 }} />
          <div className="absolute w-48 h-48 rounded-full pointer-events-none bottom-32 right-32 blur-2xl opacity-15"
            style={{ background:'radial-gradient(circle,#f97316,transparent 70%)', zIndex:1 }} />

          {/* ── Top-right stat pills ── */}
          <div className="absolute z-10 flex gap-3 top-8 right-8 h1">
            {[
              { icon:<Clock className="w-3.5 h-3.5"/>,     val:'25 min', sub:'avg delivery' },
              { icon:<Star className="w-3.5 h-3.5 fill-current text-amber-400"/>, val:'4.8★', sub:'avg rating' },
              { icon:<Flame className="w-3.5 h-3.5 text-orange-400"/>, val:`${restaurants.length}+`, sub:'restaurants' },
            ].map(({ icon, val, sub }) => (
              <div key={sub} className="stat-glass rounded-2xl px-4 py-2.5 text-white flex items-center gap-2.5">
                {icon}
                <div>
                  <div className="text-xs font-bold leading-none">{val}</div>
                  <div className="text-[9px] text-white/45 uppercase tracking-wider mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Hero copy ── */}
          <div className="relative z-10 w-full px-6 pb-20 mx-auto md:px-10 lg:px-16 pt-44 max-w-7xl">
            <div className="max-w-3xl">

              {/* Eyebrow line */}
              <div className="flex items-center gap-3 h1 mb-7">
                <div className="w-10 h-px bg-red-500" />
                <span className="text-red-400 font-semibold text-xs uppercase tracking-[0.3em]">
                  QuickCrave · Est. 2024
                </span>
              </div>

              {/* Display headline */}
              <h1 className="font-display leading-[0.9] mb-8 select-none">
                <span className="block italic font-black text-white h2"
                  style={{ fontSize:'clamp(3.2rem,9vw,7.5rem)' }}>
                  Crave it.
                </span>
                <span className="block font-bold h3 text-stone-400"
                  style={{ fontSize:'clamp(2.8rem,7.5vw,6rem)' }}>
                  Order it.
                </span>
                <span className="block italic font-black h4"
                  style={{ fontSize:'clamp(3.2rem,9vw,7.5rem)', color:'#ef4444' }}>
                  Devour it.
                </span>
              </h1>

              <p className="max-w-md mb-10 text-lg font-light leading-relaxed h5 text-stone-400">
                The finest local restaurants, delivered in minutes. Discover flavours you'll obsess over.
              </p>

              {/* Search */}
              <div className="flex flex-col max-w-xl gap-3 h6 sm:flex-row">
                <div className="search-bar flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-3.5 shadow-2xl">
                  <button onClick={handleGetLocation} disabled={locationLoading}
                    className="flex-shrink-0 p-1 text-red-500 transition-colors hover:text-red-600">
                    {locationLoading ? <Loader className="w-4 h-4 animate-spin"/> : <LocateFixed className="w-4 h-4"/>}
                  </button>
                  <input
                    type="text"
                    placeholder="Search cuisine, restaurant, area…"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    className="flex-1 text-sm font-medium bg-transparent outline-none text-stone-800 placeholder-stone-400"
                  />
                </div>
                <button onClick={handleSearch}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold px-7 py-3.5 rounded-2xl transition-all shadow-xl shadow-red-900/50 text-sm whitespace-nowrap">
                  <Search className="w-4 h-4"/>
                  {user?.role === 'admin' ? 'Find Restaurant' : 'Find Food'}
                </button>
              </div>
            </div>

            {/* Cuisine marquee */}
            <div className="opacity-50 marquee-wrap mt-14">
              <div className="marquee-track">
                {[...CUISINES, ...CUISINES].map((c, i) => (
                  <span key={i} className="flex-shrink-0 text-stone-400 text-sm font-medium border border-stone-700 rounded-full px-4 py-1.5 whitespace-nowrap">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute z-10 flex flex-col items-center gap-2 -translate-x-1/2 bottom-8 left-1/2 opacity-40">
            <div className="w-5 h-8 border border-stone-500 rounded-full flex justify-center pt-1.5">
              <div className="w-0.5 h-2 bg-stone-400 rounded-full" style={{animation:'scroll-dot 1.5s ease-in-out infinite'}}/>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════
            R E S T A U R A N T S
        ══════════════════════════════════════ */}
        <section id="spots" className="py-24 bg-stone-100">
          <div className="px-6 mx-auto md:px-10 lg:px-16 max-w-7xl">

            {/* Section heading */}
            <div className="flex flex-col justify-between gap-6 mb-16 md:flex-row md:items-end">
              <div className="relative">
                <div className="absolute select-none section-ghost -top-10 -left-6">01</div>
                <p className="text-red-500 font-semibold text-xs uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5"/>
                  {searchQuery ? `Results for "${searchQuery}"` : 'Popular right now'}
                </p>
                <h2 className="leading-tight font-display">
                  <span className="block font-black text-stone-900" style={{fontSize:'clamp(2.5rem,5vw,4rem)'}}>Trending</span>
                  <span className="block italic font-bold text-stone-400" style={{fontSize:'clamp(2.5rem,5vw,4rem)'}}>Spots</span>
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {searchQuery && (
                  <button onClick={() => { setLocation(''); setSearchQuery(''); }}
                    className="flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-900 border border-stone-200 hover:border-stone-400 px-4 py-2.5 rounded-xl transition-all">
                    <X className="w-3.5 h-3.5"/> Clear
                  </button>
                )}
                <div className="text-sm font-medium text-stone-400 bg-white border border-stone-200 px-4 py-2.5 rounded-xl shadow-sm">
                  {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Empty state */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-stone-200 rounded-3xl">
                <Utensils className="mb-5 w-14 h-14 text-stone-200"/>
                <p className="mb-2 text-2xl italic font-bold font-display text-stone-300">Nothing found</p>
                <button onClick={() => { setLocation(''); setSearchQuery(''); }}
                  className="mt-1 text-sm font-semibold text-red-500 hover:underline">
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((restaurant, idx) => (
                  <Link
                    key={restaurant._id}
                    to={`/menu/${restaurant._id}`}
                    className="flex flex-col bg-white border shadow-md border-stone-200 rcard card-shine group rounded-3xl"
                  >
                    {/* Image */}
                    <div className="relative flex-shrink-0 h-56 overflow-hidden bg-stone-100 rounded-t-3xl">
                      <img
                        src={restaurant.image
                          ? `http://localhost:3000/uploads/${restaurant.image}`
                          : 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop'}
                        alt={restaurant.name}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                        onError={e => { e.target.onerror=null; e.target.src='https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop'; }}
                      />
                      <div className="absolute inset-0 transition-colors duration-300 bg-transparent group-hover:bg-stone-950/10"/>

                      {/* Rating pill */}
                      <button onClick={e => handleOpenRating(e, restaurant)}
                        className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-lg hover:scale-105 transition-transform z-10">
                        <Star className={`w-3.5 h-3.5 ${restaurant.averageRating > 0 ? 'text-amber-400 fill-current' : 'text-stone-300'}`}/>
                        <span className="text-xs font-black text-stone-800">
                          {restaurant.averageRating > 0 ? restaurant.averageRating.toFixed(1) : 'NEW'}
                        </span>
                      </button>

                      {/* Cuisine */}
                      {restaurant.cuisineType && (
                        <span className="absolute bottom-4 right-4 bg-stone-950/80 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl">
                          {restaurant.cuisineType}
                        </span>
                      )}

                      {/* Ghost index number */}
                      <span className="absolute font-black leading-none pointer-events-none select-none bottom-2 left-4 font-display text-white/15"
                        style={{fontSize:'4.5rem'}}>
                        {String(idx + 1).padStart(2,'0')}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-xl font-bold leading-snug transition-colors font-display text-stone-900 group-hover:text-red-600 line-clamp-1">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 transition-all duration-300 border rounded-xl bg-stone-50 group-hover:bg-red-600 border-stone-100 group-hover:border-red-600">
                          <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300"/>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-stone-400 mb-5">
                        <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0"/>
                        <span className="text-xs font-medium truncate">{restaurant.address}</span>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-auto border-t border-stone-200">
                        <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium">
                          <Clock className="w-3.5 h-3.5"/>
                          20–35 min
                        </div>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-0.5">
                          View Menu <ChevronRight className="w-3 h-3"/>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>


        {/* ══════════════════════════════════════
            C T A   B A N N E R
        ══════════════════════════════════════ */}
        <section className="relative py-24 overflow-hidden bg-stone-950">
          <div className="absolute rounded-full pointer-events-none -top-20 -left-20 w-80 h-80 blur-3xl opacity-20"
            style={{background:'radial-gradient(circle,#ef4444,transparent)'}}/>
          <div className="absolute rounded-full pointer-events-none -bottom-20 -right-20 w-96 h-96 blur-3xl opacity-15"
            style={{background:'radial-gradient(circle,#f97316,transparent)'}}/>
          {/* Decorative horizontal rules */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-800/40 to-transparent"/>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-stone-700/40 to-transparent"/>

          <div className="relative z-10 px-6 mx-auto md:px-10 lg:px-16 max-w-7xl">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-red-500 text-xs font-semibold uppercase tracking-[0.3em] mb-5">
              Ready to eat?
            </p>
            <h2 className="mb-6 italic font-black leading-tight text-white font-display"
              style={{fontSize:'clamp(2.5rem,6vw,5.5rem)'}}>
              Your next favourite<br/>meal is one tap away.
            </h2>
            <p className="max-w-md mx-auto mb-10 text-lg font-light leading-relaxed text-stone-500">
              Join thousands of happy customers ordering daily from the best local spots.
            </p>

            {!user ? (
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/register"
                  className="px-10 py-4 text-sm font-bold text-white transition-all bg-red-600 shadow-2xl hover:bg-red-500 active:scale-95 rounded-2xl shadow-red-950/60 hover:shadow-red-600/30">
                  Get Started Free
                </Link>
                <Link to="/login"
                  className="px-8 py-4 text-sm font-semibold transition-all border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-white rounded-2xl">
                  Sign In
                </Link>
              </div>
            ) : (
              <button
                onClick={() => document.getElementById('spots')?.scrollIntoView({ behavior:'smooth' })}
                className="px-10 py-4 text-sm font-bold text-white transition-all bg-red-600 shadow-2xl hover:bg-red-500 active:scale-95 rounded-2xl shadow-red-950/60">
                Browse Restaurants ↑
              </button>
            )}
          </div>
          </div>
        </section>


        {/* ══════════════════════════════════════
            R A T I N G   M O D A L
        ══════════════════════════════════════ */}
        {ratingModal.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{background:'rgba(10,8,7,0.82)', backdropFilter:'blur(14px)'}}>
            <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden"
              style={{animation:'heroReveal 0.35s cubic-bezier(0.16,1,0.3,1) both'}}>

              {/* Modal dark header */}
              <div className="relative px-8 pt-8 bg-stone-950 pb-7">
                <button
                  onClick={() => setRatingModal({ isOpen:false, restaurantId:null, restaurantName:'' })}
                  className="absolute top-5 right-5 text-stone-600 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-full p-1.5 transition-colors">
                  <X className="w-4 h-4"/>
                </button>
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-red-600 shadow-lg rounded-2xl shadow-red-900/50">
                  <Star className="w-6 h-6 text-white fill-current"/>
                </div>
                <h3 className="text-2xl italic font-bold text-white font-display">Rate your visit</h3>
                <p className="mt-1 text-sm font-medium text-stone-500">{ratingModal.restaurantName}</p>
              </div>

              {/* Stars */}
              <div className="px-8 py-8 text-center">
                <p className="mb-6 text-sm font-medium text-stone-400">How was your experience?</p>
                <div className="flex justify-center gap-2 mb-3">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} className="star-btn focus:outline-none"
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => submitRating(star)}>
                      <Star className={`w-10 h-10 transition-colors duration-100 ${star <= hoveredStar ? 'text-amber-400 fill-current' : 'text-stone-200'}`}/>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold h-4">
                  {hoveredStar > 0 ? ['','Poor','Fair','Good','Great','Amazing!'][hoveredStar] : 'Tap a star to submit'}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}