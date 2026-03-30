import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import {
  Plus, Minus, ShoppingBag, ArrowLeft,
  Star, ChevronRight, Clock, Utensils, X, MapPin
} from 'lucide-react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .menu-root * { box-sizing: border-box; }
  .menu-root { font-family: 'DM Sans', sans-serif; background: #f5f5f4; }
  .font-display { font-family: 'Playfair Display', Georgia, serif; }

  /* hero grain */
  .hero-grain::after {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:3;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  /* hero image zoom */
  @keyframes hz { from{transform:scale(1.04)} to{transform:scale(1.12)} }
  .hero-img { animation: hz 20s ease-in-out infinite alternate; }

  /* entry reveals */
  @keyframes rv { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  .rv1 { animation: rv 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both }
  .rv2 { animation: rv 0.7s cubic-bezier(0.16,1,0.3,1) 0.18s both }
  .rv3 { animation: rv 0.7s cubic-bezier(0.16,1,0.3,1) 0.30s both }

  /* menu card */
  .mcard {
    background:#fff; border:1.5px solid #e7e5e4;
    border-radius:1.5rem; overflow:hidden;
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease;
    will-change: transform;
    backface-visibility: hidden;
    transform: translateZ(0);
  }
  .mcard:hover {
    transform: translateY(-6px) scale(1.012);
    box-shadow: 0 24px 64px -12px rgba(0,0,0,0.18);
    border-color: #d6d3d1;
  }

  /* category tab */
  .ctab {
    padding: 0.45rem 1.1rem; border-radius: 9999px;
    font-size: 0.78rem; font-weight: 700; white-space: nowrap;
    cursor: pointer; border: 1.5px solid transparent;
    transition: all 0.18s ease;
  }
  .ctab-on  { background:#1c1917; color:#fff; box-shadow:0 4px 12px rgba(0,0,0,0.2); }
  .ctab-off { background:#fff; color:#78716c; border-color:#e7e5e4; }
  .ctab-off:hover { border-color:#a8a29e; color:#1c1917; }

  /* ghost number */
  .ghost-num {
    font-family:'Playfair Display',serif; font-size:8rem;
    font-weight:900; line-height:1; color:transparent;
    -webkit-text-stroke:1px rgba(239,68,68,0.10);
    user-select:none; pointer-events:none;
  }

  /* sticky cart */
  @keyframes cart-up { from{opacity:0;transform:translateX(-50%) translateY(16px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  .cart-pill { animation: cart-up 0.3s cubic-bezier(0.16,1,0.3,1) both; }

  /* rating modal */
  @keyframes modal-in { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  .modal-in { animation: modal-in 0.3s cubic-bezier(0.16,1,0.3,1) both; }
  .star-hover { transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1); }
  .star-hover:hover { transform: scale(1.35) translateY(-4px); }

  /* add btn */
  .add-btn {
    width:100%; display:flex; align-items:center; justify-content:center; gap:0.5rem;
    background:#1c1917; color:#fff; font-weight:800; font-size:0.85rem;
    padding:0.75rem 1rem; border-radius:0.875rem; border:none; cursor:pointer;
    transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
  }
  .add-btn:hover { background:#ef4444; box-shadow:0 8px 20px rgba(239,68,68,0.25); }
  .add-btn:active { transform:scale(0.97); }

  /* qty stepper */
  .qty-wrap { display:flex; align-items:center; gap:0; background:#f5f5f4; border-radius:0.875rem; overflow:hidden; }
  .qty-btn  { width:2.5rem; height:2.5rem; display:flex; align-items:center; justify-content:center; cursor:pointer; border:none; background:transparent; color:#57534e; transition:background 0.15s ease, color 0.15s ease; }
  .qty-btn:hover { background:#e7e5e4; color:#1c1917; }
  .qty-num  { min-width:2rem; text-align:center; font-weight:900; font-size:0.9rem; color:#1c1917; }

  /* scrollbar hide for tab strip */
  .no-sb::-webkit-scrollbar { display:none; }
  .no-sb { -ms-overflow-style:none; scrollbar-width:none; }
`;

export default function Menu() {
  const { restaurantId } = useParams();
  const navigate         = useNavigate();

  const [menu,       setMenu]       = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState('All');
  const [modal,      setModal]      = useState({ open:false, itemId:null, name:'' });
  const [hoverStar,  setHoverStar]  = useState(0);

  const { cart, addToCart, removeFromCart } = useCart();

  useEffect(() => { window.scrollTo(0, 0); }, [restaurantId]);

  useEffect(() => {
    (async () => {
      try {
        const [mRes, rRes] = await Promise.all([
          api.get(`/menu/${restaurantId}`),
          api.get('/restaurants'),
        ]);
        setMenu(mRes.data);
        setRestaurant(rRes.data.find(r => r._id === restaurantId) || null);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [restaurantId]);

  const qty        = id => cart.items.find(i => i._id === id)?.quantity || 0;
  const cartCount  = cart.items.reduce((s,i) => s + i.quantity, 0);
  const cartTotal  = cart.items.reduce((s,i) => s + i.price * i.quantity, 0);

  /* group by category */
  const grouped = menu.reduce((acc, item) => {
    const c = item.categoryId?.name || 'Other';
    (acc[c] = acc[c] || []).push(item);
    return acc;
  }, {});
  const cats     = ['All', ...Object.keys(grouped)];
  const filtered = activeTab === 'All' ? menu : (grouped[activeTab] || []);

  const submitRating = async (score) => {
    const userId = localStorage.getItem('userId');
    if (!userId) { alert('Please sign in to rate.'); return; }
    try {
      const res = await api.post(`/menu/${modal.itemId}/rate`, { userId, score });
      setMenu(prev => prev.map(i => i._id === modal.itemId ? { ...i, averageRating: res.data.averageRating } : i));
      setModal({ open:false, itemId:null, name:'' });
    } catch { alert('Failed to submit rating.'); }
  };

  /* ── Loading ── */
  if (loading) return (
    <div style={{minHeight:'70vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f5f4'}}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'1rem'}}>
        <div style={{width:'2.5rem',height:'2.5rem',border:'2px solid #7f1d1d',borderTopColor:'#ef4444',borderRadius:'9999px',animation:'spin 0.8s linear infinite'}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{color:'#a8a29e',fontSize:'0.7rem',letterSpacing:'0.2em',fontWeight:600,textTransform:'uppercase'}}>Loading menu</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{STYLE}</style>
      <div className="menu-root">

        {/* ══════════════════════════════
            H E R O
        ══════════════════════════════ */}
        <section
          className="relative flex flex-col overflow-hidden hero-grain bg-stone-950"
          style={{ minHeight: '440px', paddingTop: '72px' }}
        >
          {/* BG */}
          <div
            className="absolute inset-0 bg-center bg-cover hero-img"
            style={{ backgroundImage: restaurant?.image
              ? `url('http://localhost:3000/uploads/${restaurant.image}')`
              : `url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=90&w=2000&auto=format&fit=crop')`
            }}
          />
          {/* Overlays */}
          <div className="absolute inset-0" style={{zIndex:1, background:'linear-gradient(to top, #0c0a09 30%, rgba(12,10,9,0.55) 70%, rgba(12,10,9,0.15) 100%)'}} />
          <div className="absolute inset-0" style={{zIndex:1, background:'linear-gradient(to right, rgba(12,10,9,0.8) 0%, rgba(12,10,9,0.2) 50%, transparent 100%)'}} />
          {/* Glow */}
          <div className="absolute pointer-events-none" style={{top:'15%',right:'8%',width:'22rem',height:'22rem',borderRadius:'9999px',background:'radial-gradient(circle,rgba(239,68,68,0.18),transparent 70%)',zIndex:1,filter:'blur(1px)'}}/>

          {/* Back + Copy — same container so margins always match */}
          <div className="relative flex flex-col justify-between flex-1 w-full px-6 py-8 mx-auto md:px-10 lg:px-16 max-w-7xl" style={{zIndex:5}}>
            {/* Back button — sits at top of container, same left edge as content */}
            <button
              onClick={() => navigate(-1)}
              className="rv1 flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-semibold transition-colors w-fit mb-auto"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {/* Copy — always at bottom of hero */}
            <div className="pt-10 mt-auto">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-5 rv1">
              <div className="w-8 h-px bg-red-500"/>
              <span className="text-red-400 text-xs font-black uppercase tracking-[0.3em]">QuickCrave · Menu</span>
            </div>

            {/* Restaurant name */}
            <h1 className="mb-3 leading-none rv2 font-display">
              <span className="block italic font-black text-white"
                style={{fontSize:'clamp(2.8rem,7vw,6rem)'}}>
                {restaurant?.name || 'Our Menu'}
              </span>
              <span className="block mt-1 font-bold text-stone-400"
                style={{fontSize:'clamp(1.2rem,2.8vw,2rem)'}}>
                {restaurant?.cuisineType ? `${restaurant.cuisineType} cuisine` : 'Curated selections'}
              </span>
            </h1>

            {/* Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-5 rv3">
              {[
                { icon:<Clock className="w-3 h-3"/>,   label:'20–35 min' },
                { icon:<Utensils className="w-3 h-3"/>, label:`${menu.length} items` },
                ...(restaurant?.address ? [{ icon:<MapPin className="w-3 h-3"/>, label:restaurant.address }] : []),
              ].map(({ icon, label }) => (
                <div key={label}
                  className="flex items-center gap-1.5 text-white/70 text-xs font-semibold px-3 py-1.5 rounded-xl"
                  style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',backdropFilter:'blur(8px)'}}>
                  {icon} {label}
                </div>
              ))}
            </div>
            </div>{/* end Copy */}
          </div>{/* end container */}
        </section>


        {/* ══════════════════════════════
            C A T E G O R Y   T A B S
        ══════════════════════════════ */}
        <div className="sticky z-30 border-b shadow-sm bg-stone-50/95 border-stone-200"
          style={{ top: '72px', backdropFilter:'blur(12px)' }}>
          <div className="px-6 mx-auto md:px-10 lg:px-16 max-w-7xl">
            <div className="flex items-center gap-2 py-3 overflow-x-auto no-sb">
              {cats.map(cat => (
                <button key={cat} onClick={() => setActiveTab(cat)}
                  className={`ctab flex-shrink-0 ${activeTab === cat ? 'ctab-on' : 'ctab-off'}`}>
                  {cat}
                  {cat !== 'All' && (
                    <span className={`ml-1.5 text-[10px] font-black ${activeTab === cat ? 'opacity-50' : 'text-stone-400'}`}>
                      {grouped[cat]?.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* ══════════════════════════════
            M E N U   I T E M S
        ══════════════════════════════ */}
        <div className="px-6 mx-auto md:px-10 lg:px-16 max-w-7xl pt-14 pb-36">

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-stone-200 rounded-3xl">
              <ShoppingBag className="mb-5 w-14 h-14 text-stone-200"/>
              <p className="text-2xl italic font-bold font-display text-stone-300">Nothing here yet</p>
              <p className="mt-2 text-sm text-stone-400">This kitchen is preparing something special…</p>
            </div>
          ) : activeTab === 'All' ? (
            /* Grouped view */
            <div className="space-y-20">
              {Object.entries(grouped).map(([cat, items], idx) => (
                <div key={cat}>
                  {/* Section header — same style as Home "Trending Spots" */}
                  <div className="relative flex items-end justify-between gap-4 mb-12">
                    <div className="relative">
                      <div className="absolute pointer-events-none select-none ghost-num"
                        style={{top:'-2.5rem',left:'-1rem'}}>
                        {String(idx+1).padStart(2,'0')}
                      </div>
                      <p className="text-red-500 font-black text-xs uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
                        <Utensils className="w-3 h-3"/> Category
                      </p>
                      <div className="leading-tight font-display">
                        <span className="block font-black text-stone-900"
                          style={{fontSize:'clamp(1.8rem,3.5vw,2.8rem)'}}>
                          {cat}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 px-4 py-2 text-sm font-bold bg-white border shadow-sm text-stone-400 border-stone-200 rounded-xl">
                      {items.length} item{items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                    {items.map(item => (
                      <MenuCard key={item._id} item={item} qty={qty(item._id)}
                        onAdd={() => addToCart(restaurantId, item)}
                        onRemove={() => removeFromCart(item._id)}
                        onRate={() => setModal({ open:true, itemId:item._id, name:item.name })}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Filtered single category */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filtered.map(item => (
                <MenuCard key={item._id} item={item} qty={qty(item._id)}
                  onAdd={() => addToCart(restaurantId, item)}
                  onRemove={() => removeFromCart(item._id)}
                  onRate={() => setModal({ open:true, itemId:item._id, name:item.name })}
                />
              ))}
            </div>
          )}
        </div>


        {/* ══════════════════════════════
            S T I C K Y   C A R T
        ══════════════════════════════ */}
        {cartCount > 0 && (
          <div className="fixed z-50 cart-pill bottom-8" style={{left:'50%',transform:'translateX(-50%)'}}>
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center gap-4 text-white font-bold pl-5 pr-2 py-2.5 rounded-2xl shadow-2xl transition-all active:scale-95"
              style={{background:'#1c1917',boxShadow:'0 8px 32px rgba(0,0,0,0.35)'}}
              onMouseEnter={e => e.currentTarget.style.background='#ef4444'}
              onMouseLeave={e => e.currentTarget.style.background='#1c1917'}
            >
              <div className="flex items-center gap-2 text-sm">
                <ShoppingBag className="w-4 h-4"/>
                {cartCount} item{cartCount !== 1 ? 's' : ''}
              </div>
              <div className="w-px h-5 bg-white/20"/>
              <span className="text-sm font-black">Rs. {cartTotal.toFixed(2)}</span>
              <div className="flex items-center gap-1 bg-white/15 rounded-xl px-3 py-1.5 text-xs font-bold ml-1">
                View Cart <ChevronRight className="w-3 h-3"/>
              </div>
            </button>
          </div>
        )}


        {/* ══════════════════════════════
            R A T I N G   M O D A L
        ══════════════════════════════ */}
        {modal.open && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{background:'rgba(10,8,7,0.85)',backdropFilter:'blur(16px)'}}
            onClick={() => setModal({ open:false, itemId:null, name:'' })}
          >
            <div className="modal-in bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}>
              {/* Dark header */}
              <div className="relative px-8 pt-8 pb-7 bg-stone-950">
                <button
                  onClick={() => setModal({ open:false, itemId:null, name:'' })}
                  className="absolute top-5 right-5 text-stone-600 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-full p-1.5 transition-colors"
                >
                  <X className="w-4 h-4"/>
                </button>
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-red-600 shadow-lg rounded-2xl shadow-red-900/50">
                  <Star className="w-6 h-6 text-white fill-current"/>
                </div>
                <h3 className="text-2xl italic font-bold text-white font-display">Rate this dish</h3>
                <p className="mt-1 text-sm font-medium text-stone-500">{modal.name}</p>
              </div>
              {/* Stars */}
              <div className="px-8 py-8 text-center">
                <p className="mb-6 text-sm font-medium text-stone-400">How was it?</p>
                <div className="flex justify-center gap-2 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} className="star-hover focus:outline-none"
                      onMouseEnter={() => setHoverStar(s)}
                      onMouseLeave={() => setHoverStar(0)}
                      onClick={() => submitRating(s)}>
                      <Star className={`w-10 h-10 transition-colors ${s <= hoverStar ? 'text-amber-400 fill-current' : 'text-stone-200'}`}/>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold h-4">
                  {hoverStar > 0 ? ['','Poor','Fair','Good','Great','Amazing!'][hoverStar] : 'Tap a star to rate'}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}


/* ══════════════════════════════
   M E N U   C A R D
══════════════════════════════ */
function MenuCard({ item, qty, onAdd, onRemove, onRate }) {
  return (
    <div className="mcard group">
      {/* Image */}
      <div className="relative overflow-hidden bg-stone-100" style={{height:'13rem'}}>
        {item.image ? (
          <img
            src={`http://localhost:3000/uploads/${item.image}`}
            alt={item.name}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            onError={e => { e.target.onerror=null; e.target.src='https://images.unsplash.com/photo-1546241072-48010ad28c2c?q=80&w=800&auto=format&fit=crop'; }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <ShoppingBag className="w-12 h-12 text-stone-200"/>
          </div>
        )}
        {/* hover tint */}
        <div className="absolute inset-0 transition-colors duration-300 bg-transparent group-hover:bg-stone-950/10"/>
        {/* price */}
        <div className="absolute top-3 right-3 text-white text-sm font-black px-3 py-1.5 rounded-xl"
          style={{background:'rgba(12,10,9,0.82)',backdropFilter:'blur(4px)'}}>
          Rs. {parseFloat(item.price).toFixed(2)}
        </div>
        {/* rating */}
        <button onClick={onRate}
          className="absolute top-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl shadow-md hover:scale-105 transition-transform z-10">
          <Star className={`w-3 h-3 ${item.averageRating > 0 ? 'text-amber-400 fill-current' : 'text-stone-300'}`}/>
          <span className="text-xs font-black text-stone-800">
            {item.averageRating > 0 ? item.averageRating.toFixed(1) : 'Rate'}
          </span>
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 p-5">
        <div>
          <h3 className="text-lg font-black leading-snug transition-colors font-display text-stone-900 group-hover:text-red-600 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-stone-400 text-xs font-medium mt-1.5 leading-relaxed line-clamp-2">
            {item.description || 'Expertly prepared with the finest seasonal ingredients.'}
          </p>
        </div>

        {/* Controls */}
        <div className="pt-4 border-t border-stone-100">
          {qty === 0 ? (
            <button onClick={onAdd} className="add-btn">
              <Plus className="w-4 h-4"/> Add to Cart
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <div className="qty-wrap">
                <button onClick={onRemove} className="qty-btn"><Minus className="w-4 h-4"/></button>
                <span className="qty-num">{qty}</span>
                <button onClick={onAdd} className="qty-btn"><Plus className="w-4 h-4"/></button>
              </div>
              <span className="text-xs font-black tracking-widest text-red-600 uppercase">In cart</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}