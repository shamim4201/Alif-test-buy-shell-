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

  const getAccountTypeBadge = () => {
    switch (channel.accountType) {
      case 'cooking_lifestyle':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/90 border border-amber-500/70 text-amber-300 shadow-md backdrop-blur-xs">
            👩‍🍳 আন্টির রান্না / Cooking
          </span>
        );
      case 'faceless_cash_cow':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-950/90 border border-purple-500/70 text-purple-300 shadow-md backdrop-blur-xs">
            🤖 Faceless Cash Cow
          </span>
        );
      case 'shorts_creator':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-950/90 border border-rose-500/70 text-rose-300 shadow-md backdrop-blur-xs">
            ⚡ Viral Shorts
          </span>
        );
      case 'gaming_stream':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-950/90 border border-blue-500/70 text-blue-300 shadow-md backdrop-blur-xs">
            🎮 Gaming & Stream
          </span>
        );
      case 'vintage_aged':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 shadow-md backdrop-blur-xs">
            🏛️ Vintage {channel.creationYear}
          </span>
        );
      case 'high_cpm_finance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 shadow-md backdrop-blur-xs">
            💰 High CPM Finance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-950/90 border border-red-500/70 text-red-300 shadow-md backdrop-blur-xs">
            {channel.niche}
          </span>
        );
    }
  };

  // Get high quality product image for channel
  const getChannelImage = () => {
    if (channel.analyticsScreenshots && channel.analyticsScreenshots.length > 0) {
      return channel.analyticsScreenshots[0];
    }
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

  const bdtPrice = Math.round(channel.askingPrice * 122);

  return (
    <div
      onClick={() => onSelect(channel.id)}
      className="group relative bg-slate-900 border border-slate-800 hover:border-red-500/70 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/30 flex flex-col justify-between cursor-pointer"
    >
      {/* 1. প্রোডাক্টের ছবি উপরে (Channel Image on Top) */}
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
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-black/30 pointer-events-none" />

        {/* Top-Left: Account Type Badge */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 max-w-[65%]">
          {getAccountTypeBadge()}
        </div>

        {/* Top-Right: Verified & Award Badges */}
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
          {channel.verificationStatus === 'approved' && (
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-600/60 px-1.5 sm:px-2 py-0.5 rounded-lg shadow-md backdrop-blur-xs">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Verified</span>
            </span>
          )}
        </div>

        {/* Bottom Floating Stats on Image */}
        <div className="absolute bottom-1.5 left-2 right-2 sm:bottom-2 sm:left-2.5 sm:right-2.5 z-10 flex items-center justify-between text-[10px] sm:text-xs font-semibold text-white">
          {/* Monetization Status */}
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-900/85 backdrop-blur-xs border border-slate-700/70 text-[10px] sm:text-[11px] text-emerald-400">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{channel.monetizationStatus === 'monetized' ? 'Monetized' : 'Clean Strike'}</span>
          </span>

          {/* Subscribers Pill */}
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-900/85 backdrop-blur-xs border border-slate-700/70 text-[10px] sm:text-[11px] text-white">
            <Users className="w-3 h-3 text-red-400 shrink-0" />
            <strong className="text-white">{formatNumber(channel.subscribers)}</strong>
            <span className="text-slate-400 text-[10px] hidden sm:inline">Subs</span>
          </span>
        </div>
      </div>

      {/* 2. ছবির নিচে টাইটেল ও বিবরণ (Channel Title Below Image) */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Title */}
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug mb-1">
            {channel.title}
          </h3>

          {/* Handle & Language */}
          <p className="text-[11px] sm:text-xs text-slate-400 font-mono mb-2.5 truncate">
            {channel.handle} {channel.primaryLanguage ? `• ${channel.primaryLanguage}` : ''}
          </p>

          {/* Mini Core Metrics Grid */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 py-1.5 sm:py-2 px-1.5 sm:px-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-2.5 text-center">
            <div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">সাবস্ক্রাইবার</span>
              <span className="text-[11px] sm:text-xs font-bold text-white">
                {formatNumber(channel.subscribers)}
              </span>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">মাসিক ভিউ</span>
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
            {channel.description || 'Verified YouTube channel ready for primary ownership transfer.'}
          </p>
        </div>

        {/* 3. টাইটেলের নিচে প্রাইস (Price Section Below Title) */}
        <div className="pt-2.5 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5 sm:gap-2 mt-auto">
          <div>
            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              দাম (Price)
            </span>
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-base sm:text-xl md:text-2xl font-black text-white group-hover:text-red-400 transition-colors">
                ${channel.askingPrice.toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-xs text-amber-400 font-semibold">
                (৳{bdtPrice.toLocaleString()})
              </span>
            </div>
          </div>

          {/* Order / View Action Button */}
          <div className="text-right shrink-0">
            <span className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 group-hover:from-red-500 group-hover:to-rose-500 text-white font-bold text-[11px] sm:text-xs shadow-md shadow-red-600/30 transition flex items-center gap-1 sm:gap-1.5 cursor-pointer">
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

