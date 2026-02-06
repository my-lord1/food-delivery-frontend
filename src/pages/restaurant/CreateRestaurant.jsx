import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Store, MapPin, Clock, DollarSign, Mail, Phone } from 'lucide-react';
import Footer from '../../components/common/Footer';
import RestaurantHeader from '../../components/common/RestaurantHeader';
import api from '../../services/api';
import { updateUser } from '../../redux/slices/authSlice';

const CUISINE_TYPES = [
  'North Indian', 'South Indian', 'Chinese', 'Continental', 'Italian', 
  'Mexican', 'Fast Food', 'Desserts', 'Beverages', 'Biryani', 
  'Street Food', 'Healthy', 'Bakery', 'Seafood', 'Bengali', 
  'Punjabi', 'Mughlai', 'Tandoor', 'Pizza', 'Burger', 
  'Salads', 'Other', 'Snacks'
];

const CreateRestaurant = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisineType: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    deliveryTime: '30-45 mins',
    minOrderPrice: '', 
    priceRange: '₹₹',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        cuisineType: [formData.cuisineType], 
        location: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        contact: {
          phone: formData.contactPhone,
          email: formData.contactEmail
        },
        deliveryTime: formData.deliveryTime,
        minimumOrder: Number(formData.minOrderPrice), 
        priceRange: formData.priceRange
      };

      const response = await api.post('/api/restaurants', payload);
      
      if (response.data.success) {
        const newRestaurantId = response.data.data._id;
        const updatedUser = { ...user, restaurant: newRestaurantId };
        dispatch(updateUser(updatedUser));
        
        alert('Restaurant created successfully!');
        navigate('/restaurant/dashboard');
      }
    } catch (error) {
      console.error('Error creating restaurant:', error);
      alert(error.response?.data?.message || 'Failed to create restaurant. Check console.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
        <RestaurantHeader/>
      <div className="flex-1 pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Setup Your Restaurant</h1>
            <p className="text-gray-500">Enter your details to start accepting orders.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-orange-500" /> Restaurant Details
                </h3>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium transition-all outline-none"
                    placeholder="e.g. The Burger Joint"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Cuisine Type</label>
                    <select name="cuisineType" required value={formData.cuisineType} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium transition-all outline-none">
                      <option value="">Select Cuisine</option>
                      {CUISINE_TYPES.map((cuisine) => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Price Range</label>
                    <select name="priceRange" value={formData.priceRange} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium transition-all outline-none">
                      <option value="₹">₹ (Cheap)</option>
                      <option value="₹₹">₹₹ (Moderate)</option>
                      <option value="₹₹₹">₹₹₹ (Expensive)</option>
                      <option value="₹₹₹₹">₹₹₹₹ (Very Expensive)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium transition-all outline-none" placeholder="Tell customers about your food..."/>
                </div>
              </div>

              <div className="border-t border-gray-100 my-6"></div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" /> Location
                </h3>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Street Address</label>
                  <input type="text" name="street" required value={formData.street} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium transition-all outline-none"
                    placeholder="Shop No. 12, Main Street" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                    <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
                    <input type="text" name="state" required value={formData.state} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium transition-all outline-none"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Pincode</label>
                    <input type="text" name="pincode" required value={formData.pincode} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium transition-all outline-none"/>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 my-6"></div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-orange-500" /> Contact Info
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Restaurant Phone</label>
                    <input type="tel" name="contactPhone" required pattern="[0-9]{10}" title="Please enter a valid 10-digit number" value={formData.contactPhone} onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium transition-all outline-none"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Restaurant Email</label>
                    <input type="email" name="contactEmail" required value={formData.contactEmail} onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium transition-all outline-none"/>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 my-6"></div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" /> Operations
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Est. Delivery Time</label>
                    <input type="text" name="deliveryTime" required value={formData.deliveryTime} onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium transition-all outline-none"
                      placeholder="e.g. 30-45 mins" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Minimum Order (₹)</label>
                    <input type="number" name="minOrderPrice" required value={formData.minOrderPrice} onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium transition-all outline-none"
                      placeholder="e.g. 200"/>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition transform hover:scale-[1.02] mt-8">
                {isLoading ? 'Creating Restaurant...' : 'Create Restaurant'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateRestaurant;