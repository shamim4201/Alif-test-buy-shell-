import React, { useState, useEffect } from 'react';
import { ChannelListing, User, Review } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
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

import {
  getLocalizedChannelTitle,
  getLocalizedChannelDescription,
  getLocalizedChannelLanguage,
  getLocalizedChannelNiche
} from '../translations/translations';
import { PlatformLogo, CategoryLogo } from '../components/CategoryIcons';

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
  const { currency, formatPrice, formatUsd, formatBdt, language, t } = useCurrency();
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
  const [feeSettings, setFeeSettings] = useState<{
    target: 'both' | 'buyer' | 'seller';
    buyerRate: number;
    sellerRate: number;
    totalRate: number;
  }>({
    target: 'both',
    buyerRate: 2.5,
    sellerRate: 2.5,
    totalRate: 5
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [res, settingsRes] = await Promise.all([
          api.getChannel(channelId),
          api.getWebsiteSettings().catch(() => ({ settings: null }))
        ]);
        setChannel(res.channel);
        setSeller(res.seller);
        setReviews(res.reviews || []);
        setOfferPrice(res.channel.askingPrice);

        const st = settingsRes?.settings || {};
        const target = (st.feeDeductionTarget as 'both' | 'buyer' | 'seller') || 'both';
        const total = Number(st.commissionRate) || 5;
        const buyer = target === 'seller' ? 0 : (st.buyerFeePercent !== undefined && st.buyerFeePercent !== null ? Number(st.buyerFeePercent) : (target === 'both' ? total / 2 : total));
        const seller = target === 'buyer' ? 0 : (st.sellerFeePercent !== undefined && st.sellerFeePercent !== null ? Number(st.sellerFeePercent) : (target === 'both' ? total / 2 : total));
        setFeeSettings({ target, buyerRate: buyer, sellerRate: seller, totalRate: total });
      } catch (err: any) {
        showToast(err.message || t('অ্যাকাউন্টের তথ্য লোড করতে ব্যর্থ হয়েছে', 'Failed to load channel details'), 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const handleSettingsUpdate = (e: any) => {
      const st = e?.detail || {};
      const target = (st.feeDeductionTarget as 'both' | 'buyer' | 'seller') || 'both';
      const total = Number(st.commissionRate) || 5;
      const buyer = target === 'seller' ? 0 : (st.buyerFeePercent !== undefined && st.buyerFeePercent !== null ? Number(st.buyerFeePercent) : (target === 'both' ? total / 2 : total));
      const seller = target === 'buyer' ? 0 : (st.sellerFeePercent !== undefined && st.sellerFeePercent !== null ? Number(st.sellerFeePercent) : (target === 'both' ? total / 2 : total));
      setFeeSettings({ target, buyerRate: buyer, sellerRate: seller, totalRate: total });
    };
    window.addEventListener('website-settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('website-settings-updated', handleSettingsUpdate);
  }, [channelId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-slate-900">{t("অ্যাকাউন্ট খুঁজে পাওয়া যায়নি", "Account not found")}</h2>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-800 text-xs font-semibold cursor-pointer"
        >
          {t("তালিকায় ফিরে যান", "Return to Listings")}
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
      showToast(t('অনুগ্রহ করে সঠিক ইমেইল বা যোগাযোগের তথ্য দিন', 'Please provide a valid email or contact info'), 'error');
      return;
    }

    try {
      setSubmittingOrder(true);
      const res = await api.createOrder({
        channelId: channel.id,
        offeredPrice: channel.askingPrice,
        buyerGoogleEmail: buyerGoogleEmail.trim()
      });
      showToast(t('অর্ডার সফলভাবে তৈরি হয়েছে! অর্ডার ভল্টে নিয়ে যাওয়া হচ্ছে।', 'Order successfully initiated! Redirecting to Escrow Vault.'), 'success');
      setPurchaseModalOpen(false);
      onOrderCreated(res.order.id);
    } catch (err: any) {
      showToast(err.message || t('অর্ডার তৈরিতে সমস্যা হয়েছে', 'Failed to create order'), 'error');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const getPlatformLabel = () => {
    switch (channel.platform) {
      case 'facebook': return t('ফেসবুক পেজ', 'Facebook Page');
      case 'tiktok': return t('টিকটক একাউন্ট', 'TikTok Account');
      case 'instagram': return t('ইনস্টাগ্রাম পেজ', 'Instagram Page');
      case 'telegram': return t('টেলিগ্রাম চ্যানেল', 'Telegram Channel');
      case 'twitter': return t('এক্স বা টুইটার', 'X / Twitter');
      default: return t('ইউটিউব চ্যানেল', 'YouTube Channel');
    }
  };

  const getAccountTypeBadge = () => {
    switch (channel.accountType) {
      case 'cooking_lifestyle':
        return t('আন্টির রান্না ও রেসিপি', 'Cooking & Lifestyle');
      case 'facebook_page':
        return t('ইনস্ট্রিম অ্যাড মনিটাইজড পেজ', 'In-Stream Ads Monetized');
      case 'tiktok_viral':
        return t('ক্রিয়েটর রিওয়ার্ডস ও শপ', 'Creator Rewards & Shop');
      case 'instagram_theme':
        return t('থিম পেজ ও ব্র্যান্ড শাউটআউট', 'Theme Page & Shoutouts');
      case 'faceless_cash_cow':
        return t('ফেসলেস ক্যাশ কাউ', 'Faceless Cash Cow');
      case 'shorts_creator':
        return t('ভাইরাল শর্টস ক্রিয়েটর', 'Viral Shorts Creator');
      case 'vintage_aged':
        return t(`ভিন্টেজ ${channel.creationYear} এর পুরাতন একাউন্ট`, `Vintage ${channel.creationYear} Aged Account`);
      default:
        return getLocalizedChannelNiche(channel.niche, language);
    }
  };

  const getFollowerTitle = () => {
    if (channel.platform === 'telegram') return t('টেলিগ্রাম মেম্বার', 'Telegram Members');
    if (channel.platform === 'facebook' || channel.platform === 'instagram' || channel.platform === 'twitter' || channel.platform === 'tiktok') {
      return t('ফলোয়ার / লাইক', 'Followers / Likes');
    }
    return t('সাবস্ক্রাইবার / ফলোয়ার', 'Subscribers / Followers');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* Top Breadcrumb & Action bar */}
      <div className="border-b border-slate-200 bg-white/95 sticky top-16 z-30 backdrop-blur-xs shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("মার্কেটপ্লেসে ফিরে যান", "Back to Marketplace")}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast(t('লিংক কপি করা হয়েছে', 'Link copied to clipboard'), 'info');
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs transition cursor-pointer"
              title={t("শেয়ার করুন", "Share")}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <a
              href={channel.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <span>
                {t(
                  `${(channel.platform || 'youtube').toUpperCase()}-এ সরাসরি যাচাই করুন`,
                  `Verify live on ${(channel.platform || 'youtube').toUpperCase()}`
                )}
              </span>
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
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* Platform Badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${
                  channel.platform === 'facebook'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : channel.platform === 'tiktok'
                    ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                    : channel.platform === 'instagram'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : channel.platform === 'telegram'
                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                    : channel.platform === 'twitter'
                    ? 'bg-slate-100 text-slate-800 border-slate-300'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  <PlatformLogo platform={channel.platform || 'youtube'} className="w-3.5 h-3.5 shrink-0" />
                  <span>{getPlatformLabel()}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs">
                  <CategoryLogo categoryId={channel.accountType || ''} className="w-3.5 h-3.5 shrink-0" />
                  <span>{getAccountTypeBadge()}</span>
                </span>

                {channel.pageQuality === 'green' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {t("১০০% গ্রিন পেজ কোয়ালিটি", "100% Green Page Quality")}
                  </span>
                )}

                {channel.verificationStatus === 'approved' && !channel.pageQuality && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {t("ভেরিফাইড অ্যাকাউন্ট ও অ্যানালিটিক্স", "Verified Account & Analytics")}
                  </span>
                )}

                {channel.hasSilverButton && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
                    <Award className="w-4 h-4 text-amber-500" />
                    {t("সিলভার প্লে বাটন প্রাপ্ত (১০০k+)", "Silver Creator Award (100k+)")}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {getLocalizedChannelTitle(channel, language)}
                </h1>
                <p className="text-sm text-slate-500 font-mono mt-1">
                  {channel.handle} • {t(`তৈরি: ${channel.creationYear}`, `Created in ${channel.creationYear}`)}
                  {channel.primaryLanguage && ` • ${t('ভাষা: ', 'Language: ')}${getLocalizedChannelLanguage(channel.primaryLanguage, language)}`}
                </p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {getLocalizedChannelDescription(channel, language) || t('যাচাইকৃত অ্যাকাউন্ট, তাৎক্ষণিক অফিসিয়াল হস্তান্তরের জন্য প্রস্তুত।', 'Verified social account ready for immediate ownership handover.')}
              </p>

              {channel.tags && channel.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {channel.tags.map((tag, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>{getFollowerTitle()}</span>
                </div>
                <p className="text-xl font-black text-slate-900">{formatNumber(channel.subscribers)}</p>
                <p className="text-[10px] text-slate-500">{channel.subscribers.toLocaleString()} {t("মোট", "total")}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Eye className="w-4 h-4 text-cyan-600" />
                  <span>{t("মাসিক ভিউ / রিচ", "Monthly Views / Reach")}</span>
                </div>
                <p className="text-xl font-black text-slate-900">{formatNumber(channel.monthlyViews)}</p>
                <p className="text-[10px] text-slate-500">{t("শেষ ২৮ দিনের সাইকেল", "Last 28-day cycle")}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>{t("মাসিক আয়", "Monthly Revenue")}</span>
                </div>
                <p className="text-xl font-black text-emerald-600">
                  ${channel.monthlyRevenue.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-500">{t("ইনস্ট্রিম / অ্যাডসেন্স", "In-Stream / AdSense")}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Film className="w-4 h-4 text-amber-600" />
                  <span>{t("মোট ভিডিও বা পোস্ট", "Total Posts / Videos")}</span>
                </div>
                <p className="text-xl font-black text-slate-900">{channel.videoCount}</p>
                <p className="text-[10px] text-slate-500">{t("অরিজিনাল কনটেন্ট লাইব্রেরি", "Original content library")}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Globe className="w-4 h-4 text-sky-600" />
                  <span>{t("লাইফটাইম ভিউজ", "Lifetime Views")}</span>
                </div>
                <p className="text-xl font-black text-slate-900">{formatNumber(channel.lifetimeViews)}</p>
                <p className="text-[10px] text-slate-500">{t("সর্বমোট ভিউ", "Cumulative historical")}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="w-4 h-4 text-rose-600" />
                  <span>{t("অ্যাকাউন্টের বয়স", "Account Age")}</span>
                </div>
                <p className="text-xl font-black text-slate-900">
                  {2026 - channel.creationYear} {t("বছর", "Years")}
                </p>
                <p className="text-[10px] text-slate-500">{t(`${channel.creationYear}-এ প্রতিষ্ঠিত`, `Established in ${channel.creationYear}`)}</p>
              </div>
            </div>

            {/* Studio Analytics Evidence Showcase */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>{t("যাচাইকৃত স্টুডিও অ্যানালিটিক্স প্রমাণ", "Verified Studio Analytics Proof")}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t(
                      "ক্রিয়েটর স্টুডিওর আয়, ভিউজ ও অডিয়েন্স ট্যাবের হাই-রেজুলুশন স্ক্রিনশট",
                      "Uploaded screenshots of Creator Studio Revenue & Audience tabs"
                    )}
                  </p>
                </div>
                {channel.analyticsScreenshots?.length > 0 && (
                  <button
                    onClick={() => setEvidenceModalOpen(true)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 underline cursor-pointer"
                  >
                    {t(`ফুলস্ক্রিন দেখুন (${channel.analyticsScreenshots.length})`, `View Fullscreen (${channel.analyticsScreenshots.length})`)}
                  </button>
                )}
              </div>

              {channel.analyticsScreenshots?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {channel.analyticsScreenshots.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setEvidenceModalOpen(true)}
                      className="group relative aspect-video rounded-2xl overflow-hidden border border-slate-200 cursor-pointer bg-slate-100"
                    >
                      <img
                        src={img}
                        alt="Studio screenshot"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-semibold shadow-md">
                          {t("বড় করে দেখুন", "Click to Enlarge")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                  {t("সেলার এখনো কোনো কাস্টম অ্যানালিটিক্স স্ক্রিনশট যুক্ত করেননি।", "Seller has not attached custom screenshots for this listing yet.")}
                </div>
              )}
            </div>

            {/* Audience Demographics & Geography */}
            {channel.audience && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-900">
                  {t("অডিয়েন্স ডেমোগ্রাফিক ও ভৌগোলিক তথ্য", "Audience Demographics & Geography")}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Top Countries */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      {t("শীর্ষ দর্শক দেশসমূহ", "Top Viewer Geographies")}
                    </h4>
                    <div className="space-y-2.5">
                      {channel.audience.topCountries.map((c, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-700 font-medium">{c.country}</span>
                            <span className="text-slate-500">{c.percentage}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
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
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                        {t("বয়সভিত্তিক বিন্যাস", "Age Distribution")}
                      </h4>
                      <div className="space-y-2.5">
                        {channel.audience.ageDistribution.map((a, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-700 font-medium">{a.range} {t("বছর", "years")}</span>
                              <span className="text-slate-500">{a.percentage}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-full"
                                style={{ width: `${a.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium">{t("লিঙ্গ অনুপাত (Gender)", "Gender Ratio")}</span>
                        <span className="text-slate-900 font-semibold">
                          {t("পুরুষ", "Male")} {channel.audience.genderSplit.male}% • {t("মহিলা", "Female")} {channel.audience.genderSplit.female}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
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

            {/* রিভিউ অপশন ও স্লাইডার */}
            <ReviewSlider
              channelId={channel.id}
              channelTitle={getLocalizedChannelTitle(channel, language)}
              initialReviews={reviews}
              onReviewAdded={(newRev) => setReviews((prev) => [newRev, ...prev])}
            />
          </div>

          {/* Right Column: Pricing & Purchase Card (1 Col) */}
          <div className="space-y-6">
            {/* Purchase / Offer Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5 sticky top-28 shadow-lg">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">
                  {t("বিক্রয় মূল্য", "Asking Price")}
                </span>
                <div className="flex flex-wrap items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    {formatPrice(channel.askingPrice)}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase">{currency}</span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    ≈ {currency === 'USD' ? formatBdt(channel.askingPrice) : formatUsd(channel.askingPrice)}
                  </span>
                </div>
                {channel.minOfferPrice && (
                  <p className="text-xs text-slate-500 mt-1">
                    {t(
                      `অফার গ্রহণ শুরু: ${formatPrice(channel.minOfferPrice)}`,
                      `Accepting offers from ${formatPrice(channel.minOfferPrice)}`
                    )}
                  </p>
                )}
              </div>

              {/* Status Pill */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{t("লিস্টিং স্ট্যাটাস:", "Listing Status:")}</span>
                  <span className="font-bold text-emerald-700 uppercase tracking-wide">
                    {channel.status === 'active' ? t('সক্রিয় (Active)', 'Active') : channel.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{t("মনিটাইজেশন:", "Monetization:")}</span>
                  <span className="font-semibold text-slate-800">
                    {channel.monetizationStatus === 'monetized' ? t('সক্রিয় / Ads Active', 'YPP / Ads Active') : t('মনিটাইজড নয়', 'Not Monetized')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{t("কপিরাইট স্ট্রাইক:", "Strikes:")}</span>
                  <span className="font-semibold text-emerald-700">{t("০ স্ট্রাইক (ক্লিন)", "0 Strikes Clean")}</span>
                </div>
              </div>

              {/* Side-by-side Dual Charge Calculation */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold flex items-center justify-between">
                  <span>{t("মূল্য ও এসক্রো চার্জ ব্রেকডাউন:", "Price & Escrow Charge Breakdown:")}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                    {feeSettings.target === 'both' ? t('উভয় পক্ষ ফি মডেল', 'Dual Fee Model') : feeSettings.target}
                  </span>
                </span>
                <div className="space-y-1.5 pt-1 border-t border-slate-200">
                  <div className="flex justify-between text-slate-700">
                    <span>{t("চ্যানেলের মূল দাম:", "Channel Asset Price:")}</span>
                    <span className="font-bold text-slate-900">{formatPrice(channel.askingPrice)}</span>
                  </div>
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>{t(`বায়ার কাস্টডি ফি (${feeSettings.buyerRate}%):`, `Buyer Custody Fee (${feeSettings.buyerRate}%):`)}</span>
                    <span className="font-bold">+ {formatPrice(Math.round(channel.askingPrice * (feeSettings.buyerRate / 100)))}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-slate-200 text-sm">
                    <span className="text-emerald-700">{t("বায়ার মোট জমা দেবেন:", "Buyer Total Escrow:")}</span>
                    <span className="text-emerald-700">
                      {formatPrice(channel.askingPrice + Math.round(channel.askingPrice * (feeSettings.buyerRate / 100)))}
                    </span>
                  </div>
                  {feeSettings.sellerRate > 0 && (
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-dashed border-slate-200">
                      <span>{t(`সেলার কমিশন কর্তন (${feeSettings.sellerRate}%):`, `Seller Commission (${feeSettings.sellerRate}%):`)}</span>
                      <span className="text-rose-600 font-medium">- {formatPrice(Math.round(channel.askingPrice * (feeSettings.sellerRate / 100)))}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={handleStartPurchase}
                  className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider shadow-md transition cursor-pointer"
                >
                  {t("নিরাপদ ক্রয় শুরু করুন (Buy Now)", "Initiate Secure Purchase")}
                </button>

                <button
                  onClick={() => setMessagingModalOpen(true)}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                >
                  <MessageSquare className="w-4 h-4 text-slate-600" />
                  <span>{t("সেলারকে মেসেজ দিন / জিজ্ঞাসা করুন", "Message Seller / Inquire")}</span>
                </button>
              </div>

              {/* Safety notice banner */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs text-emerald-800">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{t("ChannelTrust নিরাপত্তা সুরক্ষা", "ChannelTrust Protection")}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-700">
                  {t(
                    "অফিসিয়াল রোল ট্রান্সফারের মাধ্যমে হস্তান্তর সম্পন্ন হয়। অ্যাকাউন্টের পাসওয়ার্ড কখনোই চাওয়া বা শেয়ার করা হয় না।",
                    "Transfers occur via standard official role reassignment. Account passwords are never requested or shared."
                  )}
                </p>
                <button
                  onClick={() => onOpenLegal('safety')}
                  className="text-[10px] text-emerald-800 underline font-semibold block cursor-pointer"
                >
                  {t("আমাদের নিরাপত্তা প্রটোকল পড়ুন", "Review our safety protocol")}
                </button>
              </div>

              {/* Seller Profile Summary */}
              {seller && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    {t("সেলার পরিচিতি", "Seller Overview")}
                  </span>
                  <div className="flex items-center gap-3">
                    <img
                      src={seller.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${seller.name}`}
                      alt={seller.name}
                      className="w-11 h-11 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{seller.name}</span>
                        {seller.isVerifiedSeller && (
                          <span className="text-emerald-600 text-xs font-bold" title={t("যাচাইকৃত সেলার", "Verified Creator Seller")}>✓</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="text-amber-600 font-semibold">★ {seller.rating || 5.0}</span>
                        <span>•</span>
                        <span>{seller.dealsCount || 0} {t("টি সফল চুক্তি", "completed deals")}</span>
                      </div>
                    </div>
                  </div>
                  {seller.bio && (
                    <p className="text-xs text-slate-600 leading-relaxed italic">
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
        channelTitle={getLocalizedChannelTitle(channel, language)}
      />

      {/* In-flight Direct Messaging Modal */}
      <MessagingModal
        isOpen={messagingModalOpen}
        onClose={() => setMessagingModalOpen(false)}
        channelId={channel.id}
        channelTitle={getLocalizedChannelTitle(channel, language)}
        counterpartName={channel.sellerName}
        recipientId={channel.sellerId}
      />

      {/* Purchase Request Modal */}
      {purchaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in text-slate-800 space-y-5">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {t("ক্রয় রিকোয়েস্ট ও হ্যান্ডওভার সেটআপ", "Purchase Request & Handover Setup")}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t("আপনি অফিসিয়াল পারচেজ রিকোয়েস্ট দিচ্ছেন: ", "You are submitting an official purchase request for ")}
                <strong>{getLocalizedChannelTitle(channel, language)}</strong>
              </p>
            </div>

            <form onSubmit={handleConfirmPurchase} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {t("ক্রয় মূল্য ($ USD)", "Purchase Amount ($ USD)")}
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300">
                    <Lock className="w-3 h-3 text-emerald-700" />
                    {t("ফিক্সড লিস্টিং প্রাইস (পরিবর্তনযোগ্য নয়)", "Fixed Listing Price (Non-editable)")}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={`$${channel.askingPrice.toLocaleString()} USD`}
                    className="w-full bg-slate-100/90 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 cursor-not-allowed select-none shadow-inner"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    ≈ ৳{Math.round(channel.askingPrice * 122).toLocaleString()} BDT
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700 mt-2">
                  <div className="flex justify-between">
                    <span>{t("অ্যাকাউন্টের নির্ধারিত মূল্য:", "Account Listing Price:")}</span>
                    <span className="font-bold text-slate-900">${channel.askingPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>{t(`বায়ার কাস্টডি ফি (${feeSettings.buyerRate}%):`, `Buyer Custody Fee (${feeSettings.buyerRate}%):`)}</span>
                    <span className="font-bold">+${Math.round(channel.askingPrice * (feeSettings.buyerRate / 100)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-black text-emerald-800 pt-1 border-t border-slate-200 text-sm">
                    <span>{t("মোট জমা দিতে হবে:", "Total Escrow Deposit:")}</span>
                    <span>${(channel.askingPrice + Math.round(channel.askingPrice * (feeSettings.buyerRate / 100))).toLocaleString()} USD</span>
                  </div>
                  {feeSettings.target === 'both' && (
                    <p className="text-[10px] text-slate-500 pt-1 border-t border-dashed border-slate-200">
                      {t(`* এই প্ল্যাটফর্মের সুরক্ষার জন্য বায়ার (${feeSettings.buyerRate}%) এবং সেলার (${feeSettings.sellerRate}%) দুজনের থেকেই ফি কার্যকর করা হয়।`, `* Platform splits safety & escrow protection fees equally between buyer (${feeSettings.buyerRate}%) and seller (${feeSettings.sellerRate}%).`)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {channel.platform === 'facebook'
                    ? t('আপনার ফেসবুক প্রোফাইল লিংক বা ইমেইল (Facebook Page Admin ইনভাইটেশন পাওয়ার জন্য) *', 'Your Facebook Profile URL or Email (For Page Admin Invite) *')
                    : channel.platform === 'tiktok'
                    ? t('আপনার ইমেইল বা ফোন নম্বর (TikTok একাউন্ট হস্তান্তরের জন্য) *', 'Your Email or Phone (For TikTok Handover) *')
                    : channel.platform === 'instagram'
                    ? t('আপনার ইমেইল ঠিকানা (Instagram একাউন্ট ও ওজি ইমেইল ট্রান্সফারের জন্য) *', 'Your Email Address (For Instagram & OG Email Transfer) *')
                    : channel.platform === 'telegram'
                    ? t('আপনার টেলিগ্রাম ইউজারনেম (@username) বা ফোন (Owner Rights ট্রান্সফারের জন্য) *', 'Your Telegram @username or Phone (For Ownership Transfer) *')
                    : channel.platform === 'twitter'
                    ? t('আপনার ইমেইল বা এক্স হ্যান্ডেল (X / Twitter একাউন্ট হস্তান্তরের জন্য) *', 'Your Email or X Handle (For Twitter / X Handover) *')
                    : t('আপনার ফ্রেশ গুগল / জিমেইল অ্যাকাউন্ট (YouTube Brand Account Manager ইনভাইটের জন্য) *', 'Your Clean Google/Gmail Account (For YouTube Brand Account Manager Invite) *')}
                </label>
                <input
                  type="text"
                  required
                  value={buyerGoogleEmail}
                  onChange={(e) => setBuyerGoogleEmail(e.target.value)}
                  placeholder={
                    channel.platform === 'facebook'
                      ? 'https://facebook.com/yourprofile or email'
                      : channel.platform === 'telegram'
                      ? '@your_telegram_username'
                      : 'your.clean.email@gmail.com'
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-red-500"
                />
                <span className="text-[11px] text-amber-700 mt-1.5 block">
                  {t(
                    "নিরাপত্তা নির্দেশিকা: কখনোই আপনার পাসওয়ার্ড কারও সাথে শেয়ার করবেন না। প্ল্যাটফর্ম এস্ক্রোর মাধ্যমে নিরাপদে হস্তান্তর সম্পন্ন হবে।",
                    "Safety Notice: Never share your passwords with anyone. Transfer completes securely via platform escrow."
                  )}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t("পেমেন্ট ও ট্রান্সফার প্রসেস (Safe Escrow)", "Payment & Transfer Process (Safe Escrow)")}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {t(
                    "১. বায়ারের পেমেন্ট প্ল্যাটফর্মের নিরাপদ ভল্টে জমা থাকবে।\n২. সেলার ওপরের তথ্যে অ্যাডমিন/ওনারশিপ ট্রান্সফার সম্পন্ন করবেন।\n৩. বায়ার একাউন্ট অ্যাক্সেস নিশ্চিত করার পরই সেলারের কাছে টাকা পৌঁছে যাবে।",
                    "1. Buyer funds are held in secure escrow vault.\n2. Seller sends admin/owner invitation to your provided details.\n3. Funds are released to seller only after buyer confirms verified access."
                  )}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPurchaseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  {t("বাতিল", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submittingOrder ? t("সাবমিট হচ্ছে...", "Submitting...") : t("নিশ্চিত ও অগ্রসর হোন", "Confirm & Proceed")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
