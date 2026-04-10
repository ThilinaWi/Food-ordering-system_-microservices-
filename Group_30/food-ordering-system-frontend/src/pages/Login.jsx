import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Lock, Mail, Utensils } from 'lucide-react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700;1,900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  .auth-root { font-family: 'DM Sans', sans-serif; }
  .auth-input {
    width: 100%; padding: 0.875rem 1rem 0.875rem 3rem;
    background: #f5f5f4; border: 1.5px solid #e7e5e4;
    border-radius: 0.875rem; font-weight: 500; font-size: 0.9rem;
    color: #1c1917; outline: none;
    transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  }
  .auth-input:focus {
    background: #fff;
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239,68,68,0.12);
  }
  .auth-input::placeholder { color: #a8a29e; }
  @keyframes authReveal {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .auth-card { animation: authReveal 0.5s cubic-bezier(0.16,1,0.3,1) both; }
`;

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { login }               = useAuth();
  const navigate                = useNavigate();
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'admin') navigate('/admin/categories');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLE}</style>
      <div className="auth-root min-h-[80vh] flex items-center justify-center py-12">
        <div className="w-full max-w-md auth-card">

          {/* Card */}
          <div className="bg-white rounded-[2rem] shadow-xl border border-stone-100 overflow-hidden">

            {/* Top accent bar */}
            <div className="w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />

            <div className="p-10">
              {/* Logo mark */}
              <div className="flex items-center gap-2.5 mb-8">
                <div className="p-2 bg-red-600 shadow-lg rounded-xl shadow-red-900/20">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight text-stone-900"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}>
                  QuickCrave
                </span>
              </div>

              <h1 className="mb-1 text-3xl font-black text-stone-900">Welcome back</h1>
              <p className="mb-8 text-sm font-medium text-stone-500">Sign in to your account to continue ordering.</p>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 font-semibold p-4 rounded-2xl mb-6 text-sm">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="relative">
                  <Mail className="absolute w-4 h-4 -translate-y-1/2 pointer-events-none text-stone-400 left-4 top-1/2" />
                  <input
                    type="email" placeholder="Email address"
                    value={email} onChange={e => setEmail(e.target.value)}
                    required className="auth-input"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute w-4 h-4 -translate-y-1/2 pointer-events-none text-stone-400 left-4 top-1/2" />
                  <input
                    type="password" placeholder="Password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    required className="auth-input"
                  />
                </div>

                {/* Submit */}
                <button
                  disabled={loading} type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-red-500/20 active:scale-[0.98] disabled:opacity-60 mt-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    <>Sign In <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <p className="mt-8 text-sm font-medium text-center text-stone-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-red-600 hover:underline">
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;