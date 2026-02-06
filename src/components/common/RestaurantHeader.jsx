import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LogOut } from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';

const RestaurantHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-[#FFFBF2] backdrop-blur-md z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        <div onClick={() => navigate('/restaurant/dashboard')} className="cursor-pointer text-3xl font-black tracking-tighter text-orange-600 hover:opacity-80 transition">
          giggidy
          <span className="text-xs font-bold text-gray-400 block tracking-widest uppercase">
            Partner
          </span>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors cursor-pointer">
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default RestaurantHeader;