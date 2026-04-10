// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import api from '../services/api';
// import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

// const Payment = () => {
//     const { orderId } = useParams();
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(false);
//     const [result, setResult] = useState(null);

//     const handlePayment = async () => {
//         setLoading(true);
//         try {
//             // Simulated amount since we are passing basic data. In a real app we'd fetch the actual order amount.
//             // Using a dummy amount of 50 for the MVP simulation.
//             const payload = { orderId, amount: 50 };
//             const response = await api.post('/payments', payload);
//             setResult(response.data);
            
//             // If successful, update the order status
//             if (response.data.status === 'Success') {
//                 await api.put(`/orders/${orderId}/status`, { status: 'Confirmed' });
//                 setTimeout(() => navigate('/orders'), 3000);
//             }
//         } catch (error) {
//             setResult({ status: 'Failed Error', error: error.message });
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-[70vh] flex flex-col items-center justify-center py-12">
//             <div className="relative w-full max-w-md p-10 overflow-hidden text-center bg-white border border-gray-100 shadow-xl rounded-3xl">
                
//                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>

//                 {!result && (
//                     <div className="space-y-8 animate-fade-in-up">
//                         <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-primary-50 text-primary-600">
//                             <CreditCard className="w-10 h-10" />
//                         </div>
                        
//                         <div>
//                             <h2 className="mb-2 text-3xl font-bold text-gray-900">Checkout</h2>
//                             <p className="mb-2 text-gray-500">Order Tracking ID:</p>
//                             <p className="inline-block px-3 py-1 font-mono text-sm font-bold text-gray-700 bg-gray-100 rounded">{orderId}</p>
//                         </div>

//                         <div className="flex items-start p-4 text-sm font-medium text-left text-blue-800 border border-blue-100 bg-blue-50 rounded-xl">
//                             <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
//                             <p>This is a simulated payment gateway. Clicking "Pay Now" randomly resolves to either Success or Failed.</p>
//                         </div>

//                         <button 
//                             onClick={handlePayment} 
//                             disabled={loading}
//                             className={`w-full py-4 text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-primary-500/40 flex justify-center items-center ${
//                                 loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 transform hover:-translate-y-1'
//                             }`}
//                         >
//                             {loading ? (
//                                 <span className="flex items-center">
//                                     <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
//                                     Processing Payment...
//                                 </span>
//                             ) : (
//                                 <span>Pay Now Securely</span>
//                             )}
//                         </button>
//                     </div>
//                 )}

//                 {result && result.status === 'Success' && (
//                     <div className="space-y-6 animate-fade-in-up">
//                         <div className="flex items-center justify-center w-24 h-24 mx-auto text-green-500 rounded-full bg-green-50">
//                             <CheckCircle className="w-12 h-12" />
//                         </div>
//                         <h2 className="text-3xl font-black text-green-600">Payment Successful!</h2>
//                         <p className="text-lg font-medium text-gray-600">Your order is confirmed and is now being prepared.</p>
//                         <p className="mt-4 text-sm text-gray-400">Redirecting you to your orders...</p>
//                     </div>
//                 )}

//                 {result && result.status !== 'Success' && (
//                     <div className="space-y-6 animate-fade-in-up">
//                         <div className="flex items-center justify-center w-24 h-24 mx-auto text-red-500 rounded-full bg-red-50">
//                             <AlertCircle className="w-12 h-12" />
//                         </div>
//                         <h2 className="text-3xl font-black text-red-600">Payment Failed</h2>
//                         <p className="text-lg text-gray-600">Unfortunately, your payment could not be processed at this time.</p>
//                         <button 
//                             onClick={handlePayment} 
//                             className="w-full py-3 mt-6 font-bold text-white transition bg-gray-800 hover:bg-gray-900 rounded-xl"
//                         >
//                             Try Again
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Payment;


import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ReceiptUploader from '../components/ReceiptUploader';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

const Payment = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [showReceiptUploader, setShowReceiptUploader] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // Simulated amount since we are passing basic data. In a real app we'd fetch the actual order amount.
            // Using a dummy amount of 50 for the MVP simulation.
            const payload = { orderId, amount: 50 };
            const response = await api.post('/payments', payload);
            setResult(response.data);
            
            // If successful, show receipt uploader instead of auto-redirecting
            if (response.data.status === 'Success') {
                setShowReceiptUploader(true);
            }
        } catch (error) {
            setResult({ status: 'Failed Error', error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleReceiptUploadSuccess = async () => {
        // Update order status to Confirmed after receipt upload
        try {
            console.log('Receipt uploaded successfully, updating order status...');
            await api.put(`/orders/${orderId}/status`, { status: 'Confirmed' });
            console.log('Order status updated to Confirmed');
            setTimeout(() => navigate('/payment-history'), 2000);
        } catch (error) {
            console.error('Failed to update order status:', error);
            setTimeout(() => navigate('/payment-history'), 2000);
        }
    };

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center py-12">
            {result && result.status === 'Success' && showReceiptUploader ? (
                <ReceiptUploader 
                    orderId={orderId}
                    onSuccess={handleReceiptUploadSuccess}
                />
            ) : (
                <div className="relative w-full max-w-md p-10 overflow-hidden text-center bg-white border border-gray-100 shadow-xl rounded-3xl">
                    
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>

                    {!result && (
                        <div className="space-y-8 animate-fade-in-up">
                            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-primary-50 text-primary-600">
                                <CreditCard className="w-10 h-10" />
                            </div>
                            
                            <div>
                                <h2 className="mb-2 text-3xl font-bold text-gray-900">Checkout</h2>
                                <p className="mb-2 text-gray-500">Order Tracking ID:</p>
                                <p className="inline-block px-3 py-1 font-mono text-sm font-bold text-gray-700 bg-gray-100 rounded">{orderId}</p>
                            </div>

                            <div className="flex items-start p-4 text-sm font-medium text-left text-blue-800 border border-blue-100 bg-blue-50 rounded-xl">
                                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                                <p>This is a simulated payment gateway. Clicking "Pay Now" randomly resolves to either Success or Failed.</p>
                            </div>

                            <button 
                                onClick={handlePayment} 
                                disabled={loading}
                                className={`w-full py-4 text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-primary-500/40 flex justify-center items-center ${
                                    loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 transform hover:-translate-y-1'
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Processing Payment...
                                    </span>
                                ) : (
                                    <span>Pay Now Securely</span>
                                )}
                            </button>
                        </div>
                    )}

                    {result && result.status === 'Success' && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="flex items-center justify-center w-24 h-24 mx-auto text-green-500 rounded-full bg-green-50">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-black text-green-600">Payment Successful!</h2>
                            <p className="text-lg font-medium text-gray-600">Your payment has been processed successfully.</p>
                            <p className="text-sm text-gray-500">Please upload your payment receipt to complete the order.</p>
                        </div>
                    )}

                    {result && result.status !== 'Success' && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="flex items-center justify-center w-24 h-24 mx-auto text-red-500 rounded-full bg-red-50">
                                <AlertCircle className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-black text-red-600">Payment Failed</h2>
                            <p className="text-lg text-gray-600">Unfortunately, your payment could not be processed at this time.</p>
                            <button 
                                onClick={handlePayment} 
                                className="w-full py-3 mt-6 font-bold text-white transition bg-gray-800 hover:bg-gray-900 rounded-xl"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Payment;
