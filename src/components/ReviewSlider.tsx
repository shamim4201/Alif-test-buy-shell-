import React, { useState, useEffect, useRef } from 'react';
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
  ExternalLink,
  Play,
  Pause,
  Lock,
  FileCheck,
  BadgeAlert,
  ThumbsUp
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { getLocalizedReview } from '../translations/translations';

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
  heading,
  subheading
}) => {
  const { user, showToast } = useAuth();
  const { language, t } = useCurrency();
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState(user?.name || '');
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channelId || (availableChannels[0]?.id || ''));
  const [comment, setComment] = useState('');
  const [communicationRating, setCommunicationRating] = useState(5);
  const [transferSpeedRating, setTransferSpeedRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const SLIDE_DURATION = 4000;

  const trustPillars = [
    {
      icon: Lock,
      title: t('১০০% নিরাপদ এস্ক্রো ফান্ড', '100% Secure Escrow Custody'),
      desc: t('ক্রেতা ওনারশিপ না পাওয়া পর্যন্ত টাকা প্ল্যাটফর্মে সংরক্ষিত থাকে', 'Buyer funds remain locked in escrow until full ownership is delivered'),
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      icon: ShieldCheck,
      title: t('নো-পাসওয়ার্ড সিকিউরিটি পলিসি', 'No-Password Security Policy'),
      desc: t('কোনো পাসওয়ার্ড শেয়ার লাগে না, সম্পূর্ণ অফিসিয়াল একাউন্ট ওনারশিপ হস্তান্তর', 'No passwords ever shared; transfers occur via official invite permissions'),
      color: 'text-blue-700 bg-blue-50 border-blue-200'
    },
    {
      icon: FileCheck,
      title: t('যাচাইকৃত রিয়েল অ্যানালিটিক্স', 'Verified Live Analytics'),
      desc: t('স্টুডিও স্ক্রিনশট, কপিরাইট স্ট্যাটাস এবং ভিউজ লাইভ ডাটা যাচাইকৃত', 'Studio analytics, monthly revenue, and copyright standing audited'),
      color: 'text-amber-800 bg-amber-50 border-amber-200'
    },
    {
      icon: Zap,
      title: t('৭ দিনের হ্যান্ডওভার গ্যারান্টি', '7-Day Handover Guarantee'),
      desc: t('প্রাইমারি ওনারশিপ নিশ্চিতের প্রতিটি ধাপে সার্বক্ষণিক সাপোর্ট', '24/7 dedicated support throughout the mandatory 7-day transfer window'),
      color: 'text-cyan-800 bg-cyan-50 border-cyan-200'
    }
  ];

  // Fetch reviews if not provided
  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      setReviews(initialReviews);
      return;
    }
    async function loadReviews() {
      try {
        setLoading(true);
        const res = await api.getReviews(channelId ? { channelId } : undefined);
        setReviews(res.reviews || []);
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, [channelId, initialReviews]);

  // Automatic Slide Rotation & Progress Bar Timer
  useEffect(() => {
    if (!isAutoPlaying || isHovered || reviews.length <= 1) {
      return;
    }

    const intervalTime = 50;
    const stepIncrement = (intervalTime / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((curr) => (curr + 1) % reviews.length);
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovered, reviews.length]);

  const handleNext = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
    setProgress(0);
  };

  const handlePrev = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    setProgress(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleOpenModal = () => {
    if (!user) {
      showToast(t('রিভিউ দিতে অনুগ্রহ করে লগইন করুন', 'Please log in to submit a review'), 'info');
    }
    setReviewerName(user?.name || '');
    setIsModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast(t('অনুগ্রহ করে রিভিউ কমেন্ট লিখুন', 'Please write your review comment'), 'error');
      return;
    }

    const targetChannel = channelId || selectedChannelId || (availableChannels[0]?.id || '');
    if (!targetChannel) {
      showToast(t('অনুগ্রহ করে একটি চ্যানেল বা একাউন্ট নির্বাচন করুন', 'Please select a channel or account'), 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitReview({
        channelId: targetChannel,
        rating,
        comment: comment.trim(),
        reviewerName: reviewerName.trim() || user?.name || (language === 'BN' ? 'যাচাইকৃত ক্রেতা' : 'Verified Buyer'),
        communicationRating,
        transferSpeedRating
      });

      showToast(t('আপনার ট্রাস্টেড রিভিউ সফলভাবে যোগ হয়েছে!', 'Your verified review has been submitted successfully!'), 'success');
      setReviews((prev) => [res.review, ...prev]);
      onReviewAdded?.(res.review);
      setIsModalOpen(false);
      setComment('');
      setCurrentIndex(0);
      setProgress(0);
    } catch (err: any) {
      showToast(err.message || t('রিভিউ প্রকাশ করতে সমস্যা হয়েছে', 'Failed to submit review'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const currentReview = reviews[currentIndex] || reviews[0];
  const localizedReview = currentReview ? getLocalizedReview(currentReview, language) : null;

  const defaultHeading = t('কেন আমরা ১০০% ট্রাস্টেড? ক্রেতাদের বাস্তব প্রমাণ ও রিভিউ', 'Why We Are 100% Trusted: Real Buyer Reviews & Proof');
  const defaultSubheading = t('জিরো-রিস্ক এস্ক্রো, নো-পাসওয়ার্ড পলিসি ও অফিসিয়াল প্রাইমারি ওনারশিপ হস্তান্তরের শতভাগ বিশ্বস্ত প্ল্যাটফর্ম', 'Zero-risk escrow, no-password policy, and 100% verified official primary ownership transfers');

  return (
    <div className="space-y-6">
      {/* 1. সেকশন হেডার */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('১০০% ভেরিফাইড এস্ক্রো ট্রেডিং ও ট্রাস্ট গ্যারান্টি', '100% Verified Escrow Transfers & Trust Guarantee')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {heading || defaultHeading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {subheading || defaultSubheading}
          </p>
        </div>

        {/* Controls: Auto-slide Toggle + Add Review Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
              isAutoPlaying
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-white text-slate-600 border-slate-300 hover:text-slate-900'
            }`}
            title={isAutoPlaying ? t('অটো-স্লাইডার চালু আছে', 'Auto-slider is active') : t('অটো-স্লাইডার বন্ধ আছে', 'Auto-slider is paused')}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3 h-3 text-emerald-600" />
                <span className="hidden sm:inline">{t('অটো-স্লাইড চালু', 'Auto-Play Active')}</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span className="hidden sm:inline">{t('অটো-স্লাইড বন্ধ', 'Auto-Play Paused')}</span>
              </>
            )}
          </button>

          {/* [+ রিভিউ অপশন বাটন] */}
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('+ রিভিউ দিন', '+ Leave a Review')}</span>
          </button>
        </div>
      </div>

      {/* ট্রাস্ট পিলার্স */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {trustPillars.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl border ${item.color} flex flex-col justify-between gap-1 transition-transform hover:-translate-y-0.5 shadow-2xs`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold leading-tight">
                  {item.title}
                </span>
              </div>
              <p className="text-[10px] leading-normal opacity-90">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* ২. নিচে একটার পর একটা অটো-স্লাইডার আকারে রিভিউসমূহ */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">{t('ট্রাস্টেড রিভিউ লোড হচ্ছে...', 'Loading verified reviews...')}</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
          <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">{t('এখনো কোনো রিভিউ দেওয়া হয়নি', 'No reviews submitted yet')}</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t('এই প্ল্যাটফর্মের লেনদেন অভিজ্ঞতা কেমন ছিল? প্রথম রিভিউটি আপনি দিন।', 'How was your experience on our platform? Be the first to share verified feedback.')}
          </p>
          <button
            onClick={handleOpenModal}
            className="mt-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
          >
            {t('প্রথম রিভিউটি দিন', 'Be the First to Review')}
          </button>
        </div>
      ) : (
        <div
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Animated Progress Bar */}
          {isAutoPlaying && reviews.length > 1 && (
            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-red-600 transition-all duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Main Slide Card Container */}
          <div className="relative overflow-hidden rounded-2xl">
            <div
              key={currentReview.id}
              className="animate-fade-in transition-all duration-500 ease-out p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 space-y-4 shadow-sm"
            >
              {/* Slide Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-2xl bg-red-600 text-white font-black flex items-center justify-center text-base shadow-sm shrink-0">
                    {(localizedReview?.buyerName || currentReview.buyerName)?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm sm:text-base font-bold text-slate-900">
                        {localizedReview?.buyerName || currentReview.buyerName}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {t('ভেরিফাইড এস্ক্রো লেনদেন', 'Verified Escrow Transaction')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-500">
                        {new Date(currentReview.createdAt).toLocaleDateString(language === 'BN' ? 'bn-BD' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-amber-500" />
                        {t('১০০% বিশ্বস্ত অভিজ্ঞতা', '100% Trusted Experience')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Star Rating & Channel Info */}
                <div className="flex flex-wrap items-center gap-2">
                  {(localizedReview?.channelTitle || currentReview.channelTitle) && (
                    <div
                      onClick={() => onSelectChannel && currentReview.channelId && onSelectChannel(currentReview.channelId)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 ${
                        onSelectChannel ? 'cursor-pointer hover:border-red-400 hover:text-slate-900 transition' : ''
                      }`}
                      title={localizedReview?.channelTitle || currentReview.channelTitle}
                    >
                      <Youtube className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span className="max-w-[140px] sm:max-w-[200px] truncate">
                        {localizedReview?.channelTitle || currentReview.channelTitle}
                      </span>
                      {onSelectChannel && <ExternalLink className="w-2.5 h-2.5 text-slate-400" />}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 shrink-0">
                    <div className="flex items-center text-amber-500 text-sm">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < currentReview.rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-black text-amber-800">
                      {currentReview.rating}.0
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Comment Body with Quote Icon */}
              <div className="relative pl-7 py-1">
                <Quote className="w-5 h-5 text-red-400 absolute left-0 top-1 shrink-0" />
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal italic">
                  "{localizedReview?.comment || currentReview.comment}"
                </p>
              </div>

              {/* Tags / Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 text-[11px]">
                  <Zap className="w-3 h-3 text-amber-600" />
                  {t('হ্যান্ডওভার স্পিড: ', 'Handover Speed: ')}<strong className="text-slate-900">{currentReview.transferSpeedRating || 5}/{t('৫', '5')}</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 text-[11px]">
                  <MessageSquare className="w-3 h-3 text-blue-600" />
                  {t('কমিউনিকেশন: ', 'Communication: ')}<strong className="text-slate-900">{currentReview.communicationRating || 5}/{t('৫', '5')}</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {t('প্রাইমারি ওনারশিপ ভেরিফাইড', 'Primary Ownership Verified')}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 text-[11px] ml-auto">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  {t('জিরো রিস্ক এস্ক্রো', 'Zero-Risk Escrow')}
                </span>
              </div>
            </div>
          </div>

          {/* Slider Controls */}
          {reviews.length > 1 && (
            <div className="flex items-center justify-between pt-3 px-1">
              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setProgress(0);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentIndex
                        ? 'w-7 bg-red-600'
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Go to review ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Left / Right Arrow Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 transition hover:scale-105 active:scale-95 border border-slate-200 cursor-pointer shadow-xs"
                  title={t("পূর্ববর্তী রিভিউ", "Previous Review")}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 transition hover:scale-105 active:scale-95 border border-slate-200 cursor-pointer shadow-xs"
                  title={t("পরবর্তী রিভিউ", "Next Review")}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ৩. রিভিউ লেখার মডাল */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl my-8 text-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {channelId
                      ? t('এই একাউন্টের জন্য ট্রাস্টেড রিভিউ দিন', 'Submit a Verified Review for this Account')
                      : t('কেন ট্রাস্টেড? আপনার বাস্তব অভিজ্ঞতা শেয়ার করুন', 'Why We Are Trusted: Share Your Authentic Experience')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {channelTitle || t('সফল ওনারশিপ হস্তান্তর ও লেনদেনের বিশ্বাসযোগ্যতা সম্পর্কে লিখুন', 'Write about your verified ownership transfer experience')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {!channelId && availableChannels.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('কোন একাউন্ট / চ্যানেলের লেনদেন ছিল?', 'Which account/channel was this acquisition for?')}
                  </label>
                  <select
                    value={selectedChannelId}
                    onChange={(e) => setSelectedChannelId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-red-500"
                  >
                    {availableChannels.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('আপনার নাম (বা গোপন রাখতে পারেন)', 'Your Name (or alias)')}
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder={t('যেমন: তানভীর হাসান বা ভেরিফাইড ক্রেতা', 'e.g. Tanvir Hasan or Verified Buyer')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-red-500"
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('সার্বিক অভিজ্ঞতা রেটিং (১-৫ স্টার)', 'Overall Experience Rating (1-5 Stars)')}
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-700 ml-2">
                    {rating}.0 / {t('৫.০', '5.0')}
                  </span>
                </div>
              </div>

              {/* Detailed Feedback Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('আপনার বিস্তারিত বাস্তব অভিজ্ঞতা ও কমেন্ট লিখুন *', 'Your Detailed Authentic Review *')}
                </label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t(
                    'যেমন: ওনারশিপ ট্রান্সফারে কোনো সমস্যা হয়নি, ৭ দিনে প্রাইমারি ওনার বানিয়ে দিয়েছে। এস্ক্রো সিস্টেম ১০০% নিরাপদ...',
                    'e.g. Ownership transfer went smoothly without sharing any passwords. Primary owner transferred safely...'
                  )}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-red-500 leading-relaxed"
                />
              </div>

              {/* Sub-ratings */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {t('হ্যান্ডওভার স্পিড (১-৫)', 'Transfer Speed (1-5)')}
                  </label>
                  <select
                    value={transferSpeedRating}
                    onChange={(e) => setTransferSpeedRating(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                  >
                    <option value={5}>{t('⭐⭐⭐⭐⭐ ৫ - দ্রুত ও নিখুঁত', '⭐⭐⭐⭐⭐ 5 - Fast & Seamless')}</option>
                    <option value={4}>{t('⭐⭐⭐⭐ ৪ - ভালো', '⭐⭐⭐⭐ 4 - Good')}</option>
                    <option value={3}>{t('⭐⭐⭐ ৩ - স্বাভাবিক', '⭐⭐⭐ 3 - Normal')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {t('সেলার কমিউনিকেশন (১-৫)', 'Seller Communication (1-5)')}
                  </label>
                  <select
                    value={communicationRating}
                    onChange={(e) => setCommunicationRating(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                  >
                    <option value={5}>{t('⭐⭐⭐⭐⭐ ৫ - দারুণ রেসপন্স', '⭐⭐⭐⭐⭐ 5 - Excellent')}</option>
                    <option value={4}>{t('⭐⭐⭐⭐ ৪ - ভালো', '⭐⭐⭐⭐ 4 - Good')}</option>
                    <option value={3}>{t('⭐⭐⭐ ৩ - মোটামুটি', '⭐⭐⭐ 3 - Fair')}</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <span>{t('প্রকাশ হচ্ছে...', 'Submitting...')}</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('রিভিউ প্রকাশ করুন', 'Publish Review')}</span>
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
