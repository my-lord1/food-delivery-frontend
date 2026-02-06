import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Package, DollarSign, Star, MessageSquare, TrendingUp, Clock, ChevronRight, MapPin } from 'lucide-react';
import RestaurantHeader from '../../components/common/RestaurantHeader'; 
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [restaurant, setRestaurant] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.restaurant) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      if (!user || !user.restaurant) {
        setLoading(false);
        return;
      }
      setLoading(true);
      
      const restaurantResponse = await api.get(`/api/restaurants/${user.restaurant}`);
      setRestaurant(restaurantResponse.data.data);

      try {
        const statsResponse = await api.get(`/api/restaurants/${user.restaurant}/stats`);
        setStats(statsResponse.data.data);
      } catch (err) {
        console.warn("Stats failed to load", err);
      }

      const ordersResponse = await api.get(`/api/restaurants/${user.restaurant}/orders`, {
        params: { limit: 5 }
      });
      setRecentOrders(ordersResponse.data.data || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const toggleAcceptingOrders = async () => {
    try {
      await api.patch(`/api/restaurants/${user.restaurant}/toggle-orders`);
      setRestaurant(prev => ({
        ...prev,
        isAcceptingOrders: !prev.isAcceptingOrders
      }));
    } catch (error) {
      console.error('Error toggling orders:', error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <RestaurantHeader /> 
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <RestaurantHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md mx-4">
            <h2 className="text-2xl font-black text-gray-800 mb-2">No Restaurant Found</h2>
            <p className="text-gray-500 mb-6">You haven't set up your restaurant profile yet.</p>
            <button onClick={() => navigate('/restaurant/create')} className="bg-black hover:bg-gray-800 text-white font-bold px-8 py-3 rounded-xl transition">
              Create Restaurant
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <RestaurantHeader />

      <div className="flex-1 pt-28"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-black text-gray-900 leading-tight mb-2">
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-3 text-gray-500 font-medium">
                <span className="flex items-center gap-1 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <MapPin size={12} /> {restaurant.location.city}
                </span>
                <span className="text-gray-300">•</span>
                <span>Restaurant Dashboard</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</span>
                <span className={`text-sm font-black ${restaurant.isAcceptingOrders ? 'text-green-600' : 'text-gray-400'}`}>
                  {restaurant.isAcceptingOrders ? 'Accepting Orders' : 'Currently Closed'}
                </span>
              </div>
              
              <button 
                onClick={toggleAcceptingOrders}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                  restaurant.isAcceptingOrders ? 'bg-green-500' : 'bg-gray-200'
                }`}>
                <span
                  className={`${
                    restaurant.isAcceptingOrders ? 'translate-x-7' : 'translate-x-1'
                  } inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Overview', icon: TrendingUp, path: '/restaurant/dashboard', active: true },
              { label: 'Orders', icon: Package, path: '/restaurant/orders', active: false },
              { label: 'Menu', emoji: '🍽️', path: '/restaurant/menu', active: false },
              { label: 'Reviews', icon: Star, path: '/restaurant/reviews', active: false },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 font-bold transition-all ${
                  item.active 
                    ? 'border-black bg-black text-white' 
                    : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'
                }`}>
                {item.icon ? <item.icon className="w-5 h-5" /> : <span className="text-xl">{item.emoji}</span>}
                {item.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900">Recent Activity</h2>
              <button onClick={() => navigate('/restaurant/orders')} className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 text-sm">
                View All Orders <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {recentOrders.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <div key={order._id} onClick={() => navigate('/restaurant/orders')} className="flex items-center justify-between py-4 hover:bg-gray-50 -mx-4 px-4 rounded-xl transition cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-black">
                        #{order.orderNumber.slice(-4)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {order.items.length} Item{order.items.length !== 1 && 's'}
                        </p>
                        <p className="text-xs text-gray-500 font-bold">
                          ₹{order.pricing.total} • {order.payment.method === 'cash_on_delivery' ? 'COD' : 'Paid'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                      <p className="text-xs text-gray-400 mt-1 font-medium">
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-bold">No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const StatsCard = ({ icon: Icon, color, value, label }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{value}</h3>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
  );
};

export default RestaurantDashboard;