import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Phone, HelpCircle, MapPin, Clock, CheckCircle, Circle } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { setCurrentOrder, updateOrderStatus } from '../../redux/slices/orderSlice';
import api from '../../services/api';
import io from 'socket.io-client';

const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentOrder } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
    setupSocketConnection();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [id]);

  const setupSocketConnection = () => {
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const newSocket = io(socketUrl);
    
    newSocket.on('connect', () => {
      console.log('Socket connected');
      newSocket.emit('join', user._id);
      newSocket.emit('track_order', id);
    });

    newSocket.on('order_status_update', (data) => {
      if (data.orderId === id) {
        dispatch(updateOrderStatus(data));
      }
    });

    setSocket(newSocket);
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/orders/${id}`);
      dispatch(setCurrentOrder(response.data.data));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      navigate('/orders');
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await api.patch(`/api/orders/${id}/cancel`, {
          reason: 'Customer cancellation',
        });
        fetchOrderDetails();
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert(error.response?.data?.message || 'Failed to cancel order');
      }
    }
  };

  const getDeliveryPhaseSteps = () => {
    const phases = [
      { key: 'order_placed', label: 'Order Placed', description: 'Your order has been received' },
      { key: 'restaurant_preparing', label: 'Preparing', description: 'Restaurant is preparing your food' },
      { key: 'food_ready', label: 'Food Ready', description: 'Your order is ready for pickup' },
      { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Your order is on the way' },
      { key: 'delivered', label: 'Delivered', description: 'Enjoy your meal!' },
    ];

    const phaseOrder = ['order_placed', 'restaurant_preparing', 'food_ready', 'out_for_delivery', 'delivered'];
    const currentIndex = phaseOrder.indexOf(currentOrder?.deliveryPhase);

    return phases.map((phase, index) => ({
      ...phase,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  if (!currentOrder) {
    return null;
  }

  const deliveryPhaseSteps = getDeliveryPhaseSteps();
  const canCancel = !['delivered', 'cancelled', 'preparing', 'ready', 'out_for_delivery'].includes(currentOrder.status);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-gray-700 hover:text-orange-600 mb-6 transition font-bold">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Orders</span>
          </button>

          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Order #{currentOrder.orderNumber}
          </h1>
          <p className="text-gray-600 mb-8 font-medium">
            Placed on {new Date(currentOrder.createdAt).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>

          {currentOrder.status === 'cancelled' ? (
            <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-2xl font-bold">✕</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-red-800">Order Cancelled</h2>
                  <p className="text-red-600 font-medium">
                    {currentOrder.cancellation?.reason || 'Order has been cancelled'}
                  </p>
                </div>
              </div>
            </div>
          ) : currentOrder.status === 'delivered' ? (
            <div className="bg-green-50 border-2 border-green-100 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-green-800">Order Delivered</h2>
                  <p className="text-green-600 font-medium">
                    Delivered at {new Date(currentOrder.actualDeliveryTime).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900 capitalize">
                    {currentOrder.status.replace('_', ' ')}
                  </h2>
                  <p className="text-gray-600 font-medium">
                    Expected delivery: {new Date(currentOrder.estimatedDeliveryTime).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="animate-pulse">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-200">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentOrder.status !== 'cancelled' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-8">🎯 Order Tracking</h2>

              <div className="relative">
                {deliveryPhaseSteps.map((phase, index) => (
                  <div key={phase.key} className="flex gap-4 mb-8 last:mb-0 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${phase.completed ? 'bg-black text-white' : phase.current ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 ring-4 ring-orange-100' : 'bg-gray-100 text-gray-300'}`}>
                        {phase.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </div>
                      {index < deliveryPhaseSteps.length - 1 && (
                        <div className={`absolute top-10 w-0.5 h-full -z-0 ${phase.completed ? 'bg-black' : 'bg-gray-100'}`} style={{ height: 'calc(100% + 2rem)' }}/>
                      )}
                    </div>

                    <div className={`flex-1 pt-1 ${phase.current ? 'transform translate-x-1 transition-transform' : ''}`}>
                      <h3 className={`text-lg font-bold ${ phase.completed || phase.current ? 'text-gray-900' : 'text-gray-400'}`}>
                        {phase.label}
                      </h3>
                      <p className={`text-sm ${phase.completed || phase.current ? 'text-gray-600' : 'text-gray-400'}`}>
                        {phase.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:col-span-2">
                <h2 className="text-xl font-black text-gray-900 mb-6">Order Items</h2>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <img src={currentOrder.restaurant.images?.[0]?.url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200'} alt={currentOrder.restaurant.name} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{currentOrder.restaurant.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{currentOrder.restaurant.location.city}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {currentOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-gray-800 text-lg">
                          {item.quantity} x {item.name}
                        </span>
                        {item.customizations?.length > 0 && (
                          <div className="text-sm text-gray-500 mt-1">
                            {item.customizations.map((c, i) => (
                              <span key={i} className="bg-gray-100 px-2 py-0.5 rounded mr-2 text-xs font-bold">{c.option}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-gray-900">₹{item.itemTotal}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 mt-6 pt-6 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 font-medium">
                    <span>Subtotal</span>
                    <span>₹{currentOrder.pricing.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 font-medium">
                    <span>Delivery Fee</span>
                    <span>₹{currentOrder.pricing.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 font-medium">
                    <span>Tax</span>
                    <span>₹{currentOrder.pricing.tax}</span>
                  </div>
                  <div className="flex justify-between text-xl font-black text-gray-900 pt-4 border-t border-gray-100 mt-2">
                    <span>Total Paid</span>
                    <span>₹{currentOrder.pricing.total}</span>
                  </div>
                </div>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  Delivery To
                </h2>
                <div className="text-gray-700 text-sm font-medium leading-relaxed bg-gray-50 p-4 rounded-xl">
                  <p>{currentOrder.deliveryAddress.street}</p>
                  <p>{currentOrder.deliveryAddress.city}, {currentOrder.deliveryAddress.pincode}</p>
                  {currentOrder.deliveryAddress.landmark && (
                    <p className="text-orange-600 font-bold mt-2 text-xs">Landmark: {currentOrder.deliveryAddress.landmark}</p>
                  )}
                </div>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-400" />
                  Details
                </h2>
                <div className="space-y-3">
                   <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase">Phone</span>
                      <span className="font-bold text-gray-900">{currentOrder.contactNumber}</span>
                   </div>
                   <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase">Payment</span>
                      <span className="font-bold text-gray-900 capitalize">{currentOrder.payment.method.replace('_', ' ')}</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
                {canCancel && (
                  <button onClick={handleCancelOrder} className="flex-1 bg-white border-2 border-red-100 text-red-500 font-bold py-3 rounded-xl hover:bg-red-50 transition">
                    Cancel Order
                  </button>
                )}

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderTrackingPage;