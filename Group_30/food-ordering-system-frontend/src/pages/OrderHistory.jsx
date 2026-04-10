import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, Package, ChefHat, Truck, XCircle, MapPin, CreditCard, Star, ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .oh-root { font-family: 'DM Sans', sans-serif; background: #fafaf9; }
  .oh-display { font-family: 'Playfair Display', Georgia, serif; }

  @keyframes ohReveal { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .oh-r1 { animation: ohReveal 0.6s cubic-bezier(0.16,1,0.3,1) 0.0s both; }
  .oh-r2 { animation: ohReveal 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
  .oh-r3 { animation: ohReveal 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both; }

  @keyframes ohCardIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .oh-card { animation: ohCardIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }

  .oh-card-inner {
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }
  .oh-card-inner:hover {
    box-shadow: 0 20px 60px -12px rgba(0,0,0,0.18);
    transform: translateY(-2px);
  }

  .oh-track-fill {
    transition: width 0.8s cubic-bezier(0.16,1,0.3,1);
  }

  .oh-tab {
    padding: 0.5rem 1.1rem;
    border-radius: 9999px;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    transition: all 0.18s ease;
    border: 1.5px solid #e7e5e4;
    background: #fff;
    color: #78716c;
    cursor: pointer;
  }
  .oh-tab:hover { border-color: #d6d3d1; color: #1c1917; }
  .oh-tab.active { background: #1c1917; color: #fff; border-color: #1c1917; }

  .oh-item-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.6rem 0;
    border-bottom: 1px solid #f5f5f4;
  }
  .oh-item-row:last-child { border-bottom: none; }

  @keyframes floatPkg { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  .oh-float { animation: floatPkg 4s ease-in-out infinite; }
`;

const STATUS = {
  Pending:   { dot:'#f59e0b', label:'Awaiting confirmation', Icon: Clock,        step: 0 },
  Confirmed: { dot:'#3b82f6', label:'Order confirmed',       Icon: CheckCircle,  step: 1 },
  Preparing: { dot:'#f97316', label:'Being prepared',        Icon: ChefHat,      step: 2 },
  Delivered: { dot:'#22c55e', label:'Delivered',             Icon: Truck,        step: 3 },
  Cancelled: { dot:'#ef4444', label:'Cancelled',             Icon: XCircle,      step: -1 },
};

const STEPS = ['Pending','Confirmed','Preparing','Delivered'];

function Stepper({ status }) {
  if (status === 'Cancelled') return null;
  const current = STEPS.indexOf(status);
  const pct = current < 0 ? 0 : Math.round((current / (STEPS.length - 1)) * 100);

  return (
    <div className="pt-2 pb-6 px-7">
      <div className="relative h-1 mb-4 rounded-full bg-stone-100">
        <div
          className="absolute top-0 left-0 h-full bg-red-500 rounded-full oh-track-fill"
          style={{ width: `${pct}%` }}
        />
        {STEPS.map((s, i) => {
          const done = i <= current;
          const left = `${(i / (STEPS.length - 1)) * 100}%`;
          return (
            <div
              key={s}
              className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 top-1/2"
              style={{ left }}
            >
              <div
                className="w-3 h-3 border-2 border-white rounded-full"
                style={{ background: done ? STATUS[s]?.dot || '#ef4444' : '#e7e5e4', boxShadow: done ? `0 0 0 2px ${STATUS[s]?.dot}33` : 'none' }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between">
        {STEPS.map((s, i) => {
          const done = i <= current;
          const Ic = STATUS[s]?.Icon || Clock;
          return (
            <div key={s} className="flex flex-col items-center gap-0.5" style={{ width: '25%' }}>
              <Ic className="w-3 h-3" style={{ color: done ? STATUS[s]?.dot : '#d6d3d1' }} />
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: done ? '#1c1917' : '#d6d3d1' }}>{s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({ order, index }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS[order.status] || STATUS.Pending;
  const Ic = cfg.Icon;

  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div
      className="oh-card"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="overflow-hidden bg-white border shadow-md oh-card-inner rounded-3xl border-stone-200">

        {/* ── Header ── */}
        <div
          className="flex items-center justify-between py-5 cursor-pointer select-none px-7"
          onClick={() => setOpen(v => !v)}
        >
          <div className="flex items-center min-w-0 gap-4">
            {/* Status icon circle */}
            <div
              className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-2xl"
              style={{ background: cfg.dot + '18' }}
            >
              <Ic className="w-4.5 h-4.5" style={{ color: cfg.dot, width:'1.1rem', height:'1.1rem' }} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-black text-stone-400 tracking-wider">
                  #{order._id.slice(-8).toUpperCase()}
                </span>
                <span
                  className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: cfg.dot + '18', color: cfg.dot }}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs font-medium text-stone-400">
                <Clock className="w-3 h-3" />
                {dateStr} · {timeStr}
                <span className="text-stone-300">·</span>
                <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-shrink-0 gap-4 ml-3">
            <div className="text-right">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total</div>
              <div className="text-lg font-black text-stone-900">${order.totalAmount.toFixed(2)}</div>
            </div>
            <div
              className="flex items-center justify-center transition-transform duration-200 border w-7 h-7 rounded-xl border-stone-100"
              style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </div>
          </div>
        </div>

        {/* ── Expandable body ── */}
        {open && (
          <>
            <Stepper status={order.status} />

            {/* Divider */}
            <div className="h-px bg-stone-50 mx-7" />

            {/* Delivery address */}
            {order.location && (
              <div className="flex items-start gap-2.5 px-7 py-4 text-sm">
                <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="font-medium leading-snug text-stone-500">{order.location}</span>
              </div>
            )}

            {/* Items */}
            <div className="pb-2 px-7">
              {order.items.map((item, i) => (
                <div key={i} className="oh-item-row">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-600 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                      {item.quantity}
                    </span>
                    <span className="text-sm font-semibold text-stone-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-stone-600">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between py-5 mt-2 border-t px-7 border-stone-50">
              <div>
                {order.status === 'Delivered' && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Delivered successfully
                  </div>
                )}
                {order.status === 'Cancelled' && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                    <XCircle className="w-3.5 h-3.5" />
                    Order was cancelled
                  </div>
                )}
                {(order.status === 'Preparing' || order.status === 'Confirmed') && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500">
                    <ChefHat className="w-3.5 h-3.5" />
                    {cfg.label}…
                  </div>
                )}
                {order.status === 'Pending' && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                    <Clock className="w-3.5 h-3.5" />
                    {cfg.label}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={`/orders/${order._id}`}
                  className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold px-4 py-2.5 rounded-2xl transition-all duration-200"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  View Details
                </Link>
                {order.status === 'Pending' && (
                  <Link
                    to={`/payment/${order._id}`}
                    className="flex items-center gap-2 bg-stone-900 hover:bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition-all duration-200 shadow-md hover:shadow-red-500/20 active:scale-[0.97]"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Complete Payment
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const { user } = useAuth();

  useEffect(() => {
    const uid = localStorage.getItem('userId') || user?.id;
    if (!uid) { setLoading(false); return; }
    api.get(`/orders/${uid}`)
      .then(res => setOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .catch(err => console.error('Failed to fetch orders', err))
      .finally(() => setLoading(false));
  }, [user]);

  const TABS = ['All', 'Pending', 'Confirmed', 'Preparing', 'Delivered', 'Cancelled'];
  const visible = activeTab === 'All' ? orders : orders.filter(o => o.status === activeTab);

  /* Loading */
  if (loading) return (
    <div className="flex justify-center items-center h-[60vh] mt-20">
      <div className="w-10 h-10 border-b-2 border-red-500 rounded-full animate-spin" />
    </div>
  );

  /* Empty */
  if (orders.length === 0) return (
    <>
      <style>{STYLE}</style>
      <div className="oh-root flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 px-4 mt-20">
        <div className="flex items-center justify-center w-24 h-24 oh-float bg-stone-100 rounded-3xl">
          <Package className="w-10 h-10 text-stone-300" />
        </div>
        <div>
          <h2 className="mb-2 text-4xl italic font-bold oh-display text-stone-900">No orders yet</h2>
          <p className="max-w-xs mx-auto text-sm font-medium text-stone-400">
            You haven't placed any orders. Discover great food now!
          </p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 bg-stone-900 hover:bg-red-600 text-white font-bold px-7 py-3.5 rounded-2xl text-sm transition-all duration-200 shadow-lg hover:shadow-red-500/20 active:scale-[0.97]"
        >
          Browse Restaurants <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </>
  );

  const delivered = orders.filter(o => o.status === 'Delivered').length;
  const totalSpent = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.totalAmount, 0);
  const active = orders.filter(o => ['Pending','Confirmed','Preparing'].includes(o.status)).length;

  return (
    <>
      <style>{STYLE}</style>
      <div className="w-full space-y-8 oh-root">

        {/* ── Page header ── */}
        <div className="oh-r1">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-4xl font-black leading-tight oh-display text-stone-900">
                Order <span className="italic text-red-500">History</span>
              </h1>
              <p className="mt-1 text-sm font-medium text-stone-400">{orders.length} orders placed</p>
            </div>

            {/* Stats row */}
            <div className="flex gap-3">
              <div className="px-5 py-3 text-center bg-white border shadow-sm rounded-2xl border-stone-100">
                <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Delivered</div>
                <div className="text-2xl font-black text-stone-900 mt-0.5 oh-display">{delivered}</div>
              </div>
              {active > 0 && (
                <div className="px-5 py-3 text-center bg-white border shadow-sm rounded-2xl border-stone-100">
                  <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Active</div>
                  <div className="text-2xl font-black text-orange-500 mt-0.5 oh-display">{active}</div>
                </div>
              )}
              <div className="px-5 py-3 text-center bg-stone-900 rounded-2xl">
                <div className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Spent</div>
                <div className="text-2xl font-black text-white mt-0.5 oh-display">${totalSpent.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex flex-wrap gap-2 oh-r2">
          {TABS.map(tab => {
            const cnt = tab === 'All' ? orders.length : orders.filter(o => o.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`oh-tab ${activeTab === tab ? 'active' : ''}`}
              >
                {tab}
                <span className={`ml-1.5 text-[10px] font-bold ${activeTab === tab ? 'text-stone-400' : 'text-stone-300'}`}>
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Orders ── */}
        <div className="oh-r3">
          {visible.length === 0 ? (
            <div className="text-center bg-white border shadow-sm rounded-3xl border-stone-100 p-14">
              <Package className="w-10 h-10 mx-auto mb-3 text-stone-200" />
              <p className="font-bold text-stone-400">No {activeTab.toLowerCase()} orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visible.map((order, i) => (
                <OrderCard key={order._id} order={order} index={i} />
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}