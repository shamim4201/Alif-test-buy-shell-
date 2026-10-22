import React, { useState, useEffect } from 'react';
import { Order, ChannelListing, User, Message, WebsiteSettings } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { ReviewModal } from '../components/ReviewModal';
import { getLocalizedChannelTitle, getLocalizedOrderStep } from '../translations/translations';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  MessageSquare,
  Send,
  Star,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  DollarSign,
  Copy,
  Check,
  Wallet,
  QrCode,
  Building2,
  Smartphone,
  Coins,
  Upload,
  Image as ImageIcon,
  X,
  Eye,
  ZoomIn,
  FileCheck
} from 'lucide-react';

interface OrderDetailsViewProps {
  orderId: string;
  onBack: () => void;
  onOpenLegal: (tab: 'tos' | 'privacy' | 'refund' | 'safety') => void;
}

export const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({
  orderId,
  onBack,
  onOpenLegal
}) => {
  const { user, showToast } = useAuth();
  const { currency, formatPrice, formatUsd, formatBdt, language, t } = useCurrency();
  const [order, setOrder] = useState<Order | null>(null);
  const [channel, setChannel] = useState<ChannelListing | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [buyer, setBuyer] = useState<User | null>(null);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Dual Payment Confirmation State (BDT vs USDT)
  const [paymentGatewayTab, setPaymentGatewayTab] = useState<'bdt' | 'usdt'>('bdt');
  const [bdtSubMethod, setBdtSubMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [usdtSubNetwork, setUsdtSubNetwork] = useState<'trc20' | 'bep20' | 'binance_pay'>('trc20');
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState('');
  const [senderAccountInfo, setSenderAccountInfo] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>('');
  const [viewProofModalUrl, setViewProofModalUrl] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentSectionOpen, setPaymentSectionOpen] = useState(true);

  const handleCopyText = (text: string, key: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      }
      setCopiedKey(key);
      showToast(t('ক্লিপবোর্ডে কপি করা হয়েছে!', 'Copied to clipboard!'), 'success');
      setTimeout(() => setCopiedKey(null), 2500);
    } catch (e) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleScreenshotFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast(t('ছবির সাইজ সর্বোচ্চ ৮ মেগাবাইট হতে পারবে', 'Image size cannot exceed 8MB'), 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPaymentScreenshot(reader.result);
        showToast(t('পেমেন্ট স্ক্রিনশট সফলভাবে সংযুক্ত করা হয়েছে!', 'Payment proof screenshot attached!'), 'success');
      }
    };
    reader.onerror = () => {
      showToast(t('স্ক্রিনশট লোড করতে সমস্যা হয়েছে', 'Failed to load image file'), 'error');
    };
    reader.readAsDataURL(file);
  };

  // Email update
  const [inputGoogleEmail, setInputGoogleEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  // Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Dispute modal
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      const [res, settingsRes] = await Promise.all([
        api.getOrder(orderId),
        api.getWebsiteSettings().catch(() => ({ settings: null }))
      ]);
      setOrder(res.order);
      setChannel(res.channel);
      setSeller(res.seller);
      setBuyer(res.buyer);
      setInputGoogleEmail(res.order.buyerGoogleEmail || '');
      if (settingsRes?.settings) {
        setSettings(settingsRes.settings);
      }
    } catch (err: any) {
      showToast(err.message || t('অর্ডার ভল্ট লোড করতে ব্যর্থ হয়েছে', 'Failed to load order vault'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadChat = async () => {
    try {
      const res = await api.getMessages({ orderId });
      setMessages(res.messages || []);
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  };

  useEffect(() => {
    loadOrderData();
    loadChat();
    const interval = setInterval(loadChat, 4000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-slate-900">{t("অর্ডার খুঁজে পাওয়া যায়নি", "Order not found")}</h2>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-800 text-xs font-semibold cursor-pointer"
        >
          {t("ড্যাশবোর্ডে ফিরে যান", "Return to Dashboard")}
        </button>
      </div>
    );
  }

  const isBuyer = user?.id === order.buyerId;
  const isSeller = user?.id === order.sellerId;
  const isAdmin = user?.role === 'admin';

  // Buyer confirms verified deposit into Admin Escrow with TrxID and Screenshot
  const handleVerifyPayment = async () => {
    if (!transactionRef.trim()) {
      showToast(
        paymentGatewayTab === 'bdt'
          ? t('অনুগ্রহ করে পেমেন্টের TrxID (Transaction ID) প্রদান করুন', 'Please provide Transaction ID (TrxID)')
          : t('অনুগ্রহ করে ক্রিপ্টো ট্রানজেকশন হ্যাশ (TxHash / Transaction Hash) দিন', 'Please provide Crypto Transaction Hash (TxHash)'),
        'error'
      );
      return;
    }

    if (!paymentScreenshot) {
      showToast(
        t('অনুগ্রহ করে পেমেন্টের প্রমাণ হিসেবে স্ক্রিনশট বা রসিদের ছবি আপলোড করুন!', 'Please upload your payment slip/screenshot proof!'),
        'error'
      );
      return;
    }

    try {
      setVerifyingPayment(true);
      
      // Determine chosen gateway title
      let selectedMethodName = '';
      if (selectedGatewayId) {
        const found = settings?.customGateways?.find(g => g.id === selectedGatewayId);
        if (found) selectedMethodName = found.name;
      }
      if (!selectedMethodName) {
        selectedMethodName = paymentGatewayTab === 'bdt'
          ? (bdtSubMethod === 'bkash' ? 'bKash Merchant Escrow' : bdtSubMethod === 'nagad' ? 'Nagad Online Escrow' : bdtSubMethod === 'rocket' ? 'Rocket DBBL Escrow' : 'Official Bank Escrow')
          : (usdtSubNetwork === 'trc20' ? 'USDT (TRC-20 Tron Escrow)' : usdtSubNetwork === 'bep20' ? 'USDT (BEP-20 BSC Escrow)' : 'Binance Pay Escrow');
      }

      const fullRef = senderAccountInfo.trim()
        ? `${transactionRef.trim()} (Sender: ${senderAccountInfo.trim()})`
        : transactionRef.trim();

      const res = await api.confirmPayment(order.id, {
        paymentMethod: selectedMethodName,
        transactionRef: fullRef,
        screenshotUrl: paymentScreenshot,
        senderAccount: senderAccountInfo.trim()
      });
      setOrder(res.order);
      showToast(t('পেমেন্ট ট্রানজেকশন আইডি ও স্ক্রিনশট সফলভাবে এডমিন এস্ক্রো ভল্টে জমা হয়েছে!', 'Payment TrxID & Screenshot proof safely locked in Platform Admin Escrow Vault!'), 'success');
      loadChat();
    } catch (err: any) {
      showToast(err.message || t('পেমেন্ট নিশ্চিতকরণ ব্যর্থ হয়েছে', 'Payment confirmation failed'), 'error');
    } finally {
      setVerifyingPayment(false);
    }
  };

  // Step advancement
  const handleCompleteStep = async (stepNumber: number) => {
    try {
      const res = await api.updateTransferStep(order.id, stepNumber);
      setOrder(res.order);
      showToast(t(`ধাপ ${stepNumber} যাচাই ও সংরক্ষিত হয়েছে!`, `Step ${stepNumber} verified and saved!`), 'success');
      loadChat();
    } catch (err: any) {
      showToast(err.message || t('ধাপ আপডেট করতে সমস্যা হয়েছে', 'Failed to update step'), 'error');
    }
  };

  // Buyer updates clean Gmail
  const handleSaveGoogleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputGoogleEmail || !inputGoogleEmail.includes('@')) {
      showToast(t('অনুগ্রহ করে সঠিক ইমেইল দিন', 'Please provide a valid email'), 'error');
      return;
    }
    try {
      setSavingEmail(true);
      const res = await api.setBuyerGoogleEmail(order.id, inputGoogleEmail.trim());
      setOrder(res.order);
      showToast(t('সেলারকে আমন্ত্রণ জানানোর ইমেইল সফলভাবে রেকর্ড করা হয়েছে', 'Account invite email recorded for the seller'), 'success');
      handleCompleteStep(1);
    } catch (err: any) {
      showToast(err.message || t('ইমেইল সংরক্ষণে সমস্যা হয়েছে', 'Failed to save email'), 'error');
    } finally {
      setSavingEmail(false);
    }
  };

  // Buyer releases funds on completion
  const handleCompleteOrder = async () => {
    if (!confirm(t('আপনি কি নিশ্চিত যে আপনি স্টুডিওতে প্রাইমারি ওনারশিপ যাচাই করেছেন এবং সেলারের টাকা রিলিজ করতে চান?', 'Are you certain that you have verified Primary Ownership in Studio and want to release funds to the seller?'))) {
      return;
    }
    try {
      const res = await api.completeOrder(order.id);
      setOrder(res.order);
      showToast(t('অর্ডার সফলভাবে সম্পন্ন হয়েছে এবং সেলারকে টাকা রিলিজ করা হয়েছে!', 'Order successfully completed and payout released to seller!'), 'success');
      setReviewModalOpen(true);
      loadChat();
    } catch (err: any) {
      showToast(err.message || t('অর্ডার সম্পন্ন করতে সমস্যা হয়েছে', 'Failed to complete order'), 'error');
    }
  };

  // Raise dispute
  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;
    try {
      setSubmittingDispute(true);
      const res = await api.raiseDispute(order.id, disputeReason);
      setOrder(res.order);
      showToast(t('ডিসপ্যুট ওপেন হয়েছে। পেমেন্ট ফ্রিজ করা হয়েছে এবং কমপ্লায়েন্স টিম অবহিত হয়েছে।', 'Dispute opened. Payout is frozen and ChannelTrust arbitration team notified.'), 'info');
      setDisputeModalOpen(false);
      loadChat();
    } catch (err: any) {
      showToast(err.message || t('ডিসপ্যুট ওপেন করতে ব্যর্থ হয়েছে', 'Failed to raise dispute'), 'error');
    } finally {
      setSubmittingDispute(false);
    }
  };

  // Send Chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    try {
      setSendingMsg(true);
      const res = await api.sendMessage({
        orderId: order.id,
        text: chatInput
      });
      setChatInput('');
      setMessages((prev) => [...prev, res.message]);
    } catch (err: any) {
      showToast(err.message || t('মেসেজ পাঠাতে ব্যর্থ হয়েছে', 'Failed to send message'), 'error');
    } finally {
      setSendingMsg(false);
    }
  };

  const getStatusBadge = () => {
    switch (order.status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">{t('পেমেন্ট অপেক্ষমাণ', 'Pending Payment')}</span>;
      case 'payment_confirmed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">{t('পেমেন্ট ভেরিফাইড', 'Payment Confirmed')}</span>;
      case 'transfer_in_progress':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">{t('হ্যান্ডওভার চলছে', 'Account Transfer in Progress')}</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">{t('সম্পন্ন ও রিলিজড', 'Completed & Released')}</span>;
      case 'disputed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200">{t('ডিসপ্যুট প্রক্রিয়াধীন', 'Under Arbitration Dispute')}</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">{t('বাতিলকৃত', 'Cancelled')}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* Top Bar */}
      <div className="border-b border-slate-200 bg-white sticky top-16 z-30 backdrop-blur-xs shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("ড্যাশবোর্ডে ফিরে যান", "Back to Dashboard")}</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">{t("অর্ডার নং: ", "Order ID: ")}{order.id}</span>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Dispute Banner if Disputed */}
        {order.status === 'disputed' && (
          <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-700 text-sm">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>{t("অর্ডার ফ্রিজ করা হয়েছে: সক্রিয় ডিসপ্যুট আরবিট্রেশন চলছে", "Order Frozen: Active Dispute Arbitration in Progress")}</span>
            </div>
            <p className="text-xs leading-relaxed">
              <strong>{t("কারণ: ", "Reason: ")}</strong> {order.disputeReason}
            </p>
            <p className="text-[11px] text-red-600">
              {t("উত্থাপন করেছেন: ", "Raised by: ")}{order.disputeRaisedBy?.toUpperCase()} •{' '}
              {order.disputeRaisedAt ? new Date(order.disputeRaisedAt).toLocaleString() : ''}. {t("প্ল্যাটফর্ম আরবিট্রেশন অফিসার অ্যাকাউন্ট পারমিশন ও মেসেজ অডিট করছেন।", "A platform compliance officer is auditing channel permissions and messages.")}
            </p>
            {order.disputeResolution && (
              <div className="mt-2 p-3 rounded-xl bg-white text-slate-900 text-xs border border-red-300">
                <strong>{t("আরবিট্রেশন সিদ্ধান্ত: ", "Arbitration Ruling: ")}</strong> {order.disputeResolution}
              </div>
            )}
          </div>
        )}

        {/* Order Header Summary */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-xs">
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              {t("অ্যাকাউন্ট ক্রয় এস্ক্রো চুক্তি", "Account Acquisition Escrow")}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {getLocalizedChannelTitle(channel || { title: order.channelTitle }, language)}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              {order.channelHandle} •{' '}
              <a
                href={order.channelUrl}
                target="_blank"
                rel="noreferrer"
                className="text-red-600 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>{t("অ্যাকাউন্ট লিঙ্ক দেখুন", "View Account URL")}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>

            <div className="flex flex-wrap gap-4 pt-3 text-xs text-slate-600">
              <div>
                <span className="text-slate-500 block">{t("বায়ার: ", "Buyer: ")}</span>
                <strong className="text-slate-900">{order.buyerName}</strong> ({order.buyerEmail})
              </div>
              <div>
                <span className="text-slate-500 block">{t("সেলার: ", "Seller: ")}</span>
                <strong className="text-slate-900">{order.sellerName}</strong> ({order.sellerEmail})
              </div>
              {order.buyerGoogleEmail && (
                <div>
                  <span className="text-slate-500 block">{t("ইনভাইটের তথ্য: ", "Account for Invite: ")}</span>
                  <strong className="text-emerald-700">{order.buyerGoogleEmail}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">
                {t("আর্থিক হিসাব (Financial Summary)", "Financial Summary")}
              </span>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 my-2 shadow-2xs space-y-1">
                {(() => {
                  const bFee = order.buyerFee !== undefined ? order.buyerFee : (order.totalAmount > order.amount ? (order.totalAmount - order.amount) : Math.round(order.platformFee / 2));
                  const sFee = order.sellerFee !== undefined ? order.sellerFee : (order.platformFee - bFee);
                  const sPayout = order.sellerPayoutAmount ?? Math.max(0, order.amount - sFee);
                  const bRate = order.amount > 0 ? ((bFee / order.amount) * 100).toFixed(1).replace('.0', '') : '2.5';
                  const sRate = order.amount > 0 ? ((sFee / order.amount) * 100).toFixed(1).replace('.0', '') : '2.5';

                  return (
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>{t("চ্যানেলের মূল্য:", "Deal Asset Value:")}</span>
                        <span className="text-slate-800 font-bold">{formatPrice(order.amount)}</span>
                      </div>
                      <div className="flex justify-between text-amber-700">
                        <span>{t(`বায়ার এসক্রো ফি (+${bRate}%):`, `Buyer Escrow Fee (+${bRate}%):`)}</span>
                        <span className="font-semibold">+{formatPrice(bFee)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-0.5">
                        <span className="text-emerald-700">{t("বায়ারের সর্বমোট জমা:", "Buyer Total Deposited:")}</span>
                        <span className="text-emerald-700 font-black">{formatPrice(order.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 pt-1 border-t border-dashed border-slate-200">
                        <span>{t(`সেলার কমিশন কর্তন (-${sRate}%):`, `Seller Fee Deducted (-${sRate}%):`)}</span>
                        <span className="font-semibold">-{formatPrice(sFee)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{t("সেলারকে প্রদেয় পেআউট:", "Seller Net Payout:")}</span>
                        <span className="text-slate-900 font-black">{formatPrice(sPayout)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded-md font-bold mt-1">
                        <span>{t("প্ল্যাটফর্মের সর্বমোট আয়:", "Platform Net Revenue:")}</span>
                        <span>{formatPrice(order.platformFee)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {order.paymentDetails && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{t("সার্ভার-ভেরিফাইড ডিপোজিট", "Server-Verified Deposit Secured")}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {order.paymentDetails.method}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <span className="font-semibold">{t("ট্রানজেকশন রেফারেন্স:", "TrxID / Ref:")}</span>
                  <span className="font-mono font-bold text-slate-900 select-all">{order.paymentDetails.transactionRef}</span>
                </div>
                {order.paymentDetails.screenshotUrl && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/80 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <img
                        src={order.paymentDetails.screenshotUrl}
                        alt="Payment Proof"
                        className="w-9 h-9 object-cover rounded-lg border border-slate-200 shadow-2xs cursor-pointer"
                        onClick={() => setViewProofModalUrl(order.paymentDetails!.screenshotUrl!)}
                      />
                      <div>
                        <span className="text-[11px] font-bold text-slate-900 block">{t("পেমেন্ট স্লিপ সংযুক্ত", "Payment Proof Attached")}</span>
                        <span className="text-[10px] text-emerald-700">{t("ভেরিফাইড ভাউচার", "Verified Voucher")}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewProofModalUrl(order.paymentDetails!.screenshotUrl!)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{t("স্ক্রিনশট দেখুন", "View Slip")}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Transfer Milestone Checklist */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>{t("অ্যাকাউন্ট ওনারশিপ ট্রান্সফার প্রটোকল", "Account Ownership Transfer Protocol")}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t("অফিসিয়াল প্ল্যাটফর্ম পলিসি অনুযায়ী ৬-ধাপের নিরাপদ হস্তান্তর প্রক্রিয়া।", "Compliance milestone progression mandated by official platform security standards.")}
              </p>
            </div>
            <button
              onClick={() => onOpenLegal('safety')}
              className="text-xs text-red-600 hover:text-red-700 underline font-semibold cursor-pointer"
            >
              {t("ধাপভিত্তিক নিরাপত্তা গাইড", "Step-by-step Transfer Guide")}
            </button>
          </div>

          {/* ============================================================== */}
          {/* STEP 1: ESCROW CUSTODY DEPOSIT (EMBEDDED DIRECTLY INSIDE PROTOCOL) */}
          {/* ============================================================== */}
          {order.status === 'pending' && isBuyer ? (
            <div className="rounded-2xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-emerald-50/90 overflow-hidden shadow-sm">
              {/* Interactive Header: Click to Open / Collapse Payment */}
              <button
                type="button"
                onClick={() => setPaymentSectionOpen(!paymentSectionOpen)}
                className="w-full p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left cursor-pointer hover:bg-emerald-100/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/70 px-2.5 py-0.5 rounded-md">
                        {t("ধাপ ১: এস্ক্রো পেমেন্ট ডিপোজিট", "Step 1: Escrow Custody Deposit")}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold animate-pulse">
                        {t("পেমেন্ট আবশ্যক", "Payment Required")}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 mt-1">
                      {t("প্ল্যাটফর্ম এস্ক্রো ভল্টে ডিপোজিট সম্পন্ন করুন", "Deposit Funds to Platform Escrow Vault")}
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      {t("এখানে ক্লিক করে BDT বা USDT বোতাম সিলেক্ট করুন এবং পেমেন্ট ডিটেইলস দিন", "Click to select BDT or USDT button and submit payment details")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">{t("প্রদেয় অর্থ", "Amount Due")}</span>
                    <span className="text-base font-black text-slate-900 font-mono">${order.totalAmount.toLocaleString()} USD</span>
                    <span className="text-[10px] font-bold text-emerald-700 block">
                      ≈ ৳{Math.round(order.totalAmount * (settings?.bdtConversionRate || 122)).toLocaleString()} BDT
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-white border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-2xs">
                    {paymentSectionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Expandable Payment Body */}
              {paymentSectionOpen && (
                <div className="p-4 sm:p-6 border-t border-emerald-200 bg-white space-y-5 animate-fade-in">
                  {/* Escrow Custody Destination Notice */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border-2 border-emerald-300 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>
                        {t(
                          'টাকা সরাসরি এডমিনের এস্ক্রো ভল্টে জমা হবে — বিক্রেতার (Seller) কাছে সরাসরি যাবে না!',
                          'Funds deposit directly into Platform Admin Escrow Vault — Never directly to the Seller!'
                        )}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
                      {t(
                        'বায়ারের টাকা সম্পূর্ণ নিরাপদে প্ল্যাটফর্ম এডমিনের কাস্টডিতে লক থাকবে। বিক্রেতা কোনো টাকাই পাবেন না যতক্ষণ না তিনি চ্যানেল হস্তান্তর সম্পন্ন করে আপনাকে একমাত্র প্রাইমারি ওনার (Primary Owner) বানিয়ে দেন এবং আপনি সন্তুষ্ট হয়ে সম্মতি প্রদান করেন। এরপরই কেবল এডমিন কমিশন রেখে বিক্রেতাকে টাকা রিলিজ করবেন।',
                        'Your deposit remains 100% safely locked in Platform Admin custody. The seller cannot touch the money until ownership transfer is fully complete, you are confirmed Primary Owner, and you explicitly approve the release.'
                      )}
                    </p>
                  </div>

                  {/* Primary Payment Selector: 2 BUTTONS (BDT and USDT) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-emerald-600" />
                        <span>{t("পেমেন্ট গেটওয়ে নির্বাচন করুন (Select Gateway):", "Select Payment Gateway:")}</span>
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {t("পছন্দের মাধ্যমে ক্লিক করুন", "Click your preferred gateway")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Button 1: BDT (বাংলাদেশী গেটওয়ে) */}
                      <button
                        type="button"
                        onClick={() => setPaymentGatewayTab('bdt')}
                        className={`p-4 rounded-2xl border-2 text-left transition relative cursor-pointer ${
                          paymentGatewayTab === 'bdt'
                            ? 'bg-emerald-50/90 border-emerald-500 shadow-md ring-2 ring-emerald-400/20'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                              paymentGatewayTab === 'bdt' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                            }`}>
                              🇧🇩
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-slate-900">
                                  {t("BDT (বাংলাদেশী টাকা)", "BDT (Bangladeshi Taka)")}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                                {t("বিকাশ • নগদ • রকেট • ব্যাংক ট্রান্সফার", "bKash • Nagad • Rocket • Bank Transfer")}
                              </span>
                            </div>
                          </div>
                          {paymentGatewayTab === 'bdt' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shrink-0">
                              ✓ {t("নির্বাচিত", "Active")}
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-400 shrink-0">
                              {t("বাছাই করুন", "Select")}
                            </span>
                          )}
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-500">{t("মোট প্রদেয় BDT:", "Pay in BDT:")}</span>
                          <span className="text-emerald-700 font-black font-mono">
                            ৳{Math.round(order.totalAmount * (settings?.bdtConversionRate || 122)).toLocaleString()} BDT
                          </span>
                        </div>
                      </button>

                      {/* Button 2: USDT (ইউএসডিটি গেটওয়ে) */}
                      <button
                        type="button"
                        onClick={() => setPaymentGatewayTab('usdt')}
                        className={`p-4 rounded-2xl border-2 text-left transition relative cursor-pointer ${
                          paymentGatewayTab === 'usdt'
                            ? 'bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-400/20'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                              paymentGatewayTab === 'usdt' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                            }`}>
                              🪙
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-slate-900">
                                  {t("USDT (ক্রিপ্টোকারেন্সি)", "USDT (Cryptocurrency)")}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                                {t("TRC-20 • BEP-20 • Binance Pay", "TRC-20 • BEP-20 • Binance Pay")}
                              </span>
                            </div>
                          </div>
                          {paymentGatewayTab === 'usdt' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold shrink-0">
                              ✓ {t("নির্বাচিত", "Active")}
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-400 shrink-0">
                              {t("বাছাই করুন", "Select")}
                            </span>
                          )}
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-500">{t("মোট প্রদেয় USDT:", "Pay in USDT:")}</span>
                          <span className="text-amber-700 font-black font-mono">
                            {order.totalAmount.toLocaleString()} USDT
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Sub-Method Selector & Details based on Active Tab */}
                  {paymentGatewayTab === 'bdt' ? (
                    /* ================= BDT GATEWAYS & BANK ACCOUNTS ================= */
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      {(() => {
                        const bdtGateways = (settings?.customGateways || []).filter(g => g.type === 'bdt' && g.isActive !== false);
                        const activeGw = bdtGateways.find(g => g.id === selectedGatewayId) || bdtGateways[0];

                        return (
                          <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <span>{t("বাংলাদেশি গেটওয়ে বা ব্যাংক বেছে নিন:", "Choose BDT Gateway or Bank Account:")}</span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  {bdtGateways.length} {t("উপলব্ধ", "Available")}
                                </span>
                              </span>
                            </div>

                            {/* Gateways & Banks Selector Chips */}
                            {bdtGateways.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {bdtGateways.map((gw) => {
                                  const isSelected = (activeGw?.id === gw.id);
                                  return (
                                    <button
                                      key={gw.id}
                                      type="button"
                                      onClick={() => setSelectedGatewayId(gw.id)}
                                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                        isSelected
                                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/30'
                                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                      }`}
                                    >
                                      {gw.category === 'bank' ? (
                                        <Building2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                                      ) : (
                                        <Smartphone className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-pink-600'}`} />
                                      )}
                                      <span>{gw.name}</span>
                                      {gw.category === 'bank' && (
                                        <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-semibold ${
                                          isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                                        }`}>
                                          {t("ব্যাংক", "Bank")}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500 italic p-3 bg-white rounded-xl border border-slate-200">
                                {t("কোনো কাস্টম গেটওয়ে পাওয়া যায়নি। ডিফল্ট একাউন্ট সক্রিয় রয়েছে।", "No custom gateways configured. Default admin account active.")}
                              </div>
                            )}

                            {/* Detailed Gateway / Bank Card */}
                            {activeGw && (
                              <div className="p-4 rounded-xl bg-white border-2 border-emerald-200 space-y-3.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                      <h4 className="font-black text-sm text-slate-900">{activeGw.name}</h4>
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase">
                                        {activeGw.category === 'bank' ? t("অফিসিয়াল ব্যাংক অ্যাকাউন্ট", "Official Bank Escrow") : t("মোবাইল ব্যাংকিং", "Mobile Banking")}
                                      </span>
                                    </div>
                                    {activeGw.accountHolderName && (
                                      <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                                        {t("একাউন্ট হোল্ডার নাম:", "Account Name:")} <span className="text-slate-900 font-bold">{activeGw.accountHolderName}</span>
                                      </p>
                                    )}
                                  </div>

                                  {/* Copy Account Number Button */}
                                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                                    <span className="font-mono font-black text-sm text-slate-900 select-all">
                                      {activeGw.accountNumber}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyText(activeGw.accountNumber, activeGw.id)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                                    >
                                      {copiedKey === activeGw.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      <span>{copiedKey === activeGw.id ? t("কপি হয়েছে", "Copied") : t("কপি", "Copy")}</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Bank Details Grid if category is bank */}
                                {activeGw.category === 'bank' && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs">
                                    {activeGw.bankName && (
                                      <div>
                                        <span className="text-[10px] font-bold text-blue-700 block uppercase">{t("ব্যাংকের নাম", "Bank Name")}</span>
                                        <span className="font-bold text-slate-900">{activeGw.bankName}</span>
                                      </div>
                                    )}
                                    {activeGw.branchName && (
                                      <div>
                                        <span className="text-[10px] font-bold text-blue-700 block uppercase">{t("ব্রাঞ্চ / শাখা", "Branch")}</span>
                                        <span className="font-semibold text-slate-800">{activeGw.branchName}</span>
                                      </div>
                                    )}
                                    {activeGw.routingNumber && (
                                      <div>
                                        <span className="text-[10px] font-bold text-blue-700 block uppercase">{t("রাউটিং নম্বর", "Routing Number")}</span>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-mono font-bold text-slate-900">{activeGw.routingNumber}</span>
                                          <button
                                            type="button"
                                            onClick={() => handleCopyText(activeGw.routingNumber!, `rout_${activeGw.id}`)}
                                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                            title={t("রাউটিং কপি করুন", "Copy Routing")}
                                          >
                                            {copiedKey === `rout_${activeGw.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                    {activeGw.swiftCode && (
                                      <div>
                                        <span className="text-[10px] font-bold text-blue-700 block uppercase">{t("সুইফট কোড (SWIFT)", "SWIFT Code")}</span>
                                        <span className="font-mono font-bold text-slate-800">{activeGw.swiftCode}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Payment Instructions */}
                                <div className="text-[11px] text-slate-700 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 space-y-1">
                                  <p className="font-bold text-emerald-950 flex items-center justify-between">
                                    <span>{t(`প্রদেয় মোট টাকা: ৳${Math.round(order.totalAmount * (settings?.bdtConversionRate || 122)).toLocaleString()} BDT`, `Total to Pay: ৳${Math.round(order.totalAmount * (settings?.bdtConversionRate || 122)).toLocaleString()} BDT`)}</span>
                                    <span className="text-[10px] text-emerald-800 font-semibold">($1 = ৳{settings?.bdtConversionRate || 122})</span>
                                  </p>
                                  {activeGw.instructions && (
                                    <p className="text-slate-600 pt-0.5">{activeGw.instructions}</p>
                                  )}
                                  <p className="text-[10px] text-emerald-800 font-semibold pt-1">
                                    {t("* পেমেন্ট সম্পন্ন করে TrxID এবং রসিদের স্ক্রিনশট নিচের বক্সে যুক্ত করুন।", "* After payment, enter the TrxID and upload proof screenshot below.")}
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    /* ================= USDT GATEWAYS ================= */
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-4">
                      {(() => {
                        const usdtGateways = (settings?.customGateways || []).filter(g => g.type === 'usdt' && g.isActive !== false);
                        const activeGw = usdtGateways.find(g => g.id === selectedGatewayId) || usdtGateways[0];

                        return (
                          <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <span>{t("ক্রিপ্টো গেটওয়ে বা নেটওয়ার্ক বেছে নিন:", "Choose Crypto Gateway / Network:")}</span>
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                  {usdtGateways.length} {t("উপলব্ধ", "Available")}
                                </span>
                              </span>
                            </div>

                            {/* Crypto Chips */}
                            {usdtGateways.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {usdtGateways.map((gw) => {
                                  const isSelected = (activeGw?.id === gw.id);
                                  return (
                                    <button
                                      key={gw.id}
                                      type="button"
                                      onClick={() => setSelectedGatewayId(gw.id)}
                                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                        isSelected
                                          ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/30'
                                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                      }`}
                                    >
                                      <Coins className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-600'}`} />
                                      <span>{gw.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Detailed Crypto Card */}
                            {activeGw && (
                              <div className="p-4 rounded-xl bg-white border-2 border-amber-200 space-y-3.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                                  <div>
                                    <h4 className="font-black text-sm text-slate-900">{activeGw.name}</h4>
                                    <span className="text-[10px] text-amber-700 font-bold uppercase">
                                      {t("অফিসিয়াল ক্রিপ্টো এসক্রো ডিপোজিট", "Official Crypto Escrow Vault")}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                                    <span className="font-mono font-black text-xs text-slate-900 select-all truncate max-w-[200px]">
                                      {activeGw.accountNumber}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyText(activeGw.accountNumber, activeGw.id)}
                                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                                    >
                                      {copiedKey === activeGw.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      <span>{copiedKey === activeGw.id ? t("কপি হয়েছে", "Copied") : t("কপি", "Copy")}</span>
                                    </button>
                                  </div>
                                </div>

                                <div className="text-[11px] text-slate-700 bg-amber-50/60 p-3 rounded-xl border border-amber-100 space-y-1">
                                  <p className="font-bold text-amber-950 flex items-center justify-between">
                                    <span>{t(`প্রদেয় মোট USDT: ${order.totalAmount.toLocaleString()} USDT`, `Total to Pay: ${order.totalAmount.toLocaleString()} USDT`)}</span>
                                  </p>
                                  {activeGw.instructions && (
                                    <p className="text-slate-600 pt-0.5">{activeGw.instructions}</p>
                                  )}
                                  <p className="text-[10px] text-amber-800 font-semibold pt-1">
                                    {t("* ক্রিপ্টো ট্রান্সফার শেষে প্রাপ্ত TxHash / Transaction ID এবং কনফার্মেশন স্ক্রিনশট নিচের বক্সে দিন।", "* After transfer, input TxHash and upload confirmation slip below.")}
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Input Form: TrxID / TxHash and Sender Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">
                        {paymentGatewayTab === 'bdt'
                          ? t("ট্রানজেকশন আইডি (TrxID) *", "Transaction ID (TrxID) *")
                          : t("ক্রিপ্টো ট্রানজেকশন হ্যাশ (TxHash / Transaction Hash) *", "Crypto TxHash / Transaction Hash *")}
                      </label>
                      <input
                        type="text"
                        required
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        placeholder={paymentGatewayTab === 'bdt' ? 'e.g. BLA89X4029' : 'e.g. 0x8f3c... or 4b9a...'}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-emerald-500 font-semibold"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {paymentGatewayTab === 'bdt'
                          ? t("পেমেন্ট সফল হওয়ার পর প্রাপ্ত TrxID প্রদান করুন।", "Enter the Transaction ID received via SMS/app.")
                          : t("বাইনান্স বা ক্রিপ্টো ওয়ালেট থেকে সফল উইথড্রলের পর প্রাপ্ত TxID / Hash দিন।", "Enter the blockchain transaction hash after sending.")}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">
                        {paymentGatewayTab === 'bdt'
                          ? t("প্রেরকের ফোন নম্বর / ব্যাংক একাউন্ট (ঐচ্ছিক)", "Sender Phone / Bank Account (Optional)")
                          : t("প্রেরকের ওয়ালেট বা বাইন্যান্স আইডি (ঐচ্ছিক)", "Sender Wallet or Binance UID (Optional)")}
                      </label>
                      <input
                        type="text"
                        value={senderAccountInfo}
                        onChange={(e) => setSenderAccountInfo(e.target.value)}
                        placeholder={paymentGatewayTab === 'bdt' ? 'e.g. 017XXXXXXXX or Account Name' : 'e.g. Txyz... or Binance UID'}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-emerald-500"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {t("এডমিনের দ্রুত ভেরিফিকেশনে সহায়তা করে।", "Helps admin verify your deposit instantly.")}
                      </span>
                    </div>
                  </div>

                  {/* PAYMENT PROOF SCREENSHOT UPLOAD */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/30 border-2 border-dashed border-emerald-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <label className="text-xs font-black text-slate-900 block">
                            {t("পেমেন্টের স্ক্রিনশট বা রসিদের ছবি আপলোড করুন *", "Upload Payment Proof Screenshot / Slip *")}
                          </label>
                          <p className="text-[11px] text-slate-500">
                            {t("বিকাশ, নগদ, ব্যাংক ডিপোজিট স্লিপ বা ক্রিপ্টো ট্রানজেকশনের স্পষ্ট স্ক্রিনশট দিন।", "Clear screenshot of mobile banking payment, bank deposit slip, or crypto confirmation.")}
                          </p>
                        </div>
                      </div>
                      {paymentScreenshot && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span>{t("স্ক্রিনশট সংযুক্ত ✓", "Attached ✓")}</span>
                        </span>
                      )}
                    </div>

                    {/* Upload or Preview Box */}
                    {!paymentScreenshot ? (
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-2xl cursor-pointer transition text-center group bg-white">
                        <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 transition mb-2" />
                        <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                          {t("ক্লিক করে স্ক্রিনশট ফাইল নির্বাচন করুন বা এখানে ড্রপ করুন", "Click to browse screenshot or drag and drop here")}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1">
                          {t("সমর্থিত ফরম্যাট: PNG, JPG, JPEG, WebP (সর্বোচ্চ ৮ মেগাবাইট)", "Supported formats: PNG, JPG, JPEG, WebP (Max 8MB)")}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotFileChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white rounded-2xl border border-emerald-200 shadow-xs">
                        <div className="relative group shrink-0">
                          <img
                            src={paymentScreenshot}
                            alt="Payment Slip Preview"
                            className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-slate-200 cursor-pointer shadow-xs"
                            onClick={() => setViewProofModalUrl(paymentScreenshot)}
                          />
                          <button
                            type="button"
                            onClick={() => setViewProofModalUrl(paymentScreenshot)}
                            className="absolute inset-0 bg-black/40 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          >
                            <ZoomIn className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex-1 space-y-1 text-center sm:text-left">
                          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                            <FileCheck className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-black text-slate-900">{t("পেমেন্ট স্লিপ সফলভাবে লোড হয়েছে", "Payment proof slip loaded")}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {t("এডমিন পেমেন্ট ভেরিফাই করার সময় এই স্ক্রিনশটটি দেখে দ্রুত অনুমোদন প্রদান করবেন।", "Admin will inspect this proof screenshot to release funds into escrow.")}
                          </p>
                          <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                            <button
                              type="button"
                              onClick={() => setViewProofModalUrl(paymentScreenshot)}
                              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{t("বড় করে দেখুন", "View Full Slip")}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentScreenshot('')}
                              className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>{t("মুছে ফেলুন / নতুন দিন", "Remove / Replace")}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submission Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-200">
                    <div className="text-xs text-slate-600">
                      <span className="block text-[11px] text-slate-500">{t("এস্ক্রো কাস্টডিতে মোট লক হবে:", "Total Locked into Escrow:")}</span>
                      <strong className="text-base text-slate-900 font-black">${order.totalAmount.toLocaleString()} USD</strong>
                      <span className="text-emerald-700 font-bold ml-1.5">
                        ({paymentGatewayTab === 'bdt' ? `৳${Math.round(order.totalAmount * (settings?.bdtConversionRate || 122)).toLocaleString()} BDT` : `${order.totalAmount.toLocaleString()} USDT`})
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={verifyingPayment}
                      onClick={handleVerifyPayment}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>
                        {verifyingPayment
                          ? t("ভেরিফাই হচ্ছে...", "Verifying Deposit...")
                          : t("পেমেন্ট নিশ্চিত ও এস্ক্রো ভল্টে লক করুন", "Submit & Lock in Escrow Vault")}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : order.paymentDetails ? (
            /* Confirmed Deposit Card inside Protocol */
            <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-emerald-900">
                      {t("ধাপ ১ সম্পন্ন: প্ল্যাটফর্ম এস্ক্রো কাস্টডি পেমেন্ট সুরক্ষিত ও লকড", "Step 1 Completed: Escrow Deposit Secured")}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">✓ {t("ভেরিফাইড", "Verified")}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5">
                    <span className="font-bold">{order.paymentDetails.method}</span> • TrxID: <span className="font-mono font-bold text-slate-900">{order.paymentDetails.transactionRef}</span>
                  </p>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    {t("টাকা সরাসরি প্ল্যাটফর্ম এডমিন ভল্টে নিরাপদে সংরক্ষিত রয়েছে — বিক্রেতার কাছে হস্তান্তর সম্পন্ন না হওয়া পর্যন্ত যাবে না।", "Funds are securely locked in Admin Escrow — will not reach seller until transfer is approved.")}
                  </p>
                </div>
              </div>
              {order.paymentDetails.screenshotUrl && (
                <button
                  type="button"
                  onClick={() => setViewProofModalUrl(order.paymentDetails!.screenshotUrl!)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shadow-xs shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t("রসিদ / স্ক্রিনশট দেখুন", "View Payment Proof")}</span>
                </button>
              )}
            </div>
          ) : (
            /* Pending deposit banner for seller / admin */
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-amber-900 block">
                  {t("ধাপ ১: বায়ারের এস্ক্রো ডিপোজিট অপেক্ষমাণ", "Step 1: Buyer Escrow Deposit Pending")}
                </span>
                <p className="text-[11px] text-amber-800">
                  {t("ক্রেতা এখনও এস্ক্রো ভল্টে ডিপোজিট সম্পন্ন করেননি। ডিপোজিট ভেরিফাই হলে পরবর্তী হ্যান্ডওভার ধাপ শুরু হবে।", "Buyer has not yet deposited funds into escrow. Handover steps will begin once deposit is locked.")}
                </p>
              </div>
            </div>
          )}

          {/* Stepper list */}
          <div className="space-y-4">
            {order.transferSteps.map((step) => {
              const localizedStep = getLocalizedOrderStep(step, language);
              return (
                <div
                  key={step.step}
                  className={`p-4 rounded-2xl border transition ${
                    step.completed
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          step.completed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {step.completed ? '✓' : step.step}
                      </div>
                      <div>
                        <h3
                          className={`text-sm font-bold ${
                            step.completed ? 'text-emerald-900' : 'text-slate-900'
                          }`}
                        >
                          {t(`ধাপ ${step.step}: `, `Step ${step.step}: `)}{localizedStep.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {localizedStep.description}
                        </p>
                        {step.completedAt && (
                          <span className="text-[10px] text-emerald-700 mt-1 block font-medium">
                            {t("সম্পন্ন হয়েছে: ", "Completed on ")}{new Date(step.completedAt).toLocaleString(language === 'BN' ? 'bn-BD' : 'en-US')}
                          </span>
                        )}
                      </div>
                    </div>

                  {/* Actions to complete milestone */}
                  {!step.completed && order.status !== 'completed' && order.status !== 'cancelled' && (
                    <div>
                      {/* Step 1: Buyer provides Email/Handle */}
                      {step.step === 1 && isBuyer && (
                        <form onSubmit={handleSaveGoogleEmail} className="flex gap-2">
                          <input
                            type="email"
                            required
                            value={inputGoogleEmail}
                            onChange={(e) => setInputGoogleEmail(e.target.value)}
                            placeholder="buyer.clean.email@gmail.com"
                            className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden"
                          />
                          <button
                            type="submit"
                            disabled={savingEmail}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                          >
                            {t("সংরক্ষণ", "Save")}
                          </button>
                        </form>
                      )}

                      {/* Step 2: Seller marks invite sent */}
                      {step.step === 2 && isSeller && (
                        <button
                          onClick={() => handleCompleteStep(2)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold whitespace-nowrap cursor-pointer shadow-xs"
                        >
                          {t("ইনভাইট পাঠানো হয়েছে", "Mark Invite Sent")}
                        </button>
                      )}

                      {/* Step 3: Buyer accepts invitation */}
                      {step.step === 3 && isBuyer && (
                        <button
                          onClick={() => handleCompleteStep(3)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold whitespace-nowrap cursor-pointer shadow-xs"
                        >
                          {t("ইনভাইট গ্রহণ নিশ্চিত করুন", "Confirm Accepted")}
                        </button>
                      )}

                      {/* Step 4: Cooldown confirmation */}
                      {step.step === 4 && (isBuyer || isSeller) && (
                        <button
                          onClick={() => handleCompleteStep(4)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold whitespace-nowrap cursor-pointer shadow-xs"
                        >
                          {t("কুলডাউন সময় শেষ হয়েছে", "Confirm Cooldown Elapsed")}
                        </button>
                      )}

                      {/* Step 5: Primary ownership reassigned */}
                      {step.step === 5 && isSeller && (
                        <button
                          onClick={() => handleCompleteStep(5)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold whitespace-nowrap cursor-pointer shadow-xs"
                        >
                          {t("প্রাইমারি ওনারশিপ প্রদান সম্পন্ন", "Confirm Promoted to Primary Owner")}
                        </button>
                      )}

                      {/* Step 6: Buyer releases funds */}
                      {step.step === 6 && isBuyer && (
                        <button
                          onClick={handleCompleteOrder}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider whitespace-nowrap shadow-sm cursor-pointer"
                        >
                          {t("প্রাইমারি ওনারশিপ নিশ্চিত ও পেমেন্ট রিলিজ", "Confirm Primary Ownership & Release Payout")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>

          {/* Final Release Callout if all transfer steps done */}
          {order.status === 'transfer_in_progress' && isBuyer && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-emerald-900">
                  {t("চূড়ান্ত পেমেন্ট নিষ্পত্তির জন্য প্রস্তুত?", "Ready for Final Settlement?")}
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  {t("একবার নিশ্চিত হলে যে আপনি একমাত্র প্রাইমারি ওনার, প্ল্যাটফর্মের টাকা সেলারের কাছে ছাড় দিন।", "Once you confirm that you are the sole Primary Owner, authorize platform payout.")}
                </p>
              </div>
              <button
                onClick={handleCompleteOrder}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition whitespace-nowrap shadow-xs cursor-pointer"
              >
                {t("সেলারকে টাকা রিলিজ করুন", "Release Payout to Seller")}
              </button>
            </div>
          )}

          {/* Completed Order Review Callout */}
          {order.status === 'completed' && isBuyer && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{t("লেনদেন সফলভাবে সম্পন্ন হয়েছে", "Transaction Successfully Settled")}</h4>
                <p className="text-xs text-slate-500">
                  {t(`কমিউনিটির সুরক্ষার জন্য সেলার ${order.sellerName}-এর উদ্দেশ্যে একটি রিভিউ প্রদান করুন।`, `Help the community by submitting a verified transaction review for ${order.sellerName}.`)}
                </p>
              </div>
              <button
                onClick={() => setReviewModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{t("রিভিউ দিন", "Leave Review")}</span>
              </button>
            </div>
          )}
        </div>

        {/* Dispute & Cancel Actions Bar */}
        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-600">
              {t("কোনো সমস্যা হলে বা পারমিশন পেতে অসুবিধা হলে ডিসপ্যুট ওপেন করতে পারেন", "Need assistance or encounter an issue with account permissions?")}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDisputeModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 text-xs font-semibold transition cursor-pointer"
              >
                {t("ডিসপ্যুট ওপেন করুন ও টাকা ফ্রিজ রাখুন", "Open Dispute & Freeze Funds")}
              </button>
            </div>
          </div>
        )}

        {/* In-Order Real-time Chat Box */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs flex flex-col h-[500px]">
          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-red-600" />
              <h3 className="text-xs font-bold text-slate-900">
                {t("অর্ডার ডিরেক্ট চ্যাট (বায়ার ও সেলার মেসেজিং)", "Order Direct Messages (Buyer & Seller Communication)")}
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {t("সুরক্ষিত অডিট চ্যানেল", "Audit-Protected Channel")}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map((m) => {
              const isMe = m.senderId === user?.id;
              const isSystem = m.senderId === 'system';

              if (isSystem) {
                return (
                  <div key={m.id} className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs">
                    <span className="text-red-600 font-bold text-[11px] block">{m.senderName}</span>
                    <p className="mt-0.5">{m.text}</p>
                  </div>
                );
              }

              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-500 mb-0.5 px-1 font-medium">
                    {isMe ? t('আপনি', 'You') : m.senderName} ({m.senderRole})
                  </span>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-xs leading-relaxed ${
                      isMe
                        ? 'bg-red-600 text-white rounded-tr-none shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={t("হ্যান্ডওভার বিষয়ে মেসেজ লিখুন (পাসওয়ার্ড শেয়ার করবেন না)...", "Message counterparty regarding account setup (no passwords)...")}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={sendingMsg || !chatInput.trim()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {t("পাঠান", "Send")}
            </button>
          </form>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        orderId={order.id}
        channelTitle={getLocalizedChannelTitle(channel || { title: order.channelTitle }, language)}
        sellerName={order.sellerName}
        onSuccess={() => {
          loadOrderData();
        }}
      />

      {/* Dispute Reason Modal */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white border border-red-200 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in text-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {t("আনুষ্ঠানিক ডিসপ্যুট আবেদন", "Open Formal Dispute")}
                </h3>
                <p className="text-xs text-slate-500">
                  {t("এটি কমপ্লায়েন্স আরবিট্রেশন নিষ্পত্তি না হওয়া পর্যন্ত পেমেন্ট রিলিজ স্থগিত রাখবে।", "This freezes all payout release until compliance arbitration resolves the matter.")}
                </p>
              </div>
            </div>

            <form onSubmit={handleRaiseDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("ডিসপ্যুটের বিস্তারিত কারণ", "Detailed Reason for Dispute")}
                </label>
                <textarea
                  required
                  rows={4}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder={t(
                    "যেমন: সেলার ৭২ ঘণ্টার মধ্যেও ইনভাইট পাঠাননি, অথবা কপিরাইট স্ট্রাইক পাওয়া গেছে...",
                    "e.g. Seller has not sent the account invite after 72 hours, or active copyright strike discovered..."
                  )}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  {t("বাতিল", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submittingDispute ? t("সাবমিট হচ্ছে...", "Submitting...") : t("ফ্রিজ ও ডিসপ্যুট ওপেন করুন", "Freeze & Open Dispute")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Proof Screenshot Lightbox Modal */}
      {viewProofModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                <span>{t('পেমেন্ট প্রুফ / ট্রানজেকশন স্ক্রিনশট', 'Payment Proof / Transaction Slip')}</span>
              </div>
              <button
                type="button"
                onClick={() => setViewProofModalUrl(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-2xl bg-slate-950 flex items-center justify-center p-2">
              <img
                src={viewProofModalUrl}
                alt="Payment Proof"
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
              <span>{t('প্ল্যাটফর্ম এস্ক্রো অডিট সিস্টেম', 'Platform Escrow Audit System')}</span>
              <button
                type="button"
                onClick={() => setViewProofModalUrl(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition cursor-pointer"
              >
                {t('বন্ধ করুন', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
