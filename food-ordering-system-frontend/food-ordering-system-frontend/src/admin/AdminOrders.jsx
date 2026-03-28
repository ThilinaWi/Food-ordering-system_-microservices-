import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
  
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
  
    useEffect(() => { fetchOrders(); }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/orders/${id}/status`, { status });
            fetchOrders();
        } catch (err) { alert('Failed to update status'); }
    };

    if(loading) return <div className="text-center py-20 animate-pulse text-gray-500 font-bold">Loading orders...</div>;
  
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Manage Orders</h1>
        
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Location/Address</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">...{order._id.slice(-6)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={order.location}>{order.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-black text-gray-900">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select 
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="border border-gray-300 rounded p-1 text-xs focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && <div className="p-10 text-center text-gray-500 font-medium">No orders found system-wide.</div>}
        </div>
      </div>
    );
  };
  
export default AdminOrders;
