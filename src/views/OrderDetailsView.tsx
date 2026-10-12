import React, { useState, useEffect } from 'react';
import { Order, ChannelListing, User, Message } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ReviewModal } from '../components/ReviewModal';
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
      if (res.order.buyerGoogleEmail) {
        setInputGoogleEmail(res.order.buyerGoogleEmail);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadChat = async () => {
    try {
      const res = await api.getMessages({ orderId });
      setMessages(res.messages);
    } catch (e) {
      console.error(e);
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-center text-slate-300">
        <p>Order not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-800 rounded-xl text-white text-xs">
          Back
        </button>
      </div>
    );
  }

  const isBuyer = user?.id === order.buyerId;
  const isSeller = user?.id === order.sellerId;
  const isAdmin = user?.role === 'admin';

  // Server-side payment verification trigger
  const handleVerifyPayment = async () => {
    try {
      setVerifyingPayment(true);
      const res = await api.confirmPayment(order.id, {
        paymentMethod,
        transactionRef: transactionRef || undefined
      });
      setOrder(res.order);
      showToast('Payment verified by server. Funds secured in ChannelVault custody!', 'success');
      loadChat();
    } catch (err: any) {
      showToast(err.message || 'Server payment verification failed', 'error');
    } finally {
      setVerifyingPayment(false);
    }
  };

  // Update Buyer Google Email
  const handleSaveGoogleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputGoogleEmail.includes('@')) {
      showToast('Please enter a valid Google Account email', 'error');
      return;
    }
    try {
      setSavingEmail(true);
      const res = await api.setBuyerGoogleEmail(order.id, inputGoogleEmail);
      setOrder(res.order);
      showToast('Google account email saved for manager invite', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update email', 'error');
    } finally {
      setSavingEmail(false);
    }
  };

  // Advance transfer step
  const handleCompleteStep = async (stepNumber: number) => {
    try {
      const res = await api.updateTransferStep(order.id, stepNumber);
      setOrder(res.order);
      showToast(`Transfer step ${stepNumber} recorded as completed`, 'success');
      loadChat();
    } catch (err: any) {
      showToast(err.message || 'Failed to update step', 'error');
    }
  };

  // Buyer completes order & releases funds
  const handleCompleteOrder = async () => {
    if (!confirm('Are you sure you want to release the funds to the seller? Confirm only after you are verified as sole Primary Owner of the YouTube Brand Account.')) {
      return;
    }
    try {
      const res = await api.completeOrder(order.id);
      setOrder(res.order);
      showToast('Order completed! Seller payout released. You can now leave a review.', 'success');
      loadChat();
    } catch (err: any) {
      showToast(err.message || 'Failed to complete order', 'error');
    }
  };

  // Raise Dispute
  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim() || disputeReason.length < 10) {
      showToast('Please explain the dispute issue in detail (minimum 10 characters)', 'error');
      return;
    }
    try {
      setSubmittingDispute(true);
      const res = await api.raiseDispute(order.id, disputeReason);
      setOrder(res.order);
      showToast('Dispute opened. Payout is frozen and ChannelTrust arbitration team notified.', 'info');
      setDisputeModalOpen(false);
      loadChat();
    } catch (err: any) {
      showToast(err.message || 'Failed to raise dispute', 'error');
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
      showToast(err.message || 'Failed to send message', 'error');
    } finally {
      setSendingMsg(false);
    }
  };

  const getStatusBadge = () => {
    switch (order.status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">Pending Payment</span>;
      case 'payment_confirmed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-950 text-blue-400 border border-blue-800">Payment Confirmed</span>;
      case 'transfer_in_progress':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-950 text-purple-400 border border-purple-800">Brand Transfer in Progress</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">Completed &amp; Released</span>;
      case 'disputed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-950 text-red-400 border border-red-800">Under Arbitration Dispute</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">Cancelled</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Bar */}
      <div className="border-b border-slate-900 bg-slate-950/80 sticky top-16 z-30 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">Order ID: {order.id}</span>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Dispute Banner if Disputed */}
        {order.status === 'disputed' && (
          <div className="p-5 rounded-2xl bg-red-950/70 border border-red-800 text-red-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-300 text-sm">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Order Frozen: Active Dispute Arbitration in Progress</span>
            </div>
            <p className="text-xs text-red-200/90 leading-relaxed">
              <strong>Reason:</strong> {order.disputeReason}
            </p>
            <p className="text-[11px] text-red-300/80">
              Raised by {order.disputeRaisedBy?.toUpperCase()} on{' '}
              {order.disputeRaisedAt ? new Date(order.disputeRaisedAt).toLocaleString() : ''}. A platform compliance officer is auditing the channel permissions and messages.
            </p>
            {order.disputeResolution && (
              <div className="mt-2 p-3 rounded-xl bg-slate-950/80 text-white text-xs border border-red-700">
                <strong>Arbitration Ruling:</strong> {order.disputeResolution}
              </div>
            )}
          </div>
        )}

        {/* Order Header Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              YouTube Channel Acquisition
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {order.channelTitle}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {order.channelHandle} •{' '}
              <a
                href={order.channelUrl}
                target="_blank"
                rel="noreferrer"
                className="text-red-400 hover:underline inline-flex items-center gap-1"
              >
                <span>View YouTube Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>

            <div className="flex flex-wrap gap-4 pt-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block">Buyer:</span>
                <strong className="text-white">{order.buyerName}</strong> ({order.buyerEmail})
              </div>
              <div>
                <span className="text-slate-500 block">Seller:</span>
                <strong className="text-white">{order.sellerName}</strong> ({order.sellerEmail})
              </div>
              {order.buyerGoogleEmail && (
                <div>
                  <span className="text-slate-500 block">Google Account for Invite:</span>
                  <strong className="text-emerald-400">{order.buyerGoogleEmail}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                আর্থিক হিসাব (Financial Summary)
              </span>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 my-2">
                <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-bold text-slate-200">
                  <span>মূল্য: ${order.amount.toLocaleString()}</span>
                  <span className="text-amber-400">+ চার্জ: ${order.platformFee.toLocaleString()}</span>
                  <span className="text-emerald-400">= মোট: ${order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <div className="flex justify-between">
                  <span>Channel Net Price:</span>
                  <span className="text-slate-300">${order.amount.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between">
                  <span>Marketplace Custody Fee (5%):</span>
                  <span className="text-amber-400">+ ${order.platformFee.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
                  <span>Total Escrow Amount:</span>
                  <span className="text-emerald-400">${order.totalAmount.toLocaleString()} USD</span>
                </div>
              </div>
            </div>

            {order.paymentDetails?.verifiedByServer && (
              <div className="pt-3 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Server-Verified Deposit Secured</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Verification Section if Pending */}
        {order.status === 'pending' && isBuyer && (
          <div className="bg-slate-900 border border-amber-800/60 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Server-Verified Payment Custody</h2>
                <p className="text-xs text-slate-400">
                  Verify purchase funds into ChannelVault custody before the seller initiates Brand Account invitation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Routing &amp; Escrow Gateway
                </label>
                <input
                  type="text"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Transaction / Wire Reference Code
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. TXN-WIRE-992019"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Total to secure: <strong>${order.totalAmount.toLocaleString()} USD</strong>
              </span>
              <button
                onClick={handleVerifyPayment}
                disabled={verifyingPayment}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs uppercase tracking-wider transition disabled:opacity-50"
              >
                {verifyingPayment ? 'Verifying with Gateway...' : 'Submit & Verify Payment'}
              </button>
            </div>
          </div>
        )}

        {/* Transfer Milestone Checklist */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Google Brand Account Transfer Protocol
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Compliance milestone progression mandated by Google's 7-day security model.
              </p>
            </div>
            <button
              onClick={() => onOpenLegal('safety')}
              className="text-xs text-red-400 hover:text-red-300 underline font-semibold"
            >
              Step-by-step Transfer Guide
            </button>
          </div>

          {/* Stepper list */}
          <div className="space-y-4">
            {order.transferSteps.map((step) => (
              <div
                key={step.step}
                className={`p-4 rounded-2xl border transition ${
                  step.completed
                    ? 'bg-emerald-950/20 border-emerald-800/40'
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        step.completed
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {step.completed ? '✓' : step.step}
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-bold ${
                          step.completed ? 'text-emerald-300' : 'text-white'
                        }`}
                      >
                        Step {step.step}: {step.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {step.description}
                      </p>
                      {step.completedAt && (
                        <span className="text-[10px] text-emerald-400/80 mt-1 block">
                          Completed on {new Date(step.completedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions to complete milestone */}
                  {!step.completed && order.status !== 'completed' && order.status !== 'cancelled' && (
                    <div>
                      {/* Step 1: Buyer provides Google Email */}
                      {step.step === 1 && isBuyer && (
                        <form onSubmit={handleSaveGoogleEmail} className="flex gap-2">
                          <input
                            type="email"
                            required
                            value={inputGoogleEmail}
                            onChange={(e) => setInputGoogleEmail(e.target.value)}
                            placeholder="buyer.clean.email@gmail.com"
                            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                          />
                          <button
                            type="submit"
                            disabled={savingEmail}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                          >
                            Save
                          </button>
                        </form>
                      )}

                      {/* Step 2: Seller marks Manager invite sent */}
                      {step.step === 2 && isSeller && (
                        <button
                          onClick={() => handleCompleteStep(2)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold whitespace-nowrap"
                        >
                          Mark Invite Sent in YouTube Studio
                        </button>
                      )}

                      {/* Step 3: Buyer accepts invitation */}
                      {step.step === 3 && isBuyer && (
                        <button
                          onClick={() => handleCompleteStep(3)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold whitespace-nowrap"
                        >
                          Confirm Accepted in Gmail
                        </button>
                      )}

                      {/* Step 4: 7-day cooldown confirmation */}
                      {step.step === 4 && (isBuyer || isSeller) && (
                        <button
                          onClick={() => handleCompleteStep(4)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold whitespace-nowrap"
                        >
                          Confirm 7-Day Cooldown Elapsed
                        </button>
                      )}

                      {/* Step 5: Primary ownership reassigned */}
                      {step.step === 5 && isSeller && (
                        <button
                          onClick={() => handleCompleteStep(5)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold whitespace-nowrap"
                        >
                          Confirm Promoted to Primary Owner
                        </button>
                      )}

                      {/* Step 6: Buyer releases funds */}
                      {step.step === 6 && isBuyer && (
                        <button
                          onClick={handleCompleteOrder}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider whitespace-nowrap shadow-lg shadow-emerald-600/30"
                        >
                          Confirm Primary Ownership &amp; Release Payout
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Final Release Callout if all transfer steps done */}
          {order.status === 'transfer_in_progress' && isBuyer && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">Ready for Final Settlement?</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Once you confirm that you are the sole Primary Owner in YouTube Studio, authorize platform payout.
                </p>
              </div>
              <button
                onClick={handleCompleteOrder}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition whitespace-nowrap shadow-lg shadow-emerald-600/30"
              >
                Release Payout to Seller
              </button>
            </div>
          )}

          {/* Completed Order Review Callout */}
          {order.status === 'completed' && isBuyer && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Transaction Successfully Settled</h4>
                <p className="text-xs text-slate-400">
                  Help the community by submitting a verified transaction review for {order.sellerName}.
                </p>
              </div>
              <button
                onClick={() => setReviewModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                Leave Review
              </button>
            </div>
          )}
        </div>

        {/* Dispute & Cancel Actions Bar */}
        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">
              Need assistance or encounter an issue with YouTube permissions?
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDisputeModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-800 text-red-300 text-xs font-semibold transition"
              >
                Open Dispute &amp; Freeze Funds
              </button>
            </div>
          </div>
        )}

        {/* In-Order Real-time Chat Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
          <div className="px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-red-400" />
              <h3 className="text-xs font-bold text-white">
                Order Direct Messages (Buyer &amp; Seller Communication)
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Audit-Protected Channel
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/60">
            {messages.map((m) => {
              const isMe = m.senderId === user?.id;
              const isSystem = m.senderId === 'system';

              if (isSystem) {
                return (
                  <div key={m.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    <span className="text-red-400 font-bold text-[11px] block">{m.senderName}</span>
                    <p className="mt-0.5">{m.text}</p>
                  </div>
                );
              }

              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1">
                    {isMe ? 'You' : m.senderName} ({m.senderRole})
                  </span>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-xs leading-relaxed ${
                      isMe
                        ? 'bg-red-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5 px-1">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Message counterparty regarding YouTube Brand Account setup (no passwords)..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={sendingMsg || !chatInput.trim()}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        orderId={order.id}
        channelTitle={order.channelTitle}
        sellerName={order.sellerName}
        onSuccess={() => {
          loadOrderData();
        }}
      />

      {/* Dispute Reason Modal */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-red-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in text-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Open Formal Dispute</h3>
                <p className="text-xs text-slate-400">
                  This freezes all payout release until compliance arbitration resolves the matter.
                </p>
              </div>
            </div>

            <form onSubmit={handleRaiseDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Detailed Reason for Dispute
                </label>
                <textarea
                  required
                  rows={4}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="e.g. Seller has not sent the YouTube Brand Account Manager invite after 72 hours, or active copyright strike discovered..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {submittingDispute ? 'Submitting...' : 'Freeze & Open Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
