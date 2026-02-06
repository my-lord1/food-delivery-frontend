import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Plus, Edit2, Trash2, Search, ChevronDown, X, AlertCircle } from 'lucide-react';
import RestaurantHeader from '../../components/common/RestaurantHeader';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const CATEGORIES = [
  'Starters', 'Main Course', 'Breads', 'Rice & Biryani', 'Chinese',
  'South Indian', 'Desserts', 'Beverages', 'Salads', 'Soups',
  'Snacks', 'Breakfast', 'Combos', 'Pizza', 'Burger', 'Sandwiches', 'Other'
];

const SPICE_LEVELS = ['mild', 'medium', 'hot', 'extra-hot', 'not-applicable'];

const ALLERGEN_LIST = [
  'Dairy', 'Eggs', 'Gluten', 'Nuts', 'Soy', 
  'Shellfish', 'Fish', 'Peanuts', 'Sesame', 'None'
];

const RestaurantMenu = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discountedPrice: '',
    isVeg: true,
    spiceLevel: 'not-applicable',
    portionSize: '1 serving',
    preparationTime: 15,
    nutritionalInfo: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      sugar: '',
      sodium: ''
    },
    allergens: [],
    customizations: [], 
    isBestSeller: false,
    isRecommended: false
  });

  useEffect(() => {
    if (user?.restaurant) {
      fetchMenuItems();
    }
  }, [user]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/restaurants/${user.restaurant}/menu`, {
        params: { showAll: 'true' }
      });
      setMenuItems(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      discountedPrice: '',
      isVeg: true,
      spiceLevel: 'not-applicable',
      portionSize: '1 serving',
      preparationTime: 15,
      nutritionalInfo: { calories: '', protein: '', carbs: '', fat: '', fiber: '', sugar: '', sodium: '' },
      allergens: [],
      customizations: [],
      isBestSeller: false,
      isRecommended: false
    });
    setShowItemModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      discountedPrice: item.discountedPrice || '',
      isVeg: item.isVeg,
      spiceLevel: item.spiceLevel || 'not-applicable',
      portionSize: item.portionSize || '1 serving',
      preparationTime: item.preparationTime || 15,
      nutritionalInfo: {
        calories: item.nutritionalInfo?.calories || '',
        protein: item.nutritionalInfo?.protein || '',
        carbs: item.nutritionalInfo?.carbs || '',
        fat: item.nutritionalInfo?.fat || '',
        fiber: item.nutritionalInfo?.fiber || '',
        sugar: item.nutritionalInfo?.sugar || '',
        sodium: item.nutritionalInfo?.sodium || ''
      },
      allergens: item.allergens || [],
      customizations: item.customizations || [],
      isBestSeller: item.isBestSeller || false,
      isRecommended: item.isRecommended || false
    });
    setShowItemModal(true);
  };

  const handleNutritionalChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      nutritionalInfo: {
        ...prev.nutritionalInfo,
        [field]: value
      }
    }));
  };

  const handleAllergenChange = (allergen) => {
    setFormData(prev => {
      const current = prev.allergens;
      if (current.includes(allergen)) {
        return { ...prev, allergens: current.filter(a => a !== allergen) };
      } else {
        return { ...prev, allergens: [...current, allergen] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountedPrice: formData.discountedPrice ? Number(formData.discountedPrice) : undefined,
        preparationTime: Number(formData.preparationTime),
        nutritionalInfo: {
          calories: Number(formData.nutritionalInfo.calories),
          protein: Number(formData.nutritionalInfo.protein),
          carbs: Number(formData.nutritionalInfo.carbs),
          fat: Number(formData.nutritionalInfo.fat),
          fiber: Number(formData.nutritionalInfo.fiber || 0),
          sugar: Number(formData.nutritionalInfo.sugar || 0),
          sodium: Number(formData.nutritionalInfo.sodium || 0),
        }
      };

      if (editingItem) {
        await api.put(`/api/menu/${editingItem._id}`, payload);
      } else {
        await api.post(`/api/restaurants/${user.restaurant}/menu`, payload);
      }
      
      setShowItemModal(false);
      fetchMenuItems();
      alert(`Menu item ${editingItem ? 'updated' : 'added'} successfully`);
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert(error.response?.data?.message || 'Failed to save menu item. Check required fields.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/api/menu/${itemId}`);
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete menu item');
      }
    }
  };

  const handleToggleAvailability = async (itemId) => {
    try {
      await api.patch(`/api/menu/${itemId}/toggle-availability`);
      fetchMenuItems();
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <RestaurantHeader />
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <RestaurantHeader />

      <div className="flex-1 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black text-gray-900">Menu Management</h1>
            <button onClick={handleAddItem} className="bg-black hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl transition flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Item
            </button>
            <button onClick={() => navigate('/restaurant/dashboard')} className="text-primary hover:text-primary-dark font-semibold">
              ← Back to Dashboard
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search menu items..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium transition-all outline-none"/>
            </div>
          </div>

          {Object.keys(groupedItems).length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
   
              <h2 className="text-2xl font-black text-gray-900 mb-2">No menu items found</h2>
              <p className="text-gray-500 mb-6">Add delicious items to your menu!</p>
              <button onClick={handleAddItem} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition">
                Add First Item
              </button>
            </div>
          ) : (
            Object.keys(groupedItems).map((category) => (
              <div key={category} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-xl font-black text-gray-900">
                    {category} <span className="text-gray-400 text-sm font-medium ml-2">({groupedItems[category].length})</span>
                  </h2>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-4">
                  {groupedItems[category].map((item) => (
                    <div key={item._id} className={`flex items-start gap-4 p-4 border rounded-xl transition-all ${item.isAvailable ? 'border-gray-100 bg-white' : 'border-gray-200 bg-gray-50 opacity-75'}`}>
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                         {item.image?.url ? <img src={item.image.url} className="w-full h-full object-cover" /> : '🥘'}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <span>{item.isVeg ? '🟢' : '🔴'}</span>
                              {item.name}
                              {!item.isAvailable && <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded uppercase">Unavailable</span>}
                              {item.isBestSeller && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded uppercase">Bestseller</span>}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleToggleAvailability(item._id)} className={`px-3 py-1 rounded-full text-xs font-bold transition ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm font-medium text-gray-500 mt-3">
                          <span className="text-black font-bold">₹{item.price}</span>
                          <span>{item.nutritionalInfo.calories} cal</span>
                          <span>⏱️ {item.preparationTime} min</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleEditItem(item)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteItem(item._id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <div className="sticky top-0 bg-white border-b px-8 py-6 flex items-center justify-between z-10">
              <h3 className="text-2xl font-black text-gray-900">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <button onClick={() => setShowItemModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="space-y-4">
                <h4 className="font-bold text-lg text-gray-900 border-b pb-2">Basic Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Item Name *</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-medium outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. Butter Chicken" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category *</label>
                    <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-medium outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description *</label>
                  <textarea required rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-medium outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹) *</label>
                    <input type="number" required min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-medium outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Type *</label>
                    <div className="flex gap-4 mt-3">
                       <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.isVeg} onChange={() => setFormData({...formData, isVeg: true})} className="w-5 h-5 accent-green-600"/> <span className="font-bold text-gray-700">Veg</span></label>
                       <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={!formData.isVeg} onChange={() => setFormData({...formData, isVeg: false})} className="w-5 h-5 accent-red-600"/> <span className="font-bold text-gray-700">Non-Veg</span></label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Spice Level</label>
                    <select value={formData.spiceLevel} onChange={e => setFormData({...formData, spiceLevel: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-medium outline-none focus:ring-2 focus:ring-orange-500">
                      {SPICE_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                   </div>
                   <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Prep Time (mins)</label>
                    <input type="number" value={formData.preparationTime} onChange={e => setFormData({...formData, preparationTime: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-medium outline-none focus:ring-2 focus:ring-orange-500" />
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-lg text-gray-900 border-b pb-2 flex items-center gap-2">
                  <AlertCircle size={18} className="text-orange-500"/> Nutritional Info (Required)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Calories</label>
                     <input type="number" required value={formData.nutritionalInfo.calories} onChange={e => handleNutritionalChange('calories', e.target.value)} className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-orange-500" placeholder="kcal"/>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Protein (g)</label>
                     <input type="number" required value={formData.nutritionalInfo.protein} onChange={e => handleNutritionalChange('protein', e.target.value)} className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-orange-500" placeholder="g"/>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Carbs (g)</label>
                     <input type="number" required value={formData.nutritionalInfo.carbs} onChange={e => handleNutritionalChange('carbs', e.target.value)} className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-orange-500" placeholder="g"/>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fat (g)</label>
                     <input type="number" required value={formData.nutritionalInfo.fat} onChange={e => handleNutritionalChange('fat', e.target.value)} className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-orange-500" placeholder="g"/>
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                 <h4 className="font-bold text-lg text-gray-900 border-b pb-2">Allergens</h4>
                 <div className="flex flex-wrap gap-3">
                    {ALLERGEN_LIST.map(allergen => (
                      <label key={allergen} className={`cursor-pointer px-4 py-2 rounded-full border text-sm font-bold transition ${formData.allergens.includes(allergen) ? 'bg-orange-100 border-orange-500 text-orange-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                         <input type="checkbox" className="hidden" checked={formData.allergens.includes(allergen)} onChange={() => handleAllergenChange(allergen)} />
                         {allergen}
                      </label>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="font-bold text-lg text-gray-900 border-b pb-2">Tags & Options</h4>
                 <div className="flex gap-6">
                    <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                       <input type="checkbox" checked={formData.isBestSeller} onChange={e => setFormData({...formData, isBestSeller: e.target.checked})} className="w-5 h-5 accent-orange-500"/>
                       Mark as Bestseller
                    </label>
                    <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                       <input type="checkbox" checked={formData.isRecommended} onChange={e => setFormData({...formData, isRecommended: e.target.checked})} className="w-5 h-5 accent-orange-500"/>
                       Mark as Recommended
                    </label>
                 </div>
              </div>

              <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition transform hover:scale-[1.01]">
                {editingItem ? 'Update Item' : 'Save New Item'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RestaurantMenu;