import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, CreditCard, LogOut, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { logout, updateUser } from '../../redux/slices/authSlice';
import api from '../../services/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null); 
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: false
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/api/auth/profile', { name: profileData.name });
      dispatch(updateUser(response.data.data));
      setIsEditingProfile(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({ label: 'Home', street: '', city: '', state: '', pincode: '', landmark: '', isDefault: false });
    setShowAddressModal(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({ ...addr });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingAddressId) {
        response = await api.put(`/api/auth/addresses/${editingAddressId}`, addressForm);
     } else {
        response = await api.post('/api/auth/addresses', addressForm);
     }
      
      dispatch(updateUser(response.data.data)); 
      setShowAddressModal(false);
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const response = await api.delete(`/api/auth/addresses/${addressId}`);
      dispatch(updateUser(response.data.data));
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-gray-900">My Profile</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-4 rounded-xl transition">
              <LogOut size={18} />
              Logout
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">            
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-orange-200">
                 {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-1">{user?.name}</h2>
                <p className="text-gray-500 font-medium mb-1">{user?.email}</p>
              </div>
            </div>

            {!isEditingProfile && (
              <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 hover:border-black text-gray-700 hover:text-black font-bold rounded-xl transition-all">
                <Edit2 size={18} /> Edit Name
              </button>
            )}
          </div>

          {isEditingProfile && (
            <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-top-4">
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 font-semibold transition-all outline-none"/>
                </div>
                
                <div className="flex gap-4 mt-2">
                  <button type="submit" className="flex-1 bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <MapPin className="text-orange-500" /> Saved Addresses
            </h2>
            <button onClick={openAddAddress} className="flex items-center gap-2 text-sm font-black text-orange-600 bg-orange-50 px-4 py-2 rounded-lg hover:bg-orange-100 transition">
              <Plus size={16} /> Add New
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user?.addresses && user.addresses.length > 0 ? (
              user.addresses.map((addr) => (
                <div key={addr._id} className="border-2 border-gray-100 p-5 rounded-2xl hover:border-orange-200 transition-colors group relative">
                   <div className="flex justify-between items-start mb-2">
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
                        {addr.label}
                      </span>
                      {addr.isDefault && <span className="text-xs font-bold text-green-600 flex items-center gap-1"><Check size={12}/> Default</span>}
                   </div>
                   <p className="font-bold text-gray-800 leading-tight mb-1">{addr.street}</p>
                   <p className="text-sm text-gray-500 font-medium">{addr.city}, {addr.state} - {addr.pincode}</p>
                   
                   <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditAddress(addr)} className="p-2 bg-white shadow-sm border rounded-lg hover:text-orange-500"><Edit2 size={14}/></button>
                      <button onClick={() => handleDeleteAddress(addr._id)} className="p-2 bg-white shadow-sm border rounded-lg hover:text-red-500"><Trash2 size={14}/></button>
                   </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                 <p className="text-gray-400 font-bold text-sm">No addresses saved yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <CreditCard className="text-orange-500" /> Saved Cards
            </h2>
          </div>

          {user?.savedPaymentMethods && user.savedPaymentMethods.length > 0 ? (
            <div className="space-y-3">
              {user.savedPaymentMethods.map((method) => (
                <div key={method._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-500">CARD</div>
                    <div>
                      <p className="font-bold text-gray-800">•••• •••• •••• {method.cardLast4}</p>
                      <p className="text-xs text-gray-500 font-bold uppercase">{method.cardBrand || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-gray-400 font-medium text-sm">No saved cards found.</p>
          )}
        </div>

      </div>
      
      {showAddressModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative animate-in zoom-in-95">
             <button onClick={() => setShowAddressModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition"><X size={20}/></button>
             
             <h2 className="text-2xl font-black text-gray-900 mb-6">
               {editingAddressId ? 'Edit Address' : 'Add New Address'}
             </h2>
             
             <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                   {['Home', 'Work', 'Other'].map(type => (
                     <button 
                       key={type} type="button"
                       onClick={() => setAddressForm({...addressForm, label: type})}
                       className={`py-2 rounded-xl text-sm font-bold border transition-all ${addressForm.label === type ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200'}`}
                     >
                       {type}
                     </button>
                   ))}
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Street / Flat No</label>
                   <input required type="text" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-medium"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">City</label>
                    <input required type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-medium"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">State</label>
                    <input required type="text" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-medium"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Pincode</label>
                    <input required type="text" pattern="[0-9]*" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-medium"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Landmark (Optional)</label>
                    <input type="text" value={addressForm.landmark} onChange={e => setAddressForm({...addressForm, landmark: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-medium"/>
                  </div>
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer py-2">
                   <div className={`w-5 h-5 rounded border flex items-center justify-center ${addressForm.isDefault ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                      {addressForm.isDefault && <Check size={14} className="text-white"/>}
                   </div>
                   <input type="checkbox" className="hidden" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} />
                   <span className="text-sm font-bold text-gray-700">Set as default address</span>
                </label>

                <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-900 transition mt-2">
                  {editingAddressId ? 'Update Address' : 'Save Address'}
                </button>
             </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProfilePage;