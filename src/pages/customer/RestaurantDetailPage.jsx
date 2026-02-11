import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux'; 
import { Star, Clock, MapPin, ArrowLeft, Search as SearchIcon, Heart, Info, X, Activity, Plus, Minus } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';
import { addToCart } from '../../redux/slices/cartSlice'; 

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [selectedNutrition, setSelectedNutrition] = useState(null);
  const [selectedItemForCart, setSelectedItemForCart] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({}); 
  const [instructions, setInstructions] = useState(""); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resInfo = await api.get(`/api/restaurants/${id}`);
        setRestaurant(resInfo.data.data);

        const resMenu = await api.get(`/api/restaurants/${id}/menu`);
        setMenuItems(resMenu.data.data || []);
        
        try {
            const favRes = await api.get('/api/favorites/menu-items');
            const favIds = favRes.data.data.map(item => item.menuItem._id);
            setFavoriteIds(favIds);
        } catch (err) {
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleToggleFavorite = async (menuItemId) => {
    const isCurrentlyFav = favoriteIds.includes(menuItemId);
    if (isCurrentlyFav) {
      setFavoriteIds(prev => prev.filter(id => id !== menuItemId));
    } else {
      setFavoriteIds(prev => [...prev, menuItemId]);
    }

    try {
      await api.post(`/api/favorites/menu-items/${menuItemId}`);
    } catch (error) {
      console.error("Failed to update favorite", error);
    }
  };

  const handleAddItemClick = (item) => {
    if (item.customizations && item.customizations.length > 0) {
      setQuantity(1);
      setSelectedOptions({});
      setInstructions("");
      setSelectedItemForCart(item);
    } else {
      const itemTotal = item.price * 1;

      dispatch(addToCart({
        item: {
          _id: item._id,           
          menuItem: item._id,      
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: 1,
          isVeg: item.isVeg,
          customizations: [],      
          specialInstructions: "", 
          itemTotal: itemTotal     
        },
        restaurant: restaurant
      }));
      
      alert(`${item.name} added to cart!`);
    }
  };

  const handleOptionChange = (groupName, option, isMultiple) => {
    setSelectedOptions(prev => {
      const currentGroup = prev[groupName] || [];
      
      if (isMultiple) {
        const exists = currentGroup.find(opt => opt.name === option.name);
        if (exists) {
          return { ...prev, [groupName]: currentGroup.filter(opt => opt.name !== option.name) };
        } else {
          return { ...prev, [groupName]: [...currentGroup, option] };
        }
      } else {
        return { ...prev, [groupName]: [option] };
      }
    });
  };

  const handleAddToCartFromModal = () => {
    if (!selectedItemForCart) return;
    const formattedCustomizations = [];
    let customizationTotal = 0;
    
    Object.keys(selectedOptions).forEach(groupName => {
        selectedOptions[groupName].forEach(opt => {
            customizationTotal += opt.price;
            formattedCustomizations.push({
                name: groupName,  
                option: opt.name, 
                price: opt.price
            });
        });
    });

    const unitPrice = selectedItemForCart.price + customizationTotal;
    const finalItemTotal = unitPrice * quantity;

    dispatch(addToCart({
      item: {
        _id: selectedItemForCart._id,
        menuItem: selectedItemForCart._id,
        name: selectedItemForCart.name,
        image: selectedItemForCart.image,
        price: selectedItemForCart.price, 
        quantity: quantity,
        isVeg: selectedItemForCart.isVeg,
        customizations: formattedCustomizations,
        specialInstructions: instructions,
        itemTotal: finalItemTotal
      },
      restaurant: restaurant
    }));

    setSelectedItemForCart(null); 
  };

const calculateModalTotal = () => {
  if (!selectedItemForCart) return 0;
  let total = selectedItemForCart.price;
  Object.values(selectedOptions).flat().forEach(opt => {
    total += opt.price;
  });
  return total * quantity;
};

  const isFormValid = () => {
    if (!selectedItemForCart) return false;
    return selectedItemForCart.customizations.every(group => {
      if (!group.isRequired) return true;
      const selected = selectedOptions[group.name];
      return selected && selected.length > 0;
    });
  };

  const menuCategories = useMemo(() => {
    if (!menuItems.length) return {};
    const filtered = menuItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.reduce((acc, item) => {
      const cat = item.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  }, [menuItems, searchQuery]);

  const categoryKeys = Object.keys(menuCategories);

  if (loading) return <div className="min-h-screen flex justify-center items-center"><LoadingSpinner /></div>;
  if (!restaurant) return <div className="flex justify-center py-20 font-bold text-xl">Restaurant not found</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-orange-600 transition-colors">
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/3 aspect-video rounded-2xl overflow-hidden relative">
                <img src={restaurant.coverImage?.url || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"} alt={restaurant.name} className="w-full h-full object-cover"/>
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900">{restaurant.name}</h1>
                <p className="text-gray-500 font-medium">{restaurant.description}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-bold text-gray-600">
                    <span className="flex items-center gap-1"><Star size={16} className="text-orange-500 fill-orange-500"/> {restaurant.averageRating} ({restaurant.totalReviews}+ ratings)</span>
                    <span className="flex items-center gap-1"><Clock size={16}/> {restaurant.deliveryTime}</span>
                    <span className="flex items-center gap-1"><MapPin size={16}/> {restaurant.location?.city}</span>
                </div>
            </div>
        </div>

        <div className="sticky top-24 z-20 bg-gray-50 pb-4 space-y-4">
             <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search for dishes..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"/>
             </div>
             
             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button onClick={() => setActiveCategory("All")} className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-colors ${activeCategory === "All" ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                    All Items
                </button>
                {categoryKeys.map(cat => (
                    <button key={cat} onClick={() => document.getElementById(cat)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold bg-white text-gray-600 border-2 border-gray-200 hover:border-orange-600 hover:text-orange-500 transition-colors">
                        {cat}
                    </button>
                ))}
             </div>
        </div>

        <div className="space-y-10 pb-20">
            {categoryKeys.length > 0 ? categoryKeys.map(category => (
                <div key={category} id={category} className="scroll-mt-40">
                    <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        {category} <span className="text-sm font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{menuCategories[category].length}</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {menuCategories[category].map(item => (
                            <div key={item._id} className="bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-100 flex gap-4 hover:border-orange-600 transition-all group relative">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1 rounded-md border-2 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                                            <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                                        </div>
                                        <button onClick={() => handleToggleFavorite(item._id)} className="text-gray-300 hover:scale-110 transition-transform">
                                          <Heart size={20} className={favoriteIds.includes(item._id) ? "fill-red-500 text-red-500" : ""}/>
                                        </button>
                                        {item.isBestSeller && <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wide">Bestseller</span>}
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                                    <div className="font-black text-gray-700">₹{item.price}</div>
                                    <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                                    
                                    <button onClick={() => setSelectedNutrition(item)} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline pt-2 cursor-pointer">
                                      <Info size={14} /> View Nutritional Info
                                    </button>
                                </div>
                                
                                <div className="relative w-32 h-32 flex-shrink-0">
                                    <img src={item.image?.url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"} alt={item.name} className="w-full h-full object-cover rounded-xl"/>
                                    <button onClick={() => handleAddItemClick(item)} className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white text-green-600 font-black px-6 py-2 rounded-lg shadow-lg border border-gray-100 uppercase text-sm hover:bg-green-50 transition-colors cursor-pointer">
                                        ADD
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )) : (
                <div className="text-center py-20 text-gray-400 font-bold">No menu items found.</div>
            )}
        </div>
      </main>

      {selectedNutrition && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setSelectedNutrition(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
              <X size={24} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Activity size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-gray-900">{selectedNutrition.name}</h3>
                <p className="text-sm text-gray-500">Nutritional value per {selectedNutrition.portionSize}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-orange-50 p-4 rounded-2xl text-center">
                 <div className="text-2xl font-black text-orange-600">{selectedNutrition.nutritionalInfo.calories}</div>
                 <div className="text-xs font-bold text-orange-400 uppercase">Calories</div>
               </div>
               <div className="bg-gray-50 p-4 rounded-2xl text-center">
                 <div className="text-2xl font-black text-gray-900">{selectedNutrition.nutritionalInfo.protein}g</div>
                 <div className="text-xs font-bold text-gray-400 uppercase">Protein</div>
               </div>
               <div className="bg-gray-50 p-4 rounded-2xl text-center">
                 <div className="text-2xl font-black text-gray-900">{selectedNutrition.nutritionalInfo.carbs}g</div>
                 <div className="text-xs font-bold text-gray-400 uppercase">Carbs</div>
               </div>
               <div className="bg-gray-50 p-4 rounded-2xl text-center">
                 <div className="text-2xl font-black text-gray-900">{selectedNutrition.nutritionalInfo.fat}g</div>
                 <div className="text-xs font-bold text-gray-400 uppercase">Fat</div>
               </div>
            </div>
            {selectedNutrition.allergens?.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <p className="text-sm font-bold text-gray-900 mb-2">Allergens</p>
                <div className="flex flex-wrap gap-2">
                  {selectedNutrition.allergens.map(allergen => (
                    <span key={allergen} className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full">
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {selectedItemForCart && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-[2rem] max-h-[90vh] flex flex-col relative animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-gray-900">{selectedItemForCart.name}</h3>
                <p className="text-gray-500 font-bold">₹{selectedItemForCart.price}</p>
              </div>
              <button onClick={() => setSelectedItemForCart(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {selectedItemForCart.customizations?.map((group, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-lg text-gray-900">{group.name}</h4>
                    {group.isRequired && <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">REQUIRED</span>}
                  </div>
                  
                  <div className="space-y-3">
                    {group.options.map((option) => {
                      const isSelected = selectedOptions[group.name]?.some(opt => opt.name === option.name);
                      
                      return (
                        <label key={option.name} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                               {group.allowMultiple ? (
                                   isSelected && <Plus size={12} className="text-white" />
                               ) : (
                                   <div className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-white' : 'transparent'}`} />
                               )}
                            </div>
                            <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{option.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {option.price > 0 && <span className="text-sm text-gray-500">+₹{option.price}</span>}
                            <input type={group.allowMultiple ? "checkbox" : "radio"} name={group.name} className="hidden" checked={!!isSelected} onChange={() => handleOptionChange(group.name, option, group.allowMultiple)}/>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-3">Cooking Request</h4>
                <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g. Don't make it too spicy, no onions..." className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none resize-none h-24 text-sm"/>
              </div>

            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 sm:rounded-b-3xl">
              <div className="flex gap-4">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 h-14">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-1 hover:text-orange-600 disabled:opacity-50">
                    <Minus size={18} />
                  </button>
                  <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="p-1 hover:text-orange-600">
                    <Plus size={18} />
                  </button>
                </div>

                <button 
                  onClick={handleAddToCartFromModal}
                  disabled={!isFormValid()}
                  className={`flex-1 flex items-center justify-between px-6 rounded-xl font-black text-white transition-all h-14 shadow-lg shadow-orange-200 ${
                    isFormValid() 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-[1.02]' 
                      : 'bg-gray-300 cursor-not-allowed'}`}>
                  <span>Add Item</span>
                  <span className="bg-black/10 px-3 py-1 rounded-lg">₹{calculateModalTotal()}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RestaurantDetailPage;