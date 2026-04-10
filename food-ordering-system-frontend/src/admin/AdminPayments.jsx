import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Download, Eye, Edit } from 'lucide-react';

const AdminPayments = () => {
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchPaymentRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all orders across all users
      const res = await api.get('/orders');
      // Filter for orders with payment receipts only
      const paidOrders = res.data.filter(order => order.paymentReceipt);
      setPaymentRecords(paidOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      console.log('All Payment Records:', paidOrders);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch payment records');
      console.error('Payment Records Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentRecords();
  }, []);

  const handleViewDetails = (order) => {
    console.log('Viewing payment details for order:', order._id);
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleDownloadReceipt = (receiptPath) => {
    if (!receiptPath) return;
    
    try {
      console.log('Receipt path:', receiptPath);
      
      // Extract filename - handle both formats:
      // 1. Full path: "/uploads/receipts/receipt-123.jpeg"
      // 2. Filename only: "receipt-123.jpeg"
      let filename = receiptPath;
      if (receiptPath.includes('/')) {
        filename = receiptPath.split('/').pop();
      }
      
      if (!filename) {
        alert('Invalid receipt filename');
        return;
      }
      
      console.log('Extracted filename:', filename);
      
      // Use the download endpoint
      const downloadUrl = `http://localhost:3003/download/${filename}`;
      console.log('Downloading from:', downloadUrl);
      
      // Create a temporary link and click it
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Download initiated');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download receipt. Please try again. Check browser console for details.');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount?.toFixed(2) || '0.00'}`;
  };

  if (loading) {
    return <div className="text-center py-20 animate-pulse text-gray-500 font-bold">Loading payment records...</div>;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Payment Management</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Payment Management</h1>
          <p className="text-gray-500 mt-2">View and manage all user payment receipts</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-green-600">{paymentRecords.length}</div>
          <div className="text-sm text-gray-500">Total Paid Orders</div>
        </div>
      </div>

      {paymentRecords.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Payment Records</h3>
          <p className="text-gray-500">No users have uploaded payment receipts yet.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Receipt</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paymentRecords.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">...{order._id.slice(-6)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="font-mono text-xs bg-gray-50 px-2 py-1 rounded inline-block">...{order.userId?.slice(-6) || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={order.location}>
                      {order.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-black text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                        ✓ Uploaded
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadReceipt(order.paymentReceipt)}
                        className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition"
                        title="Download Receipt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-900 to-blue-600 text-white p-6 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-black">Payment Details</h2>
                <p className="text-gray-200 text-sm">Order ID: {selectedOrder._id}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-2xl hover:text-gray-200 transition"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* User & Order Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Information</h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">User ID:</span>
                    <span className="text-gray-900 font-mono text-sm">{selectedOrder.userId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">Order Date:</span>
                    <span className="text-gray-900 font-medium">{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Details</h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">Delivery Address:</span>
                    <span className="text-gray-900 font-medium text-right max-w-xs">{selectedOrder.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">Status:</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      ✓ {selectedOrder.status || 'Confirmed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Items Ordered</h3>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white rounded border border-gray-100">
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(selectedOrder.totalAmount - 150)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-semibold text-gray-900">Rs. 150.00</span>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-2 flex justify-between">
                    <span className="font-bold text-gray-900">Total Paid</span>
                    <span className="text-2xl font-black text-green-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Receipt Section */}
              {selectedOrder.paymentReceipt && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📄</div>
                      <div>
                        <p className="font-bold text-gray-900">Payment Receipt</p>
                        <p className="text-xs text-gray-500">File uploaded and verified</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadReceipt(selectedOrder.paymentReceipt)}
                      className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
