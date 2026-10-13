import React, { useState, useEffect } from 'react';
import { ChannelListing, Order, User, PlatformType } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  PlusCircle,
  List,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Edit,
  ExternalLink,
  Users,
  Film,
  Award
} from 'lucide-react';

interface SellerDashboardViewProps {
  initialTab?: 'listings' | 'create' | 'sales';
  onSelectOrder: (orderId: string) => void;
  onSelectChannel: (channelId: string) => void;
  onOpenLegal: (tab: 'tos' | 'privacy' | 'refund' | 'safety') => void;
}

const NICHES = [
  'Entertainment',
  'Gaming',
  'Finance',
  'Education',
  'Tech',
  'Lifestyle',
  'Music',
  'Health & Fitness'
];

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({
  initialTab = 'listings',
  onSelectOrder,
  onSelectChannel,
  onOpenLegal
}) => {
  const { user, showToast } = useAuth();
  const { currency, formatPrice, formatUsd, formatBdt, t } = useCurrency();
  const [activeTab, setActiveTab] = useState<'listings' | 'create' | 'sales'>(initialTab);
  const [myChannels, setMyChannels] = useState<ChannelListing[]>([]);
  const [mySales, setMySales] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Listing Form State
  const [platform, setPlatform] = useState<PlatformType>('facebook');
  const [title, setTitle] = useState('');
  const [handle, setHandle] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [niche, setNiche] = useState('Entertainment');
  const [accountType, setAccountType] = useState('facebook_page');
  const [primaryLanguage, setPrimaryLanguage] = useState('Bengali / Bangla & English');
  const [subscribers, setSubscribers] = useState('');
  const [monthlyViews, setMonthlyViews] = useState('');
  const [lifetimeViews, setLifetimeViews] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [videoCount, setVideoCount] = useState('');
  const [creationYear, setCreationYear] = useState('2023');
  const [monetizationStatus, setMonetizationStatus] = useState<'monetized' | 'not_monetized'>('monetized');
  const [strikeStatus, setStrikeStatus] = useState<'clean' | '1_strike'>('clean');
  const [hasSilverButton, setHasSilverButton] = useState(false);
  const [askingPrice, setAskingPrice] = useState('');
  const [minOfferPrice, setMinOfferPrice] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedScreenshots, setUploadedScreenshots] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadSellerData = async () => {
    try {
      setLoading(true);
      const [channelsRes, ordersRes] = await Promise.all([
        api.getChannels({ sellerId: user?.id, status: 'all' }),
        api.getOrders()
      ]);
      setMyChannels(channelsRes.channels || []);
      setMySales(ordersRes.orders.filter((o) => o.sellerId === user?.id) || []);
    } catch (err: any) {
      showToast(err.message || t('সেলার রেকর্ড লোড করতে ব্যর্থ হয়েছে', 'Failed to load seller records'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerData();
  }, [user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedScreenshots((prev) => [...prev, reader.result as string]);
      setUploadingFile(false);
      showToast(t('স্টুডিও অ্যানালিটিক্স প্রমাণ স্ক্রিনশট যুক্ত হয়েছে', 'Studio proof screenshot attached successfully'), 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !channelUrl || !askingPrice) {
      showToast(t('শিরোনাম, URL এবং বিক্রয় মূল্য আবশ্যক', 'Title, URL, and Asking Price are required'), 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createChannel({
        platform,
        title,
        handle: handle.startsWith('@') ? handle : `@${handle}`,
        channelUrl,
        niche,
        accountType: accountType as any,
        primaryLanguage,
        subscribers: Number(subscribers) || 0,
        monthlyViews: Number(monthlyViews) || 0,
        lifetimeViews: Number(lifetimeViews) || 0,
        monthlyRevenue: Number(monthlyRevenue) || 0,
        videoCount: Number(videoCount) || 10,
        creationYear: Number(creationYear) || 2023,
        monetizationStatus,
        strikeStatus,
        hasSilverButton,
        askingPrice: Number(askingPrice),
        minOfferPrice: minOfferPrice ? Number(minOfferPrice) : undefined,
        description,
        analyticsScreenshots: uploadedScreenshots
      });

      showToast(t('লিস্টিং সফলভাবে জমা হয়েছে!', 'Listing submitted! Verified channels are automatically approved.'), 'success');
      setActiveTab('listings');
      loadSellerData();

      // Reset form
      setTitle('');
      setHandle('');
      setChannelUrl('');
      setSubscribers('');
      setMonthlyRevenue('');
      setAskingPrice('');
      setDescription('');
    } catch (err: any) {
      showToast(err.message || t('লিস্টিং তৈরিতে ব্যর্থ হয়েছে', 'Failed to create channel listing'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteListing = async (channelId: string) => {
    if (!confirm(t('আপনি কি নিশ্চিত যে এই লিস্টিংটি ডিলিট করতে চান?', 'Are you sure you want to delete this listing?'))) return;
    try {
      await api.deleteChannel(channelId);
      showToast(t('লিস্টিং সফলভাবে মুছে ফেলা হয়েছে', 'Listing removed successfully'), 'info');
      loadSellerData();
    } catch (err: any) {
      showToast(err.message || t('লিস্টিং মুছতে ব্যর্থ হয়েছে', 'Failed to delete listing'), 'error');
    }
  };

  const handleTogglePause = async (ch: ChannelListing) => {
    const nextStatus = ch.status === 'active' ? 'paused' : 'active';
    try {
      await api.updateChannel(ch.id, { status: nextStatus });
      showToast(t(`লিস্টিং ${nextStatus === 'active' ? 'সক্রিয়' : 'পজ'} করা হয়েছে`, `Listing ${nextStatus === 'active' ? 'activated' : 'paused'}`), 'info');
      loadSellerData();
    } catch (err: any) {
      showToast(err.message || t('স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে', 'Failed to update status'), 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white py-8 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                {t('সেলার কন্ট্রোল সেন্টার', 'Seller Control Center')}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {t('সোশ্যাল অ্যাকাউন্ট ও অর্ডার পরিচালনা', 'Manage Social Accounts & Orders')}
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                {t('লাইভ ইনভেন্টরি পর্যবেক্ষণ করুন, স্টুডিও প্রমাণ আপলোড করুন এবং নিরাপদ হস্তান্তর প্রক্রিয়া সম্পন্ন করুন।', 'Monitor live inventory, upload proof, and advance safe account transfers.')}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('create')}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('নতুন অ্যাকাউন্ট বিক্রি করুন', 'List New Account')}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">{t('মোট লিস্টিং', 'Total Listings')}</span>
              <p className="text-xl font-black text-slate-900 mt-1">{myChannels.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">{t('চলমান ডিল / বিক্রি', 'Active Deals / Sales')}</span>
              <p className="text-xl font-black text-amber-700 mt-1">{mySales.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">{t('সেলার রেটিং', 'Seller Rating')}</span>
              <p className="text-xl font-black text-slate-900 mt-1">★ {user?.rating || 5.0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">{t('ভেরিফিকেশন স্ট্যাটাস', 'Verification Status')}</span>
              <p className="text-xs font-bold text-emerald-700 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {user?.isVerifiedSeller ? t('ভেরিফাইড ক্রিয়েটর সেলার', 'Verified Creator Seller') : t('স্ট্যান্ডার্ড সেলার', 'Standard Seller')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white sticky top-16 z-20 backdrop-blur-xs shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6">
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'listings'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>{t('আমার লিস্টিং ইনভেন্টরি', 'My Account Inventory')} ({myChannels.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'create'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('নতুন লিস্টিং তৈরি করুন', 'Create Listing')}</span>
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'sales'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>{t('বায়ার অনুসন্ধান ও বিক্রি', 'Buyer Inquiries & Sales')} ({mySales.length})</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Tab 1: My Listings */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {myChannels.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3 shadow-xs">
                <Film className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">{t('এখনো কোনো লিস্টিং যুক্ত করা হয়নি', 'No Account Listings Yet')}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {t('আপনার প্রথম সোশ্যাল মিডিয়া বা ইউটিউব অ্যাকাউন্ট লিস্টিং তৈরি করুন।', "You haven't listed any accounts or channels for sale yet. Create your first listing with verified analytics.")}
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
                >
                  {t('লিস্টিং তৈরি করুন', 'Create Listing')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md transition"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {channel.niche}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {channel.verificationStatus === 'approved' ? (
                            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              {t('অনুমোদিত', 'Approved')}
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              {t('রিভিউ অপেক্ষমাণ', 'Pending Review')}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              channel.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : channel.status === 'sold'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {channel.status}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">{channel.title}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{channel.handle}</p>

                      <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-200 mt-3 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">{t('ফলোয়ার', 'Followers')}</span>
                          <strong className="text-slate-900">{channel.subscribers.toLocaleString()}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">{t('মাসিক আয়', 'Revenue')}</span>
                          <strong className="text-emerald-600">${channel.monthlyRevenue.toLocaleString()}/mo</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">{t('মূল্য', 'Price')}</span>
                          <strong className="text-slate-900">${channel.askingPrice.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onSelectChannel(channel.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer border border-slate-200"
                        >
                          {t('পাবলিক পেজ দেখুন', 'View Public Page')}
                        </button>
                        <button
                          onClick={() => handleTogglePause(channel)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs border border-slate-300 cursor-pointer"
                        >
                          {channel.status === 'active' ? t('পজ করুন', 'Pause') : t('সক্রিয় করুন', 'Activate')}
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteListing(channel.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
                        title={t('লিস্টিং মুছুন', 'Delete listing')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Create Listing Wizard */}
        {activeTab === 'create' && (
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {t('নতুন অ্যাকাউন্ট / চ্যানেল লিস্টিং তৈরি করুন', 'Create New Account / Channel Listing')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t('সঠিক তথ্য প্রদান করুন। দ্রুত অনুমোদনের জন্য যাচাইযোগ্য অ্যানালিটিক্স স্ক্রিনশট সংযুক্ত করুন।', 'Provide accurate information. Attach verifiable analytics screenshots to expedite approval.')}
              </p>
            </div>

            {/* Anti-Password Safety Directive */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-800">
                <strong className="text-emerald-900">{t('হস্তান্তর শর্ত ও নিরাপত্তা:', 'Handover Requirement:')}</strong>
                <p className="mt-0.5 leading-relaxed">
                  {t(
                    'বায়ারের অ্যাকাউন্টে অফিসিয়াল অ্যাডমিন/ম্যানেজার ইনভাইটেশন পাঠিয়ে হস্তান্তর সম্পন্ন হবে। পাসওয়ার্ড কখনোই কারো সাথে শেয়ার করবেন না।',
                    'Transfer will occur by adding the buyer account as an Admin/Manager, and then reassigning Primary Ownership after verification. Never share passwords with anyone.'
                  )}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-5">
              {/* Platform Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  {t('প্ল্যাটফর্ম নির্বাচন করুন (Select Platform) *', 'Select Platform *')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {[
                    { id: 'facebook', label: '🔵 Facebook', color: 'border-blue-300 bg-blue-50 text-blue-700' },
                    { id: 'youtube', label: '🔴 YouTube', color: 'border-red-300 bg-red-50 text-red-700' },
                    { id: 'tiktok', label: '🎵 TikTok', color: 'border-cyan-300 bg-cyan-50 text-cyan-800' },
                    { id: 'instagram', label: '📸 Instagram', color: 'border-rose-300 bg-rose-50 text-rose-700' },
                    { id: 'telegram', label: '✈️ Telegram', color: 'border-sky-300 bg-sky-50 text-sky-700' },
                    { id: 'twitter', label: '🐦 X / Twitter', color: 'border-slate-300 bg-slate-100 text-slate-800' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPlatform(p.id as PlatformType);
                        if (p.id === 'facebook') setAccountType('facebook_page');
                        else if (p.id === 'tiktok') setAccountType('tiktok_viral');
                        else if (p.id === 'instagram') setAccountType('instagram_theme');
                        else if (p.id === 'telegram') setAccountType('telegram_signal');
                        else if (p.id === 'twitter') setAccountType('twitter_crypto');
                        else setAccountType('cooking_lifestyle');
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                        platform === p.id
                          ? `${p.color} ring-2 ring-red-500 shadow-sm`
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('অ্যাকাউন্ট বা পেজের নাম *', 'Channel / Page Display Title *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      platform === 'facebook'
                        ? 'e.g. BD Viral Media (Facebook Page)'
                        : platform === 'tiktok'
                        ? 'e.g. TrendVibe Comedy (TikTok)'
                        : 'e.g. Cooking with Auntie'
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('হ্যান্ডেল / ইউজারনেম (@handle) *', 'Handle / Username (@handle) *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@YourPageOrChannel"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('অফিসিয়াল লিঙ্ক / URL *', 'Official URL / Profile Link *')}
                  </label>
                  <input
                    type="url"
                    required
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('ক্যাটাগরি / নিশ *', 'Primary Niche / Category *')}
                  </label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  >
                    {NICHES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('একাউন্ট টাইপ (Account Type) *', 'Account Type *')}
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  >
                    <option value="facebook_page">{t('📄 ফেসবুক মনিটাইজড পেজ (In-Stream Ads)', '📄 Facebook In-Stream Ads Monetized')}</option>
                    <option value="tiktok_viral">{t('⚡ টিকটক ক্রিয়েটর রিওয়ার্ডস ও শপ (TikTok)', '⚡ TikTok Creator Rewards & Shop')}</option>
                    <option value="instagram_theme">{t('🎨 ইনস্টাগ্রাম থিম পেজ (Instagram)', '🎨 Instagram Theme Page')}</option>
                    <option value="cooking_lifestyle">{t('👩‍🍳 আন্টির রান্না ও ফুড রেসিপি (Cooking & Lifestyle)', '👩‍🍳 Cooking & Lifestyle')}</option>
                    <option value="faceless_cash_cow">{t('🤖 ফেসলেস ক্যাশ কাউ (Faceless Cash Cow)', '🤖 Faceless Cash Cow')}</option>
                    <option value="shorts_creator">{t('⚡ ভাইরাল শর্টস চ্যানেল (Shorts Creator)', '⚡ Viral Shorts Creator')}</option>
                    <option value="gaming_stream">{t('🎮 গেমিং ও টেক চ্যানেল (Gaming & Tech)', '🎮 Gaming & Tech Channel')}</option>
                    <option value="vintage_aged">{t('🏛️ ভিন্টেজ পুরানো একাউন্ট (Vintage 2012-2018)', '🏛️ Vintage Aged Account (2012-2018)')}</option>
                    <option value="high_cpm_finance">{t('💰 হাই CPM ফিন্যান্স ও বিজনেস (Finance)', '💰 High CPM Finance & Business')}</option>
                    <option value="vlog_personal">{t('📹 পার্সোনাল ভ্লগ ও লাইফস্টাইল (Personal Vlog)', '📹 Personal Vlog & Lifestyle')}</option>
                    <option value="education_tech">{t('📚 এডুকেশন ও সফটওয়্যার টিউটোরিয়াল', '📚 Education & Software Tutorials')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('প্রাথমিক ভাষা (Primary Language)', 'Primary Language')}
                  </label>
                  <input
                    type="text"
                    value={primaryLanguage}
                    onChange={(e) => setPrimaryLanguage(e.target.value)}
                    placeholder="e.g. Bengali / Bangla & English"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Numerical Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('ফলোয়ার / সাবস *', 'Followers / Subs *')}
                  </label>
                  <input
                    type="number"
                    required
                    value={subscribers}
                    onChange={(e) => setSubscribers(e.target.value)}
                    placeholder="145000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('মাসিক রিচ / ভিউজ', 'Monthly Reach / Views')}
                  </label>
                  <input
                    type="number"
                    value={monthlyViews}
                    onChange={(e) => setMonthlyViews(e.target.value)}
                    placeholder="850000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('মাসিক আয় ($)', 'Monthly Revenue ($)')}
                  </label>
                  <input
                    type="number"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(e.target.value)}
                    placeholder="2400"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('ভিডিও / পোস্ট সংখ্যা', 'Post / Video Count')}
                  </label>
                  <input
                    type="number"
                    value={videoCount}
                    onChange={(e) => setVideoCount(e.target.value)}
                    placeholder="120"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Status checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('মনিটাইজেশন স্ট্যাটাস', 'Monetization')}</label>
                  <select
                    value={monetizationStatus}
                    onChange={(e: any) => setMonetizationStatus(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                  >
                    <option value="monetized">{t('মনিটাইজড সক্রিয়', 'Monetized Active')}</option>
                    <option value="not_monetized">{t('মনিটাইজড নয়', 'Not Monetized')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('কপিরাইট অবস্থা', 'Strikes Standing')}</label>
                  <select
                    value={strikeStatus}
                    onChange={(e: any) => setStrikeStatus(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900"
                  >
                    <option value="clean">{t('০ স্ট্রাইক (ক্লিন হিস্ট্রি)', '0 Strikes (Clean History)')}</option>
                    <option value="1_strike">{t('১টি ওয়ার্নিং / স্ট্রাইক', '1 Warning / Strike')}</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={hasSilverButton}
                      onChange={(e) => setHasSilverButton(e.target.checked)}
                      className="w-4 h-4 rounded-sm bg-white border-slate-300 text-red-600 cursor-pointer"
                    />
                    <span>{t('১০০k+ সিলভার প্লে বাটন বা ব্যাজ আছে', 'Has 100k+ Award / Badge')}</span>
                  </label>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('বিক্রয় মূল্য ($ USD) *', 'Asking Price ($ USD) *')}
                  </label>
                  <input
                    type="number"
                    required
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value)}
                    placeholder="14900"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('সর্বনিম্ন প্রস্তাব গ্রহণ ($ USD)', 'Minimum Offer Accepted ($ USD)')}
                  </label>
                  <input
                    type="number"
                    value={minOfferPrice}
                    onChange={(e) => setMinOfferPrice(e.target.value)}
                    placeholder="13000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('লিস্টিংয়ের বিবরণ ও কনটেন্ট স্ট্র্যাটেজি', 'Listing Description & Operations')}
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t(
                    'কনটেন্ট তৈরি, অডিয়েন্স রিটেনশন এবং আয়ের ইতিহাস সম্পর্কে লিখুন...',
                    'Describe content production, niche audience retention, and monetization history...'
                  )}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* File Upload for Proof */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  {t('অ্যানালিটিক্স প্রমাণ স্ক্রিনশট', 'Analytics Proof Screenshots')}
                </label>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-2 transition shadow-xs">
                      <Upload className="w-4 h-4 text-red-600" />
                      <span>{uploadingFile ? t('আপলোড হচ্ছে...', 'Uploading...') : t('স্ক্রিনশট আপলোড করুন (PNG, JPG)', 'Upload Screenshot (PNG, JPG)')}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {t('ক্রিয়েটর স্টুডিওর রেভিনিউ, ২৮ দিনের ভিউজ এবং কোয়ালিটি পেজের স্ক্রিনশট দিন', 'Upload Creator Studio screenshots: Revenue, 28-day Views, Quality page')}
                    </span>
                  </div>

                  {uploadedScreenshots.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                      {uploadedScreenshots.map((url, i) => (
                        <div key={i} className="relative rounded-xl overflow-hidden border border-slate-300 aspect-video bg-black">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setUploadedScreenshots(uploadedScreenshots.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white text-[10px] cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('listings')}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? t('সাবমিট হচ্ছে...', 'Submitting...') : t('লিস্টিং প্রকাশ করুন', 'Publish Account Listing')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Sales & Orders */}
        {activeTab === 'sales' && (
          <div className="space-y-4">
            {mySales.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3 shadow-xs">
                <DollarSign className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">{t('এখনো কোনো সেলস অর্ডার নেই', 'No Sales Orders Yet')}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {t('কোনো বায়ার আপনার লিস্টিং ক্রয় শুরু করলে এখানে অর্ডার দেখতে পাবেন।', 'When a buyer initiates a purchase on one of your listings, the tracked order will appear here.')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {mySales.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => onSelectOrder(order.id)}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-500">{order.id}</span>
                        <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{order.channelTitle}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t('বায়ার: ', 'Buyer: ')}<strong>{order.buyerName}</strong> ({order.buyerEmail})
                        {order.buyerGoogleEmail && ` • ${t('ইনভাইট তথ্য: ', 'Invite detail: ')}${order.buyerGoogleEmail}`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">{t('মোট পেআউট', 'Total Payout')}</span>
                        <span className="text-base font-extrabold text-slate-900">
                          ${order.amount.toLocaleString()} USD
                        </span>
                      </div>
                      <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 cursor-pointer">
                        {t('হ্যান্ডওভার পরিচালনা →', 'Manage Transfer →')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
