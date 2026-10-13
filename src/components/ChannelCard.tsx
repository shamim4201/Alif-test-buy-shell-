import React from 'react';
import { ChannelListing } from '../types';
import {
  Users,
  Eye,
  DollarSign,
  CheckCircle2,
  ShieldCheck,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Youtube
} from 'lucide-react';

interface ChannelCardProps {
  channel: ChannelListing;
  onSelect: (channelId: string) => void;
  currency?: 'USD' | 'BDT';
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onSelect, currency = 'USD' }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getPlatformBadge = () => {
    const p = channel.platform || 'youtube';
    switch (p) {
      case 'facebook':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-950/95 border border-blue-500/80 text-blue-300 shadow-md backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            🔵 Facebook
          </span>
        );
      case 'tiktok':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-950/95 border border-cyan-400/80 text-cyan-300 shadow-md backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            🎵 TikTok
          </span>
        );
      case 'instagram':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-950/95 border border-pink-500/80 text-pink-300 shadow-md backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            📸 Instagram
          </span>
        );
      case 'telegram':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-950/95 border border-sky-400/80 text-sky-300 shadow-md backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            ✈️ Telegram
          </span>
        );
      case 'twitter':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-950/95 border border-slate-400/80 text-slate-200 shadow-md backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            🐦 X / Twitter
          </span>
        );
      case 'youtube':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-950/95 border border-red-500/80 text-red-300 shadow-md backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            🔴 YouTube
          </span>
        );
    }
  };

  const getAccountTypeBadge = () => {
    switch (channel.accountType) {
      case 'facebook_page':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/80 border border-blue-600/60 text-blue-200 shadow-xs">
            📄 ফেসবুক পেজ
          </span>
        );
      case 'tiktok_viral':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-900/80 border border-cyan-500/60 text-cyan-200 shadow-xs">
            ⚡ ক্রিয়েটর রিওয়ার্ডস
          </span>
        );
      case 'instagram_theme':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-900/80 border border-purple-500/60 text-purple-200 shadow-xs">
            🎨 থিম পেজ
          </span>
        );
      case 'telegram_signal':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-900/80 border border-sky-500/60 text-sky-200 shadow-xs">
            📡 সিগন্যাল / মেম্বার
          </span>
        );
      case 'twitter_crypto':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800/80 border border-slate-600/60 text-zinc-200 shadow-xs">
            💎 ব্লু ভেরিফাইড
          </span>
        );
      case 'cooking_lifestyle':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/90 border border-amber-500/70 text-amber-300 shadow-xs">
            👩‍🍳 আন্টির রান্না / Cooking
          </span>
        );
      case 'faceless_cash_cow':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/90 border border-purple-500/70 text-purple-300 shadow-xs">
            🤖 Faceless Cash Cow
          </span>
        );
      case 'shorts_creator':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/90 border border-rose-500/70 text-rose-300 shadow-xs">
            ⚡ Viral Shorts
          </span>
        );
      case 'gaming_stream':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/90 border border-blue-500/70 text-blue-300 shadow-xs">
            🎮 Gaming & Stream
          </span>
        );
      case 'vintage_aged':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 shadow-xs">
            🏛️ Vintage {channel.creationYear}
          </span>
        );
      case 'high_cpm_finance':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 shadow-xs">
            💰 High CPM Finance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800/90 border border-slate-600/70 text-slate-300 shadow-xs">
            {channel.niche}
          </span>
        );
    }
  };

  // Get high quality product image for channel or social account
  const getChannelImage = () => {
    if (channel.analyticsScreenshots && channel.analyticsScreenshots.length > 0) {
      return channel.analyticsScreenshots[0];
    }
    const p = channel.platform || 'youtube';
    if (p === 'facebook') return 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&auto=format&fit=crop&q=80';
    if (p === 'tiktok') return 'https://images.unsplash.com/photo-1611162616091-2dc0609f06df?w=800&auto=format&fit=crop&q=80';
    if (p === 'instagram') return 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=80';
    if (p === 'telegram') return 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80';
    if (p === 'twitter') return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';

    switch (channel.accountType) {
      case 'cooking_lifestyle':
        return 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80';
      case 'faceless_cash_cow':
        return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
      case 'shorts_creator':
        return 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80';
      case 'gaming_stream':
        return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';
      case 'vintage_aged':
        return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
      case 'high_cpm_finance':
        return 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80';
      default:
        if (channel.niche === 'Gaming') return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';
        if (channel.niche === 'Finance') return 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80';
        if (channel.niche === 'Lifestyle') return 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80';
        if (channel.niche === 'Education') return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80';
        return 'https://images.unsplash.com/photo-1611162616091-2dc0609f06df?w=800&auto=format&fit=crop&q=80';
    }
  };

  const getFollowerLabel = () => {
    const p = channel.platform || 'youtube';
    if (p === 'telegram') return 'মেম্বার';
    if (p === 'facebook' || p === 'tiktok' || p === 'instagram' || p === 'twitter') return 'ফলোয়ার';
    return 'সাবস্ক্রাইবার';
  };

  const getBorderHoverClass = () => {
    const p = channel.platform || 'youtube';
    if (p === 'facebook') return 'hover:border-blue-500/80 hover:shadow-blue-950/40';
    if (p === 'tiktok') return 'hover:border-cyan-400/80 hover:shadow-cyan-950/40';
    if (p === 'instagram') return 'hover:border-pink-500/80 hover:shadow-pink-950/40';
    if (p === 'telegram') return 'hover:border-sky-400/80 hover:shadow-sky-950/40';
    if (p === 'twitter') return 'hover:border-slate-400/80 hover:shadow-slate-900/40';
    return 'hover:border-red-500/80 hover:shadow-red-950/40';
  };

  const bdtPrice = Math.round(channel.askingPrice * 122);

  return (
    <div
      onClick={() => onSelect(channel.id)}
      className={`group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col justify-between cursor-pointer ${getBorderHoverClass()}`}
    >
      {/* 1. প্রোডাক্টের ছবি উপরে (Account/Channel Image on Top) */}
      <div className="relative aspect-[16/10] sm:aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={getChannelImage()}
          alt={channel.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162616091-2dc0609f06df?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Gradient shadow overlay for badge readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-black/40 pointer-events-none" />

        {/* Top-Left: Platform Badge & Account Type */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 flex flex-wrap items-center gap-1.5 max-w-[75%]">
          {getPlatformBadge()}
          {getAccountTypeBadge()}
        </div>

        {/* Top-Right: Verified & Badges */}
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 flex items-center gap-1 sm:gap-1.5">
          {channel.hasSilverButton && (
            <span
              className="p-1 sm:px-1.5 rounded-lg bg-slate-900/90 text-slate-200 border border-slate-700/80 text-[9px] sm:text-[10px] flex items-center gap-1 font-bold shadow-md backdrop-blur-xs"
              title="Silver Creator Award (100k+ subscribers)"
            >
              <Award className="w-3 h-3 text-slate-300" />
              <span className="hidden sm:inline">100K Award</span>
            </span>
          )}
          {channel.pageQuality === 'green' && (
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-500/70 px-1.5 sm:px-2 py-0.5 rounded-lg shadow-md backdrop-blur-xs">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Green Quality</span>
            </span>
          )}
          {channel.verificationStatus === 'approved' && !channel.pageQuality && (
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-600/60 px-1.5 sm:px-2 py-0.5 rounded-lg shadow-md backdrop-blur-xs">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Verified</span>
            </span>
          )}
        </div>

        {/* Bottom Floating Stats on Image */}
        <div className="absolute bottom-1.5 left-2 right-2 sm:bottom-2 sm:left-2.5 sm:right-2.5 z-10 flex items-center justify-between text-[10px] sm:text-xs font-semibold text-white">
          {/* Monetization Status or Tool */}
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-xs border border-slate-700/70 text-[10px] sm:text-[11px] text-emerald-400">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">
              {channel.monetizationTool || (channel.monetizationStatus === 'monetized' ? 'Monetized' : 'Clean')}
            </span>
          </span>

          {/* Subscribers / Followers Pill */}
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-xs border border-slate-700/70 text-[10px] sm:text-[11px] text-white">
            <Users className="w-3 h-3 text-blue-400 shrink-0" />
            <strong className="text-white">{formatNumber(channel.subscribers)}</strong>
            <span className="text-slate-300 text-[10px] hidden sm:inline">{getFollowerLabel()}</span>
          </span>
        </div>
      </div>

      {/* 2. ছবির নিচে টাইটেল ও বিবরণ (Channel / Account Title Below Image) */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Title */}
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug mb-1">
            {channel.title}
          </h3>

          {/* Handle & Language */}
          <p className="text-[11px] sm:text-xs text-slate-400 font-mono mb-2.5 truncate">
            {channel.handle} {channel.primaryLanguage ? `• ${channel.primaryLanguage}` : ''}
          </p>

          {/* Mini Core Metrics Grid */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 py-1.5 sm:py-2 px-1.5 sm:px-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-2.5 text-center">
            <div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">{getFollowerLabel()}</span>
              <span className="text-[11px] sm:text-xs font-bold text-white">
                {formatNumber(channel.subscribers)}
              </span>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">মাসিক ভিউ/রিচ</span>
              <span className="text-[11px] sm:text-xs font-bold text-white">
                {formatNumber(channel.monthlyViews)}
              </span>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">মাসিক আয়</span>
              <span className="text-[11px] sm:text-xs font-bold text-emerald-400">
                ${channel.monthlyRevenue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {channel.description || 'Verified social account ready for primary ownership transfer.'}
          </p>
        </div>

        {/* 3. টাইটেলের নিচে প্রাইস (Price Section Below Title) */}
        <div className="pt-2.5 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5 sm:gap-2 mt-auto">
          <div>
            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              দাম (Price)
            </span>
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-base sm:text-xl md:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                ${channel.askingPrice.toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-xs text-amber-400 font-semibold">
                (৳{bdtPrice.toLocaleString()})
              </span>
            </div>
          </div>

          {/* Order / View Action Button */}
          <div className="text-right shrink-0">
            <span className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 group-hover:from-blue-500 group-hover:to-indigo-500 text-white font-bold text-[11px] sm:text-xs shadow-md shadow-blue-600/30 transition flex items-center gap-1 sm:gap-1.5 cursor-pointer">
              <span>কিনুন / দেখুন</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <div className="flex items-center justify-end gap-1 text-[9px] sm:text-[10px] text-slate-400 mt-1">
              <span className="truncate max-w-[50px] sm:max-w-none">{channel.sellerName?.split(' ')[0]}</span>
              <span className="text-amber-400 font-semibold">★ {channel.sellerRating || 5.0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

