import React, { useState, useEffect } from 'react';
import { ChannelListing, User, Review } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EvidenceModal } from '../components/EvidenceModal';
import { MessagingModal } from '../components/MessagingModal';
import { ReviewSlider } from '../components/ReviewSlider';
import {
  ShieldCheck,
  Award,
  Users,
  Eye,
  DollarSign,
  TrendingUp,
  Calendar,
  Film,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Lock,
  Star,
  Globe,
  Share2
} from 'lucide-react';

interface ChannelDetailsViewProps {
  channelId: string;
  onBack: () => void;
  onOrderCreated: (orderId: string) => void;
  onOpenLegal: (tab: 'tos' | 'privacy' | 'refund' | 'safety') => void;
}

export const ChannelDetailsView: React.FC<ChannelDetailsViewProps> = ({
  channelId,
  onBack,
  onOrderCreated,
  onOpenLegal
}) => {
  const { user, openAuthModal, showToast } = useAuth();
  const [channel, setChannel] = useState<ChannelListing | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [messagingModalOpen, setMessagingModalOpen] = useState(false);

  // Purchase modal
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState<number | string>('');
  const [buyerGoogleEmail, setBuyerGoogleEmail] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.getChannel(channelId);
        setChannel(res.channel);
        setSeller(res.seller);
        setReviews(res.reviews);
        setOfferPrice(res.channel.askingPrice);
      } catch (err: any) {
        showToast(err.message || 'Failed to load channel details', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [channelId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-center text-slate-300">
        <p>Channel listing not found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-800 rounded-xl text-white text-xs font-semibold"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const handleStartPurchase = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setPurchaseModalOpen(true);
  };

  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerGoogleEmail || !buyerGoogleEmail.includes('@')) {
      showToast('Please provide your valid Google Account email for the Brand Account manager invitation', 'error');
      return;
    }

    try {
      setSubmittingOrder(true);
      const res = await api.createOrder({
        channelId: channel.id,
        offeredPrice: Number(offerPrice) || channel.askingPrice,
        buyerGoogleEmail: buyerGoogleEmail.trim()
      });
      showToast('Purchase request created successfully! Proceeding to Order Vault.', 'success');
      setPurchaseModalOpen(false);
      onOrderCreated(res.order.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit purchase request', 'error');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Breadcrumb & Action bar */}
      <div className="border-b border-slate-900 bg-slate-950/80 sticky top-16 z-30 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast('Channel link copied to clipboard', 'info');
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <a
              href={channel.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <span>Verify on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {channel.accountType === 'cooking_lifestyle' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-700/60">
                    👩‍🍳 আন্টির রান্না ও রেসিপি / Cooking &amp; Lifestyle
                  </span>
                ) : channel.accountType === 'faceless_cash_cow' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-950 text-purple-300 border border-purple-700/60">
                    🤖 Faceless Cash Cow
                  </span>
                ) : channel.accountType === 'shorts_creator' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-700/60">
                    ⚡ Viral Shorts Creator
                  </span>
                ) : channel.accountType === 'vintage_aged' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                    🏛️ Vintage {channel.creationYear} Aged Channel
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-950 text-red-400 border border-red-800/60">
                    {channel.niche}
                  </span>
                )}

                {channel.verificationStatus === 'approved' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Channel &amp; Analytics
                  </span>
                )}

                {channel.hasSilverButton && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                    <Award className="w-4 h-4 text-amber-400" />
                    Silver Creator Award (100k+)
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {channel.title}
                </h1>
                <p className="text-sm text-slate-400 font-mono mt-1">
                  {channel.handle} • Created in {channel.creationYear}
                  {channel.primaryLanguage && ` • Language: ${channel.primaryLanguage}`}
                </p>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {channel.description || 'Verified YouTube channel ready for immediate Brand Account primary ownership handover.'}
              </p>

              {channel.tags && channel.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {channel.tags.map((tag, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Subscribers</span>
                </div>
                <p className="text-xl font-black text-white">{formatNumber(channel.subscribers)}</p>
                <p className="text-[10px] text-slate-500">{channel.subscribers.toLocaleString()} total</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <span>Monthly Views</span>
                </div>
                <p className="text-xl font-black text-white">{formatNumber(channel.monthlyViews)}</p>
                <p className="text-[10px] text-slate-500">Last 28-day cycle</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Monthly Revenue</span>
                </div>
                <p className="text-xl font-black text-emerald-400">
                  ${channel.monthlyRevenue.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-500">AdSense &amp; sponsorships</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span>Total Videos</span>
                </div>
                <p className="text-xl font-black text-white">{channel.videoCount} Videos</p>
                <p className="text-[10px] text-slate-500">Evergreen library</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Lifetime Views</span>
                </div>
                <p className="text-xl font-black text-white">{formatNumber(channel.lifetimeViews)}</p>
                <p className="text-[10px] text-slate-500">Cumulative historical</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-4 h-4 text-rose-400" />
                  <span>Channel Age</span>
                </div>
                <p className="text-xl font-black text-white">{2026 - channel.creationYear} Years</p>
                <p className="text-[10px] text-slate-500">Established {channel.creationYear}</p>
              </div>
            </div>

            {/* YouTube Studio Analytics Evidence Showcase */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Verified Studio Analytics Proof
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Uploaded screenshots of YouTube Studio Revenue &amp; Audience tabs
                  </p>
                </div>
                {channel.analyticsScreenshots?.length > 0 && (
                  <button
                    onClick={() => setEvidenceModalOpen(true)}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 underline"
                  >
                    View High-Res Proof
                  </button>
                )}
              </div>

              {channel.analyticsScreenshots?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {channel.analyticsScreenshots.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => setEvidenceModalOpen(true)}
                      className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video cursor-pointer"
                    >
                      <img
                        src={url}
                        alt={`Studio Analytics ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
                        <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 text-white text-xs font-semibold backdrop-blur-xs border border-slate-700">
                          Click to Enlarge ({idx + 1}/{channel.analyticsScreenshots.length})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
                  Seller has not attached custom screenshots for this listing yet.
                </div>
              )}
            </div>

            {/* Audience Demographics & Geography */}
            {channel.audience && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
                <h3 className="text-base font-bold text-white">Audience Demographics &amp; Geography</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Top Countries */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Top Viewer Geographies
                    </h4>
                    <div className="space-y-2.5">
                      {channel.audience.topCountries.map((c, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-medium">{c.country}</span>
                            <span className="text-slate-400">{c.percentage}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full"
                              style={{ width: `${c.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Age Distribution & Gender */}
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Age Distribution
                      </h4>
                      <div className="space-y-2.5">
                        {channel.audience.ageDistribution.map((a, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-300 font-medium">{a.range} years</span>
                              <span className="text-slate-400">{a.percentage}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                                style={{ width: `${a.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 font-medium">Gender Ratio</span>
                        <span className="text-white font-semibold">
                          Male {channel.audience.genderSplit.male}% • Female {channel.audience.genderSplit.female}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden flex">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${channel.audience.genderSplit.male}%` }}
                        />
                        <div
                          className="h-full bg-pink-500"
                          style={{ width: `${channel.audience.genderSplit.female}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* একাউন্টের রিভিউ অপশন ও স্লাইডার (উপরে রিভিউ অপশন, নিচে স্লাইডার আকারে রিভিউসমূহ) */}
            <ReviewSlider
              channelId={channel.id}
              channelTitle={channel.title}
              initialReviews={reviews}
              onReviewAdded={(newRev) => setReviews((prev) => [newRev, ...prev])}
            />
          </div>

          {/* Right Column: Pricing & Purchase Card (1 Col) */}
          <div className="space-y-6">
            {/* Purchase / Offer Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 sticky top-28 shadow-2xl">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Asking Price (বিক্রয় মূল্য)</span>
                <div className="flex flex-wrap items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    ${channel.askingPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">USD</span>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md">
                    ≈ ৳{Math.round(channel.askingPrice * 122).toLocaleString()} BDT
                  </span>
                </div>
                {channel.minOfferPrice && (
                  <p className="text-xs text-slate-400 mt-1">
                    Accepting offers from ${channel.minOfferPrice.toLocaleString()} (৳{Math.round(channel.minOfferPrice * 122).toLocaleString()})
                  </p>
                )}
              </div>

              {/* Status Pill */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Listing Status:</span>
                  <span className="font-bold text-emerald-400 uppercase tracking-wide">
                    {channel.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Monetization:</span>
                  <span className="font-semibold text-white">
                    {channel.monetizationStatus === 'monetized' ? 'YPP Active' : 'Not Monetized'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Strikes:</span>
                  <span className="font-semibold text-emerald-400">0 Strikes Clean</span>
                </div>
              </div>

              {/* Side-by-side Charge Calculation (মূল্য + চার্জ = মোট পাশে পাশে) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                  মূল্য ও প্ল্যাটফর্ম চার্জ ব্রেকডাউন (Price &amp; Charge):
                </span>
                <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-slate-800/80 font-bold">
                  <span className="text-white">${channel.askingPrice.toLocaleString()} (মূল্য)</span>
                  <span className="text-amber-400 font-semibold">+ ${Math.round(channel.askingPrice * 0.05).toLocaleString()} (৫% চার্জ)</span>
                  <span className="text-emerald-400">= ${(channel.askingPrice + Math.round(channel.askingPrice * 0.05)).toLocaleString()} (সর্বমোট)</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={handleStartPurchase}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/30 transition"
                >
                  Initiate Secure Purchase
                </button>
                <button
                  onClick={() => setMessagingModalOpen(true)}
                  className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message Seller / Inquire
                </button>
              </div>

              {/* Safety notice banner */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1.5 text-xs text-emerald-200">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>ChannelTrust Protection</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-300/80">
                  Transfers occur via Google Brand Account primary ownership reassignment. Google passwords are never requested or shared.
                </p>
                <button
                  onClick={() => onOpenLegal('safety')}
                  className="text-[10px] text-emerald-400 underline font-semibold block"
                >
                  Review our 7-day transfer protocol
                </button>
              </div>

              {/* Seller Profile Summary */}
              {seller && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Seller Overview
                  </span>
                  <div className="flex items-center gap-3">
                    <img
                      src={seller.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${seller.name}`}
                      alt={seller.name}
                      className="w-11 h-11 rounded-full border border-slate-700 object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{seller.name}</span>
                        {seller.isVerifiedSeller && (
                          <span className="text-emerald-400 text-xs" title="Verified Creator Seller">✓</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="text-amber-400 font-semibold">★ {seller.rating || 5.0}</span>
                        <span>•</span>
                        <span>{seller.dealsCount || 0} completed deals</span>
                      </div>
                    </div>
                  </div>
                  {seller.bio && (
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      "{seller.bio}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Viewer Lightbox */}
      <EvidenceModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        screenshots={channel.analyticsScreenshots}
        channelTitle={channel.title}
      />

      {/* In-flight Direct Messaging Modal */}
      <MessagingModal
        isOpen={messagingModalOpen}
        onClose={() => setMessagingModalOpen(false)}
        channelId={channel.id}
        channelTitle={channel.title}
        counterpartName={channel.sellerName}
        recipientId={channel.sellerId}
      />

      {/* Purchase Request Modal */}
      {purchaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in text-slate-100 space-y-5">
            <div>
              <h3 className="text-xl font-extrabold text-white">Purchase Request &amp; Handover Setup</h3>
              <p className="text-xs text-slate-400 mt-1">
                You are submitting an official purchase request for <strong>{channel.title}</strong>
              </p>
            </div>

            <form onSubmit={handleConfirmPurchase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Purchase Amount ($ USD)
                </label>
                <input
                  type="number"
                  required
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500"
                />
                <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-semibold pt-1.5 text-slate-300">
                  <span>চ্যানেল মূল্য: ${(Number(offerPrice) || 0).toLocaleString()}</span>
                  <span className="text-amber-400">+ ৫% চার্জ: ${Math.round((Number(offerPrice) || 0) * 0.05).toLocaleString()}</span>
                  <span className="text-emerald-400 font-bold">= মোট: ${((Number(offerPrice) || 0) + Math.round((Number(offerPrice) || 0) * 0.05)).toLocaleString()} USD</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Clean Google/Gmail Account (For YouTube Brand Account Manager Invite)
                </label>
                <input
                  type="email"
                  required
                  value={buyerGoogleEmail}
                  onChange={(e) => setBuyerGoogleEmail(e.target.value)}
                  placeholder="your.buyer.google@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500"
                />
                <span className="text-[11px] text-amber-400/90 mt-1.5 block">
                  Important: This is ONLY for YouTube Studio to send you a Manager invite. We will NEVER ask for your password.
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 text-white font-semibold">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>How Payment &amp; Transfer Work</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  1. Your purchase request creates a tracked order in ChannelVault.<br />
                  2. You verify deposit into platform custody.<br />
                  3. Seller invites your email above as Brand Account Manager.<br />
                  4. After the standard 7-day Google cooldown, seller makes you Primary Owner and funds are released.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPurchaseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition disabled:opacity-50"
                >
                  {submittingOrder ? 'Submitting...' : 'Confirm & Proceed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
