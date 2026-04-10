import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FileText, MapPin, Calendar, DollarSign, Download, Eye, Loader, AlertCircle, Edit } from 'lucide-react';
import ReceiptUploader from '../components/ReceiptUploader';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700;1,900&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
  
  .payment-history-root { font-family: 'DM Sans', sans-serif; }
  .table-header { background: linear-gradient(135deg, #1c1917 0%, #78716c 100%); }
  
  @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .row-animation { animation: slideIn 0.3s ease-out backwards; }
  
  .receipt-btn { transition: all 0.2s ease; }
  .receipt-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239,68,68,0.3); }
  
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 49; display: flex; align-items: center; justify-content: center; }
  .modal-content { 
    max-height: 90vh; 
    overflow-y: auto;
    animation: slideIn 0.3s ease-out;
    z-index: 50;
  }
  
  .detail-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 1rem; border-bottom: 1px solid #f5f5f4; gap: 1rem; }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { font-weight: 600; color: #57534e; flex-shrink: 0; }
  .detail-value { font-weight: 500; color: #1c1917; text-align: right; flex: 1; }
  
  .modal-content::-webkit-scrollbar { width: 6px; }
  .modal-content::-webkit-scrollbar-track { background: #f5f5f4; border-radius: 3px; }
  .modal-content::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 3px; }
  .modal-content::-webkit-scrollbar-thumb:hover { background: #a8a29e; }
`;

const PaymentHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReceiptUploader, setShowReceiptUploader] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPaymentHistory();
  }, [user, navigate]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/orders/${user.id}`);
      // Filter for orders with payment receipts (paid orders)
      const paidOrders = response.data.filter(order => order.paymentReceipt);
      setOrders(paidOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      console.log('Paid Orders:', paidOrders);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch payment history');
      console.error('Payment History Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    console.log('Viewing details for order:', order._id);
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

  const handleEditReceipt = (order) => {
    console.log('Editing receipt for order:', order._id);
    setEditingOrderId(order._id);
    setShowReceiptUploader(true);
  };

  const handleReceiptUploadSuccess = () => {
    console.log('Receipt updated successfully');
    setShowReceiptUploader(false);
    setEditingOrderId(null);
    // Refresh the payment history
    fetchPaymentHistory();
    // Close the details modal if it was open
    setShowModal(false);
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

  if (!user) return null;

  return (
    <>
      <style>{STYLE}</style>
      <div className="payment-history-root min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-black text-stone-900 mb-2">Payment History</h1>
            <p className="text-lg text-stone-500">View all your paid orders and download receipts</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader className="w-12 h-12 text-red-600 animate-spin mb-4" />
              <p className="text-stone-600 font-semibold">Loading payment history...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
              <FileText className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-2">No Payment Records</h3>
              <p className="text-stone-500 mb-6">You haven't completed any orders yet. Start exploring!</p>
              <button
                onClick={() => navigate('/home')}
                className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-stone-200">
              
              {/* Table Header */}
              <div className="table-header hidden md:grid grid-cols-5 gap-4 px-6 py-4 text-white font-semibold">
                <div>Date</div>
                <div>Location</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {/* Table Rows */}
              <div>
                {orders.map((order, idx) => (
                  <div
                    key={order._id}
                    className="row-animation border-b border-stone-200 p-6 hover:bg-stone-50 transition"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {/* Mobile View */}
                    <div className="md:hidden space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-stone-600">Date</span>
                        <span className="font-medium text-stone-900">{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-stone-600">Location</span>
                        <span className="font-medium text-stone-900 text-right">{order.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-stone-600">Amount</span>
                        <span className="font-bold text-red-600">{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:grid grid-cols-5 gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        <span className="text-sm font-medium">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-stone-400" />
                        <span className="text-sm truncate">{order.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-red-600" />
                        <span className="font-bold text-red-600">{formatCurrency(order.totalAmount)}</span>
                      </div>
                      <div>
                        <span className="inline-block px-3 py-1 bg-green-50 text-green-700 font-semibold text-xs rounded-full">
                          Confirmed
                        </span>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="receipt-btn p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(order.paymentReceipt)}
                          className="receipt-btn p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                          title="Download Receipt"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="md:hidden flex gap-2">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="flex-1 receipt-btn p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center gap-1 text-sm font-semibold"
                      >
                        <Eye className="w-4 h-4" /> Details
                      </button>
                      <button
                        onClick={() => handleDownloadReceipt(order.paymentReceipt)}
                        className="flex-1 receipt-btn p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center gap-1 text-sm font-semibold"
                      >
                        <Download className="w-4 h-4" /> Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Uploader Modal */}
      {showReceiptUploader && editingOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md">
            <div className="bg-gradient-to-r from-stone-900 to-red-600 text-white p-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-black">Update Receipt</h2>
              <button
                onClick={() => setShowReceiptUploader(false)}
                className="text-2xl hover:text-stone-200 transition"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <ReceiptUploader
                orderId={editingOrderId}
                onSuccess={handleReceiptUploadSuccess}
                onError={(error) => console.error('Receipt upload error:', error)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-stone-900 to-red-600 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">Order Details</h2>
                <p className="text-stone-200 text-sm">Order ID: {selectedOrder._id}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-2xl hover:text-stone-200 transition"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              
              {/* Order Info */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-4">Order Information</h3>
                <div className="space-y-3">
                  <div className="detail-row">
                    <span className="detail-label">Order Date</span>
                    <span className="detail-value">{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Delivery Address</span>
                    <span className="detail-value text-right">{selectedOrder.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status</span>
                    <span className="text-green-700 font-bold">✓ Confirmed</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-4">Items Ordered</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-stone-900">{item.name}</p>
                        <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-stone-900">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gradient-to-r from-stone-50 to-red-50 p-4 rounded-xl border border-stone-200">
                <h3 className="text-lg font-bold text-stone-900 mb-3">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Subtotal</span>
                    <span className="font-semibold text-stone-900">
                      {formatCurrency(selectedOrder.totalAmount - 150)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Delivery Fee</span>
                    <span className="font-semibold text-stone-900">Rs. 150.00</span>
                  </div>
                  <div className="border-t-2 border-stone-200 pt-2 flex justify-between">
                    <span className="font-bold text-stone-900">Total Paid</span>
                    <span className="text-2xl font-black text-red-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Receipt Section */}
              {selectedOrder.paymentReceipt && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-bold text-stone-900">Payment Receipt</p>
                        <p className="text-xs text-stone-500">Receipt uploaded successfully</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadReceipt(selectedOrder.paymentReceipt)}
                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        View/Download
                      </button>
                      <button
                        onClick={() => handleEditReceipt(selectedOrder)}
                        className="px-4 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-stone-900 text-white font-bold rounded-lg hover:bg-stone-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentHistory;
