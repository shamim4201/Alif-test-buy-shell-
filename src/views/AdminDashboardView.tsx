import React, { useState, useEffect } from 'react';
import { AdminStats, ChannelListing, Order, User } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EvidenceModal } from '../components/EvidenceModal';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  DollarSign,
  TrendingUp,
  FileCheck,
  Scale,
  Lock,
  ExternalLink,
  Eye,
  BadgeCheck,
  Ban
} from 'lucide-react';

interface AdminDashboardViewProps {
  onSelectOrder: (orderId: string) => void;
  onSelectChannel: (channelId: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onSelectOrder,
  onSelectChannel
}) => {
  const { user, showToast } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [channels, setChannels] = useState<ChannelListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'approvals' | 'disputes' | 'users' | 'orders'>('approvals');
  const [loading, setLoading] = useState(true);

  // Evidence modal for inspecting channel proof
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedProof, setSelectedProof] = useState<{ screenshots: string[]; title: string }>({
    screenshots: [],
    title: ''
  });

  // Dispute resolution modal state
  const [resolvingOrder, setResolvingOrder] = useState<Order | null>(null);
  const [resolutionAction, setResolutionAction] = useState<'refund_buyer' | 'complete_order'>('refund_buyer');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submittingResolution, setSubmittingResolution] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, channelsRes, ordersRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getChannels({ status: 'all' }),
        api.getOrders(),
        api.getAdminUsers()
      ]);
      setStats(statsRes);
      setChannels(channelsRes.channels);
      setOrders(ordersRes.orders);
      setUsersList(usersRes.users);
    } catch (err: any) {
      showToast(err.message || 'Failed to load administration data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewListing = async (channelId: string, decision: 'approved' | 'rejected') => {
    const notes = prompt(`Enter review notes for seller (${decision}):`, decision === 'approved' ? 'Verified YouTube Studio analytics proof matches channel metrics.' : 'Analytics proof unclear or outdated.');
    if (notes === null) return;

    try {
      await api.reviewChannel(channelId, decision, notes);
      showToast(`Channel listing ${decision.toUpperCase()}`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Review failed', 'error');
    }
  };

  const handleToggleBan = async (userId: string) => {
    try {
      const res = await api.toggleUserBan(userId);
      showToast(res.message, 'info');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user', 'error');
    }
  };

  const handleToggleVerified = async (userId: string) => {
    try {
      const res = await api.toggleUserVerified(userId);
      showToast(res.message, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update badge', 'error');
    }
  };

  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingOrder) return;

    try {
      setSubmittingResolution(true);
      const res = await api.resolveDispute(resolvingOrder.id, resolutionAction, resolutionNotes);
      showToast(res.message, 'success');
      setResolvingOrder(null);
      setResolutionNotes('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to resolve dispute', 'error');
    } finally {
      setSubmittingResolution(false);
    }
  };

  const pendingApprovals = channels.filter((c) => c.verificationStatus === 'pending');
  const disputedOrders = orders.filter((o) => o.status === 'disputed');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Admin Header */}
      <div className="border-b border-slate-900 bg-slate-950/90 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-800 text-rose-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Compliance &amp; Moderation
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
                ChannelTrust Administration Control
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Approve verified channel listings, audit YouTube Brand Account transfers, and mediate disputes.
              </p>
            </div>
          </div>

          {/* KPI Dashboard */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Settled Volume</span>
                <p className="text-lg font-black text-white mt-0.5">${stats.totalVolume.toLocaleString()}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Platform Fees (5%)</span>
                <p className="text-lg font-black text-emerald-400 mt-0.5">${stats.totalFees.toLocaleString()}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Pending Listings</span>
                <p className="text-lg font-black text-amber-400 mt-0.5">{stats.pendingApprovalsCount}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Active Listings</span>
                <p className="text-lg font-black text-white mt-0.5">{stats.activeListings}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Active Disputes</span>
                <p className="text-lg font-black text-red-400 mt-0.5">{stats.disputedOrdersCount}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Registered Users</span>
                <p className="text-lg font-black text-blue-400 mt-0.5">{stats.totalUsers}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-900 bg-slate-950/60 sticky top-16 z-20 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'approvals'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Pending Listings ({pendingApprovals.length})
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'disputes'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4" />
            Dispute Arbitration ({disputedOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            User Access Control ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            All Orders Audit ({orders.length})
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Tab 1: Pending Listings Approvals */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-white">All Clear! No Pending Approvals</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  All submitted YouTube channel listings have been reviewed and approved or resolved.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((channel) => (
                  <div
                    key={channel.id}
                    className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-950 text-amber-400 border border-amber-800">
                            Pending Audit
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{channel.id}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mt-1">{channel.title}</h3>
                        <p className="text-xs text-slate-400 font-mono">
                          {channel.handle} •{' '}
                          <a
                            href={channel.channelUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-red-400 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Verify YouTube URL</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReviewListing(channel.id, 'approved')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve Listing
                        </button>
                        <button
                          onClick={() => handleReviewListing(channel.id, 'rejected')}
                          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject with Notes
                        </button>
                      </div>
                    </div>

                    {/* Channel stats to verify */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950 text-xs">
                      <div>
                        <span className="text-slate-500 block">Seller:</span>
                        <strong className="text-white">{channel.sellerName}</strong> ({channel.sellerEmail})
                      </div>
                      <div>
                        <span className="text-slate-500 block">Claimed Subs:</span>
                        <strong className="text-white">{channel.subscribers.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Claimed Revenue:</span>
                        <strong className="text-emerald-400">${channel.monthlyRevenue.toLocaleString()}/mo</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Asking Price:</span>
                        <strong className="text-white">${channel.askingPrice.toLocaleString()}</strong>
                      </div>
                    </div>

                    {/* Screenshots preview */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-300">
                          Submitted Studio Analytics Evidence ({channel.analyticsScreenshots.length} files):
                        </span>
                        {channel.analyticsScreenshots.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedProof({
                                screenshots: channel.analyticsScreenshots,
                                title: channel.title
                              });
                              setEvidenceModalOpen(true);
                            }}
                            className="text-xs text-red-400 hover:underline font-semibold"
                          >
                            Inspect Full Proof Lightbox →
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {channel.analyticsScreenshots.map((url, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setSelectedProof({
                                screenshots: channel.analyticsScreenshots,
                                title: channel.title
                              });
                              setEvidenceModalOpen(true);
                            }}
                            className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 cursor-pointer hover:border-red-500 transition"
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Dispute Resolution */}
        {activeTab === 'disputes' && (
          <div className="space-y-4">
            {disputedOrders.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No Active Disputes</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  All transactions are operating smoothly within the 7-day Brand Account transfer lifecycle.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 rounded-2xl bg-slate-900 border border-red-800/80 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-red-950 text-red-400 border border-red-800">
                            Arbitration Case
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{order.id}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mt-1">{order.channelTitle}</h3>
                        <p className="text-xs text-red-300 font-medium mt-1">
                          Dispute Reason: "{order.disputeReason}"
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Opened by {order.disputeRaisedBy?.toUpperCase()} on{' '}
                          {order.disputeRaisedAt ? new Date(order.disputeRaisedAt).toLocaleString() : ''}
                        </p>
                      </div>

                      <button
                        onClick={() => setResolvingOrder(order)}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition"
                      >
                        Arbitrate &amp; Resolve
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950 text-xs">
                      <div>
                        <span className="text-slate-500 block">Buyer:</span>
                        <strong className="text-white">{order.buyerName}</strong> ({order.buyerEmail})
                      </div>
                      <div>
                        <span className="text-slate-500 block">Seller:</span>
                        <strong className="text-white">{order.sellerName}</strong> ({order.sellerEmail})
                      </div>
                      <div>
                        <span className="text-slate-500 block">Frozen Custody:</span>
                        <strong className="text-emerald-400">${order.totalAmount.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Action Required:</span>
                        <strong className="text-amber-400">Admin Ruling Pending</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: User Access Control */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Verified Seller</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-semibold text-white flex items-center gap-2">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                          alt=""
                          className="w-7 h-7 rounded-full"
                        />
                        <span>{u.name}</span>
                      </td>
                      <td className="p-4 text-slate-400 font-mono">{u.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                            u.role === 'admin'
                              ? 'bg-rose-950 text-rose-400'
                              : u.role === 'seller'
                              ? 'bg-amber-950 text-amber-400'
                              : 'bg-blue-950 text-blue-400'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.role === 'seller' ? (
                          <button
                            onClick={() => handleToggleVerified(u.id)}
                            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                              u.isVerifiedSeller
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {u.isVerifiedSeller ? '✓ Verified' : 'Grant Badge'}
                          </button>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {u.isBanned ? (
                          <span className="text-red-400 font-bold">Suspended</span>
                        ) : (
                          <span className="text-emerald-400 font-medium">Active</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleBan(u.id)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                              u.isBanned
                                ? 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900'
                                : 'bg-red-950 text-red-300 hover:bg-red-900'
                            }`}
                          >
                            {u.isBanned ? 'Reinstate' : 'Suspend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: All Orders Audit */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                onClick={() => onSelectOrder(o.id)}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">{o.id}</span>
                    <span className="text-xs font-bold uppercase text-emerald-400">
                      {o.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">{o.channelTitle}</h4>
                  <p className="text-xs text-slate-400">
                    Buyer: {o.buyerName} • Seller: {o.sellerName} • Ref:{' '}
                    {o.paymentDetails?.transactionRef || 'Pending verification'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-white">
                    ${o.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Fee: ${o.platformFee.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evidence Lightbox */}
      <EvidenceModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        screenshots={selectedProof.screenshots}
        channelTitle={selectedProof.title}
      />

      {/* Dispute Resolution Arbitration Modal */}
      {resolvingOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-rose-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in text-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-white">Arbitrate Dispute: {resolvingOrder.id}</h3>
            <p className="text-xs text-slate-400">
              Dispute for <strong>{resolvingOrder.channelTitle}</strong> (${resolvingOrder.totalAmount.toLocaleString()} USD).
            </p>

            <form onSubmit={handleResolveDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Resolution Ruling
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolutionAction('refund_buyer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                      resolutionAction === 'refund_buyer'
                        ? 'bg-red-600/20 border-red-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Refund Buyer in Full
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolutionAction('complete_order')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                      resolutionAction === 'complete_order'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Release Payout to Seller
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Arbitration Findings &amp; Log Notes
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="State the findings based on YouTube Studio manager logs and message history..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingOrder(null)}
                  className="flex-1 py-2.5 bg-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResolution}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-50"
                >
                  {submittingResolution ? 'Executing...' : 'Enact Formal Ruling'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
