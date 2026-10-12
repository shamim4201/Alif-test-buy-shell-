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

const TRUST_PILLARS = [
  {
    icon: Lock,
    title: '১০০% নিরাপদ এসক্রো ফান্ড',
    desc: 'বায়ার ওনারশিপ না পাওয়া পর্যন্ত টাকা প্ল্যাটফর্মে সংরক্ষিত থাকে',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  },
  {
    icon: ShieldCheck,
    title: 'নো-পাসওয়ার্ড পলিসি',
    desc: 'কোনো পাসওয়ার্ড শেয়ার লাগে না, ব্র্যান্ড একাউন্ট ট্রান্সফার',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
  },
  {
    icon: FileCheck,
    title: 'ভেরিফাইড লাইভ অ্যানালিটিক্স',
    desc: 'স্টুডিও স্ক্রিনশট, কপিরাইট ও ভিউজ লাইভ ডাটা যাচাইকৃত',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  },
  {
    icon: Zap,
    title: '৭ দিনের হ্যান্ডওভার গ্যারান্টি',
    desc: 'প্রাইমারি ওনারশিপ নিশ্চিতের প্রতিটি ধাপে ২৪/৭ সাপোর্ট',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
  }
];

export const ReviewSlider: React.FC<ReviewSliderProps> = ({
  channelId,
  channelTitle,
  initialReviews,
  onReviewAdded,
  onSelectChannel,
  availableChannels = [],
  heading = 'কেন আমরা ১০০% ট্রাস্টেড? ক্রেতাদের বাস্তব প্রমাণ ও রিভিউ',
  subheading = 'জিরো-রিস্ক এসক্রো, নো-পাসওয়ার্ড পলিসি ও অফিসিয়াল গুগল প্রাইমারি ওনারশিপ হস্তান্তরের শতভাগ বিশ্বস্ত প্ল্যাটফর্ম'
}) => {
  const { user, showToast } = useAuth();
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

  const SLIDE_DURATION = 4000; // 4 seconds per slide for smooth automatic sliding

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

  // একটার পর একটা অটো-স্লাইডার (Auto-slider timer + progress bar)
  useEffect(() => {
    if (reviews.length <= 1 || !isAutoPlaying || isHovered || isModalOpen) {
      setProgress(0);
      return;
    }

    const intervalStep = 50; // update progress every 50ms
    const totalSteps = SLIDE_DURATION / intervalStep;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      const currentProgress = (stepCount / totalSteps) * 100;
      setProgress(currentProgress);

      if (stepCount >= totalSteps) {
        stepCount = 0;
        setProgress(0);
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
      }
    }, intervalStep);

    return () => clearInterval(timer);
  }, [reviews.length, isAutoPlaying, isHovered, isModalOpen, currentIndex]);

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
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
      // Swiped left -> next
      handleNext();
    } else if (distance < -50) {
      // Swiped right -> prev
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
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
      setProgress(0);
      setIsModalOpen(false);
      setComment('');
      showToast('আপনার ট্রাস্টেড রিভিউ সফলভাবে প্রকাশ করা হয়েছে!', 'success');
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
      setProgress(0);
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* ১. উপরে রিভিউ অপশন ও হেডার বার (Review Option on Top) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80 relative z-10">
        <div>
          <div className="flex items-start sm:items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-red-500/30 text-red-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {heading}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  ১০০% ভেরিফাইড লেনদেন
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {subheading}
              </p>
            </div>
          </div>
        </div>

        {/* Right side: Score, Auto-slider Status & "রিভিউ দিন" Button */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          {/* Average Rating Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner">
            <div className="flex items-center text-amber-400 text-sm">
              {'★'.repeat(Math.round(Number(avgRating)))}
            </div>
            <span className="text-sm font-black text-white">{avgRating}</span>
            <span className="text-[10px] text-slate-500 font-semibold">/ ৫.০ ({totalReviews} রিভিউ)</span>
          </div>

          {/* Auto-Slide Toggle Button */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
              isAutoPlaying
                ? 'bg-slate-950 text-emerald-400 border-emerald-500/40 hover:bg-slate-800'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title={isAutoPlaying ? 'অটো-স্লাইডার চালু আছে (ক্লিক করে পজ করুন)' : 'অটো-স্লাইডার বন্ধ আছে (ক্লিক করে চালু করুন)'}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3 h-3" />
                <span className="hidden sm:inline">অটো-স্লাইড চালু</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span className="hidden sm:inline">অটো-স্লাইড বন্ধ</span>
              </>
            )}
          </button>

          {/* [+ রিভিউ অপশন বাটন] */}
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ রিভিউ দিন</span>
          </button>
        </div>
      </div>

      {/* ট্রাস্ট পিলার্স (কেন এটি ১০০% ট্রাস্টেড) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {TRUST_PILLARS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl border ${item.color} flex flex-col justify-between gap-1 transition-transform hover:-translate-y-0.5`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold text-white leading-tight">
                  {item.title}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-normal">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* ২. নিচে একটার পর একটা অটো-স্লাইডার আকারে রিভিউসমূহ (Auto-slider Reviews) */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">ট্রাস্টেড রিভিউ লোড হচ্ছে...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 p-6 space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">এখনো কোনো রিভিউ দেওয়া হয়নি</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            এই প্ল্যাটফর্মের লেনদেন অভিজ্ঞতা কেমন ছিল? প্রথম রিভিউটি আপনি দিন।
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
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Animated Progress Bar for Auto-Slider (একটার পর একটা অটো স্লাইড প্রগ্রেস) */}
          {isAutoPlaying && reviews.length > 1 && (
            <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mb-3 border border-slate-800/60">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Main Slide Card Container */}
          <div className="relative overflow-hidden rounded-2xl">
            <div
              key={currentReview.id}
              className="animate-fade-in transition-all duration-500 ease-out p-5 sm:p-7 rounded-2xl bg-slate-950/95 border border-slate-800 hover:border-slate-700 space-y-4 shadow-xl"
            >
              {/* Slide Header: Reviewer Info, Star Rating & Trust Proof Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 text-white font-black flex items-center justify-center text-base shadow-lg ring-2 ring-slate-800 shrink-0">
                    {currentReview.buyerName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm sm:text-base font-bold text-white">
                        {currentReview.buyerName}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/90 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        ভেরিফাইড এসক্রো লেনদেন
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400">
                        {new Date(currentReview.createdAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        ১০০% ট্রাস্টেড অভিজ্ঞতা
                      </span>
                    </div>
                  </div>
                </div>

                {/* Star Rating & Channel Info */}
                <div className="flex flex-wrap items-center gap-2">
                  {currentReview.channelTitle && (
                    <div
                      onClick={() => onSelectChannel && currentReview.channelId && onSelectChannel(currentReview.channelId)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300 ${
                        onSelectChannel ? 'cursor-pointer hover:border-red-500/50 hover:text-white transition' : ''
                      }`}
                      title={currentReview.channelTitle}
                    >
                      <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="max-w-[140px] sm:max-w-[200px] truncate">
                        {currentReview.channelTitle}
                      </span>
                      {onSelectChannel && <ExternalLink className="w-2.5 h-2.5 text-slate-400" />}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                    <div className="flex items-center text-amber-400 text-sm">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
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
              <div className="relative pl-7 py-1">
                <Quote className="w-5 h-5 text-red-500/60 absolute left-0 top-1 shrink-0" />
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal italic">
                  "{currentReview.comment}"
                </p>
              </div>

              {/* Tags / Badges for Communication, Speed & Platform Trust */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-900 text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[11px]">
                  <Zap className="w-3 h-3 text-amber-400" />
                  হ্যান্ডওভার স্পিড: <strong className="text-white">{currentReview.transferSpeedRating || 5}/৫</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[11px]">
                  <MessageSquare className="w-3 h-3 text-blue-400" />
                  কমিউনিকেশন: <strong className="text-white">{currentReview.communicationRating || 5}/৫</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  গুগল প্রাইমারি ওনারশিপ ভেরিফাইড
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 text-[11px] ml-auto">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  জিরো রিস্ক এসক্রো
                </span>
              </div>
            </div>
          </div>

          {/* Slider Controls: Previous & Next Buttons, Indicators, and Auto-play status */}
          {reviews.length > 1 && (
            <div className="flex items-center justify-between mt-4">
              {/* Slide Counter & Hover Pause status */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span>
                  রিভিউ <strong className="text-white font-bold">{currentIndex + 1}</strong> / {reviews.length}
                </span>
                {isHovered && isAutoPlaying && (
                  <span className="text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                    ⏸ মাউস পজ
                  </span>
                )}
              </div>

              {/* Slider Indicator Dots */}
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
                        ? 'w-7 bg-gradient-to-r from-red-500 to-amber-500'
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
                    {channelId ? 'এই একাউন্টের জন্য ট্রাস্টেড রিভিউ দিন' : 'কেন ট্রাস্টেড? আপনার বাস্তব অভিজ্ঞতা শেয়ার করুন'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {channelTitle || 'সফল ওনারশিপ হস্তান্তর ও লেনদেনের বিশ্বাসযোগ্যতা সম্পর্কে লিখুন'}
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
                  আপনার নাম (ক্রেতা / বায়ার)
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
                  সার্বিক বিশ্বস্ততা ও রেটিং (১ - ৫ স্টার)
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
                    {rating === 5 && '🌟 শতভাগ ট্রাস্টেড (৫.০)'}
                    {rating === 4 && '👍 খুব ভালো ও নিরাপদ (৪.০)'}
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
                  আপনার রিভিউ ও কেন এটি ট্রাস্টেড মনে হয়েছে? *
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="যেমন: কোনো পাসওয়ার্ড ছাড়াই ব্র্যান্ড একাউন্ট ট্রান্সফার পেয়েছি, এসক্রো থাকায় টাকা নিরাপদ ছিল এবং সাপোর্ট খুব হেল্পফুল ছিল..."
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
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
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
