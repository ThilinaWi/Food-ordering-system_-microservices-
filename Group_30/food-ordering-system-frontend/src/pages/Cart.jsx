import { useEffect } from 'react';
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import {
  Trash2, ArrowRight, ShoppingBag,
  MapPin, Loader, Plus, Minus, ChevronRight, LocateFixed
} from 'lucide-react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700;1,900&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');

  .cart-root { font-family: 'DM Sans', sans-serif; }
  .font-display { font-family: 'Playfair Display', Georgia, serif; }

  @keyframes rv { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .rv  { animation: rv 0.5s cubic-bezier(0.16,1,0.3,1) both; }
  .rv2 { animation: rv 0.5s cubic-bezier(0.16,1,0.3,1) 0.08s both; }
  .rv3 { animation: rv 0.5s cubic-bezier(0.16,1,0.3,1) 0.16s both; }

  /* item row */
  .cart-item {
    display:flex; align-items:center; gap:1rem;
    padding:1.1rem 1.25rem; margin:0 -1.25rem;
    border-bottom: 1.5px solid #f5f5f4;
    border-radius: 0.875rem;
    transition: background 0.15s ease;
  }
  .cart-item:hover { background:#fafaf9; }
  .cart-item:last-child { border-bottom: none; }

  /* qty stepper */
  .q-wrap { display:flex; align-items:center; background:#f5f5f4; border-radius:0.75rem; overflow:hidden; }
  .q-btn  {
    width:2rem; height:2rem; display:flex; align-items:center; justify-content:center;
    border:none; background:transparent; cursor:pointer; color:#78716c;
    transition: background 0.15s, color 0.15s;
  }
  .q-btn:hover { background:#e7e5e4; color:#1c1917; }
  .q-btn:disabled { opacity:0.3; pointer-events:none; }
  .q-num { min-width:2rem; text-align:center; font-weight:900; font-size:0.9rem; color:#1c1917; }

  /* location input */
  .loc-input {
    width:100%; padding:0.9rem 3.25rem 0.9rem 1rem;
    background:#f5f5f4; border:1.5px solid #e7e5e4;
    border-radius:0.875rem; font-weight:500; font-size:0.9rem;
    color:#1c1917; outline:none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .loc-input:focus {
    background:#fff; border-color:#ef4444;
    box-shadow:0 0 0 3px rgba(239,68,68,0.12);
  }
  .loc-input::placeholder { color:#a8a29e; }

  /* place order btn */
  .order-btn {
    width:100%; display:flex; align-items:center; justify-content:center; gap:0.6rem;
    background:#1c1917; color:#fff; font-weight:800; font-size:0.95rem;
    padding:1rem 1.5rem; border-radius:1rem; border:none; cursor:pointer;
    transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
    box-shadow: 0 4px 20px rgba(0,0,0,0.18);
  }
  .order-btn:hover:not(:disabled) { background:#ef4444; box-shadow:0 8px 28px rgba(239,68,68,0.3); }
  .order-btn:active:not(:disabled) { transform:scale(0.98); }
  .order-btn:disabled { opacity:0.5; cursor:not-allowed; }

  /* remove btn */
  .rm-btn {
    width:2rem; height:2rem; display:flex; align-items:center; justify-content:center;
    border-radius:0.5rem; border:none; background:transparent; cursor:pointer; color:#d6d3d1;
    transition: background 0.15s, color 0.15s;
    flex-shrink:0;
  }
  .rm-btn:hover { background:#fef2f2; color:#ef4444; }

  /* summary row */
  .sum-row { display:flex; align-items:center; justify-content:space-between; }
  .sum-label { font-size:0.85rem; font-weight:600; color:#a8a29e; }
  .sum-value { font-size:0.95rem; font-weight:700; color:#1c1917; }
  .sum-total-label { font-size:1rem; font-weight:800; color:#57534e; }
  .sum-total-value { font-size:1.5rem; font-weight:900; color:#1c1917; }
`;

const Cart = () => {
  const { cart, removeFromCart, addToCart, totalAmount, clearCart } = useCart();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [loading,         setLoading]         = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error,           setError]           = useState(null);
  const [location,        setLocation]        = useState('');


  // Scroll to top when navigating to Cart page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const deliveryFee = cart.items.length > 0 ? 150 : 0;
  const grandTotal  = totalAmount + deliveryFee;

  const handleGetLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported by your browser.'); return; }
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
      () => { setError('Location permission denied.'); setLocationLoading(false); }
    );
  };

  const handleOrder = async () => {
    if (!user) {
      if (window.confirm('You need to sign in to place an order. Go to login?')) navigate('/login');
      return;
    }
    if (!location.trim()) { setError('Please enter a delivery address.'); return; }
    setLoading(true); setError(null);
    try {
      const res = await api.post('/orders', {
        userId: user.id,
        restaurantId: cart.restaurantId,
        items: cart.items.map(i => ({ menuId: i._id, name: i.name, price: i.price, quantity: i.quantity })),
        totalAmount: grandTotal,
        location,
      });
      clearCart();
      navigate(`/payment/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally { setLoading(false); }
  };

  /* ── Empty state ── */
  if (cart.items.length === 0) return (
    <>
      <style>{STYLE}</style>
      <div className="cart-root flex flex-col items-center justify-center min-h-[65vh] text-center">
        <div className="flex items-center justify-center w-24 h-24 mb-6 border rv rounded-3xl bg-stone-100 border-stone-200">
          <ShoppingBag className="w-10 h-10 text-stone-300" />
        </div>
        <h2 className="mb-2 text-3xl italic font-bold rv2 font-display text-stone-900">Your cart is empty</h2>
        <p className="max-w-xs mb-8 text-sm font-medium leading-relaxed rv3 text-stone-400">
          You haven't added anything yet. Find something delicious to order.
        </p>
        <Link to="/"
          className="rv3 flex items-center gap-2 bg-stone-900 hover:bg-red-600 text-white font-bold px-7 py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-red-500/25 active:scale-95">
          Browse Restaurants <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </>
  );

  return (
    <>
      <style>{STYLE}</style>
      <div className="max-w-5xl pb-16 mx-auto cart-root">

        {/* Header */}
        <div className="mt-16 mb-8 rv">
          <p className="text-red-500 text-xs font-black uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5" /> Your Order
          </p>
          <h1 className="italic font-black font-display text-stone-900"
            style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', lineHeight: 1 }}>
            Review & Checkout
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div className="rv flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 font-semibold p-4 rounded-2xl mb-6 text-sm">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
            </svg>
            {error}
          </div>
        )}

        <div className="grid items-start grid-cols-1 gap-8 rv2 lg:grid-cols-5">

          {/* ── Left: Items ── */}
          <div className="overflow-hidden bg-white border shadow-sm lg:col-span-3 border-stone-200 rounded-3xl">

            {/* Cart header */}
            <div className="flex items-center justify-between py-5 border-b px-7 border-stone-100">
              <h2 className="text-base font-black text-stone-900">
                {cart.items.length} item{cart.items.length !== 1 ? 's' : ''}
              </h2>
              <button
                onClick={clearCart}
                className="text-xs font-bold transition-colors text-stone-400 hover:text-red-500"
              >
                Clear all
              </button>
            </div>

            {/* Items list */}
            <div className="px-6">
              {cart.items.map((item, i) => (
                <div key={item._id} className="cart-item"
                  style={{ animationDelay: `${i * 0.05}s` }}>

                  {/* Food image / placeholder */}
                  <div className="flex-shrink-0 overflow-hidden border w-14 h-14 rounded-2xl bg-stone-200 border-stone-300">
                    {item.image ? (
                      <img
                        src={`http://localhost:3000/uploads/${item.image}`}
                        alt={item.name}
                        className="object-cover w-full h-full"
                        onError={e => { e.target.onerror=null; e.target.style.display='none'; }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <ShoppingBag className="w-5 h-5 text-stone-300" />
                      </div>
                    )}
                  </div>

                  {/* Name + unit price */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold leading-snug truncate text-stone-900">{item.name}</h3>
                    <p className="text-stone-400 text-xs font-medium mt-0.5">
                      Rs. {parseFloat(item.price).toFixed(2)} each
                    </p>
                  </div>

                  {/* Qty stepper */}
                  <div className="flex-shrink-0 q-wrap">
                    <button className="q-btn" onClick={() => removeFromCart(item._id)} disabled={item.quantity <= 1}>
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="q-num">{item.quantity}</span>
                    <button className="q-btn" onClick={() => addToCart(cart.restaurantId, item)}>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line total */}
                  <div className="text-right flex-shrink-0 min-w-[4rem]">
                    <span className="text-sm font-black text-stone-900">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Remove */}
                  <button className="rm-btn" onClick={() => removeFromCart(item._id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>


          {/* ── Right: Summary + Checkout ── */}
          <div className="space-y-4 lg:col-span-2">

            {/* Order summary card */}
            <div className="p-6 space-y-4 bg-white border shadow-sm border-stone-200 rounded-3xl">
              <h2 className="pb-4 text-base font-black border-b text-stone-900 border-stone-100">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="sum-row">
                  <span className="sum-label">Subtotal</span>
                  <span className="sum-value">Rs. {totalAmount.toFixed(2)}</span>
                </div>
                <div className="sum-row">
                  <span className="sum-label">Delivery fee</span>
                  <span className="sum-value">Rs. {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="h-px bg-stone-100" />
                <div className="sum-row">
                  <span className="sum-total-label">Total</span>
                  <span className="sum-total-value">Rs. {grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery address card */}
            <div className="p-6 space-y-3 bg-white border shadow-sm border-stone-200 rounded-3xl">
              <h2 className="text-base font-black text-stone-900">Delivery Address</h2>
              <p className="text-xs font-medium text-stone-400">
                Enter your address or use your current location.
              </p>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Street, City, Postcode…"
                  value={location}
                  onChange={e => { setLocation(e.target.value); setError(null); }}
                  className="loc-input"
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                  title="Use current location"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-40"
                >
                  {locationLoading
                    ? <Loader className="w-4 h-4 animate-spin" />
                    : <LocateFixed className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            {/* Place order button */}
            <button
              onClick={handleOrder}
              disabled={loading || !location.trim()}
              className="order-btn"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Processing…
                </>
              ) : (
                <>Place Order & Pay <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <p className="text-xs font-medium text-center text-stone-400">
              By placing your order you agree to our{' '}
              <a href="#" className="underline hover:text-stone-600">Terms of Service</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;