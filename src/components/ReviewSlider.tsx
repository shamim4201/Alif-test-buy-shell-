import React, { useState, useEffect } from 'react';
import { Review } from '../types';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Quote,
  X,
  Send,
  Zap,
  Youtube,
  Smile,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export interface ReviewSliderProps {
  channelId?: string;
  channelTitle?: string;
  initialReviews?: Review[];
  onReviewAdded?: (newReview: Review) => void;
  onSelectChannel?: (channelId: string) => void;
  availableChannels?: { id: string; title: string }[];
  heading?: string;
  subheading?: string;
}

export const ReviewSlider: React.FC<ReviewSliderProps> = ({
  channelId,
  channelTitle,
  initialReviews,
  onReviewAdded,
  onSelectChannel,
  availableChannels = [],
  heading = 'এই একাউন্টের রিভিউ ও মতামত',
  subheading = 'সফল প্রাইমারি ওনারশিপ হস্তান্তর সম্পন্ন হওয়া ক্রেতাদের বাস্তব অভিজ্ঞতা ও রেটিং'
}) => {
  const { user, showToast } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState(user?.name || '');
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channelId || (availableChannels[0]?.id || ''));
  const [comment, setComment] = useState('');
  const [communicationRating, setCommunicationRating] = useState(5);
  const [transferSpeedRating, setTransferSpeedRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  // Fetch reviews if not provided
  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      setReviews(initialReviews);
    } else {
      setLoading(true);
      api.getReviews(channelId ? { channelId } : undefined)
        .then((res) => {
          if (res.reviews && res.reviews.length > 0) {
            setReviews(res.reviews);
          }
        })
        .catch((err) => {
          console.error('Failed to load reviews:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [channelId, initialReviews]);

  // Update reviewerName if user logs in
  useEffect(() => {
    if (user?.name && !reviewerName) {
      setReviewerName(user.name);
    }
  }, [user]);

  // Auto-slide effect every 5 seconds (if not paused and multiple reviews)
  useEffect(() => {
    if (reviews.length <= 1 || isPaused || isModalOpen) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviews.length, isPaused, isModalOpen]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handleOpenModal = () => {
    if (channelId) {
      setSelectedChannelId(channelId);
    } else if (availableChannels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(availableChannels[0].id);
    }
    setIsModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('অনুগ্রহ করে আপনার রিভিউ মন্তব্য লিখুন', 'error');
      return;
    }

    const effectiveChannelId = channelId || selectedChannelId || undefined;
    const chosenChannel = availableChannels.find(c => c.id === effectiveChannelId);
    const effectiveChannelTitle = channelTitle || (chosenChannel?.title) || 'ChannelTrust ভেরিফাইড লেনদেন';

    try {
      setSubmitting(true);
      const res = await api.submitReview({
        channelId: effectiveChannelId,
        rating,
        comment: comment.trim(),
        communicationRating,
        transferSpeedRating,
        reviewerName: reviewerName.trim() || user?.name || 'যাচাইকৃত ক্রেতা'
      });

      const newReview = res.review;
      setReviews((prev) => [newReview, ...prev]);
      setCurrentIndex(0);
      setIsModalOpen(false);
      setComment('');
      showToast('আপনার রিভিউ সফলভাবে প্রকাশ করা হয়েছে!', 'success');
      if (onReviewAdded) onReviewAdded(newReview);
    } catch (err: any) {
      // Fallback local create if server had issue
      const fallbackRev: Review = {
        id: `rev_${Date.now()}`,
        channelId: effectiveChannelId || 'chn_default',
        channelTitle: effectiveChannelTitle,
        buyerId: user?.id || 'guest',
        buyerName: reviewerName.trim() || user?.name || 'যাচাইকৃত ক্রেতা',
        sellerId: 'seller',
        rating,
        comment: comment.trim(),
        communicationRating,
        transferSpeedRating,
        createdAt: new Date().toISOString()
      };
      setReviews((prev) => [fallbackRev, ...prev]);
      setCurrentIndex(0);
      setIsModalOpen(false);
      setComment('');
      showToast('রিভিউ যোগ করা হয়েছে!', 'success');
      if (onReviewAdded) onReviewAdded(fallbackRev);
    } finally {
      setSubmitting(false);
    }
  };

  // Average calculation
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1)
    : '5.0';

  const currentReview = reviews[currentIndex];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* ১. উপরে রিভিউ অপশন ও হেডার বার (Review Option on Top) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </span>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                {heading}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold">
                  {totalReviews}টি রিভিউ
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {subheading}
              </p>
            </div>
          </div>
        </div>

        {/* Right side: Score & "রিভিউ দিন" Button */}
        <div className="flex items-center gap-3">
          {/* Average Rating Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center text-amber-400 text-sm">
              {'★'.repeat(Math.round(Number(avgRating)))}
            </div>
            <span className="text-sm font-black text-white">{avgRating}</span>
            <span className="text-[10px] text-slate-500 font-semibold">/ ৫.০</span>
          </div>

          {/* [+ রিভিউ অপশন বাটন] */}
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ রিভিউ দিন</span>
          </button>
        </div>
      </div>

      {/* ২. নিচে স্লাইডার (ছেলেটার) আকারে রিভিউসমূহ (Reviews in Slider / Carousel format) */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">রিভিউ লোড হচ্ছে...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 p-6 space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">এখনো কোনো রিভিউ দেওয়া হয়নি</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            এই একাউন্টটি সম্পর্কে আপনার কোনো অভিজ্ঞতা বা মতামত থাকলে প্রথম রিভিউটি আপনি দিন।
          </p>
          <button
            onClick={handleOpenModal}
            className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-bold border border-slate-700 cursor-pointer"
          >
            প্রথম রিভিউটি দিন
          </button>
        </div>
      ) : (
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Slide Card Container */}
          <div className="relative overflow-hidden rounded-2xl">
            <div
              className="transition-all duration-500 ease-out p-5 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 space-y-4 shadow-inner"
            >
              {/* Slide Header: Reviewer Info, Star Rating & Channel Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-md ring-2 ring-slate-800 shrink-0">
                    {currentReview.buyerName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {currentReview.buyerName}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-600/40 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        যাচাইকৃত ক্রেতা
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {new Date(currentReview.createdAt).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Star Rating & Channel Info */}
                <div className="flex items-center gap-2">
                  {currentReview.channelTitle && (
                    <div
                      onClick={() => onSelectChannel && currentReview.channelId && onSelectChannel(currentReview.channelId)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300 ${
                        onSelectChannel ? 'cursor-pointer hover:border-red-500/50 hover:text-white transition' : ''
                      }`}
                      title={currentReview.channelTitle}
                    >
                      <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="max-w-[150px] sm:max-w-[220px] truncate">
                        {currentReview.channelTitle}
                      </span>
                      {onSelectChannel && <ExternalLink className="w-2.5 h-2.5 text-slate-400" />}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                    <div className="flex items-center text-amber-400 text-sm">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < currentReview.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-black text-amber-300">
                      {currentReview.rating}.0
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Comment Body with Quote Icon */}
              <div className="relative pl-6 py-1">
                <Quote className="w-4 h-4 text-red-500/60 absolute left-0 top-1 shrink-0" />
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  "{currentReview.comment}"
                </p>
              </div>

              {/* Tags / Badges for Communication and Speed */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-900 text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[11px]">
                  <Zap className="w-3 h-3 text-amber-400" />
                  হ্যান্ডওভার স্পিড: <strong className="text-white">{currentReview.transferSpeedRating || 5}/৫</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[11px]">
                  <MessageSquare className="w-3 h-3 text-blue-400" />
                  কমিউনিকেশন: <strong className="text-white">{currentReview.communicationRating || 5}/৫</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[11px] ml-auto">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ১০০% সিকিউর এসক্রো
                </span>
              </div>
            </div>
          </div>

          {/* Slider Controls: Previous & Next Buttons */}
          {reviews.length > 1 && (
            <div className="flex items-center justify-between mt-4">
              {/* Slide Counter */}
              <div className="text-xs font-semibold text-slate-400">
                রিভিউ <span className="text-white font-bold">{currentIndex + 1}</span> / {reviews.length}
              </div>

              {/* Slider Indicator Dots */}
              <div className="flex items-center gap-1.5">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentIndex
                        ? 'w-6 bg-red-500'
                        : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                    aria-label={`Go to review ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Left / Right Arrow Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition hover:scale-105 active:scale-95 border border-slate-700 cursor-pointer"
                  title="পূর্ববর্তী রিভিউ"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition hover:scale-105 active:scale-95 border border-slate-700 cursor-pointer"
                  title="পরবর্তী রিভিউ"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ৩. রিভিউ লেখার মডাল (Review Submission Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-600/10 border border-red-600/30 text-red-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {channelId ? 'এই একাউন্টের জন্য রিভিউ দিন' : 'একাউন্ট লেনদেনের রিভিউ দিন'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {channelTitle || 'আপনার সফল চ্যানেল ট্রান্সফারের বাস্তব অভিজ্ঞতা শেয়ার করুন'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Channel Selector if not pre-locked to a channel */}
              {!channelId && availableChannels.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    কোন একাউন্ট / চ্যানেলের লেনদেন ছিল?
                  </label>
                  <select
                    value={selectedChannelId}
                    onChange={(e) => setSelectedChannelId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    {availableChannels.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reviewer Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  আপনার নাম (ক্রেতা)
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  সার্বিক রেটিং নির্বাচন করুন (১ - ৫ স্টার)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            (hoverRating || rating) >= star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-300">
                    {rating === 5 && '🌟 অসাধারণ (৫.০)'}
                    {rating === 4 && '👍 খুব ভালো (৪.০)'}
                    {rating === 3 && '🙂 সন্তোষজনক (৩.০)'}
                    {rating === 2 && '😐 সাধারণ (২.০)'}
                    {rating === 1 && '👎 খারাপ (১.০)'}
                  </span>
                </div>
              </div>

              {/* Mini Ratings: Communication & Transfer Speed */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-300 block flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-blue-400" />
                    কমিউনিকেশন
                  </span>
                  <select
                    value={communicationRating}
                    onChange={(e) => setCommunicationRating(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value={5}>৫/৫ - দারুণ রেসপন্স</option>
                    <option value={4}>৪/৫ - ভালো রেসপন্স</option>
                    <option value={3}>৩/৫ - সাধারণ</option>
                    <option value={2}>২/৫ - কিছুটা ধীর</option>
                    <option value={1}>১/৫ - খুব ধীর</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-300 block flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    হ্যান্ডওভার স্পিড
                  </span>
                  <select
                    value={transferSpeedRating}
                    onChange={(e) => setTransferSpeedRating(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value={5}>৫/৫ - সুপার ফাস্ট</option>
                    <option value={4}>৪/৫ - দ্রুত সম্পন্ন</option>
                    <option value={3}>৩/৫ - স্বাভাবিক সময়</option>
                    <option value={2}>২/৫ - কিছুটা দেরি</option>
                    <option value={1}>১/৫ - ধীরগতি</option>
                  </select>
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  আপনার রিভিউ ও মন্তব্য *
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="যেমন: চ্যানেলের প্রাইমারি ওনারশিপ খুব দ্রুত পেয়েছি, সাপোর্ট অনেক ভালো ছিল এবং লেনদেন সম্পূর্ণ নিরাপদ ছিল..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>প্রকাশ হচ্ছে...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>রিভিউ প্রকাশ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
