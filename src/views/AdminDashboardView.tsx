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
      setChannels(channelsRes.channels || []);
      setOrders(ordersRes.orders || []);
      setUsersList(usersRes.users || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load administration data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewListing = async (channelId: string, status: 'approved' | 'rejected') => {
    try {
      await api.reviewChannel(channelId, status);
      showToast(`Listing marked as ${status}`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update channel status', 'error');
    }
  };

  const handleToggleVerified = async (userId: string) => {
    try {
      await api.toggleUserVerified(userId);
      showToast('Seller verified status updated', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle verification', 'error');
    }
  };

  const handleToggleBan = async (userId: string) => {
    try {
      await api.toggleUserBan(userId);
      showToast('User status updated', 'info');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user', 'error');
    }
  };

  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingOrder) return;
    try {
      setSubmittingResolution(true);
      await api.resolveDispute(resolvingOrder.id, resolutionAction, resolutionNotes);
      showToast(`Dispute resolved with action: ${resolutionAction}`, 'success');
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* Admin Header */}
      <div className="border-b border-slate-200 bg-white py-8 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Compliance &amp; Moderation
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                ChannelTrust Administration Control
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Approve verified channel listings, audit account transfers, and mediate disputes.
              </p>
            </div>
          </div>

          {/* KPI Dashboard */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 block font-medium">Settled Volume</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">${stats.totalVolume.toLocaleString()}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 block font-medium">Platform Fees (5%)</span>
                <p className="text-lg font-black text-emerald-600 mt-0.5">${stats.totalFees.toLocaleString()}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 block font-medium">Pending Listings</span>
                <p className="text-lg font-black text-amber-600 mt-0.5">{stats.pendingApprovalsCount}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 block font-medium">Active Listings</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">{stats.activeListings}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 block font-medium">Active Disputes</span>
                <p className="text-lg font-black text-red-600 mt-0.5">{stats.disputedOrdersCount}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 block font-medium">Registered Users</span>
                <p className="text-lg font-black text-blue-600 mt-0.5">{stats.totalUsers}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white sticky top-16 z-20 backdrop-blur-xs shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'approvals'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Pending Listings ({pendingApprovals.length})
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'disputes'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4" />
            Dispute Arbitration ({disputedOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            User Access Control ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
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
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3 shadow-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">All Clear! No Pending Approvals</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  All submitted account listings have been reviewed and approved or resolved.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((channel) => (
                  <div
                    key={channel.id}
                    className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                            Pending Audit
                          </span>
                          <span className="text-xs text-slate-500 font-mono">{channel.id}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">{channel.title}</h3>
                        <p className="text-xs text-slate-500 font-mono">
                          {channel.handle} •{' '}
                          <a
                            href={channel.channelUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-red-600 hover:underline inline-flex items-center gap-1 font-semibold"
                          >
                            <span>Verify URL</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReviewListing(channel.id, 'approved')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve Listing
                        </button>
                        <button
                          onClick={() => handleReviewListing(channel.id, 'rejected')}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject with Notes
                        </button>
                      </div>
                    </div>

                    {/* Stats to verify */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-500 block">Seller:</span>
                        <strong className="text-slate-900">{channel.sellerName}</strong> ({channel.sellerEmail})
                      </div>
                      <div>
                        <span className="text-slate-500 block">Claimed Subs/Followers:</span>
                        <strong className="text-slate-900">{channel.subscribers.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Claimed Revenue:</span>
                        <strong className="text-emerald-600">${channel.monthlyRevenue.toLocaleString()}/mo</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Asking Price:</span>
                        <strong className="text-slate-900">${channel.askingPrice.toLocaleString()}</strong>
                      </div>
                    </div>

                    {/* Screenshots preview */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-700">
                          Submitted Analytics Evidence ({channel.analyticsScreenshots.length} files):
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
                            className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
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
                            className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:border-red-500 transition"
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
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3 shadow-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Active Disputes</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  All transactions are operating smoothly within the transfer lifecycle.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 rounded-2xl bg-white border border-red-200 space-y-4 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                            Arbitration Case
                          </span>
                          <span className="text-xs text-slate-500 font-mono">{order.id}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">{order.channelTitle}</h3>
                        <p className="text-xs text-red-700 font-medium mt-1">
                          Dispute Reason: "{order.disputeReason}"
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Opened by {order.disputeRaisedBy?.toUpperCase()} on{' '}
                          {order.disputeRaisedAt ? new Date(order.disputeRaisedAt).toLocaleString() : ''}
                        </p>
                      </div>

                      <button
                        onClick={() => setResolvingOrder(order)}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs"
                      >
                        Arbitrate &amp; Resolve
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-500 block">Buyer:</span>
                        <strong className="text-slate-900">{order.buyerName}</strong> ({order.buyerEmail})
                      </div>
                      <div>
                        <span className="text-slate-500 block">Seller:</span>
                        <strong className="text-slate-900">{order.sellerName}</strong> ({order.sellerEmail})
                      </div>
                      <div>
                        <span className="text-slate-500 block">Frozen Custody:</span>
                        <strong className="text-emerald-700 font-bold">${order.totalAmount.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Action Required:</span>
                        <strong className="text-amber-700 font-bold">Admin Ruling Pending</strong>
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
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Verified Seller</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70">
                      <td className="p-4 font-semibold text-slate-900 flex items-center gap-2">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                          alt=""
                          className="w-7 h-7 rounded-full border border-slate-200"
                        />
                        <span>{u.name}</span>
                      </td>
                      <td className="p-4 text-slate-500 font-mono">{u.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                            u.role === 'admin'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : u.role === 'seller'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.role === 'seller' ? (
                          <button
                            onClick={() => handleToggleVerified(u.id)}
                            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                              u.isVerifiedSeller
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {u.isVerifiedSeller ? '✓ Verified' : 'Grant Badge'}
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {u.isBanned ? (
                          <span className="text-red-600 font-bold">Suspended</span>
                        ) : (
                          <span className="text-emerald-700 font-medium">Active</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleBan(u.id)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                              u.isBanned
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
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
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">{o.id}</span>
                    <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {o.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{o.channelTitle}</h4>
                  <p className="text-xs text-slate-500">
                    Buyer: {o.buyerName} • Seller: {o.sellerName} • Ref:{' '}
                    {o.paymentDetails?.transactionRef || 'Pending verification'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white border border-red-200 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in text-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Arbitrate Dispute: {resolvingOrder.id}</h3>
            <p className="text-xs text-slate-500">
              Dispute for <strong>{resolvingOrder.channelTitle}</strong> (${resolvingOrder.totalAmount.toLocaleString()} USD).
            </p>

            <form onSubmit={handleResolveDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Resolution Ruling
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolutionAction('refund_buyer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      resolutionAction === 'refund_buyer'
                        ? 'bg-red-50 border-red-500 text-red-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Refund Buyer in Full
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolutionAction('complete_order')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      resolutionAction === 'complete_order'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Release Payout to Seller
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Arbitration Findings &amp; Log Notes
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="State the findings based on manager logs and message history..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingOrder(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResolution}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
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
