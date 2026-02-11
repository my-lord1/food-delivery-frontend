import { useState } from 'react';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setMessage('Reset link sent! Check your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF2] flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-3xl w-full max-w-md border-4 border-orange-500 p-8 shadow-xl">
        <Link to="/" className="flex items-center text-gray-500 hover:text-orange-500 mb-6 transition-colors font-bold">
          <ArrowLeft size={20} className="mr-2" /> Back to Login
        </Link>
        
        <h1 className="text-3xl font-black mb-2">Forgot Password?</h1>
        <p className="text-gray-500 mb-6">Enter your email and we'll send you a reset link.</p>

        {message && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 font-medium">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required/>
          </div>

          <button disabled={loading} className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-900 transition-colors flex items-center justify-center">
            {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;