import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Package, Phone, X, CheckCircle, Clock, MapPin } from 'lucide-react';
import RestaurantHeader from '../../components/common/RestaurantHeader';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';
import io from 'socket.io-client';

const RestaurantOrders = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user?.restaurant) {
      fetchOrders();
      setupSocketConnection();
    }
    return () => {
      if (socket) socket.disconnect();
    };
  }, [user, activeTab]);

  const setupSocketConnection = () => {
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const newSocket = io(socketUrl);
    
    newSocket.on('connect', () => {
      console.log('Socket connected');
      newSocket.emit('join', user.restaurant); 
    });

    newSocket.on('new_order', () => {
      fetchOrders();
    });

    setSocket(newSocket);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const statusMap = {
        new: 'placed',
        preparing: 'confirmed,preparing',
        ready: 'ready,picked_up',
        completed: 'delivered',
        cancelled: 'cancelled'
      };

      const response = await api.get(`/api/restaurants/${user.restaurant}/orders`, {
        params: { status: statusMap[activeTab] }
      });
      setOrders(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setShowOrderModal(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      placed: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-purple-100 text-purple-800',
      preparing: 'bg-yellow-100 text-yellow-800',
      ready: 'bg-green-100 text-green-800',
      picked_up: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      placed: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'picked_up',
      picked_up: 'delivered', 
    };
    return statusFlow[currentStatus];
  };

  if (loading && orders.length === 0) {
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
            <h1 className="text-3xl font-black text-gray-900">Order Management</h1>
            <button onClick={() => navigate('/restaurant/dashboard')} className="text-orange-600 hover:text-orange-700 font-bold">
              ← Back to Dashboard
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 p-1">
            <div className="flex overflow-x-auto">
              {[
                { key: 'new', label: 'New', count: orders.filter(o => o.status === 'placed').length },
                { key: 'preparing', label: 'Preparing', count: orders.filter(o => ['confirmed', 'preparing'].includes(o.status)).length },
                { key: 'ready', label: 'Ready & Out', count: orders.filter(o => ['ready', 'picked_up'].includes(o.status)).length },
                { key: 'completed', label: 'History', count: 0 },
                { key: 'cancelled', label: 'Cancelled', count: 0 },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 px-6 py-4 font-bold rounded-xl transition whitespace-nowrap ${
                    activeTab === tab.key ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                  {tab.label}
                  {tab.count > 0 && activeTab === tab.key && (
                    <span className="ml-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.length === 0 ? (
               <div className="col-span-full py-20 text-center">
                  <p className="text-gray-400 font-bold text-lg">No orders in this section.</p>
               </div>
            ) : (
               orders.map(order => (
                  <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition flex flex-col">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <h3 className="font-black text-xl text-gray-900">#{order.orderNumber?.slice(-4)}</h3>
                           <p className="text-xs font-bold text-gray-400 uppercase">
                              {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadgeColor(order.status)}`}>
                           {order.status.replace('_', ' ')}
                        </span>
                     </div>
                     
                     <div className="mb-4 flex-1">
                        <div className="space-y-2 text-sm text-gray-700">
                           {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between font-medium">
                                 <span>{item.quantity} x {item.name}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="pt-4 border-t border-gray-100 flex gap-2">
                        <button onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }} className="flex-1 py-2 border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:border-black hover:text-black transition">
                           Details
                        </button>
                        
                        {order.status === 'placed' && (
                           <div className="flex gap-2 flex-1">
                               <button onClick={() => { if(window.confirm('Are you sure you want to reject this order?')) {handleUpdateOrderStatus(order._id, 'cancelled');}}} 
                                 className="flex-1 border-2 border-red-100 text-red-600 font-bold rounded-lg hover:bg-red-50 hover:border-red-200">
                                  Reject
                               </button>

                               <button onClick={() => handleUpdateOrderStatus(order._id, 'confirmed')} className="flex-1 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600">
                                  Accept
                               </button>
                           </div>
                        )}

                        {['confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status) && (
                           <button onClick={() => handleUpdateOrderStatus(order._id, getNextStatus(order.status))} className="flex-1 bg-black text-white font-bold rounded-lg hover:bg-gray-800">
                              {order.status === 'confirmed' ? 'Start Prep' : 
                               order.status === 'preparing' ? 'Mark Ready' :
                               order.status === 'ready' ? 'Picked Up' : 'Delivered'}
                           </button>
                        )}
                     </div>
                  </div>
               ))
            )}
          </div>
        </div>
      </div>

      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 shadow-2xl">
             <div className="sticky top-0 bg-white border-b px-8 py-6 flex items-center justify-between z-10">
                <h3 className="text-2xl font-black text-gray-900">Order #{selectedOrder.orderNumber}</h3>
                <button onClick={() => setShowOrderModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6"/></button>
             </div>
             <div className="p-8 space-y-6">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                   <div>
                      <p className="text-sm font-bold text-gray-500 uppercase">Total Amount</p>
                      <p className="text-3xl font-black text-gray-900">₹{selectedOrder.pricing.total}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-bold text-gray-500 uppercase">Payment</p>
                      <p className="text-lg font-bold text-gray-900 capitalize">{selectedOrder.payment.method.replace('_', ' ')}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-bold mb-2">Customer</h4>
                        <div className="bg-gray-50 p-3 rounded-xl text-sm">
                            <p className="font-bold">{selectedOrder.customer?.name}</p>
                            <p className="text-gray-500">{selectedOrder.contactNumber}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2">Address</h4>
                        <div className="bg-gray-50 p-3 rounded-xl text-sm">
                            <p>{selectedOrder.deliveryAddress?.street}</p>
                            <p>{selectedOrder.deliveryAddress?.city}</p>
                        </div>
                    </div>
                </div>
                
                {!['delivered', 'cancelled'].includes(selectedOrder.status) && (
                   <div className="pt-4 border-t">
                       {selectedOrder.status === 'placed' ? (
                           <div className="grid grid-cols-2 gap-4">
                               <button onClick={() => { if(window.confirm('Reject order?')) handleUpdateOrderStatus(selectedOrder._id, 'cancelled'); }}
                                 className="border-2 border-red-100 text-red-600 font-bold py-3 rounded-xl hover:bg-red-50">
                                   Reject Order
                               </button>
                               <button onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'confirmed')} className="bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600">
                                   Accept Order
                               </button>
                           </div>
                       ) : (
                           <button onClick={() => handleUpdateOrderStatus(selectedOrder._id, getNextStatus(selectedOrder.status))} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition">
                              Mark as {getNextStatus(selectedOrder.status)?.replace('_', ' ')}
                           </button>
                       )}
                   </div>
                )}
             </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RestaurantOrders;