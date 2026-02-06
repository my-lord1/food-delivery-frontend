import { useState } from 'react';
import { UtensilsCrossed, Store, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPage = () => {
  const [role, setRole] = useState('customer');

  const handleGoogleLogin = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    window.location.href = `${baseUrl}/api/auth/google?role=${role}`;
  };

  return (
    <div className="min-h-screen bg-[#FFFBF2] flex items-center justify-center p-6 font-sans overflow-hidden relative">
      <div className="bg-white rounded-3xl h-130 w-100 border-4 border-orange-500 flex flex-col justify-center gap-5">
        <header className="text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-8xl font-black tracking-tighter mb-4 bg-gradient-to-b from-orange-500 to-orange-600 bg-clip-text text-transparent">
          giggidy
          </motion.h1>
          <p className="text-orange-900/40 text-xs font-black uppercase tracking-[0.4em] mb-2">
          Welcome to the Family
          </p>
        </header>

        <div className="flex items-center justify-center gap-5">
        {[
        { id: 'customer', label: 'Order Food', sub: 'Customer', icon: UtensilsCrossed },
        { id: 'restaurant_owner', label: 'Patner', sub: 'Restaurant', icon: Store }
        ].map((item) => (
        <button key={item.id} onClick={() => setRole(item.id)} className={`group relative flex flex-col items-center justify-center h-50 w-30 p-8 rounded-2xl border-2 transition-all duration-500 ${
        role === item.id
        ? 'border-orange-500 bg-white shadow-[0_20px_40px_rgba(249,115,22,0.15)] scale-105'
        : 'border-gray-100 bg-white/50 hover:border-orange-200 backdrop-blur-sm'
        }`}>
        <AnimatePresence>
        {role === item.id && (
        <motion.div layoutId="outline" className="absolute inset-0 rounded-2xl ring-2 ring-orange-500 ring-offset-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}/>
        )}
        </AnimatePresence>

        <div className={`p-4 rounded-2xl mb-4 transition-all duration-500 ${role === item.id ? 'bg-orange-500 text-white rotate-6' : 'bg-gray-100 text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-500'}`}>
          <item.icon size={32} />
        </div>

        <span className={`text-xl font-bold tracking-tight ${role === item.id ? 'text-gray-900' : 'text-gray-500'}`}>
        {item.label}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-40">
        {item.sub}
        </span>

        {role === item.id && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-4 right-4">
        <CheckCircle2 className="text-orange-500" size={20} />
        </motion.div>
        )}
        </button>
        ))}
        </div>

        <div className='flex justify-center'>
          <button onClick={handleGoogleLogin} className='w-65 h-10 group bg-black text-white rounded-2xl flex items-center justify-center gap-3 cursor-pointer '> 
            <span className="font-bold text-lg">Continue with Google</span>
            <div className="bg-white p-1.5 rounded-lg group-hover:rotate-360 transition-transform">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
          </button>
        </div>

        
      </div>
    </div>
  );
};

export default AuthPage;