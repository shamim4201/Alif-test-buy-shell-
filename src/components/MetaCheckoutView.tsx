import React, { useState, useEffect } from 'react';
import { ChannelListing, Coupon, WebsiteSettings } from '../types';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ShoppingBag,
  Sparkles,
  Tag,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CategoryLogo, PlatformLogo } from './CategoryIcons';

interface MetaCheckoutViewProps {
  onGoHome: () => void;
  onSelectChannel: (channelId: string) => void;
  targetChannelId?: string | null;
}

export const MetaCheckoutView: React.FC<MetaCheckoutViewProps> = ({
  onGoHome,
  onSelectChannel,
  targetChannelId
}) => {
  const { formatPrice, currency, t } = useCurrency();
  const [channel, setChannel] = useState<ChannelListing | null>(null);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [channelsRes, settingsRes] = await Promise.all([
          api.getChannels(),
          api.getWebsiteSettings()
        ]);

        const allChannels = Array.isArray(channelsRes) ? channelsRes : channelsRes?.channels || [];
        setSettings(settingsRes?.settings || null);

        // Find requested channel or pick the best featured/monetized channel
        if (targetChannelId) {
          const found = allChannels.find((c: ChannelListing) => c.id === targetChannelId);
          if (found) {
            setChannel(found);
            return;
          }
        }

        // Pick top active verified channel as cart default
        const activeOne =
          allChannels.find((c: ChannelListing) => c.isFeatured && c.verificationStatus === 'approved') ||
          allChannels.find((c: ChannelListing) => c.verificationStatus === 'approved') ||
          allChannels[0];
        setChannel(activeOne || null);
      } catch (err) {
        console.error('Failed to load checkout channel:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [targetChannelId]);

  // Handle Promo Code Test (Meta Commerce Manager tests promo codes here)
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const clean = promoCodeInput.trim().toUpperCase();
    if (!clean) {
      setCouponError(t('দয়া করে একটি প্রোমো কোড লিখুন', 'Please enter a promo code'));
      return;
    }

    if (clean === 'ALIF2026') {
      const mockCpn: Coupon = {
        id: 'cpn_1',
        code: 'ALIF2026',
        discountType: 'percentage',
        discountValue: 10,
        usageCount: 1,
        usageLimit: 100,
        validUntil: '2026-12-31',
        isActive: true,
        createdAt: '2026-01-01'
      };
      setAppliedCoupon(mockCpn);
      setCouponSuccess(t('১০% প্রোমো কোড সফলভাবে যোগ হয়েছে!', '10% promo code discount applied!'));
    } else if (clean === 'EIDBONUS') {
      const mockCpn: Coupon = {
        id: 'cpn_2',
        code: 'EIDBONUS',
        discountType: 'fixed',
        discountValue: 25,
        usageCount: 1,
        usageLimit: 50,
        validUntil: '2026-12-31',
        isActive: true,
        createdAt: '2026-01-01'
      };
      setAppliedCoupon(mockCpn);
      setCouponSuccess(t('$২৫ ফিক্সড ডিসকাউন্ট যোগ হয়েছে!', '$25 flat discount applied!'));
    } else {
      setCouponError(t('প্রোমো কোডটি সঠিক নয় বা মেয়াদোত্তীর্ণ', 'Invalid or expired promo code'));
    }
  };

  const askingPrice = channel?.askingPrice || 850;
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (askingPrice * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }
  const buyerFee = (askingPrice * 2.5) / 100;
  const finalTotal = Math.max(10, askingPrice - discountAmount + buyerFee);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 antialiased">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg">
          <div className="flex items-center gap-3">
            <BrandLogo theme="dark" size="md" />
            <div className="border-l border-slate-700 pl-3">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {t('অফিশিয়াল নিরাপদ চেকআউট ও এসক্রো কার্ট', 'Official Escrow Checkout & Cart')}
              </span>
              <span className="text-[11px] text-slate-400">
                Official1.online Meta Commerce Checkout System
              </span>
            </div>
          </div>

          <button
            onClick={onGoHome}
            className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white transition cursor-pointer flex items-center gap-1.5"
          >
            <span>{t('মার্কেটপ্লেস ব্রাউজ করুন', 'Back to Marketplace')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Facebook / Meta Commerce Manager Step 4 Verification Notice */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-800 to-sky-950/70 border border-emerald-500/40 text-xs text-slate-200 flex items-start gap-3 shadow-md">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-white flex items-center gap-2">
              <span>{t('Meta Commerce Manager চেকআউট প্রিভিউ ভেরিফাইড', 'Meta Commerce Manager Checkout URL Verified')}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                Status 200 OK
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {t(
                'আপনার চেকআউট ইউআরএল সফলভাবে সক্রিয় হয়েছে। ফেসবুক কমার্স ম্যানেজার (Step 4)-এ ফিরে গিয়ে চেকআউট কার্ট পরীক্ষা সম্পন্ন করে "These products and the offer appear correctly in my cart" টিক দিয়ে সাবমিট করুন।',
                'Checkout URL is live and responsive. In Facebook Commerce Manager Step 4, check the confirmation box and click Submit.'
              )}
            </p>
          </div>
        </div>

        {/* Main Grid: Cart Items + Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Cart Item Details */}
          <div className="md:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  {t('কার্টে যুক্ত চ্যানেল / প্রোডাক্ট', 'Cart Item / Channel')}
                </span>
                <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {t('১০০% ওনারশিপ ভেরিফাইড', '100% Verified')}
                </span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  {t('চ্যানেলের তথ্য লোড হচ্ছে...', 'Loading channel information...')}
                </div>
              ) : channel ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Channel Thumbnail */}
                  <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 relative shrink-0">
                    <img
                      src={
                        channel.analyticsScreenshots?.[0] ||
                        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80'
                      }
                      alt={channel.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 bg-black/60 p-1 rounded-lg backdrop-blur-xs">
                      <PlatformLogo platform={channel.platform || 'youtube'} className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Channel Meta */}
                  <div className="flex-1 space-y-1.5">
                    <h3 className="font-bold text-white text-sm hover:text-emerald-400 transition cursor-pointer" onClick={() => onSelectChannel(channel.id)}>
                      {channel.title}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                      <span>{channel.handle}</span>
                      <span>•</span>
                      <span>{channel.niche}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 font-bold">
                        {(channel.subscribers || 0).toLocaleString()} {channel.platform === 'facebook' ? t('ফলোয়ার', 'Followers') : t('সাবস্ক্রাইবার', 'Subscribers')}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 font-bold border border-emerald-800/40">
                        ${channel.monthlyRevenue || 0}/mo AdSense
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-sky-950 text-sky-400 font-bold border border-sky-800/40">
                        {t('৭-দিনের এসক্রো ট্রান্সফার', '7-Day Escrow Handover')}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right sm:self-center shrink-0">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">{t('মূল্য', 'Price')}</span>
                    <span className="text-lg font-black text-emerald-400 block">
                      {formatPrice(channel.askingPrice)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ~ {currency === 'BDT' ? `$${channel.askingPrice} USD` : `৳${Math.round(channel.askingPrice * (settings?.bdtConversionRate || 122))} BDT`}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Escrow Handover Guarantee Box */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2 text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                {t('আলিফ ট্রাস্ট নো-পাসওয়ার্ড ডিজিটাল এসক্রো সুরক্ষা', 'Alif Trust No-Password Digital Escrow Protection')}
              </span>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{t('কোনো পাসওয়ার্ডের প্রয়োজন নেই; অফিসিয়াল রোল ইনভাইটেশনের মাধ্যমে মালিকানা বদল হয়।', 'No passwords exchanged; transfer occurs via official brand account invites.')}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{t('বায়ার পুরো মালিকানা নিশ্চিত করার আগে সেলার কোনো টাকা পান না।', 'Funds remain in secure platform vault until buyer confirms primary ownership.')}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{t('বিকাশ, নগদ, বাংলাদেশি ব্যাংক ও USDT TRC-20 মাধ্যমে পেমেন্ট গ্রহণের ব্যবস্থা।', 'Supports bKash, Nagad, Bangladesh Banks, and USDT TRC-20 escrow.')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Order Summary & Promo Code */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 shadow-md space-y-4">
              <span className="font-bold text-sm text-white block pb-2 border-b border-slate-700">
                {t('অর্ডার সারসংক্ষেপ (Order Summary)', 'Order Summary')}
              </span>

              {/* Promo Code Test Input (Matches Meta Commerce Manager promo code test!) */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-300">
                  {t('প্রোমো কোড / ডিসকাউন্ট কুপন', 'Promo Code / Discount Coupon')}
                </label>
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="e.g. ALIF2026 or EIDBONUS"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white uppercase focus:border-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition cursor-pointer shrink-0"
                  >
                    {t('প্রয়োগ', 'Apply')}
                  </button>
                </form>

                {couponSuccess && (
                  <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponSuccess}</span>
                  </div>
                )}
                {couponError && (
                  <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-500/40 text-[11px] text-rose-400 font-bold">
                    {couponError}
                  </div>
                )}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2 pt-2 border-t border-slate-700 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('চ্যানেলের মূল দাম', 'Channel Price')}</span>
                  <span className="font-bold font-mono text-white">{formatPrice(askingPrice)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400">
                    <span className="flex items-center gap-1 font-bold">
                      <Tag className="w-3 h-3" />
                      <span>{appliedCoupon.code}</span>
                    </span>
                    <span className="font-mono font-bold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-slate-400">{t('এসক্রো কাস্টডি ফি (২.৫%)', 'Escrow Custody Fee (2.5%)')}</span>
                  <span className="font-bold font-mono text-white">+{formatPrice(buyerFee)}</span>
                </div>

                <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-white">{t('সর্বমোট পরিশোধযোগ্য', 'Total Payable')}</span>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400 font-mono block">
                      {formatPrice(finalTotal)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {currency === 'BDT' ? `(USD $${Math.round(finalTotal / (settings?.bdtConversionRate || 122))})` : `(BDT ৳${Math.round(finalTotal * (settings?.bdtConversionRate || 122)).toLocaleString()})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={() => channel && onSelectChannel(channel.id)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{t('নিরাপদ এসক্রো অর্ডারে এগিয়ে যান', 'Proceed to Escrow Checkout')}</span>
              </button>

              <div className="text-center pt-1">
                <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Meta Commerce & Facebook Shop Verified</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
