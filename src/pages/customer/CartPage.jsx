import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Plus, Minus, Trash2, MapPin, Calendar, Clock, X, Phone } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { updateQuantity, removeFromCart, clearCart } from '../../redux/slices/cartSlice';
import { updateUser } from '../../redux/slices/authSlice'; 
import api from '../../services/api';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, restaurant, total } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [contactNumber, setContactNumber] = useState(user?.phone || ''); 
  const [deliveryType, setDeliveryType] = useState('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'home',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: false
  });

  useEffect(() => {
    if (user?.addresses?.length > 0 && !selectedAddress) {
      const defaultAddr = user.addresses.find(a => a.isDefault);
      setSelectedAddress(defaultAddr ? defaultAddr._id : user.addresses[0]._id);
    }

    if (user?.phone && !contactNumber) {
      setContactNumber(user.phone);
    }
  }, [user, selectedAddress]);

  const deliveryFee = restaurant?.deliveryFee || 40;
  const tax = total * 0.05;
  const finalTotal = total + deliveryFee + tax;

  const handleQuantityChange = (index, newQuantity) => {
    dispatch(updateQuantity({ index, quantity: newQuantity }));
  };

  const handleRemoveItem = (index) => {
    dispatch(removeFromCart(index));
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    try {
      const response = await api.post('/api/auth/addresses', newAddress);
      
      if (response.data.success) {
        dispatch(updateUser(response.data.data)); 

        const updatedAddresses = response.data.data.addresses;
        const newAddrId = updatedAddresses[updatedAddresses.length - 1]._id;
        setSelectedAddress(newAddrId);

        setShowAddressModal(false);
        setNewAddress({
          label: 'home', street: '', city: '', state: '', pincode: '', landmark: '', isDefault: false
        });
      }
    } catch (error) {
      console.error('Address save error:', error);
      alert(error.response?.data?.message || 'Failed to save address');
    } finally {
      setAddressLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {

    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }
    
    const cleanPhone = contactNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      alert('Please enter a valid 10-digit contact number');
      return;
    }

    if (deliveryType === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      alert('Please select delivery date and time');
      return;
    }

    setIsProcessing(true);

    try {
      const selectedAddrObj = user.addresses.find(a => a._id === selectedAddress);
      const generatedOrderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const orderData = {
        restaurantId: restaurant._id,
        orderNumber: generatedOrderNumber, 
        
        items: items.map(item => {
          const customizationCost = item.customizations?.reduce((sum, c) => sum + c.price, 0) || 0;
          const singleItemTotal = item.price + customizationCost;
          
          return {
            menuItem: item._id,
            name: item.name,              
            quantity: item.quantity,
            price: item.price,            
            itemTotal: singleItemTotal * item.quantity, 
            customizations: item.customizations || [],
            specialInstructions: item.specialInstructions || '',
          };
        }),

        deliveryAddress: {
          street: selectedAddrObj.street,
          city: selectedAddrObj.city,
          state: selectedAddrObj.state,
          pincode: selectedAddrObj.pincode,
          landmark: selectedAddrObj.landmark,
        },
        deliveryType,
        ...(deliveryType === 'scheduled' && {
          scheduledFor: {
            date: scheduledDate,
            timeSlot: {
              start: scheduledTime.split(' - ')[0],
              end: scheduledTime.split(' - ')[1],
            },
          },
        }),
        
        contactNumber: cleanPhone,
        specialInstructions,
        paymentMethod,
      };

      const response = await api.post('/api/orders', orderData);

      if (paymentMethod === 'razorpay') {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          alert('Razorpay SDK failed to load');
          setIsProcessing(false);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: response.data.data.razorpayOrder.amount,
          currency: response.data.data.razorpayOrder.currency,
          order_id: response.data.data.razorpayOrder.id,
          name: 'FoodDel',
          description: `Order from ${restaurant.name}`,
          handler: async function (razorpayResponse) {
            try {
              await api.post('/api/orders/verify-payment', {
                orderId: response.data.data.order._id,
                razorpayOrderId: razorpayResponse.razorpay_order_id,
                razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                razorpaySignature: razorpayResponse.razorpay_signature,
              });

              dispatch(clearCart());
              navigate(`/orders/${response.data.data.order._id}/track`);
            } catch (error) {
              console.error('Payment verification failed:', error);
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: cleanPhone,
          },
          theme: { color: '#FC8019' },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
        setIsProcessing(false);
      } else {
        // Cash on Delivery
        dispatch(clearCart());
        navigate(`/orders/${response.data.data._id}/track`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.message || 'Failed to place order');
      setIsProcessing(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 10; hour < 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const start = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endMin = minute + 30;
        const endHour = endMin === 60 ? hour + 1 : hour;
        const end = `${endHour.toString().padStart(2, '0')}:${(endMin % 60).toString().padStart(2, '0')}`;
        slots.push(`${start} - ${end}`);
      }
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold mb-6">Your cart is empty</h2>
            <button onClick={() => navigate('/restaurants')} className="bg-primary text-white px-8 py-3 rounded-lg">Browse Restaurants</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-gray-600 hover:text-primary">
          <ArrowLeft className="w-5 h-5" /> Continue Shopping
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-xl shadow-sm p-6">
               <h2 className="text-xl font-bold mb-4">{restaurant?.name}</h2>
               {items.map((item, index) => (
                 <div key={index} className="flex items-center justify-between py-4 border-b last:border-0">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-lg">
                        <button onClick={() => handleQuantityChange(index, item.quantity - 1)} className="p-1 px-2"><Minus className="w-4 h-4"/></button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(index, item.quantity + 1)} className="p-1 px-2"><Plus className="w-4 h-4"/></button>
                      </div>
                      <button onClick={() => handleRemoveItem(index)} className="text-red-500"><Trash2 className="w-5 h-5"/></button>
                    </div>
                 </div>
               ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><MapPin className="text-primary"/> Delivery Address</h2>
                <button onClick={() => setShowAddressModal(true)} className="text-primary font-bold flex items-center gap-1 hover:underline">
                  <Plus className="w-4 h-4"/> Add New
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user?.addresses?.map((addr) => (
                  <div key={addr._id} onClick={() => setSelectedAddress(addr._id)} className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedAddress === addr._id ? 'border-primary bg-orange-50' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded">{addr.label}</span>
                      {selectedAddress === addr._id && <div className="w-4 h-4 bg-primary rounded-full border-4 border-white shadow-sm"></div>}
                    </div>
                    <p className="mt-2 text-sm text-gray-700 font-medium">{addr.street}</p>
                    <p className="text-xs text-gray-500">{addr.city}, {addr.pincode}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-primary"/> Contact Number
              </h2>
              <div className="relative">
                <input type="text" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="Enter 10-digit mobile number"
                  className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium tracking-wide"
                  maxLength={10}/>
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">+91</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-1">We'll call this number for delivery updates.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                <div className="flex gap-4">
                    <button onClick={() => setPaymentMethod('razorpay')} className={`flex-1 p-4 border-2 rounded-xl ${paymentMethod === 'razorpay' ? 'border-primary bg-orange-50' : ''}`}>Online Payment</button>
                    <button onClick={() => setPaymentMethod('cash_on_delivery')} className={`flex-1 p-4 border-2 rounded-xl ${paymentMethod === 'cash_on_delivery' ? 'border-primary bg-orange-50' : ''}`}>Cash on Delivery</button>
                </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Bill Details</h2>
              <div className="space-y-3 text-sm border-b pb-4">
                <div className="flex justify-between"><span>Item Total</span><span>₹{total}</span></div>
                <div className="flex justify-between"><span>Delivery Fee</span><span>₹{deliveryFee}</span></div>
                <div className="flex justify-between"><span>Taxes (5%)</span><span>₹{tax.toFixed(2)}</span></div>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total to Pay</span><span>₹{finalTotal.toFixed(2)}</span>
              </div>
              <button onClick={handlePlaceOrder} disabled={isProcessing} className="w-full text-black font-bold border-2 py-4 rounded-xl mt-6 cursor-pointer">
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Add New Address</h3>
              <button onClick={() => setShowAddressModal(false)}><X className="w-6 h-6 text-gray-400 cursor-pointer"/></button>
            </div>
            <form onSubmit={handleAddressSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Address Label</label>
                <div className="flex gap-2 mt-1">
                  {['home', 'work', 'other'].map(l => (
                    <button key={l} type="button" onClick={() => setNewAddress({...newAddress, label: l})}
                      className={`flex-1 py-2 rounded-lg border-2 capitalize font-medium ${newAddress.label === l ? 'border-primary bg-orange-50 text-primary' : 'border-gray-100'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <input type="text" placeholder="Flat/House No, Street, Area" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}/>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="City" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}/>
                <input type="text" placeholder="Pincode" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}/>
              </div>
              <input type="text" placeholder="Landmark (Optional)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})}/>
              <button type="submit" disabled={addressLoading} className="w-full bg-orange/600 text-white font-bold py-4 rounded-xl bg-orange-600 cursor-pointer">
                {addressLoading ? 'Saving...' : 'Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CartPage;