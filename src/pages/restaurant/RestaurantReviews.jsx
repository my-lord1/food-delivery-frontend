import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Star, MessageSquare, ThumbsUp, X, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RestaurantHeader from '../../components/common/RestaurantHeader';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const RestaurantReviews = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.restaurant) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/reviews/restaurant/${user.restaurant}/dashboard`);
      setReviews(response.data.data);
      setStats({
        averageRating: response.data.stats.averageRating || '0.0',
        totalReviews: response.data.stats.totalReviews || 0,
        pendingReviews: response.data.stats.pendingReviews || 0,
        positiveReviews: response.data.data.filter(r => r.ratings.overall >= 4).length
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
      setLoading(false);
    }
  };

  const handleRespondToReview = (review) => {
    setSelectedReview(review);
    setResponseText(review.restaurantResponse?.text || '');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) return;

    try {
      setSubmitting(true);
      await api.post(`/api/reviews/${selectedReview._id}/respond`, {
        response: responseText
      });
      
      toast.success('Response submitted successfully');
      setShowResponseModal(false);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error(error.response?.data?.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const StatusBadge = ({ status }) => {
    if (status === 'approved') return <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full"><CheckCircle size={12}/> Live</span>;
    if (status === 'pending') return <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full"><Clock size={12}/> Pending</span>;
    if (status === 'flagged') return <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full"><AlertCircle size={12}/> Flagged</span>;
    return null;
  };

  const filteredReviews = reviews.filter(review => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return review.moderationStatus === 'pending';
    if (activeTab === 'not_responded') return !review.restaurantResponse;
    return true;
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <RestaurantHeader />

      <div className="flex-1 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black text-gray-900">⭐ Reviews & Ratings</h1>
            <button onClick={() => navigate('/restaurant/dashboard')} className="text-orange-600 hover:text-orange-700 font-bold" >
              ← Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                <Star className="fill-current" />
              </div>
              <div>
                <h3 className="text-2xl font-black">{stats?.averageRating}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase">Average Rating</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <MessageSquare />
              </div>
              <div>
                <h3 className="text-2xl font-black">{stats?.totalReviews}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase">Total Reviews</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                <Clock />
              </div>
              <div>
                <h3 className="text-2xl font-black">{stats?.pendingReviews}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase">Pending Moderation</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 p-1 inline-flex overflow-x-auto">
            {[
              { key: 'all', label: 'All Reviews' },
              { key: 'pending', label: '⚠️ Pending' },
              { key: 'not_responded', label: 'Needs Reply' },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-6 py-3 font-bold rounded-xl transition text-sm whitespace-nowrap ${ activeTab === tab.key ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid gap-6">
            {filteredReviews.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                 <p className="text-gray-400 font-bold">No reviews found in this category.</p>
               </div>
            ) : (
               filteredReviews.map((review) => (
                <div key={review._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-black text-lg">
                        {review.customer?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <h3 className="font-bold text-gray-900">{review.customer?.name}</h3>
                           <StatusBadge status={review.moderationStatus} />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase">
                          {new Date(review.createdAt).toLocaleDateString()} • Order #{review.order?.orderNumber?.slice(-6)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-lg">
                       <span className="font-black text-gray-900">{review.ratings.overall}</span>
                       <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    </div>
                  </div>

                  <p className="text-gray-700 font-medium mb-4">"{review.comment}"</p>

                  {review.restaurantResponse ? (
                    <div className="ml-4 pl-4 border-l-4 border-orange-500 bg-orange-50/50 p-4 rounded-r-xl">
                       <div className="flex justify-between">
                          <div>
                            <p className="text-xs font-black text-orange-600 uppercase mb-1">Your Reply</p>
                            <p className="text-sm font-medium">{review.restaurantResponse.text}</p>
                          </div>
                          <button onClick={() => handleRespondToReview(review)} className="text-xs font-bold text-gray-400 hover:text-black underline">Edit</button>
                       </div>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-gray-100">
                      <button onClick={() => handleRespondToReview(review)} className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-2">
                        <MessageSquare size={16} /> Reply to Customer
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showResponseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">Reply to Review</h3>
                <button onClick={() => setShowResponseModal(false)}><X className="text-gray-400 hover:text-black"/></button>
             </div>
             <form onSubmit={handleSubmitResponse}>
                <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)}
                  className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-black outline-none font-medium resize-none mb-4"
                  rows="4"
                  placeholder="Type your response here..."/>
                <button  disabled={submitting} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition disabled:opacity-50">
                  {submitting ? 'Sending...' : 'Send Reply'}
                </button>
             </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RestaurantReviews;