import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Clock, Heart, ArrowLeft, ShoppingBag, UtensilsCrossed, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';
import { updateUser } from '../../redux/slices/authSlice';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('restaurants'); 
  const [favRestaurants, setFavRestaurants] = useState([]);
  const [favItems, setFavItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllFavorites();
  }, []);

  const fetchAllFavorites = async () => {
    try {
      setLoading(true);
      const [restRes, itemRes] = await Promise.all([
        api.get('/api/favorites/restaurants'),
        api.get('/api/favorites/menu-items')
      ]);

      setFavRestaurants(restRes.data.data || []);
      setFavItems(itemRes.data.data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeRestaurant = async (e, id) => {
    e.stopPropagation();
    setFavRestaurants(prev => prev.filter(r => r._id !== id));
    
    try {
      await api.post(`/api/favorites/restaurants/${id}`);
      if (user?.favoriteRestaurants) {
        const updated = user.favoriteRestaurants.filter(favId => favId !== id);
        dispatch(updateUser({ ...user, favoriteRestaurants: updated }));
      }
    } catch (error) {
      console.error(error);
      fetchAllFavorites(); 
    }
  };

  const removeMenuItem = async (e, menuItemId) => {
    e.stopPropagation();
    setFavItems(prev => prev.filter(item => item.menuItem._id !== menuItemId));

    try {
      await api.post(`/api/favorites/menu-items/${menuItemId}`);
    } catch (error) {
      console.error(error);
      fetchAllFavorites(); 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition">
              <ArrowLeft size={20} className="text-gray-700"/>
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Your Favorites</h1>
              <p className="text-gray-500 text-sm">Saved restaurants and dishes</p>
            </div>
          </div>

          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 inline-flex">
            <button onClick={() => setActiveTab('restaurants')} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'restaurants' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Store size={18} /> Restaurants <span className="opacity-60 ml-1">({favRestaurants.length})</span>
            </button>
            <button onClick={() => setActiveTab('dishes')} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'dishes' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
              <UtensilsCrossed size={18} /> Dishes <span className="opacity-60 ml-1">({favItems.length})</span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'restaurants' && (
            <motion.div key="restaurants" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {favRestaurants.length > 0 ? favRestaurants.map((restaurant) => (
                <motion.div layout key={restaurant._id} onClick={() => navigate(`/restaurant/${restaurant._id}`)} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 cursor-pointer group relative">
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img src={restaurant.images?.[0]?.url || restaurant.coverImage?.url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"} alt={restaurant.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 shadow-sm">
                      <Star size={12} className="text-orange-500 fill-orange-500" /> {restaurant.averageRating || 'NEW'}
                    </div>
                    <button onClick={(e) => removeRestaurant(e, restaurant._id)} className="absolute top-4 right-4 p-2.5 bg-white text-red-500 rounded-full shadow-md hover:bg-red-50 hover:scale-110 transition-all z-20">
                      <Heart size={18} className="fill-current" />
                    </button>
                  </div>
                  <div className="p-6">
                     <h3 className="text-xl font-black text-gray-900 mb-1">{restaurant.name}</h3>
                     <p className="text-xs text-gray-500 font-bold uppercase mb-4">
                        {Array.isArray(restaurant.cuisineType) ? restaurant.cuisineType.slice(0, 3).join(', ') : 'Multi-cuisine'}
                     </p>
                     <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                          <Clock size={16} className="text-orange-500" /> {restaurant.deliveryTime || '30-40'} mins
                        </div>
                        <button className="text-xs font-black text-white bg-gray-900 px-4 py-2 rounded-full hover:bg-orange-500 transition-colors">
                           View Menu
                        </button>
                     </div>
                  </div>
                </motion.div>
              )) : (
                <EmptyState type="restaurants" navigate={navigate} />
              )}
            </motion.div>
          )}

          {activeTab === 'dishes' && (
            <motion.div key="dishes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {favItems.length > 0 ? favItems.map(({ menuItem, restaurant }) => {
                if (!menuItem) return null; 
                return (
                  <motion.div layout key={menuItem._id} onClick={() => navigate(`/restaurant/${restaurant?._id}`)} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all border border-gray-100 cursor-pointer flex gap-4 group relative">
                    <div className="w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 relative">
                       <img src={menuItem.image?.url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"} alt={menuItem.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       <button onClick={(e) => removeMenuItem(e, menuItem._id)} className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full shadow hover:scale-110 transition-all z-20">
                         <Heart size={14} className="fill-current" />
                       </button>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                       <div className="flex items-start justify-between mb-1">
                          <div className={`w-4 h-4 border ${menuItem.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center p-[2px]`}>
                             <div className={`w-full h-full rounded-full ${menuItem.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                          </div>
                          <span className="font-black text-lg text-gray-900">₹{menuItem.price}</span>
                       </div>
                       
                       <h3 className="font-bold text-gray-800 line-clamp-1 mb-1">{menuItem.name}</h3>
                       <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                          from <span className="font-semibold text-orange-600 hover:underline">{restaurant?.name || 'Unknown Restaurant'}</span>
                       </p>
                       
                       <button className="mt-auto w-full text-xs font-bold bg-orange-50 text-orange-600 py-2 rounded-lg hover:bg-orange-100 transition flex items-center justify-center gap-2">
                          Order Now <ShoppingBag size={14} />
                       </button>
                    </div>
                  </motion.div>
                );
              }) : (
                <EmptyState type="dishes" navigate={navigate} />
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

const EmptyState = ({ type, navigate }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
      <Heart size={32} className="text-gray-300" />
    </div>
    <h2 className="text-xl font-bold text-gray-800 mb-2">No favorite {type} yet</h2>
    <p className="text-gray-500 mb-6 text-sm">Save items you love to find them easily later!</p>
    <button onClick={() => navigate('/restaurants')} className="bg-gray-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-black transition-all">
      Browse {type === 'restaurants' ? 'Restaurants' : 'Food'}
    </button>
  </div>
);

export default FavoritesPage;