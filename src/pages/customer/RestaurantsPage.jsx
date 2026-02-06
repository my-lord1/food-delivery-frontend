import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Clock, Heart, ChevronDown, SlidersHorizontal, MapPin, Search as SearchIcon, Leaf, Check, Filter } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { setRestaurants, setLoading, setFilters } from '../../redux/slices/restaurantSlice';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const CITIES = ['Anantapur', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune'];

const PRICE_LEVELS = [
  { value: '₹', label: 'Budget' },
  { value: '₹₹', label: 'Moderate' },
  { value: '₹₹₹', label: 'Premium' },
];

const TOP_CUISINES = ['North Indian', 'South Indian', 'Chinese', 'Biryani'];

const RestaurantsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { restaurants, loading, filters } = useSelector((state) => state.restaurant);
  const { user } = useSelector((state) => state.auth); 
  const [showFilters, setShowFilters] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || "");
  const [favoriteIds, setFavoriteIds] = useState([]); 

  const currentCity = searchParams.get('city') || 'Anantapur';

  useEffect(() => {
    if (user?.favoriteRestaurants) {
      const ids = user.favoriteRestaurants.map(item => 
        typeof item === 'string' ? item : item._id
      );
      setFavoriteIds(ids);
    }
  }, [user]);

  const fetchRestaurants = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const params = {
        city: currentCity,
        search: searchInput,
        cuisineType: filters.cuisineType.join(','),
        priceRange: filters.priceRange.join(','),
        isVeg: filters.isVeg ? 'true' : undefined, 
        rating: filters.rating, 
      };

      const response = await api.get('/api/restaurants', { params });
      dispatch(setRestaurants(response.data.data || [])); 
    } catch (error) {
      console.error('Fetch error:', error);
      dispatch(setRestaurants([]));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, currentCity, searchInput, filters]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') setSearchParams({ ...Object.fromEntries(searchParams), search: searchInput });
  };

  const handleCityChange = (city) => {
    setSearchParams({ ...Object.fromEntries(searchParams), city });
    setCityDropdownOpen(false);
  };

  const toggleFilterArray = (field, value) => {
    const current = filters[field] || [];
    const updated = current.includes(value) ? current.filter(i => i !== value) : [...current, value];
    dispatch(setFilters({ ...filters, [field]: updated }));
  };

  const toggleRating = (val) => {
    const newRating = filters.rating === val ? null : val;
    dispatch(setFilters({ ...filters, rating: newRating }));
  };

  const handleFavoriteClick = async (e, restaurantId) => {
    e.stopPropagation(); 
    
    const isCurrentlyFavorite = favoriteIds.includes(restaurantId);
    const newFavorites = isCurrentlyFavorite 
      ? favoriteIds.filter(id => id !== restaurantId)
      : [...favoriteIds, restaurantId];
      
    setFavoriteIds(newFavorites);

    try {
      await api.post(`/api/favorites/restaurants/${restaurantId}`);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setFavoriteIds(favoriteIds); 
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28"> 
        
        <div className="relative z-30 mb-8 flex flex-col md:flex-row gap-6 items-end justify-between">
            <div className="relative">
               <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest mb-2">
                 <MapPin size={14} /> Location
               </div>
               <div className="relative inline-block">
                  <button onClick={() => setCityDropdownOpen(!cityDropdownOpen)} className="flex items-center gap-2 text-3xl font-black text-gray-900 hover:text-orange-600">
                    {currentCity} <ChevronDown size={24} />
                  </button>
                  {cityDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-56 bg-white shadow-xl rounded-xl border border-gray-100 z-50">
                      {CITIES.map(city => (
                        <button key={city} onClick={() => handleCityChange(city)} className="w-full text-left px-5 py-3 font-bold text-sm hover:bg-orange-50 text-gray-700">{city}</button>
                      ))}
                    </div>
                  )}
               </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto items-center">
               <div className="relative flex-1 md:w-80">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={handleSearch} placeholder="Search..." className="w-full pl-12 pr-4 py-3 rounded-xl border-none shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-orange-500" />
               </div>
               <button onClick={() => setShowFilters(!showFilters)} className={`p-3 rounded-xl font-bold border shadow-sm ${showFilters ? 'bg-gray-900 text-white' : 'bg-white'}`}>
                 <Filter size={20} />
               </button>
            </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-8 relative z-20">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-8">
                 <div className="space-y-3">
                    <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Type</h4>
                    <button onClick={() => dispatch(setFilters({...filters, isVeg: !filters.isVeg}))} className={`w-full flex items-center justify-between p-3 rounded-xl border-2 ${filters.isVeg ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}>
                       <span className="font-bold text-gray-700 flex items-center gap-2"><Leaf size={16} className={filters.isVeg ? "text-green-600" : "text-gray-400"}/> Veg Only</span>
                       {filters.isVeg && <Check size={16} className="text-green-600" />}
                    </button>
                 </div>

                 <div className="space-y-3">
                    <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Cuisines</h4>
                    <div className="flex flex-col gap-2">
                       {TOP_CUISINES.map(c => (
                         <label key={c} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.cuisineType.includes(c) ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                                {filters.cuisineType.includes(c) && <Check size={12} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" onChange={() => toggleFilterArray('cuisineType', c)} checked={filters.cuisineType.includes(c)} />
                            <span className={`text-sm font-bold ${filters.cuisineType.includes(c) ? 'text-gray-900' : 'text-gray-500 group-hover:text-orange-500'}`}>{c}</span>
                         </label>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-3">
                    <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Ratings</h4>
                    <div className="flex flex-col gap-2">
                       {[4, 3.5, 3].map(r => (
                         <label key={r} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${filters.rating === r ? 'bg-yellow-400 border-yellow-400' : 'border-gray-300 bg-white'}`}>
                                {filters.rating === r && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <input type="radio" name="rating" className="hidden" onChange={() => toggleRating(r)} checked={filters.rating === r} />
                            <span className="text-sm font-bold text-gray-600 flex items-center gap-1">
                                {r}+ <Star size={12} className="fill-gray-400 text-gray-400" />
                            </span>
                         </label>
                       ))}
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                    <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Price</h4>
                    <div className="flex gap-2">
                       {PRICE_LEVELS.map(p => (
                         <button key={p.value} onClick={() => toggleFilterArray('priceRange', p.value)} className={`flex-1 py-2 rounded-lg text-sm font-bold border ${filters.priceRange.includes(p.value) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500'}`}>
                           {p.label}
                         </button>
                       ))}
                    </div>
                 </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20 relative z-10">
            {restaurants.length > 0 ? restaurants.map((restaurant) => {
              
              const isFavorite = favoriteIds.includes(restaurant._id);

              return (
                <motion.div 
                  layout 
                  key={restaurant._id} 
                  onClick={() => navigate(`/restaurant/${restaurant._id}`)} 
                  className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 cursor-pointer group">
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img 
                      src={restaurant.coverImage?.url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"} 
                      alt={restaurant.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 shadow-sm">
                      <Star size={12} className="text-orange-500 fill-orange-500" /> {restaurant.averageRating || 'NEW'}
                    </div>

                    <button 
                      onClick={(e) => handleFavoriteClick(e, restaurant._id)} className={`absolute top-4 right-4 p-2.5 rounded-full transition-all z-20 shadow-sm backdrop-blur ${ isFavorite ? 'bg-white text-red-500 scale-110' : 'bg-black/20 text-white hover:bg-white hover:text-red-500'}`}>
                      <Heart size={18} className={isFavorite ? "fill-current" : ""} />
                    </button>

                  </div>

                  <div className="p-6">
                     <h3 className="text-xl font-black text-gray-900 mb-1">{restaurant.name}</h3>
                     <p className="text-xs text-gray-500 font-bold uppercase mb-4">{restaurant.cuisineType.slice(0,3).join(', ')}</p>
                     <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                          <Clock size={16} className="text-orange-500" /> {restaurant.deliveryTime} mins
                        </div>
                        <div className="text-xs font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                          {PRICE_LEVELS.find(p => p.value === restaurant.priceRange)?.label || 'Avg'}
                        </div>
                     </div>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="col-span-full text-center py-20 font-bold text-gray-400">No restaurants found.</div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RestaurantsPage;