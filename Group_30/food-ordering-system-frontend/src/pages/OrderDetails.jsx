import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Clock, CheckCircle, Package, ChefHat, Truck, XCircle, MapPin, CreditCard, ArrowLeft } from 'lucide-react';

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
    <div className="pt-2 pb-6 px-7 border-b border-stone-100">
      <div className="relative h-1 mb-4 rounded-full bg-stone-100">
        <div
          className="absolute top-0 left-0 h-full bg-red-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
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

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/detail/${orderId}`);
        setOrder(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch order details');
        console.error('Failed to fetch order details', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] mt-20">
        <div className="w-10 h-10 border-b-2 border-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 mt-20">
        <div className="bg-white rounded-3xl shadow-lg border border-stone-100 p-8 max-w-md text-center">
          <Package className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Order Not Found</h2>
          <p className="text-stone-500 mb-6">{error || 'The order you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/orderhistory')}
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-2xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const cfg = STATUS[order.status] || STATUS.Pending;
  const Ic = cfg.Icon;
  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
  const itemCount = order.items.reduce((s, i) => s + (i.quantity || 0), 0);

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 mt-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/orderhistory')}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 font-semibold transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-stone-900">Order Details</h1>
          <div className="w-20" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-stone-200 overflow-hidden">

          {/* Header Section */}
          <div className="flex items-center justify-between py-6 px-7 bg-gradient-to-r from-stone-50 to-white border-b border-stone-100">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-2xl"
                style={{ background: cfg.dot + '18' }}
              >
                <Ic className="w-6 h-6" style={{ color: cfg.dot }} />
              </div>
              <div>
                <div className="text-sm font-bold text-stone-400 uppercase tracking-wider">Order ID</div>
                <div className="text-lg font-black text-stone-900 font-mono">{order._id}</div>
              </div>
            </div>
            <div
              className="text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full"
              style={{ background: cfg.dot + '18', color: cfg.dot }}
            >
              {order.status}
            </div>
          </div>

          {/* Stepper */}
          <Stepper status={order.status} />

          {/* Order Metadata */}
          <div className="grid grid-cols-2 gap-4 px-7 py-6 bg-stone-50">
            <div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Order Date</div>
              <div className="text-sm font-semibold text-stone-900">{dateStr}</div>
              <div className="text-xs text-stone-500">{timeStr}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Restaurant</div>
              <div className="text-sm font-semibold text-stone-900">{order.restaurantId}</div>
            </div>
          </div>

          {/* Delivery Address */}
          {order.location && (
            <div className="flex items-start gap-3 px-7 py-5 border-t border-stone-100">
              <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Delivery Address</div>
                <div className="text-sm font-medium text-stone-700 leading-relaxed">{order.location}</div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="px-7 py-6 border-t border-stone-100">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Order Items ({itemCount})</div>
            <div className="space-y-3">
              {order.items && order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black bg-white text-stone-600 px-2.5 py-1.5 rounded-lg">
                      {item.quantity || 1}x
                    </span>
                    <div>
                      <div className="font-semibold text-stone-900">{item.name}</div>
                      <div className="text-xs text-stone-500">${(item.price || 0).toFixed(2)} each</div>
                    </div>
                  </div>
                  <div className="font-bold text-stone-900">
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="px-7 py-6 border-t border-stone-100 bg-gradient-to-r from-stone-50 to-white">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Subtotal</span>
                <span className="font-semibold text-stone-900">${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-stone-100">
                <span className="font-bold text-stone-900">Total Amount</span>
                <span className="text-2xl font-black text-red-600">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="px-7 py-6 border-t border-stone-100 bg-stone-50">
            {order.status === 'Delivered' && (
              <div className="flex items-start gap-3 text-green-700 bg-green-50 p-3 rounded-2xl border border-green-100">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Order Delivered</div>
                  <div className="text-sm">Thank you for your order! We hope you enjoyed your meal.</div>
                </div>
              </div>
            )}
            {order.status === 'Cancelled' && (
              <div className="flex items-start gap-3 text-red-700 bg-red-50 p-3 rounded-2xl border border-red-100">
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Order Cancelled</div>
                  <div className="text-sm">This order has been cancelled.</div>
                </div>
              </div>
            )}
            {(order.status === 'Pending' || order.status === 'Confirmed' || order.status === 'Preparing') && (
              <div className="flex items-start gap-3 text-amber-700 bg-amber-50 p-3 rounded-2xl border border-amber-100">
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">{cfg.label}</div>
                  <div className="text-sm">Your order is on its way!</div>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          {order.status === 'Pending' && (
            <div className="px-7 py-6 border-t border-stone-100">
              <button
                onClick={() => navigate(`/payment/${order._id}`)}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl transition-all"
              >
                <CreditCard className="w-5 h-5" />
                Complete Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
