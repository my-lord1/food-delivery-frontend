import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const ResetPasswordPage = () => {
  const { resettoken } = useParams(); 
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${resettoken}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FFFBF2] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl w-full max-w-md border-4 border-green-500 p-8 text-center shadow-xl">
          <h2 className="text-2xl font-black text-green-600 mb-2">Password Reset!</h2>
          <p className="text-gray-500">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF2] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl w-full max-w-md border-4 border-orange-500 p-8 shadow-xl">
        <h1 className="text-3xl font-black mb-2">Reset Password</h1>
        <p className="text-gray-500 mb-6">Create a new strong password.</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-10 outline-none focus:border-orange-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required/>
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-orange-500 transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required/>
          </div>

          <button disabled={loading} className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-900 transition-all active:scale-95 flex items-center justify-center">
            {loading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;