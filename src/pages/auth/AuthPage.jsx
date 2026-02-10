import { useState, useEffect } from 'react';
import { UtensilsCrossed, Store, CheckCircle2, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPage = () => {
  // UI State
  const [role, setRole] = useState('customer');
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login/Register
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '' // Optional, can add input if needed
  });
  const [error, setError] = useState('');

  // 1. Check for URL Errors (Google Redirects)
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const errorParam = query.get('error');
    
    if (errorParam === 'account_exists_local') {
      setError('You created this account with a password. Please sign in below.');
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorParam === 'auth_failed') {
      setError('Google authentication failed. Please try again.');
    }
  }, []);

  // 2. Handle Google Login
  const handleGoogleLogin = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Make sure port matches your server
    window.location.href = `${baseUrl}/api/auth/google?role=${role}`;
  };

  // 3. Handle Email/Password Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // Success! Store token and redirect
      // Assuming your backend sends a token or cookie
      // window.location.href = '/dashboard'; 
      alert(`Success! Welcome ${data.user?.name || 'User'}`); // Replace with navigation
      
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#FFFBF2] flex items-center justify-center p-6 font-sans overflow-hidden relative">
      
      {/* Container - Changed h-130 to min-h to fit form */}
      <div className="bg-white rounded-3xl min-h-[700px] w-full max-w-md border-4 border-orange-500 flex flex-col justify-center gap-6 p-8 relative shadow-2xl">
        
        {/* Header */}
        <header className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-6xl font-black tracking-tighter mb-2 bg-gradient-to-b from-orange-500 to-orange-600 bg-clip-text text-transparent"
          >
            giggidy
          </motion.h1>
          <p className="text-orange-900/40 text-xs font-black uppercase tracking-[0.4em]">
            Welcome to the Family
          </p>
        </header>

        {/* Role Selection */}
        <div className="flex items-center justify-center gap-4">
          {[
            { id: 'customer', label: 'Eat', sub: 'Customer', icon: UtensilsCrossed },
            { id: 'restaurant_owner', label: 'Cook', sub: 'Partner', icon: Store }
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => setRole(item.id)} 
              className={`group relative flex flex-col items-center justify-center h-36 w-32 rounded-2xl border-2 transition-all duration-300 ${
                role === item.id
                  ? 'border-orange-500 bg-orange-50 shadow-lg scale-105'
                  : 'border-gray-100 bg-white hover:border-orange-200'
              }`}
            >
              {role === item.id && (
                <motion.div layoutId="outline" className="absolute inset-0 rounded-2xl ring-2 ring-orange-500 ring-offset-2" />
              )}
              
              <div className={`p-3 rounded-xl mb-2 transition-all duration-300 ${role === item.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                <item.icon size={24} />
              </div>
              <span className={`font-bold ${role === item.id ? 'text-gray-900' : 'text-gray-500'}`}>{item.label}</span>
              {role === item.id && (
                <CheckCircle2 className="absolute top-2 right-2 text-orange-500" size={16} />
              )}
            </button>
          ))}
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3 text-red-600 text-sm font-medium"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google Login */}
        <button 
          onClick={handleGoogleLogin} 
          className='w-full h-12 bg-black text-white rounded-xl flex items-center justify-center gap-3 hover:bg-gray-900 transition-colors'
        >
          <div className="bg-white p-1 rounded-full">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <span className="font-bold">Continue with Google</span>
        </button>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">Or with email</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text" 
                  name="name"
                  placeholder="Full Name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  required={!isLogin}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="email" 
              name="email"
              placeholder="Email Address" 
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="password" 
              name="password"
              placeholder="Password" 
              value={formData.password}
              onChange={handleInputChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-2 bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="text-center mt-2">
          <p className="text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }} 
              className="text-orange-600 font-bold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;