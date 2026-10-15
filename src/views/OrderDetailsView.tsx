import React, { useState, useEffect } from 'react';
import { Order, ChannelListing, User, Message } from '../types';
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
  Info,
  DollarSign
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
  const [loading, setLoading] = useState(true);

  // Payment confirmation form
  const [paymentMethod, setPaymentMethod] = useState('Platform Secured Wire / Card Custody');
  const [transactionRef, setTransactionRef] = useState('');
  const [verifyingPayment, setVerifyingPayment] = useState(false);

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
      const res = await api.getOrder(orderId);
      setOrder(res.order);
      setChannel(res.channel);
      setSeller(res.seller);
      setBuyer(res.buyer);
      setInputGoogleEmail(res.order.buyerGoogleEmail || '');
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

  // Buyer confirms mock payment
  const handleVerifyPayment = async () => {
    try {
      setVerifyingPayment(true);
      const res = await api.confirmPayment(order.id, {
        paymentMethod,
        transactionRef: transactionRef || `VAULT-${Date.now().toString().slice(-6)}`
      });
      setOrder(res.order);
      showToast(t('পেমেন্ট প্ল্যাটফর্ম এস্ক্রো কাস্টডিতে সুরক্ষিতভাবে সংরক্ষিত হয়েছে!', 'Payment secured into platform escrow custody!'), 'success');
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
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 my-2 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-bold text-slate-800">
                  <span>{t("মূল্য: ", "Price: ")}{formatPrice(order.amount)}</span>
                  <span className="text-amber-700">+ {t("চার্জ: ", "Fee: ")}{formatPrice(order.platformFee)}</span>
                  <span className="text-emerald-700">= {t("মোট: ", "Total: ")}{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5">
                <div className="flex justify-between">
                  <span>{t("নেট দাম:", "Net Price:")}</span>
                  <span className="text-slate-800 font-medium">{formatPrice(order.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("কাস্টডি ফি (৫%):", "Custody Fee (5%):")}</span>
                  <span className="text-amber-700 font-medium">+ {formatPrice(order.platformFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>{t("সর্বমোট এস্ক্রো পরিমাণ:", "Total Escrow Amount:")}</span>
                  <span className="text-emerald-700 font-bold">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="text-[10px] text-slate-500 text-right">
                  ≈ {currency === 'USD' ? formatBdt(order.totalAmount) : formatUsd(order.totalAmount)}
                </div>
              </div>
            </div>

            {order.paymentDetails?.verifiedByServer && (
              <div className="pt-3 border-t border-slate-200 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t("সার্ভার-ভেরিফাইড ডিপোজিট সুরক্ষিত", "Server-Verified Deposit Secured")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Verification Section if Pending */}
        {order.status === 'pending' && isBuyer && (
          <div className="bg-white border border-amber-300 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {t("সার্ভার-ভেরিফাইড পেমেন্ট কাস্টডি", "Server-Verified Payment Custody")}
                </h2>
                <p className="text-xs text-slate-500">
                  {t("সেলার হস্তান্তর শুরু করার আগে ক্রয়কৃত অর্থ প্ল্যাটফর্ম কাস্টডিতে নিশ্চিত করুন।", "Verify purchase funds into custody before the seller initiates account invitation.")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("পেমেন্ট মাধ্যম (Gateway / Method)", "Payment Routing & Escrow Gateway")}
                </label>
                <input
                  type="text"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("ট্রানজেকশন / রেফারেন্স কোড", "Transaction / Reference Code")}
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. TXN-WIRE-992019"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-600">
                {t("জমা করার মোট পরিমাণ: ", "Total to secure: ")}
                <strong className="text-slate-900">${order.totalAmount.toLocaleString()} USD</strong>
              </span>
              <button
                onClick={handleVerifyPayment}
                disabled={verifyingPayment}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {verifyingPayment ? t("যাচাই হচ্ছে...", "Verifying with Gateway...") : t("পেমেন্ট নিশ্চিত ও ভেরিফাই করুন", "Submit & Verify Payment")}
              </button>
            </div>
          </div>
        )}

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
    </div>
  );
};
