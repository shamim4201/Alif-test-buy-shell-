import React, { useState, useEffect } from 'react';
import { ChannelListing } from '../types';
import { api } from '../services/api';
import { ChannelCard } from '../components/ChannelCard';
import { ReviewSlider } from '../components/ReviewSlider';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  ShieldCheck,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  Lock,
  ArrowRight,
  Flame,
  Clock,
  Youtube,
  DollarSign,
  Sparkles,
  HeartHandshake,
  Tag,
  HelpCircle,
  X,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw
} from 'lucide-react';

interface HomeViewProps {
  onSelectChannel: (id: string) => void;
  onNavigate: (view: string, params?: any) => void;
  onOpenLegal: (tab: 'tos' | 'privacy' | 'refund' | 'safety') => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

const ACCOUNT_TYPES: { id: string; label: string; icon: string; countHint?: string }[] = [
  { id: 'all', label: 'সকল ক্যাটাগরি (All Types)', icon: '🌟' },
  { id: 'cooking_lifestyle', label: 'আন্টির রান্না ও কিচেন (Auntie Cooking)', icon: '👩‍🍳' },
  { id: 'faceless_cash_cow', label: 'ফেসলেস ক্যাশ কাউ (Cash Cow)', icon: '🤖' },
  { id: 'shorts_creator', label: 'ভাইরাল শর্টস চ্যানেল (Shorts)', icon: '⚡' },
  { id: 'gaming_stream', label: 'গেমিং ও টেক চ্যানেল (Gaming)', icon: '🎮' },
  { id: 'vintage_aged', label: 'ভিন্টেজ পুরানো একাউন্ট (Vintage 2012-2018)', icon: '🏛️' },
  { id: 'high_cpm_finance', label: 'হাই CPM ফিন্যান্স ও বিজনেস', icon: '💰' }
];

const BUDGET_PRESETS: { id: string; label: string; bdt: string }[] = [
  { id: 'all', label: 'সকল বাজেট (All Budgets)', bdt: 'যেকোনো দাম' },
  { id: 'under_1k', label: 'Under $1,000 (কম বাজেট)', bdt: '৳১,২২,০০০ এর নিচে' },
  { id: '1k_3k', label: '$1,000 – $3,000 (সাশ্রয়ী)', bdt: '৳১.২ লাখ – ৳৩.৬ লাখ' },
  { id: '3k_8k', label: '$3,000 – $8,000 (মিড রেঞ্জ)', bdt: '৳৩.৬ লাখ – ৳৯.৭ লাখ' },
  { id: '8k_15k', label: '$8,000 – $15,000 (হাই রেভিনিউ)', bdt: '৳৯.৭ লাখ – ৳১৮ লাখ' },
  { id: '15k_plus', label: '$15,000+ (১০০K+ সিলভার)', bdt: '৳১৮ লাখের উপরে' }
];

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectChannel,
  onNavigate,
  onOpenLegal,
  searchTerm = '',
  onSearchChange
}) => {
  const { showToast } = useAuth();
  const [channels, setChannels] = useState<ChannelListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountType, setSelectedAccountType] = useState('all');
  const [budgetPreset, setBudgetPreset] = useState('all');
  const [currency, setCurrency] = useState<'USD' | 'BDT'>('USD');
  const [monetizationFilter, setMonetizationFilter] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [subRange, setSubRange] = useState<string>('all');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showInlineSearch, setShowInlineSearch] = useState(false);

  // Custom Buyer Request Modal
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [reqBudget, setReqBudget] = useState('$2,000 - $5,000');
  const [reqType, setReqType] = useState('cooking_lifestyle');
  const [reqSubs, setReqSubs] = useState('50k - 100k');
  const [reqNote, setReqNote] = useState('');
  const [reqEmail, setReqEmail] = useState('');

  const fetchChannels = async () => {
    try {
      setLoading(true);
      let minSubs: number | undefined;
      let maxSubs: number | undefined;

      if (subRange === 'under_50k') {
        maxSubs = 50000;
      } else if (subRange === '50k_100k') {
        minSubs = 50000;
        maxSubs = 100000;
      } else if (subRange === '100k_plus') {
        minSubs = 100000;
      }

      const res = await api.getChannels({
        search: searchTerm.trim() || undefined,
        accountType: selectedAccountType !== 'all' ? selectedAccountType : undefined,
        budgetPreset: budgetPreset !== 'all' ? budgetPreset : undefined,
        monetization: monetizationFilter !== 'all' ? monetizationFilter : undefined,
        verifiedOnly: verifiedOnly ? 'true' : undefined,
        sort,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minSubs,
        maxSubs
      });
      setChannels(res.channels);
    } catch (err) {
      console.error('Failed to load channels', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [searchTerm, selectedAccountType, budgetPreset, monetizationFilter, verifiedOnly, sort, subRange, minPrice, maxPrice]);

  const resetAllFilters = () => {
    onSearchChange?.('');
    setSelectedAccountType('all');
    setBudgetPreset('all');
    setMonetizationFilter('all');
    setVerifiedOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setSubRange('all');
  };

  const handleQuickAuntieFilter = () => {
    setSelectedAccountType('cooking_lifestyle');
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const handleSubmitCustomRequest = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('আপনার চ্যানেল রিকোয়েস্ট জমা হয়েছে! আমাদের টিম আপনার বাজেটের চ্যানেল খুঁজে ম্যাচ করিয়ে দেবে।', 'success');
    setRequestModalOpen(false);
    setReqNote('');
  };

  const featuredChannels = channels.filter((c) => c.isFeatured);

  // Render the filter panel (used on desktop sidebar and mobile drawer)
  // সার্চ বার এখান থেকে বের করে উপরে লোগোর পাশে রাখা হয়েছে
  const renderSidebarFilters = () => (
    <div className="space-y-6 text-slate-200">
      {/* 1. Sidebar Header & Active Search Status */}
      <div className="pb-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">ফিল্টার ও বাজেট</h3>
          </div>
          {(searchTerm || selectedAccountType !== 'all' || budgetPreset !== 'all' || monetizationFilter !== 'all' || verifiedOnly || minPrice || maxPrice || subRange !== 'all') && (
            <button
              onClick={resetAllFilters}
              className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>সব রিসেট</span>
            </button>
          )}
        </div>

        {/* Top Search Active Indicator & Quick Search on Side */}
        <div className="mt-2.5 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-red-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="সার্চ করুন (আন্টির রান্না, Cash cow...)"
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500 transition shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1"
                title="মুছুন"
              >
                ✕
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="p-1.5 rounded-lg bg-red-950/40 border border-red-800/50 flex items-center justify-between text-[11px]">
              <span className="text-slate-300 truncate">
                সক্রিয় সার্চ: <strong className="text-white">"{searchTerm}"</strong>
              </span>
              <button
                onClick={() => onSearchChange?.('')}
                className="text-red-400 hover:text-red-300 font-bold ml-1.5 shrink-0"
                title="সার্চ মুছুন"
              >
                ✕ মুছুন
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Account Type Filter on Side */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2.5">
          চ্যানেল টাইপ (Account Type)
        </label>
        <div className="space-y-1.5">
          {ACCOUNT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedAccountType(type.id)}
              className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition flex items-center justify-between ${
                selectedAccountType === type.id
                  ? 'bg-red-600/20 text-white border border-red-500/60 font-bold'
                  : 'bg-slate-950/70 border border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <span>{type.icon}</span>
                <span className="truncate">{type.label}</span>
              </span>
              {selectedAccountType === type.id && (
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Budget Range Presets on Side (কত টাকার ভেতরে) */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
          বাজেট রেঞ্জ (Budget Presets)
        </label>
        <div className="space-y-1.5">
          {BUDGET_PRESETS.map((b) => (
            <button
              key={b.id}
              onClick={() => setBudgetPreset(b.id)}
              className={`w-full px-3 py-2 rounded-xl text-left text-xs transition flex items-center justify-between ${
                budgetPreset === b.id
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/60 font-bold'
                  : 'bg-slate-950/70 border border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>{b.label}</span>
              <span className="text-[10px] text-slate-500">{b.bdt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Custom Min & Max Price Input on Side */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
          কাস্টম বাজেট ($ USD)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min $"
            className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-hidden"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max $"
            className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* 5. Subscribers Filter on Side */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
          সাবস্ক্রাইবার
        </label>
        <select
          value={subRange}
          onChange={(e) => setSubRange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500"
        >
          <option value="all">সকল সাবস্ক্রাইবার রেঞ্জ</option>
          <option value="under_50k">&lt; ৫০,০০০ সাবস্ক্রাইবার</option>
          <option value="50k_100k">৫০,০০০ – ১,০০,০০০</option>
          <option value="100k_plus">১,০০,০০০+ (সিলভার বাটন)</option>
        </select>
      </div>

      {/* 6. Monetization Filter on Side */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
          মনিটাইজেশন
        </label>
        <select
          value={monetizationFilter}
          onChange={(e) => setMonetizationFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500"
        >
          <option value="all">সকল মনিটাইজেশন</option>
          <option value="monetized">YPP মনিটাইজড (AdSense চালু)</option>
          <option value="not_monetized">নন-মনিটাইজড চ্যানেল</option>
        </select>
      </div>

      {/* 7. Verified Sellers Only Toggle on Side */}
      <div className="pt-2 border-t border-slate-800/80">
        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 font-medium select-none">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="w-4 h-4 rounded-sm bg-slate-950 border-slate-800 text-red-600 focus:ring-0 cursor-pointer"
          />
          <span>শুধুমাত্র ভেরিফাইড সেলার</span>
        </label>
      </div>

      {/* Charge / Fee Breakdown Notice on Side */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <span className="font-semibold text-slate-300 block">প্ল্যাটফর্ম চার্জ পলিসি:</span>
        <div className="flex items-center justify-between text-slate-400">
          <span>চ্যানেল মূল্য</span>
          <span>+ ৫% কাস্টডি চার্জ = মোট পরিশোধ</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 border-b border-slate-900 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(225,29,72,0.12),transparent_50%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/50 border border-red-800/60 text-xs font-semibold text-red-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero Password Policy • ১০০% নিরাপদ ব্র্যান্ড একাউন্ট ট্রান্সফার</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              আপনার বাজেটের ভেতরে <br />
              <span className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-400 bg-clip-text text-transparent">
                ইউটিউব চ্যানেল কিনুন ও বিক্রি করুন
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
              আন্টির ভিলেজ রান্না ও কিচেন চ্যানেল, ফেসলেস ক্যাশ কাউ, ভাইরাল শর্টস এবং পুরানো ভিন্টেজ অ্যাকাউন্ট—আপনার বাজেটের মধ্যে সাইডবার ফিল্টার করে খুঁজে নিন।
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                onClick={handleQuickAuntieFilter}
                className="px-4 py-2 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 border border-amber-700/60 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <span>👩‍🍳 আন্টির রান্না ও কিচেন চ্যানেল দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setRequestModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900/80 border border-blue-700/60 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>বাজেট অনুযায়ী চ্যানেল রিকোয়েস্ট</span>
              </button>

              <button
                onClick={() => setCurrency(currency === 'USD' ? 'BDT' : 'USD')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>কারেন্সি: {currency === 'USD' ? '$ USD' : '৳ BDT'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Highlight for Auntie's Cooking / Family Channels */}
      <section className="py-6 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl shrink-0">
              👩‍🍳
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>আন্টির রান্না ও কিচেন একাউন্ট (Auntie Cooking Channels)</span>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                  জনপ্রিয়
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                অরগানিক ফ্যামিলি রেসিপি, ভিলেজ কিচেন ও রান্নার চ্যানেল—রেগুলার অডিয়েন্স ও মনিটাইজড ইনকাম সহ প্রস্তুত।
              </p>
            </div>
          </div>

          <button
            onClick={handleQuickAuntieFilter}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition shrink-0 shadow-md shadow-amber-500/20"
          >
            কুকিং চ্যানেলগুলো দেখুন →
          </button>
        </div>
      </section>

      {/* Main Browse Section with SIDEBAR Layout (সার্চ ও ফিল্টার এখন পাশে থাকবে) */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar above Listings */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-850">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>চ্যানেল মার্কেটপ্লেস</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {channels.length} টি চ্যানেল
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                বামে থাকা সাইডবার থেকে আপনার পছন্দের বাজেট ও একাউন্ট টাইপ নির্বাচন করুন।
              </p>
            </div>

            {/* Controls Row: Search -> Filter -> Account Type -> Sort -> Dollar (সার্চ আইকন এক সাইটে দৃশ্যমান) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Search Icon & Expandable Box on One Side */}
              {!showInlineSearch && !searchTerm ? (
                <button
                  type="button"
                  onClick={() => setShowInlineSearch(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-red-600/30 ring-1 ring-red-400/50 transition cursor-pointer shrink-0"
                  title="সার্চ করতে ক্লিক করুন (Search)"
                >
                  <Search className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  <span>সার্চ</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-slate-900 border-2 border-red-500 rounded-xl px-2.5 py-1 shadow-lg shadow-red-950/50">
                  <Search className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    placeholder="সার্চ: আন্টির রান্না, Cash cow..."
                    className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-hidden w-36 xs:w-44 sm:w-56"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => onSearchChange?.('')}
                      className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
                      title="মুছুন"
                    >
                      ✕
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowInlineSearch(false)}
                    className="text-slate-400 hover:text-white text-xs px-1 ml-0.5 cursor-pointer"
                    title="বন্ধ করুন"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Filter Toggle */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5 hover:bg-slate-700 transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-red-400" />
                <span>ফিল্টার</span>
              </button>

              {/* Account Type Selector (ফিল্টারের সাইডে, ডলারের আগে) */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-xs transition">
                <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap hidden sm:inline">
                  একাউন্ট টাইপ:
                </span>
                <select
                  value={selectedAccountType}
                  onChange={(e) => setSelectedAccountType(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-hidden cursor-pointer max-w-[130px] xs:max-w-[160px] sm:max-w-[200px] truncate"
                >
                  {ACCOUNT_TYPES.map((type) => (
                    <option key={type.id} value={type.id} className="bg-slate-950 text-white py-1">
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
                <span className="text-[11px] text-slate-400 hidden md:inline">সর্ট:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="newest" className="bg-slate-950">নতুন চ্যানেল</option>
                  <option value="price_asc" className="bg-slate-950">দাম: কম থেকে বেশি</option>
                  <option value="price_desc" className="bg-slate-950">দাম: বেশি থেকে কম</option>
                  <option value="subs_desc" className="bg-slate-950">সর্বোচ্চ সাবস্ক্রাইবার</option>
                  <option value="revenue_desc" className="bg-slate-950">সর্বোচ্চ মাসিক আয়</option>
                </select>
              </div>

              {/* Currency Toggle (ডলার বাটন) */}
              <button
                onClick={() => setCurrency(currency === 'USD' ? 'BDT' : 'USD')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400 hover:text-amber-300 transition shrink-0"
                title="কারেন্সি পরিবর্তন"
              >
                {currency === 'USD' ? '$ USD' : '৳ BDT'}
              </button>
            </div>
          </div>

          {/* Quick Account Type Horizontal Pills (ফিল্টারের সাইডে দ্রুত ক্লিক করার জন্য) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none text-xs">
            {ACCOUNT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedAccountType(type.id)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                  selectedAccountType === type.id
                    ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                    : 'bg-slate-900/80 border border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>

          {/* TWO-COLUMN SIDEBAR LAYOUT (সার্চ ও ফিল্টার একপাশে, চ্যানেলগুলো ডানপাশে) */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Desktop Left Sidebar (সার্চ ও ফিল্টার এখন পাশে থাকবে) */}
            <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-24 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
              {renderSidebarFilters()}
            </aside>

            {/* Mobile Filter Slide Drawer */}
            {mobileFilterOpen && (
              <div className="lg:hidden w-full mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-red-400" />
                    <span>সার্চ ও ফিল্টার অপশন</span>
                  </h3>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                {renderSidebarFilters()}
              </div>
            )}

            {/* Right Main Grid (চ্যানেলের কার্ডসমূহ) */}
            <main className="flex-1 w-full">
              {/* Active Filter Tags Bar */}
              {(selectedAccountType !== 'all' || budgetPreset !== 'all' || searchTerm) && (
                <div className="flex flex-wrap items-center gap-2 mb-4 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400">ফিল্টার চালু আছে:</span>
                  {selectedAccountType !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-950/80 text-red-300 border border-red-800/50">
                      {ACCOUNT_TYPES.find((a) => a.id === selectedAccountType)?.label}
                      <button onClick={() => setSelectedAccountType('all')} className="hover:text-white">✕</button>
                    </span>
                  )}
                  {budgetPreset !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                      {BUDGET_PRESETS.find((b) => b.id === budgetPreset)?.label}
                      <button onClick={() => setBudgetPreset('all')} className="hover:text-white">✕</button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-950/80 text-red-300 border border-red-800/50">
                      <Search className="w-3 h-3 text-red-400" />
                      সার্চ: "{searchTerm}"
                      <button onClick={() => onSearchChange?.('')} className="hover:text-white" title="সার্চ মুছুন">✕</button>
                    </span>
                  )}
                  <button
                    onClick={resetAllFilters}
                    className="text-[11px] text-slate-400 hover:text-white underline ml-auto"
                  >
                    সব মুছুন
                  </button>
                </div>
              )}

              {/* Channels Grid (এক লাইনে দুইটা করে প্রোডাক্ট) */}
              {loading ? (
                <div className="py-24 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">চ্যানেল তালিকা লোড হচ্ছে...</p>
                </div>
              ) : channels.length === 0 ? (
                <div className="py-20 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8 space-y-4">
                  <Youtube className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-lg font-bold text-white">কোনো চ্যানেল পাওয়া যায়নি</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    আপনার বর্তমান ফিল্টার বা বাজেটের ভেতর কোনো চ্যানেল খুঁজে পাওয়া যায়নি। ফিল্টার রিসেট করুন অথবা কাস্টম চ্যানেল রিকোয়েস্ট জমা দিন।
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={resetAllFilters}
                      className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                    >
                      ফিল্টার রিসেট করুন
                    </button>
                    <button
                      onClick={() => setRequestModalOpen(true)}
                      className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                    >
                      বাজেট অনুযায়ী রিকোয়েস্ট দিন
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
      <section className="py-16 border-t border-slate-900 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">নিরাপদ ট্রান্সফার পদ্ধতি</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              কিভাবে ব্র্যান্ড একাউন্ট ট্রান্সফার সম্পন্ন হয়?
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              গুগল পাসওয়ার্ড কখনো শেয়ার করতে হয় না। ১০০% গুগল পলিসি অনুযায়ী অফিসিয়াল ট্রান্সফার।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 font-extrabold flex items-center justify-center text-sm border border-red-500/30">
                ১
              </div>
              <h3 className="text-base font-bold text-white">প্রুফ ও স্টুডিও প্রমাণ যাচাই</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                ২৮-দিনের ভিউজ, মাসিক আয়, কপিরাইট স্ট্যাটাস এবং সাবস্ক্রাইবার অ্যানালিটিক্সের হাই-রেজুলুশন স্ক্রিনশট দেখুন।
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 font-extrabold flex items-center justify-center text-sm border border-blue-500/30">
                ২
              </div>
              <h3 className="text-base font-bold text-white">সার্ভার-ভেরিফাইড কাস্টডি</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                বায়ার চ্যানেলের টাকা কাস্টডিতে জমা করেন। সেলার নিশ্চিত হন যে টাকা প্ল্যাটফর্মে সংরক্ষিত আছে।
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-amber-600/20 text-amber-400 font-extrabold flex items-center justify-center text-sm border border-amber-500/30">
                ৩
              </div>
              <h3 className="text-base font-bold text-white">৭-দিনের গুগল হ্যান্ডওভার</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                সেলার বায়ারকে ম্যানেজার বানান। গুগলের বাধ্যতামূলক ৭ দিনের কুলডাউন পিরিয়ড নিরাপদে অতিবাহিত হয়।
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 font-extrabold flex items-center justify-center text-sm border border-emerald-500/30">
                ৪
              </div>
              <h3 className="text-base font-bold text-white">প্রাইমারি ওনারশিপ ও পেমেন্ট</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                বায়ার প্রাইমারি ওনার হয়ে সেলারকে রিমুভ করেন এবং সন্তুষ্ট হলে সেলারের টাকা রিলিজ অনুমোদন করেন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* প্রাইমারি ওনারশিপ ও পেমেন্ট এটার নিচে এবং ফুটারের উপরে: রিভিউ অপশন ও স্লাইডার */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ReviewSlider
          heading="ভেরিফাইড একাউন্ট রিভিউ ও কাস্টমার রেটিং"
          subheading="প্রাইমারি ওনারশিপ হস্তান্তর ও পেমেন্ট সম্পন্ন হওয়া সম্মানিত ক্রেতাদের বাস্তব রিভিউ ও অভিজ্ঞতা"
          onSelectChannel={onSelectChannel}
          availableChannels={channels.map((c) => ({ id: c.id, title: c.title }))}
        />
      </section>

      {/* Custom Buyer Budget Request Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in text-slate-100 space-y-5">
            <button
              onClick={() => setRequestModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>নির্দিষ্ট বাজেট অনুযায়ী চ্যানেল রিকোয়েস্ট করুন</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                আপনার বাজেট ও পছন্দের ক্যাটাগরি (যেমন আন্টির রান্না, ক্যাশ কাউ, গেমিং) উল্লেখ করুন।
              </p>
            </div>

            <form onSubmit={handleSubmitCustomRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  আপনার বাজেট (কত টাকার ভেতরে কিনতে চান?)
                </label>
                <select
                  value={reqBudget}
                  onChange={(e) => setReqBudget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Under $1,000">১,০০০ ডলারের নিচে (Under $1,000 / ৳১,২২,০০০)</option>
                  <option value="$1,000 - $3,000">$১,০০০ – $৩,০০০ (৳১.২ লাখ – ৳৩.৬ লাখ)</option>
                  <option value="$3,000 - $8,000">$৩,০০০ – $৮,০০০ (৳৩.৬ লাখ – ৳৯.৭ লাখ)</option>
                  <option value="$8,000 - $15,000">$৮,০০০ – $১৫,০০০ (৳৯.৭ লাখ – ৳১৮ লাখ)</option>
                  <option value="$15,000+">$১৫,০০০+ (৳১৮ লাখের উপরে)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  কোন ধরণের চ্যানেল কিনতে চান? (Account Type)
                </label>
                <select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="cooking_lifestyle">👩‍🍳 আন্টির রান্না ও কিচেন রেসিপি (Cooking & Lifestyle)</option>
                  <option value="faceless_cash_cow">🤖 ফেসলেস ক্যাশ কাউ (Faceless Cash Cow)</option>
                  <option value="shorts_creator">⚡ ভাইরাল শর্টস চ্যানেল (Shorts Creator)</option>
                  <option value="gaming_stream">🎮 গেমিং ও টেক চ্যানেল (Gaming & Tech)</option>
                  <option value="vintage_aged">🏛️ ভিন্টেজ পুরানো একাউন্ট (Vintage 2012-2018)</option>
                  <option value="high_cpm_finance">💰 হাই CPM ফিন্যান্স ও বিজনেস (Finance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  কাঙ্ক্ষিত সাবস্ক্রাইবার রেঞ্জ
                </label>
                <select
                  value={reqSubs}
                  onChange={(e) => setReqSubs(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="10k - 50k">১০,০০০ – ৫০,০০০ সাবস্ক্রাইবার</option>
                  <option value="50k - 100k">৫০,০০০ – ১,০০,০০০ সাবস্ক্রাইবার</option>
                  <option value="100k+">১,০০,০০০+ সিলভার প্লে বাটন প্রাপ্ত</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  আপনার ইমেইল বা যোগাযোগের মাধ্যম *
                </label>
                <input
                  type="email"
                  required
                  value={reqEmail}
                  onChange={(e) => setReqEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  বিশেষ কোনো চাহিদা থাকলে লিখুন (Optional)
                </label>
                <textarea
                  rows={2}
                  value={reqNote}
                  onChange={(e) => setReqNote(e.target.value)}
                  placeholder="যেমন: বাংলা ভাষার অডিয়েন্স থাকতে হবে, অ্যাডসেন্স পিন ভেরিফাইড হতে হবে..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider"
                >
                  রিকোয়েস্ট জমা দিন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
