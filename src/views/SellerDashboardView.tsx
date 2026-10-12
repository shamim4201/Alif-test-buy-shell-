import React, { useState, useEffect } from 'react';
import { ChannelListing, Order, User } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  'Gaming',
  'Finance',
  'Education',
  'Tech',
  'Lifestyle',
  'Music',
  'Health & Fitness',
  'Entertainment'
];

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({
  initialTab = 'listings',
  onSelectOrder,
  onSelectChannel,
  onOpenLegal
}) => {
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'create' | 'sales'>(initialTab);
  const [myChannels, setMyChannels] = useState<ChannelListing[]>([]);
  const [mySales, setMySales] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Listing Form State
  const [title, setTitle] = useState('');
  const [handle, setHandle] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [niche, setNiche] = useState('Gaming');
  const [accountType, setAccountType] = useState('cooking_lifestyle');
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
  const [uploadedScreenshots, setUploadedScreenshots] = useState<string[]>([
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80'
  ]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit Listing Modal
  const [editingChannel, setEditingChannel] = useState<ChannelListing | null>(null);

  const loadSellerData = async () => {
    try {
      setLoading(true);
      const [channelsRes, ordersRes] = await Promise.all([
        api.getChannels({ sellerId: user?.id, status: 'all' }),
        api.getOrders()
      ]);
      setMyChannels(channelsRes.channels);
      // Filter sales where user is seller
      setMySales(ordersRes.orders.filter((o) => o.sellerId === user?.id));
    } catch (err: any) {
      showToast(err.message || 'Failed to load seller records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerData();
  }, [user]);

  // Handle Screenshot Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const res = await api.uploadFile(file);
      setUploadedScreenshots((prev) => [...prev, res.url]);
      showToast('Analytics screenshot uploaded successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !channelUrl || !askingPrice) {
      showToast('Title, YouTube URL, and Asking Price are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createChannel({
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

      showToast('Listing submitted! Verified channels are automatically approved.', 'success');
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
      showToast(err.message || 'Failed to create channel listing', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteListing = async (channelId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.deleteChannel(channelId);
      showToast('Listing removed successfully', 'info');
      loadSellerData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete listing', 'error');
    }
  };

  const handleTogglePause = async (ch: ChannelListing) => {
    const nextStatus = ch.status === 'active' ? 'paused' : 'active';
    try {
      await api.updateChannel(ch.id, { status: nextStatus });
      showToast(`Listing ${nextStatus === 'active' ? 'activated' : 'paused'}`, 'info');
      loadSellerData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Header */}
      <div className="border-b border-slate-900 bg-slate-950/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                Seller Control Center
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Manage YouTube Listings &amp; Orders
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Monitor live inventory, upload Studio proof, and advance Google Brand Account transfers.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('create')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-4 h-4" />
                List New Channel
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400">Total Listings</span>
              <p className="text-xl font-black text-white mt-1">{myChannels.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400">Active Deals / Sales</span>
              <p className="text-xl font-black text-amber-400 mt-1">{mySales.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400">Seller Rating</span>
              <p className="text-xl font-black text-white mt-1">★ {user?.rating || 5.0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400">Verification Status</span>
              <p className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                {user?.isVerifiedSeller ? 'Verified Creator Seller' : 'Standard Seller'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-900 bg-slate-950/60 sticky top-16 z-20 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6">
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'listings'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            My Channel Inventory ({myChannels.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'create'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Create Listing
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'sales'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Buyer Inquiries &amp; Sales ({mySales.length})
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Tab 1: My Listings */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {myChannels.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-3">
                <Film className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Channel Listings Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You haven't listed any YouTube channels for sale yet. Create your first listing with verified Studio analytics.
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-5 py-2.5 bg-red-600 rounded-xl text-white text-xs font-bold uppercase tracking-wider"
                >
                  Create Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {channel.niche}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {channel.verificationStatus === 'approved' ? (
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md">
                              Approved
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded-md">
                              Pending Review
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              channel.status === 'active'
                                ? 'bg-emerald-950 text-emerald-400'
                                : channel.status === 'sold'
                                ? 'bg-purple-950 text-purple-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {channel.status}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white line-clamp-1">{channel.title}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{channel.handle}</p>

                      <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-slate-950 mt-3 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Subs</span>
                          <strong className="text-white">{channel.subscribers.toLocaleString()}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Revenue</span>
                          <strong className="text-emerald-400">${channel.monthlyRevenue.toLocaleString()}/mo</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Price</span>
                          <strong className="text-white">${channel.askingPrice.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onSelectChannel(channel.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                        >
                          View Public Page
                        </button>
                        <button
                          onClick={() => handleTogglePause(channel)}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs"
                        >
                          {channel.status === 'active' ? 'Pause' : 'Activate'}
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteListing(channel.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition"
                        title="Delete listing"
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
          <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">Create New YouTube Channel Listing</h2>
              <p className="text-xs text-slate-400 mt-1">
                Provide accurate channel information. Attach verifiable YouTube Studio analytics screenshots to expedite approval.
              </p>
            </div>

            {/* Anti-Password Safety Directive */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-200">
                <strong className="text-emerald-300">Brand Account Handover Requirement:</strong>
                <p className="mt-0.5 leading-relaxed">
                  You will transfer this channel by adding the buyer’s Google Account as a Manager, and then reassigning Primary Ownership after the standard 7-day cooldown. Never share your Google password with anyone.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Channel Display Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Apex Tactical Gaming"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Channel Handle (@handle) *
                  </label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@ApexTacticalGaming"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    YouTube Channel URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    placeholder="https://youtube.com/@ApexTacticalGaming"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary Niche / Category *
                  </label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    চ্যানেলের ক্যাটাগরি / একাউন্ট টাইপ (Account Type) *
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="cooking_lifestyle">👩‍🍳 আন্টির রান্না ও ফুড রেসিপি (Cooking & Lifestyle)</option>
                    <option value="faceless_cash_cow">🤖 ফেসলেস ক্যাশ কাউ (Faceless Cash Cow)</option>
                    <option value="shorts_creator">⚡ ভাইরাল শর্টস চ্যানেল (Shorts Creator)</option>
                    <option value="gaming_stream">🎮 গেমিং ও টেক চ্যানেল (Gaming & Tech)</option>
                    <option value="vintage_aged">🏛️ ভিন্টেজ পুরানো একাউন্ট (Vintage 2012-2018)</option>
                    <option value="high_cpm_finance">💰 হাই CPM ফিন্যান্স ও বিজনেস (Finance)</option>
                    <option value="vlog_personal">📹 পার্সোনাল ভ্লগ ও লাইফস্টাইল (Personal Vlog)</option>
                    <option value="education_tech">📚 এডুকেশন ও সফটওয়্যার টিউটোরিয়াল</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    চ্যানেলের প্রাথমিক ভাষা (Primary Language)
                  </label>
                  <input
                    type="text"
                    value={primaryLanguage}
                    onChange={(e) => setPrimaryLanguage(e.target.value)}
                    placeholder="e.g. Bengali / Bangla & English"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Numerical Channel Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subscribers *
                  </label>
                  <input
                    type="number"
                    required
                    value={subscribers}
                    onChange={(e) => setSubscribers(e.target.value)}
                    placeholder="145000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Monthly Views (28d)
                  </label>
                  <input
                    type="number"
                    value={monthlyViews}
                    onChange={(e) => setMonthlyViews(e.target.value)}
                    placeholder="850000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Monthly Revenue ($)
                  </label>
                  <input
                    type="number"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(e.target.value)}
                    placeholder="2400"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Video Count
                  </label>
                  <input
                    type="number"
                    value={videoCount}
                    onChange={(e) => setVideoCount(e.target.value)}
                    placeholder="120"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Status checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Monetization</label>
                  <select
                    value={monetizationStatus}
                    onChange={(e: any) => setMonetizationStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white"
                  >
                    <option value="monetized">YPP Monetized</option>
                    <option value="not_monetized">Not Monetized</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Strikes Standing</label>
                  <select
                    value={strikeStatus}
                    onChange={(e: any) => setStrikeStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white"
                  >
                    <option value="clean">0 Strikes (Clean History)</option>
                    <option value="1_strike">1 Warning / Strike</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={hasSilverButton}
                      onChange={(e) => setHasSilverButton(e.target.checked)}
                      className="w-4 h-4 rounded-sm bg-slate-900 border-slate-700 text-red-600"
                    />
                    <span>Has Silver Creator Award (100k+)</span>
                  </label>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Asking Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    required
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value)}
                    placeholder="14900"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Minimum Offer Accepted ($ USD)
                  </label>
                  <input
                    type="number"
                    value={minOfferPrice}
                    onChange={(e) => setMinOfferPrice(e.target.value)}
                    placeholder="13000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Listing Description &amp; Channel Operations
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your content production process, audience retention, included video files, voiceover SOPs, and monetization history..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden"
                />
              </div>

              {/* File Upload for YouTube Studio Proof */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  YouTube Studio Analytics Proof Screenshots
                </label>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-2 transition">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingFile ? 'Uploading...' : 'Upload Screenshot (PNG, JPG, PDF)'}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Upload YouTube Studio screenshots: Revenue, 28-day Views, Copyright page
                    </span>
                  </div>

                  {uploadedScreenshots.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                      {uploadedScreenshots.map((url, i) => (
                        <div key={i} className="relative rounded-xl overflow-hidden border border-slate-800 aspect-video bg-black">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setUploadedScreenshots(uploadedScreenshots.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white text-[10px]"
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
                  className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Publish Channel Listing'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Sales & Orders */}
        {activeTab === 'sales' && (
          <div className="space-y-4">
            {mySales.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-3">
                <DollarSign className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Sales Orders Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  When a buyer initiates a purchase on one of your channels, the tracked order will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {mySales.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => onSelectOrder(order.id)}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-500">{order.id}</span>
                        <span className="text-xs font-bold text-emerald-400 uppercase">
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">{order.channelTitle}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Buyer: <strong>{order.buyerName}</strong> ({order.buyerEmail})
                        {order.buyerGoogleEmail && ` • Invite email: ${order.buyerGoogleEmail}`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block">Total Payout</span>
                        <span className="text-base font-extrabold text-white">
                          ${order.amount.toLocaleString()} USD
                        </span>
                      </div>
                      <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold">
                        Manage Transfer →
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
