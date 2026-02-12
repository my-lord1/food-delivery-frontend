import { useState, useEffect } from 'react';
import { Star, X, Loader, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import { toast, Toaster } from 'react-hot-toast'; 

const ReviewModal = ({ isOpen, onClose, order, viewOnly = false }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [ratings, setRatings] = useState({ food: 0, delivery: 0, overall: 0 });
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (isOpen && viewOnly && order) {
      fetchReviewDetails();
    }
  }, [isOpen, viewOnly, order]);

  const fetchReviewDetails = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/api/reviews/order/${order._id}`);
      const reviewData = response.data.data;
      
      setExistingReview(reviewData);
      setRatings(reviewData.ratings);
      setComment(reviewData.comment);
      setFetching(false);
    } catch (error) {
      console.error('Error fetching review:', error);
      toast.error('Could not load review');
      onClose();
    }
  };

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (ratings.overall === 0) return toast.error('Please provide an overall rating');
    if (comment.length < 10) return toast.error('Review must be at least 10 characters');

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('restaurantId', order.restaurant._id);
      formData.append('orderId', order._id);
      formData.append('ratings[food]', ratings.food);
      formData.append('ratings[delivery]', ratings.delivery);
      formData.append('ratings[overall]', ratings.overall);
      formData.append('comment', comment);

      await api.post('/api/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Review submitted successfully!');
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ label, category, value, readOnly }) => (
    <div className="mb-4">
      <p className="text-sm font-bold text-gray-700 mb-1">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && setRatings(prev => ({ ...prev, [category]: star }))}
            className={`transition-transform focus:outline-none ${!readOnly ? 'hover:scale-110' : 'cursor-default'}`}>
            <Star 
              size={readOnly ? 20 : 28} 
              className={`${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} />

      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-black text-gray-900">
              {viewOnly ? 'Your Review' : 'Rate your Order'}
            </h3>
            <p className="text-sm text-gray-500 font-medium">{order.restaurant.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {fetching ? (
             <div className="py-10 flex justify-center"><Loader className="animate-spin text-orange-500"/></div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <StarRating label="Overall Experience" category="overall" value={ratings.overall} readOnly={viewOnly} />
                <div className="grid grid-cols-2 gap-4">
                  <StarRating label="Food Taste" category="food" value={ratings.food} readOnly={viewOnly} />
                  <StarRating label="Delivery" category="delivery" value={ratings.delivery} readOnly={viewOnly} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Your Review</label>
                {viewOnly ? (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 italic">
                    "{comment}"
                  </div>
                ) : (
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you liked..."
                    className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-black outline-none resize-none font-medium"
                    rows="4"/>
                )}
              </div>

              {viewOnly && existingReview?.restaurantResponse && (
                <div className="pl-4 border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={16} className="text-orange-600" />
                    <p className="text-xs font-black text-orange-600 uppercase">Restaurant Reply</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800 leading-relaxed">
                    {existingReview.restaurantResponse.text}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase">
                    {new Date(existingReview.restaurantResponse.respondedAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {!viewOnly && (
                <div className="flex gap-3">
                  <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2">
                    {loading ? <Loader className="animate-spin" size={18} /> : 'Submit Review'}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;