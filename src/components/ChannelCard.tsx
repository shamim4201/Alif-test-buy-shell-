import React from 'react';
import { ChannelListing } from '../types';
import { useCurrency } from '../context/CurrencyContext';
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

import {
  getLocalizedChannelTitle,
  getLocalizedChannelDescription,
  getLocalizedChannelLanguage,
  getLocalizedChannelNiche
} from '../translations/translations';

interface ChannelCardProps {
  channel: ChannelListing;
  onSelect: (channelId: string) => void;
  currency?: 'USD' | 'BDT';
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onSelect }) => {
  const { currency, formatPrice, formatUsd, formatBdt, language, t } = useCurrency();

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-md">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            🔵 {t('ফেসবুক', 'Facebook')}
          </span>
        );
      case 'tiktok':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-cyan-300 border border-cyan-400/80 shadow-md">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            🎵 {t('টিকটক', 'TikTok')}
          </span>
        );
      case 'instagram':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            📸 {t('ইনস্টাগ্রাম', 'Instagram')}
          </span>
        );
      case 'telegram':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-600 text-white shadow-md">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            ✈️ {t('টেলিগ্রাম', 'Telegram')}
          </span>
        );
      case 'twitter':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-900 text-white shadow-md">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            🐦 {t('এক্স / টুইটার', 'X / Twitter')}
          </span>
        );
      case 'youtube':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-md">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            🔴 {t('ইউটিউব', 'YouTube')}
          </span>
        );
    }
  };

  const getAccountTypeBadge = () => {
    switch (channel.accountType) {
      case 'facebook_page':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            {t('📄 ফেসবুক পেজ', '📄 Facebook Page')}
          </span>
        );
      case 'tiktok_viral':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
            {t('⚡ ক্রিয়েটর রিওয়ার্ডস', '⚡ Creator Rewards')}
          </span>
        );
      case 'instagram_theme':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            {t('🎨 থিম পেজ', '🎨 Theme Page')}
          </span>
        );
      case 'telegram_signal':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
            {t('📡 সিগন্যাল / মেম্বার', '📡 Signal / Members')}
          </span>
        );
      case 'twitter_crypto':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
            {t('💎 ব্লু ভেরিফাইড', '💎 Blue Verified')}
          </span>
        );
      case 'cooking_lifestyle':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            {t('👩‍🍳 আন্টির রান্না ও কিচেন', '👩‍🍳 Cooking & Food')}
          </span>
        );
      case 'faceless_cash_cow':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            {t('🤖 ফেসলেস ক্যাশ কাউ', '🤖 Faceless Cash Cow')}
          </span>
        );
      case 'shorts_creator':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
            {t('⚡ ভাইরাল শর্টস', '⚡ Viral Shorts')}
          </span>
        );
      case 'gaming_stream':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
            {t('🎮 গেমিং চ্যানেল', '🎮 Gaming Channel')}
          </span>
        );
      case 'vintage_aged':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            {t('🏛️ ভিন্টেজ ', '🏛️ Vintage ') + channel.creationYear}
          </span>
        );
      case 'high_cpm_finance':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            {t('💰 হাই CPM ফিন্যান্স', '💰 High CPM Finance')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 border border-slate-300 text-slate-700">
            {getLocalizedChannelNiche(channel.niche, language)}
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
    if (p === 'telegram') return t('মেম্বার', 'Members');
    if (p === 'facebook' || p === 'tiktok' || p === 'instagram' || p === 'twitter') return t('ফলোয়ার', 'Followers');
    return t('সাবস্ক্রাইবার', 'Subscribers');
  };

  const getBorderHoverClass = () => {
    const p = channel.platform || 'youtube';
    if (p === 'facebook') return 'hover:border-blue-500 hover:shadow-blue-200';
    if (p === 'tiktok') return 'hover:border-cyan-500 hover:shadow-cyan-200';
    if (p === 'instagram') return 'hover:border-pink-500 hover:shadow-pink-200';
    if (p === 'telegram') return 'hover:border-sky-500 hover:shadow-sky-200';
    if (p === 'twitter') return 'hover:border-slate-500 hover:shadow-slate-200';
    return 'hover:border-red-500 hover:shadow-red-200';
  };

  return (
    <div
      onClick={() => onSelect(channel.id)}
      className={`group relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col justify-between cursor-pointer ${getBorderHoverClass()}`}
    >
      {/* 1. প্রোডাক্টের ছবি উপরে (Account/Channel Image on Top) */}
      <div className="relative aspect-[16/10] sm:aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={getChannelImage()}
          alt={getLocalizedChannelTitle(channel, language)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162616091-2dc0609f06df?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Gradient shadow overlay for badge readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-black/30 pointer-events-none" />

        {/* Top-Left: Platform Badge & Account Type */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 flex flex-wrap items-center gap-1.5 max-w-[75%]">
          {getPlatformBadge()}
          {getAccountTypeBadge()}
        </div>

        {/* Top-Right: Verified & Badges */}
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 flex items-center gap-1 sm:gap-1.5">
          {channel.hasSilverButton && (
            <span
              className="p-1 sm:px-1.5 rounded-lg bg-slate-900/90 text-slate-100 border border-slate-700 text-[9px] sm:text-[10px] flex items-center gap-1 font-bold shadow-md backdrop-blur-xs"
              title={t("১০০K সিলভার ক্রিয়েটর অ্যাওয়ার্ড", "Silver Creator Award (100k+ subscribers)")}
            >
              <Award className="w-3 h-3 text-amber-300" />
              <span className="hidden sm:inline">{t('১০০K অ্যাওয়ার্ড', '100K Award')}</span>
            </span>
          )}
          {channel.pageQuality === 'green' && (
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-white bg-emerald-600 px-1.5 sm:px-2 py-0.5 rounded-lg shadow-md">
              <ShieldCheck className="w-3 h-3 text-white" />
              <span>{t('গ্রিন কোয়ালিটি', 'Green Quality')}</span>
            </span>
          )}
          {channel.verificationStatus === 'approved' && !channel.pageQuality && (
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-white bg-emerald-600 px-1.5 sm:px-2 py-0.5 rounded-lg shadow-md">
              <ShieldCheck className="w-3 h-3 text-white" />
              <span>{t('ভেরিফাইড', 'Verified')}</span>
            </span>
          )}
        </div>

        {/* Bottom Floating Stats on Image */}
        <div className="absolute bottom-1.5 left-2 right-2 sm:bottom-2 sm:left-2.5 sm:right-2.5 z-10 flex items-center justify-between text-[10px] sm:text-xs font-semibold text-white">
          {/* Monetization Status or Tool */}
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-xs border border-slate-700/70 text-[10px] sm:text-[11px] text-emerald-400">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">
              {channel.monetizationTool || (channel.monetizationStatus === 'monetized' ? t('মনিটাইজড', 'Monetized') : t('ক্লিন অ্যাকাউন্ট', 'Clean'))}
            </span>
          </span>

          {/* Subscribers / Followers Pill */}
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-xs border border-slate-700/70 text-[10px] sm:text-[11px] text-white">
            <Users className="w-3 h-3 text-sky-400 shrink-0" />
            <strong className="text-white">{formatNumber(channel.subscribers)}</strong>
            <span className="text-slate-300 text-[10px] hidden sm:inline">{getFollowerLabel()}</span>
          </span>
        </div>
      </div>

      {/* 2. ছবির নিচে টাইটেল ও বিবরণ (Channel / Account Title Below Image) */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Title */}
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mb-1">
            {getLocalizedChannelTitle(channel, language)}
          </h3>

          {/* Handle & Language */}
          <p className="text-[11px] sm:text-xs text-slate-500 font-mono mb-2.5 truncate">
            {channel.handle} {channel.primaryLanguage ? `• ${getLocalizedChannelLanguage(channel.primaryLanguage, language)}` : ''}
          </p>

          {/* Mini Core Metrics Grid - Light soft background */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 py-2 px-2 sm:px-2.5 rounded-xl bg-slate-50 border border-slate-200 mb-2.5 text-center">
            <div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">{getFollowerLabel()}</span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-900">
                {formatNumber(channel.subscribers)}
              </span>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">{t('মাসিক ভিউ/রিচ', 'Monthly Reach')}</span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-900">
                {formatNumber(channel.monthlyViews)}
              </span>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate font-medium">{t('মাসিক আয়', 'Monthly Revenue')}</span>
              <span className="text-[11px] sm:text-xs font-bold text-emerald-600">
                {currency === 'USD' ? `$${channel.monthlyRevenue.toLocaleString()}` : `৳${Math.round(channel.monthlyRevenue * 122).toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {getLocalizedChannelDescription(channel, language) || t('প্রাইমারি ওনারশিপ হস্তান্তরের জন্য প্রস্তুত যাচাইকৃত অ্যাকাউন্ট।', 'Verified social account ready for primary ownership transfer.')}
          </p>
        </div>

        {/* 3. টাইটেলের নিচে প্রাইস (Price Section Below Title) */}
        <div className="pt-2.5 sm:pt-3 border-t border-slate-200 flex items-center justify-between gap-1.5 sm:gap-2 mt-auto">
          <div>
            <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              {t('মূল্য (', 'Price (')}{currency})
            </span>
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-base sm:text-xl md:text-2xl font-black text-slate-900 group-hover:text-red-600 transition-colors">
                {formatPrice(channel.askingPrice)}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-600 font-semibold bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                {currency === 'USD' ? formatBdt(channel.askingPrice) : formatUsd(channel.askingPrice)}
              </span>
            </div>
          </div>

          {/* Order / View Action Button */}
          <div className="text-right shrink-0">
            <span className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-red-600 group-hover:bg-red-700 text-white font-bold text-[11px] sm:text-xs shadow-sm transition flex items-center gap-1 sm:gap-1.5 cursor-pointer">
              <span>{t('কিনুন / বিস্তারিত', 'Buy / Details')}</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
