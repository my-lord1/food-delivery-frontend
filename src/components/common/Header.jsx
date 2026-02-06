import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, ShoppingCart, Heart, Package, LogOut, User, Utensils, Bell, Check } from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../pages/customer/NotificationContext';

const Header = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false); 
  
  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null); 

  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { unreadCount, notifications, markAsRead, markAllRead } = useNotification();
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000); 
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <header className="bg-[#FFFBF2] backdrop-blur-md sticky top-0 z-[100] border-b border-gray-100">

      <div className="max-w-7xl m-9 px-6 sm:px-8 h-10 flex items-center place-content-around">
        
        <Link to="/restaurants" className="flex-shrink-0 pr-8 h-10">
          <h1 className="text-3xl font-black text-orange-500 tracking-tighter">
            giggidy
          </h1>
        </Link>

        <nav className="hidden lg:flex items-center gap-4">
          {[
            { label: 'Browse', icon: Utensils, path: '/restaurants' },
            { label: 'Orders', icon: Package, path: '/orders' },
            { label: 'Saved', icon: Heart, path: '/favorites' }
          ].map((item) => (
            <Link key={item.label} to={item.path} className="flex items-center gap-1 text-[15px] font-black uppercase text-orange-500 hover:text-black transition-colors">
              <item.icon size={16} strokeWidth={2.5} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative" ref={notificationRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2.5 hover:bg-orange-50 rounded-xl transition-all text-gray-700 hover:text-orange-500 outline-none">
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-2 bg-red-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-gray-100 rounded-2xl shadow-xl z-[110] overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-black text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                        <Check size={12} /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">
                        <Bell size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-bold">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif._id} 
                          onClick={() => {
                            if (!notif.isRead) markAsRead(notif._id);
                            if (notif.relatedOrder) navigate('/orders');
                          }}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-orange-50/30' : ''}`}>
                          <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notif.isRead ? 'bg-orange-500' : 'bg-gray-300'}`} />
                          <div>
                            <p className={`text-sm ${!notif.isRead ? 'font-black text-gray-900' : 'font-medium text-gray-600'}`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wide">
                              {formatTime(notif.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/cart" className="relative p-2.5 hover:bg-orange-50 rounded-xl transition-all text-gray-700 hover:text-orange-500">
            <ShoppingCart size={22} />
            {cartItemCount > 0 && (
              <span className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white">
                {cartItemCount}
              </span>
            )}
          </Link>

          <div className="relative" ref={profileMenuRef}>
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center justify-center w-10 h-10 bg-orange-600 hover:bg-black text-white rounded-xl transition-transform active:scale-95 shadow-lg shadow-gray-200 ml-2">
              <span className="text-sm font-black uppercase">{user?.name?.charAt(0)}</span>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="flex flex-col items-center justify-center gap-3 absolute right-0 top-12 w-64 bg-white border-2 border-orange-100 rounded-2xl shadow-xl z-[110] p-4">
                  <div className="border-b border-gray-100 w-full pb-3 mb-1 text-center">
                    <p className="font-black text-gray-900 text-lg leading-tight truncate px-2">
                      {user?.name}
                    </p>
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">
                      Verified Member
                    </p>
                  </div>
                  
                  <div className="flex flex-col w-full gap-1">
                    <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-bold text-sm transition-colors">
                      <User size={18} /> Profile Settings
                    </Link>
                    <button onClick={() => dispatch(logout())} className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-500 font-bold text-sm transition-colors text-left">
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;