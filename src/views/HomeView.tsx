import React, { useState, useEffect } from 'react';
import { ChannelListing, AccountType, PlatformType } from '../types';
import { api } from '../services/api';
import { ChannelCard } from '../components/ChannelCard';
import { ReviewSlider } from '../components/ReviewSlider';
import { BrandLogo } from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Award,
  Sparkles,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  X,
  Tag,
  ArrowRight,
  Flame,
  HelpCircle,
  Clock,
  Youtube,
  Lock,
  Layers,
  RotateCcw
} from 'lucide-react';
import {
  PlatformLogo,
  CategoryLogo,
  FacebookLogo,
  YouTubeLogo,
  TikTokLogo,
  InstagramLogo,
  TelegramLogo,
  XLogo,
  AllPlatformsLogo
} from '../components/CategoryIcons';

interface HomeViewProps {
  onSelectChannel: (channelId: string) => void;
  onNavigate: (view: string, params?: any) => void;
  onOpenLegal: (tab: 'tos' | 'privacy' | 'refund' | 'safety') => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  selectedPlatform?: string;
  onSelectPlatform?: (platform: string) => void;
}

const getPlatforms = (t: (bn: string, en: string) => string) => [
  { id: 'all', label: t('সকল প্ল্যাটফর্ম', 'All Platforms'), desc: t('সব প্ল্যাটফর্মের ভেরিফাইড একাউন্ট', 'Verified accounts across all platforms'), badgeColor: 'border-slate-300 bg-white text-slate-900' },
  { id: 'youtube', label: t('ইউটিউব চ্যানেল', 'YouTube Channels'), desc: t('মনিটাইজড ও ক্যাশ কাউ চ্যানেল', 'Monetized & cash cow channels'), badgeColor: 'border-red-300 bg-red-50 text-red-700' },
  { id: 'facebook', label: t('ফেসবুক পেজ', 'Facebook Pages'), desc: t('ইনস্ট্রিম বিজ্ঞাপন ও গ্রিন পেজ', 'In-Stream Ads & Green pages'), badgeColor: 'border-blue-300 bg-blue-50 text-blue-700' },
  { id: 'tiktok', label: t('টিকটক অ্যাকাউন্ট', 'TikTok Accounts'), desc: t('ক্রিয়েটর রিওয়ার্ডস ও শপ আইডি', 'Creator Rewards & Shop IDs'), badgeColor: 'border-cyan-300 bg-cyan-50 text-cyan-800' },
  { id: 'instagram', label: t('ইনস্টাগ্রাম পেজ', 'Instagram Pages'), desc: t('থিম পেজ ও ইনফ্লুয়েন্সার অ্যাকাউন্ট', 'Theme pages & influencers'), badgeColor: 'border-rose-300 bg-rose-50 text-rose-700' },
  { id: 'telegram', label: t('টেলিগ্রাম চ্যানেল', 'Telegram Channels'), desc: t('মেম্বার ও সিগন্যাল চ্যানেল', 'Signal & member channels'), badgeColor: 'border-sky-300 bg-sky-50 text-sky-700' },
  { id: 'twitter', label: t('এক্স / টুইটার', 'X / Twitter Handles'), desc: t('ব্লু ব্যাজ ও বিজ্ঞাপন আয় একাউন্ট', 'Blue badge verified handles'), badgeColor: 'border-slate-300 bg-slate-100 text-slate-800' },
];

const getAccountTypes = (t: (bn: string, en: string) => string) => [
  { id: 'all', label: t('সকল ক্যাটাগরি', 'All Categories') },
  { id: 'facebook_page', label: t('ফেসবুক পেজ ও গ্রুপ', 'Facebook Pages & Groups') },
  { id: 'tiktok_viral', label: t('টিকটক ভাইরাল অ্যাকাউন্ট', 'TikTok Viral Accounts') },
  { id: 'instagram_theme', label: t('ইনস্টাগ্রাম থিম পেজ', 'Instagram Theme Pages') },
  { id: 'cooking_lifestyle', label: t('রান্না ও রেসিপি', 'Cooking & Lifestyle') },
  { id: 'faceless_cash_cow', label: t('ফেসলেস ক্যাশ কাউ', 'Faceless Cash Cow') },
  { id: 'shorts_creator', label: t('ভাইরাল শর্টস চ্যানেল', 'Viral Shorts Creators') },
  { id: 'gaming_stream', label: t('গেমিং ও টেক চ্যানেল', 'Gaming & Tech Stream') },
  { id: 'vintage_aged', label: t('পুরানো ভিন্টেজ অ্যাকাউন্ট', 'Aged Vintage Accounts') },
  { id: 'high_cpm_finance', label: t('উচ্চ আয় ফিন্যান্স ও বিজনেস', 'High CPM Finance & Business') }
];

const getBudgetPresets = (t: (bn: string, en: string) => string) => [
  { id: 'all', label: t('সকল বাজেট', 'All Budgets'), bdt: t('যেকোনো দাম', 'Any Price') },
  { id: 'under_1k', label: t('১,০০০ ডলারের নিচে (কম বাজেট)', 'Under $1,000 (Starter)'), bdt: t('৳১,২২,০০০ এর নিচে', 'Under ৳122,000') },
  { id: '1k_3k', label: t('১,০০০ – ৩,০০০ ডলার (সাশ্রয়ী)', '$1,000 – $3,000 (Budget)'), bdt: t('৳১.২ লাখ – ৳৩.৬ লাখ', '৳1.2L – ৳3.6L') },
  { id: '3k_8k', label: t('৩,০০০ – ৮,০০০ ডলার (মিড রেঞ্জ)', '$3,000 – $8,000 (Mid-Range)'), bdt: t('৳৩.৬ লাখ – ৳৯.৭ লাখ', '৳3.6L – ৳9.7L') },
  { id: '8k_15k', label: t('৮,০০০ – ১৫,০০০ ডলার (উচ্চ আয়)', '$8,000 – $15,000 (High Revenue)'), bdt: t('৳৯.৭ লাখ – ৳১৮ লাখ', '৳9.7L – ৳18L') },
  { id: '15k_plus', label: t('১৫,০০০ ডলারের বেশি (সিলভার)', '$15,000+ (100K+ Silver)'), bdt: t('৳১৮ লাখের উপরে', 'Above ৳18 Lakh') }
];

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectChannel,
  onNavigate,
  onOpenLegal,
  searchTerm = '',
  onSearchChange,
  selectedPlatform: propSelectedPlatform,
  onSelectPlatform
}) => {
  const { showToast } = useAuth();
  const { currency, setCurrency, formatPrice, formatUsd, formatBdt, language, t, openCurrencyModal } = useCurrency();
  const [channels, setChannels] = useState<ChannelListing[]>([]);
  const [loading, setLoading] = useState(true);

  const PLATFORMS = getPlatforms(t);
  const ACCOUNT_TYPES = getAccountTypes(t);
  const BUDGET_PRESETS = getBudgetPresets(t);

  // Filters State
  const [selectedPlatform, setSelectedPlatform] = useState<string>(propSelectedPlatform || 'all');

  useEffect(() => {
    if (propSelectedPlatform !== undefined) {
      setSelectedPlatform(propSelectedPlatform);
    }
  }, [propSelectedPlatform]);
  const [selectedAccountType, setSelectedAccountType] = useState<string>('all');
  const [budgetPreset, setBudgetPreset] = useState<string>('all');
  const [monetizationFilter, setMonetizationFilter] = useState<'all' | 'monetized' | 'not_monetized'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [subRange, setSubRange] = useState<string>('all');
  const [sort, setSort] = useState<string>('newest');

  // Mobile layout state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showInlineSearch, setShowInlineSearch] = useState(false);

  // Custom Request Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [reqPlatform, setReqPlatform] = useState('all');
  const [reqBudget, setReqBudget] = useState('$1,000 - $3,000');
  const [reqType, setReqType] = useState('cooking_lifestyle');
  const [reqSubs, setReqSubs] = useState('10k - 50k');
  const [reqEmail, setReqEmail] = useState('');
  const [reqNote, setReqNote] = useState('');
  const [buyerFeeRate, setBuyerFeeRate] = useState<number>(2.5);

  useEffect(() => {
    api.getWebsiteSettings().then(res => {
      const st = res?.settings || {};
      const target = st.feeDeductionTarget || 'both';
      const total = Number(st.commissionRate) || 5;
      const bRate = target === 'seller' ? 0 : (st.buyerFeePercent !== undefined && st.buyerFeePercent !== null ? Number(st.buyerFeePercent) : (target === 'both' ? total / 2 : total));
      setBuyerFeeRate(bRate);
    }).catch(() => {});

    const handleSettingsUpdate = (e: any) => {
      const st = e?.detail || {};
      const target = st.feeDeductionTarget || 'both';
      const total = Number(st.commissionRate) || 5;
      const bRate = target === 'seller' ? 0 : (st.buyerFeePercent !== undefined && st.buyerFeePercent !== null ? Number(st.buyerFeePercent) : (target === 'both' ? total / 2 : total));
      setBuyerFeeRate(bRate);
    };
    window.addEventListener('website-settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('website-settings-updated', handleSettingsUpdate);
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const params: any = {
        status: 'active',
        sort
      };

      if (selectedPlatform !== 'all') params.platform = selectedPlatform;
      if (selectedAccountType !== 'all') params.accountType = selectedAccountType;
      if (searchTerm) params.search = searchTerm;
      if (monetizationFilter !== 'all') params.monetization = monetizationFilter;
      if (verifiedOnly) params.verifiedOnly = 'true';

      // Price preset logic
      if (budgetPreset === 'under_1k') {
        params.maxPrice = 1000;
      } else if (budgetPreset === '1k_3k') {
        params.minPrice = 1000;
        params.maxPrice = 3000;
      } else if (budgetPreset === '3k_8k') {
        params.minPrice = 3000;
        params.maxPrice = 8000;
      } else if (budgetPreset === '8k_15k') {
        params.minPrice = 8000;
        params.maxPrice = 15000;
      } else if (budgetPreset === '15k_plus') {
        params.minPrice = 15000;
      }

      // Manual price override if entered
      if (minPrice) params.minPrice = Number(minPrice);
      if (maxPrice) params.maxPrice = Number(maxPrice);

      // Subs range
      if (subRange === 'under_50k') params.maxSubs = 50000;
      if (subRange === '50k_100k') {
        params.minSubs = 50000;
        params.maxSubs = 100000;
      }
      if (subRange === '100k_plus') params.minSubs = 100000;

      const res = await api.getChannels(params);
      setChannels(res.channels || []);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [
    selectedPlatform,
    selectedAccountType,
    budgetPreset,
    monetizationFilter,
    verifiedOnly,
    minPrice,
    maxPrice,
    subRange,
    sort,
    searchTerm
  ]);

  const resetAllFilters = () => {
    onSearchChange?.('');
    setSelectedPlatform('all');
    setSelectedAccountType('all');
    setBudgetPreset('all');
    setMonetizationFilter('all');
    setVerifiedOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setSubRange('all');
  };

  const handleSubmitCustomRequest = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(t('আপনার অ্যাকাউন্ট রিকোয়েস্ট জমা হয়েছে! আমাদের টিম শীঘ্রই যোগাযোগ করবে।', 'Your custom account sourcing request has been submitted! Our team will contact you shortly.'), 'success');
    setRequestModalOpen(false);
    setReqNote('');
  };

  // Render the filter panel (used on desktop sidebar and mobile drawer)
  const renderSidebarFilters = () => (
    <div className="space-y-6 text-slate-700">
      {/* 1. Sidebar Header & Active Search Status */}
      <div className="pb-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-red-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">{t("ফিল্টার ও প্ল্যাটফর্ম", "Filters & Platforms")}</h3>
          </div>
          {(searchTerm || selectedPlatform !== 'all' || selectedAccountType !== 'all' || budgetPreset !== 'all' || monetizationFilter !== 'all' || verifiedOnly || minPrice || maxPrice || subRange !== 'all') && (
            <button
              onClick={resetAllFilters}
              className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t("সব রিসেট", "Reset All")}</span>
            </button>
          )}
        </div>

        {/* Top Search Active Indicator & Quick Search on Side */}
        <div className="mt-2.5 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={t("সার্চ (Facebook, YouTube, TikTok...)", "Search (Facebook, YouTube, TikTok...)")}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-red-500 transition shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
                title={t("মুছুন", "Clear")}
              >
                ✕
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="p-1.5 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between text-[11px]">
              <span className="text-red-800 truncate">
                {t("সক্রিয় সার্চ: ", "Active Search: ")}<strong className="text-slate-900">"{searchTerm}"</strong>
              </span>
              <button
                onClick={() => onSearchChange?.('')}
                className="text-red-600 hover:text-red-700 font-bold ml-1.5 shrink-0 cursor-pointer"
                title={t("সার্চ মুছুন", "Clear Search")}
              >
                ✕ {t("মুছুন", "Clear")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Platform Selector Filter on Side */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-2.5">
          {t("প্ল্যাটফর্ম (Platform)", "Platform")}
        </label>
        <div className="space-y-1">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(p.id)}
              className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                selectedPlatform === p.id
                  ? 'bg-red-50 text-red-700 border border-red-300 font-bold shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <PlatformLogo platform={p.id} className="w-4 h-4 shrink-0" />
                <span className="truncate">{p.label}</span>
              </span>
              {selectedPlatform === p.id && (
                <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Account Type Filter on Side */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-2.5">
          {t("ক্যাটাগরি টাইপ (Category)", "Category Type")}
        </label>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {ACCOUNT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedAccountType(type.id)}
              className={`w-full px-3 py-1.5 rounded-xl text-left text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                selectedAccountType === type.id
                  ? 'bg-red-50 text-red-700 border border-red-300 font-bold shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <CategoryLogo categoryId={type.id} className="w-4 h-4 shrink-0" />
                <span className="truncate">{type.label}</span>
              </span>
              {selectedAccountType === type.id && (
                <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Budget Range Presets on Side */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-2">
          {t("বাজেট রেঞ্জ (Budget Presets)", "Budget Range Presets")}
        </label>
        <div className="space-y-1.5">
          {BUDGET_PRESETS.map((b) => (
            <button
              key={b.id}
              onClick={() => setBudgetPreset(b.id)}
              className={`w-full px-3 py-2 rounded-xl text-left text-xs transition flex items-center justify-between cursor-pointer ${
                budgetPreset === b.id
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{b.label}</span>
              <span className="text-[10px] text-slate-500">{b.bdt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Custom Min & Max Price Input on Side */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-2">
          {t("কাস্টম বাজেট ($ USD)", "Custom Budget ($ USD)")}
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder={t("সর্বনিম্ন $", "Min $")}
            className="w-1/2 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder={t("সর্বোচ্চ $", "Max $")}
            className="w-1/2 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* 6. Subscribers Filter on Side */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-2">
          {t("সাবস্ক্রাইবার / ফলোয়ার", "Subscribers / Followers")}
        </label>
        <select
          value={subRange}
          onChange={(e) => setSubRange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-red-500"
        >
          <option value="all">{t("সকল সাবস্ক্রাইবার রেঞ্জ", "All Subscriber Ranges")}</option>
          <option value="under_50k">{t("< ৫০,০০০ সাবস্ক্রাইবার", "< 50,000 Subscribers")}</option>
          <option value="50k_100k">{t("৫০,০০০ – ১,০০,০০০", "50,000 – 100,000")}</option>
          <option value="100k_plus">{t("১,০০,০০০+ (সিলভার বাটন)", "100,000+ (Silver Award)")}</option>
        </select>
      </div>

      {/* 7. Monetization Filter on Side */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-2">
          {t("মনিটাইজেশন", "Monetization")}
        </label>
        <select
          value={monetizationFilter}
          onChange={(e) => setMonetizationFilter(e.target.value as 'all' | 'monetized' | 'not_monetized')}
          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-red-500"
        >
          <option value="all">{t("সকল মনিটাইজেশন", "All Monetization")}</option>
          <option value="monetized">{t("YPP মনিটাইজড (AdSense চালু)", "YPP Monetized (Active AdSense)")}</option>
          <option value="not_monetized">{t("নন-মনিটাইজড চ্যানেল", "Not Monetized / Clean")}</option>
        </select>
      </div>

      {/* 8. Verified Sellers Only Toggle on Side */}
      <div className="pt-2 border-t border-slate-200">
        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium select-none">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="w-4 h-4 rounded-sm bg-white border-slate-300 text-red-600 focus:ring-0 cursor-pointer"
          />
          <span>{t("শুধুমাত্র ভেরিফাইড সেলার", "Verified Sellers Only")}</span>
        </label>
      </div>

      {/* Charge / Fee Breakdown Notice on Side */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
        <span className="font-semibold text-slate-900 block">{t("প্ল্যাটফর্ম চার্জ পলিসি:", "Platform Escrow Policy:")}</span>
        <div className="flex items-center justify-between text-slate-600">
          <span>{t("চ্যানেল মূল্য", "Asset Price")}</span>
          <span>{t(`+ ${buyerFeeRate}% কাস্টডি চার্জ = মোট পরিশোধ`, `+ ${buyerFeeRate}% Escrow Custody = Total`)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Hero Section - Light white soft background */}
      <section className="relative overflow-hidden pt-10 pb-14 border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            {/* Brand Logo Presentation Badge */}
            <div className="flex items-center justify-center mb-3">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-md shadow-blue-900/5 hover:shadow-lg transition">
                <BrandLogo theme="light" size="lg" showSubtitle={true} />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t("মাল্টি-প্ল্যাটফর্ম এস্ক্রো • নিরাপদ অ্যাকাউন্ট ও চ্যানেল ট্রান্সফার", "Multi-Platform Escrow • Safe Social Asset Transfers")}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              {t("ফেসবুক, ইউটিউব, টিকটক সহ", "Verified Marketplace for")} <br />
              <span className="text-red-600">
                {t("সোশ্যাল মিডিয়া অ্যাকাউন্ট মার্কেটপ্লেস", "Social Media & Channel Assets")}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {t(
                "ফেসবুক ইনস্ট্রিম অ্যাড পেজ, ইউটিউব চ্যানেল, টিকটক ক্রিয়েটর রিওয়ার্ডস, ইনস্টাগ্রাম থিম পেজ, টেলিগ্রাম সিগন্যাল ও এক্স অ্যাকাউন্ট—১০০% নিরাপদ এস্ক্রো সিস্টেমে যাচাইকৃত অ্যাকাউন্ট কিনুন ও বিক্রি করুন।",
                "Acquire or sell Facebook in-stream pages, monetized YouTube channels, TikTok Creator Rewards accounts, Instagram theme hubs, and Telegram signal communities with 100% verified custody escrow."
              )}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => {
                  setSelectedPlatform('facebook');
                  window.scrollTo({ top: 550, behavior: 'smooth' });
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <FacebookLogo className="w-4 h-4" />
                <span>{t("ফেসবুক পেজ", "Facebook Pages")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setSelectedPlatform('youtube');
                  window.scrollTo({ top: 550, behavior: 'smooth' });
                }}
                className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <YouTubeLogo className="w-4 h-4" />
                <span>{t("ইউটিউব চ্যানেল", "YouTube Channels")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setSelectedPlatform('tiktok');
                  window.scrollTo({ top: 550, behavior: 'smooth' });
                }}
                className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <TikTokLogo className="w-4 h-4" />
                <span>{t("টিকটক অ্যাকাউন্ট", "TikTok Accounts")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setRequestModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>{t("কাস্টম অ্যাকাউন্ট রিকোয়েস্ট", "Custom Sourcing Request")}</span>
              </button>

              <button
                onClick={() => openCurrencyModal()}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                title={t("কারেন্সি ও ভাষা সেটিংস খুলুন", "Open Currency & Language Settings")}
              >
                <span>🌐 {t("কারেন্সি ও ভাষা: ", "Currency & Language: ") + (currency === 'USD' ? '$ USD' : '৳ BDT') + ' • ' + (language === 'BN' ? 'বাংলা' : 'EN')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Browse Section with SIDEBAR Layout */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Prominent Horizontal Platform Cards Selector */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{t("প্ল্যাটফর্ম নির্বাচন করুন", "Select Platform")}</span>
                  <span className="hidden sm:inline text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                    {t("ফেসবুক • ইউটিউব • টিকটক • ইনস্টাগ্রাম • টেলিগ্রাম • এক্স", "Facebook • YouTube • TikTok • Instagram • Telegram • X")}
                  </span>
                </span>
              </div>
              {selectedPlatform !== 'all' && (
                <button
                  onClick={() => setSelectedPlatform('all')}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <span>{t("সবগুলো দেখুন", "View All")}</span>
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {PLATFORMS.map((p) => {
                const isSelected = selectedPlatform === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    className={`relative p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
                      isSelected
                        ? `${p.badgeColor} ring-2 ring-red-500 shadow-md scale-[1.02]`
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <PlatformLogo platform={p.id} className="w-7 h-7 sm:w-8 sm:h-8" />
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs"></span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold truncate leading-tight text-slate-900">
                        {p.label}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {p.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Top Bar above Listings */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>{t("অ্যাকাউন্ট ও চ্যানেল মার্কেটপ্লেস", "Social Media Account Marketplace")}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                  {channels.length} {t("টি অ্যাকাউন্ট", " Accounts")}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedPlatform === 'all'
                  ? t('ফেসবুক, ইউটিউব, টিকটক, ইনস্টাগ্রাম, টেলিগ্রাম ও এক্স এর সকল ভেরিফাইড অ্যাকাউন্ট।', 'Verified accounts across Facebook, YouTube, TikTok, Instagram, Telegram, and X.')
                  : t(`${selectedPlatform.toUpperCase()} প্ল্যাটফর্মের নির্বাচিত অ্যাকাউন্টসমূহ।`, `Curated accounts on ${selectedPlatform.toUpperCase()}.`)}
              </p>
            </div>

            {/* Controls Row: Search -> Filter -> Account Type -> Sort -> Dollar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Search Icon & Expandable Box on One Side */}
              {!showInlineSearch && !searchTerm ? (
                <button
                  type="button"
                  onClick={() => setShowInlineSearch(true)}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition cursor-pointer shrink-0"
                  title={t("সার্চ করতে ক্লিক করুন (Search)", "Click to search")}
                >
                  <Search className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  <span>{t("সার্চ", "Search")}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-white border-2 border-red-500 rounded-xl px-2.5 py-1 shadow-sm">
                  <Search className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    placeholder={t("সার্চ: আন্টির রান্না, Cash cow...", "Search: Cooking, Cash Cow, Tech...")}
                    className="bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden w-36 xs:w-44 sm:w-56"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => onSearchChange?.('')}
                      className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
                      title={t("মুছুন", "Clear")}
                    >
                      ✕
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowInlineSearch(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs px-1 ml-0.5 cursor-pointer"
                    title={t("বন্ধ করুন", "Close")}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Filter Toggle */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50 transition cursor-pointer shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-red-600" />
                <span>{t("ফিল্টার", "Filters")}</span>
              </button>

              {/* Account Type Selector */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-xs transition">
                <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap hidden sm:inline">
                  {t("একাউন্ট টাইপ:", "Account Type:")}
                </span>
                <select
                  value={selectedAccountType}
                  onChange={(e) => setSelectedAccountType(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer max-w-[130px] xs:max-w-[160px] sm:max-w-[200px] truncate"
                >
                  {ACCOUNT_TYPES.map((type) => (
                    <option key={type.id} value={type.id} className="text-slate-800 py-1">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-xs">
                <span className="text-[11px] text-slate-500 hidden md:inline">{t("সর্ট:", "Sort:")}</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent text-xs text-slate-800 focus:outline-hidden cursor-pointer font-medium"
                >
                  <option value="newest">{t("নতুন চ্যানেল", "Newest Listings")}</option>
                  <option value="price_asc">{t("দাম: কম থেকে বেশি", "Price: Low to High")}</option>
                  <option value="price_desc">{t("দাম: বেশি থেকে কম", "Price: High to Low")}</option>
                  <option value="subs_desc">{t("সর্বোচ্চ সাবস্ক্রাইবার", "Highest Subscribers")}</option>
                  <option value="revenue_desc">{t("সর্বোচ্চ মাসিক আয়", "Highest Revenue")}</option>
                </select>
              </div>

              {/* Currency Toggle */}
              <button
                onClick={() => setCurrency(currency === 'USD' ? 'BDT' : 'USD')}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-amber-700 hover:bg-slate-50 transition shrink-0 cursor-pointer shadow-xs"
                title={t("কারেন্সি পরিবর্তন", "Switch Currency")}
              >
                {currency === 'USD' ? '$ USD' : '৳ BDT'}
              </button>
            </div>
          </div>

          {/* Quick Account Type Horizontal Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none text-xs">
            {ACCOUNT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedAccountType(type.id)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                  selectedAccountType === type.id
                    ? 'bg-red-600 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <CategoryLogo categoryId={type.id} className="w-4 h-4 shrink-0" />
                <span>{type.label}</span>
              </button>
            ))}
          </div>

          {/* TWO-COLUMN SIDEBAR LAYOUT */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Desktop Left Sidebar */}
            <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-24 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              {renderSidebarFilters()}
            </aside>

            {/* Mobile Filter Slide Drawer */}
            {mobileFilterOpen && (
              <div className="lg:hidden w-full mb-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-lg">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-red-600" />
                    <span>{t("সার্চ ও ফিল্টার অপশন", "Search & Filter Options")}</span>
                  </h3>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                {renderSidebarFilters()}
              </div>
            )}

            {/* Right Main Grid */}
            <main className="flex-1 w-full">
              {/* Active Filter Tags Bar */}
              {(selectedAccountType !== 'all' || budgetPreset !== 'all' || searchTerm) && (
                <div className="flex flex-wrap items-center gap-2 mb-4 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-medium">{t("ফিল্টার চালু আছে:", "Active Filters:")}</span>
                  {selectedAccountType !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                      {ACCOUNT_TYPES.find((a) => a.id === selectedAccountType)?.label}
                      <button onClick={() => setSelectedAccountType('all')} className="hover:text-red-900 cursor-pointer">✕</button>
                    </span>
                  )}
                  {budgetPreset !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {BUDGET_PRESETS.find((b) => b.id === budgetPreset)?.label}
                      <button onClick={() => setBudgetPreset('all')} className="hover:text-emerald-950 cursor-pointer">✕</button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                      <Search className="w-3 h-3 text-red-600" />
                      {t("সার্চ: ", "Search: ")}"{searchTerm}"
                      <button onClick={() => onSearchChange?.('')} className="hover:text-red-900 cursor-pointer" title={t("সার্চ মুছুন", "Clear search")}>✕</button>
                    </span>
                  )}
                  <button
                    onClick={resetAllFilters}
                    className="text-[11px] text-red-600 hover:text-red-800 underline ml-auto font-medium cursor-pointer"
                  >
                    {t("সব মুছুন", "Clear All")}
                  </button>
                </div>
              )}

              {/* Channels Grid (এক লাইনে দুইটা করে প্রোডাক্ট) */}
              {loading ? (
                <div className="py-24 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">{t("অ্যাকাউন্ট তালিকা লোড হচ্ছে...", "Loading accounts list...")}</p>
                </div>
              ) : channels.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
                  <Youtube className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-900">{t("কোনো অ্যাকাউন্ট পাওয়া যায়নি", "No accounts found")}</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {t(
                      "আপনার বর্তমান ফিল্টার বা বাজেটের ভেতর কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি। ফিল্টার রিসেট করুন অথবা কাস্টম অ্যাকাউন্ট রিকোয়েস্ট জমা দিন।",
                      "No accounts matched your current filters or budget. Reset filters or submit a custom account sourcing request."
                    )}
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={resetAllFilters}
                      className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      {t("ফিল্টার রিসেট করুন", "Reset Filters")}
                    </button>
                    <button
                      onClick={() => setRequestModalOpen(true)}
                      className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      {t("বাজেট অনুযায়ী রিকোয়েস্ট দিন", "Request Custom Sourcing")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                  {channels.map((channel) => (
                    <ChannelCard
                      key={channel.id}
                      channel={channel}
                      onSelect={onSelectChannel}
                      currency={currency}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Visual 4-Step How It Works Guide */}
      <section className="py-16 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">
              {t("নিরাপদ ট্রান্সফার পদ্ধতি", "Safe Transfer Methodology")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {t("কিভাবে নিরাপদ ওনারশিপ ট্রান্সফার সম্পন্ন হয়?", "How Safe Ownership Transfer Works")}
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              {t(
                "পাসওয়ার্ড কখনো শেয়ার করতে হয় না। ১০০% প্ল্যাটফর্ম পলিসি অনুযায়ী অফিসিয়াল ট্রান্সফার।",
                "No passwords ever shared. 100% compliant with platform policies via official invite."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 font-extrabold flex items-center justify-center text-sm border border-red-200">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {t("প্রুফ ও স্টুডিও প্রমাণ যাচাই", "Proof & Analytics Audit")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(
                  "২৮-দিনের ভিউজ, মাসিক আয়, কপিরাইট স্ট্যাটাস এবং সাবস্ক্রাইবার অ্যানালিটিক্সের হাই-রেজুলুশন স্ক্রিনশট দেখুন।",
                  "Inspect 28-day views, monthly revenue, copyright status, and subscriber analytics screenshots."
                )}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-sm border border-blue-200">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {t("সার্ভার-ভেরিফাইড কাস্টডি", "Server-Verified Escrow Custody")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(
                  "বায়ার চ্যানেলের টাকা কাস্টডিতে জমা করেন। সেলার নিশ্চিত হন যে টাকা প্ল্যাটফর্মে সংরক্ষিত আছে।",
                  "Buyer deposits funds into escrow custody. Seller confirms payment is securely locked."
                )}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center text-sm border border-amber-200">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {t("৭-দিনের গুগল/অ্যাকাউন্ট হ্যান্ডওভার", "7-Day Ownership Handover")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(
                  "সেলার বায়ারকে ম্যানেজার বানান। গুগলের বাধ্যতামূলক ৭ দিনের কুলডাউন পিরিয়ড নিরাপদে অতিবাহিত হয়।",
                  "Seller appoints buyer as Primary/Manager. The mandatory 7-day security cooldown elapses safely."
                )}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-sm border border-emerald-200">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {t("প্রাইমারি ওনারশিপ ও পেমেন্ট", "Primary Ownership & Fund Release")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(
                  "বায়ার প্রাইমারি ওনার হয়ে সেলারকে রিমুভ করেন এবং সন্তুষ্ট হলে সেলারের টাকা রিলিজ অনুমোদন করেন।",
                  "Buyer becomes sole Primary Owner, revokes seller access, and approves payout to seller."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* কেন ট্রাস্টেড রিভিউ অপশন ও অটো-স্লাইডার */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ReviewSlider
          heading={t("কেন আমরা ১০০% ট্রাস্টেড? ক্রেতাদের বাস্তব প্রমাণ ও রিভিউ", "Why We Are 100% Trusted: Real Buyer Reviews & Proof")}
          subheading={t("জিরো-রিস্ক এস্ক্রো, নো-পাসওয়ার্ড পলিসি ও অফিসিয়াল প্রাইমারি ওনারশিপ হস্তান্তরের শতভাগ বিশ্বস্ত প্ল্যাটফর্ম", "Zero-risk escrow, no-password policy, and 100% verified official primary ownership transfers")}
          onSelectChannel={onSelectChannel}
          availableChannels={channels.map((c) => ({ id: c.id, title: c.title }))}
        />
      </section>

      {/* Custom Buyer Budget Request Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in text-slate-800 space-y-5">
            <button
              onClick={() => setRequestModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>{t("নির্দিষ্ট বাজেট অনুযায়ী অ্যাকাউন্ট রিকোয়েস্ট করুন", "Request Custom Account by Budget")}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t(
                  "ফেসবুক, ইউটিউব, টিকটক, ইনস্টাগ্রাম, টেলিগ্রাম বা এক্স এর যে অ্যাকাউন্ট চান তা উল্লেখ করুন।",
                  "Specify your required account on Facebook, YouTube, TikTok, Instagram, Telegram, or X."
                )}
              </p>
            </div>

            <form onSubmit={handleSubmitCustomRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("কোন প্ল্যাটফর্মের অ্যাকাউন্ট লাগবে?", "Which Platform Account Do You Need?")}
                </label>
                <select
                  value={reqPlatform}
                  onChange={(e) => setReqPlatform(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                >
                  <option value="all">{t("যেকোনো প্ল্যাটফর্ম", "Any Platform")}</option>
                  <option value="facebook">🔵 {t("ফেসবুক পেজ বা গ্রুপ", "Facebook Page / Group")}</option>
                  <option value="youtube">🔴 {t("ইউটিউব চ্যানেল", "YouTube Channel")}</option>
                  <option value="tiktok">🎵 {t("টিকটক অ্যাকাউন্ট", "TikTok Account")}</option>
                  <option value="instagram">📸 {t("ইনস্টাগ্রাম পেজ", "Instagram Page")}</option>
                  <option value="telegram">✈️ {t("টেলিগ্রাম চ্যানেল", "Telegram Channel")}</option>
                  <option value="twitter">🐦 {t("এক্স বা টুইটার অ্যাকাউন্ট", "X / Twitter Account")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("আপনার বাজেট (কত টাকার ভেতরে কিনতে চান?)", "Your Target Budget")}
                </label>
                <select
                  value={reqBudget}
                  onChange={(e) => setReqBudget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                >
                  <option value="Under $1,000">{t("১,০০০ ডলারের নিচে (৳১,২২,০০০)", "Under $1,000 (৳122,000)")}</option>
                  <option value="$1,000 - $3,000">{t("$১,০০০ – $৩,০০০ (৳১.২ লাখ – ৳৩.৬ লাখ)", "$1,000 – $3,000 (৳120K – ৳360K)")}</option>
                  <option value="$3,000 - $8,000">{t("$৩,০০০ – $৮,০০০ (৳৩.৬ লাখ – ৳৯.৭ লাখ)", "$3,000 – $8,000 (৳360K – ৳970K)")}</option>
                  <option value="$8,000 - $15,000">{t("$৮,০০০ – $১৫,০০০ (৳৯.৭ লাখ – ৳১৮ লাখ)", "$8,000 – $15,000 (৳970K – ৳1.8M)")}</option>
                  <option value="$15,000+">{t("$১৫,০০০+ (৳১৮ লাখের উপরে)", "$15,000+ (Over ৳1.8M)")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("ক্যাটাগরি বা ধরন", "Category or Niche")}
                </label>
                <select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                >
                  <option value="facebook_page">{t("📄 ফেসবুক মনিটাইজড পেজ", "📄 Facebook Monetized Page (In-Stream Ads)")}</option>
                  <option value="tiktok_viral">{t("⚡ টিকটক ক্রিয়েটর রিওয়ার্ডস ও শপ", "⚡ TikTok Creator Rewards & Shop")}</option>
                  <option value="instagram_theme">{t("🎨 ইনস্টাগ্রাম থিম ও ইনফ্লুয়েন্সার পেজ", "🎨 Instagram Theme & Influencer Page")}</option>
                  <option value="cooking_lifestyle">{t("👩‍🍳 আন্টির রান্না ও কিচেন রেসিপি", "👩‍🍳 Cooking & Recipe Channel")}</option>
                  <option value="faceless_cash_cow">{t("🤖 ফেসলেস ক্যাশ কাউ চ্যানেল", "🤖 Faceless Cash Cow Channel")}</option>
                  <option value="shorts_creator">{t("⚡ ভাইরাল শর্টস বা রিলস একাউন্ট", "⚡ Viral Shorts / Reels Account")}</option>
                  <option value="gaming_stream">{t("🎮 গেমিং ও টেক চ্যানেল", "🎮 Gaming & Tech Channel")}</option>
                  <option value="vintage_aged">{t("🏛️ পুরানো ভিন্টেজ একাউন্ট (২০১৪-২০২০)", "🏛️ Vintage Aged Account (2014-2020)")}</option>
                  <option value="high_cpm_finance">{t("💰 হাই CPM ফিন্যান্স ও ক্রিপ্টো", "💰 High CPM Finance & Crypto")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("কাঙ্ক্ষিত সাবস্ক্রাইবার রেঞ্জ", "Desired Follower / Subscriber Range")}
                </label>
                <select
                  value={reqSubs}
                  onChange={(e) => setReqSubs(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                >
                  <option value="10k - 50k">{t("১০,০০০ – ৫০,০০০ সাবস্ক্রাইবার", "10,000 – 50,000 Followers/Subs")}</option>
                  <option value="50k - 100k">{t("৫০,০০০ – ১,০০,০০০ সাবস্ক্রাইবার", "50,000 – 100,000 Followers/Subs")}</option>
                  <option value="100k+">{t("১,০০,০০০+ সিলভার প্লে বাটন প্রাপ্ত", "100,000+ (Silver Play Button / Verified)")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("আপনার ইমেইল বা যোগাযোগের মাধ্যম *", "Your Email or Contact Details *")}
                </label>
                <input
                  type="email"
                  required
                  value={reqEmail}
                  onChange={(e) => setReqEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("বিশেষ কোনো চাহিদা থাকলে লিখুন (Optional)", "Special Requirements (Optional)")}
                </label>
                <textarea
                  rows={2}
                  value={reqNote}
                  onChange={(e) => setReqNote(e.target.value)}
                  placeholder={t(
                    "যেমন: বাংলা ভাষার অডিয়েন্স থাকতে হবে, অ্যাডসেন্স পিন ভেরিফাইড হতে হবে...",
                    "e.g., US audience, verified AdSense PIN, clean strike history..."
                  )}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  {t("বাতিল", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
                >
                  {t("রিকোয়েস্ট জমা দিন", "Submit Request")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
