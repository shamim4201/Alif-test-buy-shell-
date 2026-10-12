import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Star, MessageSquare } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  channelTitle: string;
  sellerName: string;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  orderId,
  channelTitle,
  sellerName,
  onSuccess
}) => {
  const { showToast } = useAuth();
  const [rating, setRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [transferSpeedRating, setTransferSpeedRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.submitReview({
        orderId,
        rating,
        comment,
        communicationRating,
        transferSpeedRating
      });
      showToast('Thank you! Your verified transaction review has been published.', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStarSelector = (value: number, setValue: (n: number) => void, label: string) => (
    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1">{label}</label>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setValue(star)}
            className="p-1 text-slate-600 hover:text-amber-400 focus:outline-hidden transition"
          >
            <Star
              className={`w-6 h-6 ${
                star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
              }`}
            />
          </button>
        ))}
        <span className="text-xs text-amber-400 font-bold ml-2">{value}.0 / 5.0</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in text-slate-100">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400 mb-3">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-xl font-bold text-white">Review Channel Acquisition</h2>
          <p className="text-xs text-slate-400 mt-1">
            Share your experience acquiring <strong>{channelTitle}</strong> from <strong>{sellerName}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {renderStarSelector(rating, setRating, 'Overall Transaction Experience')}
          {renderStarSelector(communicationRating, setCommunicationRating, 'Seller Communication & Responsiveness')}
          {renderStarSelector(transferSpeedRating, setTransferSpeedRating, 'Google Brand Account Transfer Efficiency')}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your Feedback &amp; Verification Experience
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe how the 7-day transfer went, accuracy of analytics, and seller helpfulness..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !comment.trim()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Publish Verified Review'}
          </button>
        </form>
      </div>
    </div>
  );
};
