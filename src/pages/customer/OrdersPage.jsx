import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, Clock, CheckCircle, XCircle, Star, MessageSquare } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { setOrders } from '../../redux/slices/orderSlice';
import api from '../../services/api';
import ReviewModal from './ReviewModal';

const OrdersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { orders } = useSelector((state) => state.order);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [viewOnlyMode, setViewOnlyMode] = useState(false); 

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab !== 'all') {
        if (activeTab === 'active') {
          params.status = 'placed,confirmed,preparing,ready,out_for_delivery';
        } else {
          params.status = activeTab;
        }
      }

      const response = await api.get('/api/orders', { params });
      dispatch(setOrders(response.data.data));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleReorder = async (order) => {
    navigate(`/restaurant/${order.restaurant._id}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      placed: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-purple-100 text-purple-800',
      preparing: 'bg-yellow-100 text-yellow-800',
      ready: 'bg-orange-100 text-orange-800',
      out_for_delivery: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    if (status === 'delivered') return <CheckCircle className="w-5 h-5" />;
    if (status === 'cancelled') return <XCircle className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') {
      return !['delivered', 'cancelled'].includes(order.status);
    }
    return order.status === activeTab;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>
          <div className="bg-white rounded-xl shadow-md mb-8">
            <div className="flex overflow-x-auto">
              {[
                { key: 'all', label: 'All Orders' },
                { key: 'active', label: 'Active' },
                { key: 'delivered', label: 'Delivered' },
                { key: 'cancelled', label: 'Cancelled' },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-6 py-4 font-semibold whitespace-nowrap transition ${
                    activeTab === tab.key ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-800'}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-16 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders found</h2>
              <p className="text-gray-600 mb-6">Start ordering delicious food!</p>
              <button onClick={() => navigate('/restaurants')} className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-lg transition">
                Browse Restaurants
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <img src={order.restaurant.images?.[0]?.url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200'} alt={order.restaurant.name} className="w-16 h-16 rounded-lg object-cover"/>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            {order.restaurant.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {order.restaurant.location.city}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      {order.items.map((item, index) => (
                        <p key={index} className="text-sm text-gray-700">
                          • {item.name} x {item.quantity}
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-lg font-bold text-gray-800">₹{order.pricing.total}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          •{' '}
                          {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        {order.status === 'delivered' ? (
                          <>
                            <button onClick={() => handleReorder(order)} className="px-6 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-lg transition">
                              Reorder
                            </button>
                            <button onClick={() => navigate(`/orders/${order._id}/track`)} className="px-6 py-2 border-2 border-black text-black font-semibold rounded-lg transition">
                              View Details
                            </button>
                            
                            {!order.isReviewed && (
                              <button
                                onClick={() => {
                                  setSelectedOrderForReview(order);
                                  setViewOnlyMode(false); 
                                  setIsReviewModalOpen(true);
                                }}
                                className="px-6 py-2 text-black border-2 font-semibold rounded-lg transition flex items-center gap-2 hover:bg-gray-100">
                                <Star className="w-4 h-4" />
                                Rate & Review
                              </button>
                            )}

                            {order.isReviewed && (
                              <button
                                onClick={() => {
                                  setSelectedOrderForReview(order);
                                  setViewOnlyMode(true); 
                                  setIsReviewModalOpen(true);
                                }} className="px-6 py-2 bg-orange-50 text-orange-600 border-2 border-orange-100 font-semibold rounded-lg transition flex items-center gap-2 hover:bg-orange-100">
                                <MessageSquare className="w-4 h-4" />
                                See Review
                              </button>
                            )}
                          </>
                        ) : order.status === 'cancelled' ? (
                          <button onClick={() => navigate(`/orders/${order._id}/track`)} className="px-6 py-2 border-2 border-gray-300 text-gray-700 hover:border-gray-400 font-semibold rounded-lg transition">
                            View Details
                          </button>
                        ) : (
                          <>
                            <button onClick={() => navigate(`/orders/${order._id}/track`)} className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition">
                              Track Order
                            </button>
                            <button onClick={() => navigate(`/orders/${order._id}/track`)} className="px-6 py-2 border-2 border-gray-300 text-gray-700 hover:border-gray-400 font-semibold rounded-lg transition">
                              View Details
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedOrderForReview(null);
        }}
        order={selectedOrderForReview}
        viewOnly={viewOnlyMode} 
        onSuccess={() => {
          fetchOrders(); 
        }}
      />

      <Footer />
    </div>
  );
};

export default OrdersPage;