import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Lock, Mail } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const loggedUser = await login(email, password);
            if (loggedUser.role === 'admin') {
                navigate('/admin/categories');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center animate-fade-in-up">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 max-w-md w-full relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary-500 to-orange-500"></div>
                <h2 className="text-4xl font-black text-gray-900 mb-2">Welcome back</h2>
                <p className="text-gray-500 font-medium mb-8">Enter your details and get ordering.</p>
                
                {error && <div className="bg-red-50 text-red-600 font-bold p-4 rounded-xl mb-6 text-sm flex items-center">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input 
                          type="email" 
                          placeholder="Email address" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          required 
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors outline-none font-medium text-gray-900"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input 
                          type="password" 
                          placeholder="Password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors outline-none font-medium text-gray-900"
                        />
                    </div>
                    <button disabled={loading} type="submit" className="w-full bg-slate-900 hover:bg-primary-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-primary-500/40 group">
                        {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-500 font-medium">
                    Don't have an account? <Link to="/register" className="text-primary-600 font-bold hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
