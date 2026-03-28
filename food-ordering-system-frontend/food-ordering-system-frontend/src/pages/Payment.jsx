import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

const Payment = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // Simulated amount since we are passing basic data. In a real app we'd fetch the actual order amount.
            // Using a dummy amount of 50 for the MVP simulation.
            const payload = { orderId, amount: 50 };
            const response = await api.post('/payments', payload);
            setResult(response.data);
            
            // If successful, update the order status
            if (response.data.status === 'Success') {
                await api.put(`/orders/${orderId}/status`, { status: 'Confirmed' });
                setTimeout(() => navigate('/orders'), 3000);
            }
        } catch (error) {
            setResult({ status: 'Failed Error', error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center py-12">
            <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-10 border border-gray-100 text-center relative overflow-hidden">
                
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>

                {!result && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto text-primary-600 mb-6">
                            <CreditCard className="h-10 w-10" />
                        </div>
                        
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h2>
                            <p className="text-gray-500 mb-2">Order Tracking ID:</p>
                            <p className="text-sm font-mono bg-gray-100 inline-block px-3 py-1 rounded text-gray-700 font-bold">{orderId}</p>
                        </div>

                        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium border border-blue-100 flex items-start text-left">
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
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500">
                            <CheckCircle className="h-12 w-12" />
                        </div>
                        <h2 className="text-3xl font-black text-green-600">Payment Successful!</h2>
                        <p className="text-gray-600 font-medium text-lg">Your order is confirmed and is now being prepared.</p>
                        <p className="text-sm text-gray-400 mt-4">Redirecting you to your orders...</p>
                    </div>
                )}

                {result && result.status !== 'Success' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                            <AlertCircle className="h-12 w-12" />
                        </div>
                        <h2 className="text-3xl font-black text-red-600">Payment Failed</h2>
                        <p className="text-gray-600 text-lg">Unfortunately, your payment could not be processed at this time.</p>
                        <button 
                            onClick={handlePayment} 
                            className="mt-6 w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payment;
