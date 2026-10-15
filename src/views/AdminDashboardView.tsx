import React, { useState, useEffect } from 'react';
import {
  AdminStats,
  ChannelListing,
  Order,
  User,
  Transaction,
  WebsiteSettings,
  AdminAuditLog,
  SupportTicket,
  Coupon,
  FraudAlert,
  NotificationItem
} from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { getLocalizedChannelTitle, ORDER_STATUS_TRANSLATIONS, ROLE_TRANSLATIONS } from '../translations/translations';
import { EvidenceModal } from '../components/EvidenceModal';
import { CategoryLogo, PlatformLogo } from '../components/CategoryIcons';
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
  Ban,
  Settings,
  ShieldCheck,
  BarChart3,
  Ticket,
  Bell,
  Search,
  Filter,
  Plus,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  ArrowUpRight,
  Clock,
  Send,
  Sparkles,
  CreditCard,
  UserCheck,
  HelpCircle,
  AlertOctagon,
  Percent,
  Check
} from 'lucide-react';

interface AdminDashboardViewProps {
  onSelectOrder: (orderId: string) => void;
  onSelectChannel: (channelId: string) => void;
}

type TabType =
  | 'overview'
  | 'channels'
  | 'users'
  | 'orders'
  | 'payments'
  | 'disputes'
  | 'settings'
  | 'security'
  | 'reports'
  | 'coupons'
  | 'notifications'
  | 'tickets'
  | 'fraud';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onSelectOrder,
  onSelectChannel
}) => {
  const { user, showToast } = useAuth();
  const { currency, formatPrice, language, t } = useCurrency();

  // Core Data States
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [channels, setChannels] = useState<ChannelListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settingsData, setSettingsData] = useState<WebsiteSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'buyer' | 'seller' | 'admin' | 'banned'>('all');
  const [channelSearch, setChannelSearch] = useState('');
  const [channelStatusFilter, setChannelStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'payment_confirmed' | 'transfer_in_progress' | 'completed' | 'disputed' | 'cancelled'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);

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

  // Support Ticket reply modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [submittingTicketReply, setSubmittingTicketReply] = useState(false);

  // New Coupon modal
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    minOrderAmount: 200,
    maxDiscount: 50,
    usageLimit: 50,
    validUntil: '2026-12-31'
  });

  // New Broadcast Notification modal
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    targetAudience: 'all' as 'all' | 'buyers' | 'sellers',
    type: 'info' as 'info' | 'warning' | 'urgent' | 'promo'
  });

  // Settings form saving
  const [savingSettings, setSavingSettings] = useState(false);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [
        statsRes,
        channelsRes,
        ordersRes,
        usersRes,
        txRes,
        settingsRes,
        auditRes,
        ticketsRes,
        couponsRes,
        fraudRes,
        notifRes
      ] = await Promise.all([
        api.getAdminStats(),
        api.getChannels({ status: 'all' }),
        api.getOrders(),
        api.getAdminUsers(),
        api.getAdminTransactions().catch(() => ({ transactions: [] })),
        api.getWebsiteSettings().catch(() => ({ settings: null })),
        api.getAdminAuditLogs().catch(() => ({ logs: [] })),
        api.getAdminTickets().catch(() => ({ tickets: [] })),
        api.getAdminCoupons().catch(() => ({ coupons: [] })),
        api.getAdminFraudAlerts().catch(() => ({ alerts: [] })),
        api.getAdminNotifications().catch(() => ({ notifications: [] }))
      ]);

      setStats(statsRes);
      setChannels(channelsRes.channels || []);
      setOrders(ordersRes.orders || []);
      setUsersList(usersRes.users || []);
      setTransactions(txRes.transactions || []);
      setSettingsData(settingsRes.settings || null);
      setAuditLogs(auditRes.logs || []);
      setTickets(ticketsRes.tickets || []);
      setCoupons(couponsRes.coupons || []);
      setFraudAlerts(fraudRes.alerts || []);
      setNotifications(notifRes.notifications || []);
    } catch (err: any) {
      showToast(err.message || t('অ্যাডমিন ডাটা লোড করতে ব্যর্থ হয়েছে', 'Failed to load administration data'), 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Action: Review Channel (Approve / Reject)
  const handleReviewListing = async (channelId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      await api.reviewChannel(channelId, status, notes);
      showToast(
        t(`লিস্টিংটি ${status === 'approved' ? 'অনুমোদিত' : 'বাতিল'} করা হয়েছে`, `Listing marked as ${status}`),
        'success'
      );
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('চ্যানেল স্ট্যাটাস আপডেট ব্যর্থ হয়েছে', 'Failed to update channel status'), 'error');
    }
  };

  // Action: Toggle Featured Channel
  const handleToggleFeatured = async (channelId: string) => {
    try {
      await api.toggleChannelFeatured(channelId);
      showToast(t('ফিচার্ড স্ট্যাটাস আপডেট হয়েছে', 'Featured status updated'), 'success');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('আপডেট ব্যর্থ হয়েছে', 'Failed to update featured flag'), 'error');
    }
  };

  // Action: Toggle Channel Active / Paused Status
  const handleToggleChannelStatus = async (channelId: string) => {
    try {
      await api.toggleChannelStatus(channelId);
      showToast(t('চ্যানেল ভিজিবিলিটি আপডেট হয়েছে', 'Channel visibility status updated'), 'success');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('আপডেট ব্যর্থ হয়েছে', 'Failed to update channel status'), 'error');
    }
  };

  // Action: Delete Channel (Fake / Duplicate)
  const handleDeleteChannel = async (channelId: string, title: string) => {
    if (!window.confirm(t(`আপনি কি নিশ্চিত যে "${title}" চ্যানেল লিস্টিংটি স্থায়ীভাবে মুছে ফেলতে চান?`, `Are you sure you want to permanently delete "${title}"?`))) {
      return;
    }
    try {
      await api.deleteAdminChannel(channelId);
      showToast(t('ভুয়া/ডুপ্লিকেট লিস্টিং সরানো হয়েছে', 'Listing removed permanently'), 'success');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('মুছে ফেলতে সমস্যা হয়েছে', 'Failed to delete listing'), 'error');
    }
  };

  // Action: User Ban / Unban
  const handleToggleBan = async (userId: string) => {
    try {
      const res = await api.toggleUserBan(userId);
      showToast(res.message || t('ব্যবহারকারীর স্ট্যাটাস পরিবর্তিত হয়েছে', 'User status updated'), 'info');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('ইউজার আপডেট ব্যর্থ হয়েছে', 'Failed to update user'), 'error');
    }
  };

  // Action: User KYC / Verified Badge
  const handleToggleVerified = async (userId: string) => {
    try {
      const res = await api.toggleUserVerified(userId);
      showToast(res.message || t('সেলার ভেরিফিকেশন স্ট্যাটাস আপডেট হয়েছে', 'Seller verified status updated'), 'success');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('ভেরিফিকেশন পরিবর্তন ব্যর্থ হয়েছে', 'Failed to toggle verification'), 'error');
    }
  };

  // Action: User Role Change
  const handleUpdateRole = async (userId: string, newRole: 'buyer' | 'seller' | 'admin') => {
    try {
      await api.updateUserRole(userId, newRole);
      showToast(t(`ব্যবহারকারীর রোল "${newRole}" করা হয়েছে`, `User role changed to ${newRole}`), 'success');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('রোল পরিবর্তন ব্যর্থ হয়েছে', 'Failed to update role'), 'error');
    }
  };

  // Action: Dispute Resolution
  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingOrder) return;
    try {
      setSubmittingResolution(true);
      await api.resolveDispute(resolvingOrder.id, resolutionAction, resolutionNotes);
      showToast(t('বিরোধ সফলভাবে নিষ্পত্তি করা হয়েছে', `Dispute resolved with action: ${resolutionAction}`), 'success');
      setResolvingOrder(null);
      setResolutionNotes('');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('বিরোধ নিষ্পত্তি ব্যর্থ হয়েছে', 'Failed to resolve dispute'), 'error');
    } finally {
      setSubmittingResolution(false);
    }
  };

  // Action: Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsData) return;
    try {
      setSavingSettings(true);
      await api.updateWebsiteSettings(settingsData);
      showToast(t('ওয়েবসাইট সেটিংস সফলভাবে সংরক্ষিত হয়েছে', 'Website settings updated successfully'), 'success');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('সেটিংস সংরক্ষণে ব্যর্থ হয়েছে', 'Failed to save settings'), 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Action: Support Ticket Reply
  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;
    try {
      setSubmittingTicketReply(true);
      const res = await api.replyAdminTicket(selectedTicket.id, ticketReplyText.trim());
      showToast(t('সাপোর্ট রিপ্লাই পাঠানো হয়েছে', 'Support response sent successfully'), 'success');
      setSelectedTicket(res.ticket);
      setTicketReplyText('');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('রিপ্লাই পাঠাতে ব্যর্থ হয়েছে', 'Failed to send reply'), 'error');
    } finally {
      setSubmittingTicketReply(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const res = await api.updateTicketStatus(ticketId, status);
      showToast(t(`টিকেট স্ট্যাটাস "${status}" করা হয়েছে`, `Ticket marked as ${status}`), 'success');
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(res.ticket);
      }
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('টিকেট স্ট্যাটাস আপডেট ব্যর্থ হয়েছে', 'Failed to update status'), 'error');
    }
  };

  // Action: Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminCoupon(couponForm);
      showToast(t(`কুপন "${couponForm.code.toUpperCase()}" তৈরি করা হয়েছে`, 'Coupon created successfully'), 'success');
      setCouponModalOpen(false);
      setCouponForm({
        code: '',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 200,
        maxDiscount: 50,
        usageLimit: 50,
        validUntil: '2026-12-31'
      });
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('কুপন তৈরি ব্যর্থ হয়েছে', 'Failed to create coupon'), 'error');
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!window.confirm(t(`আপনি কি কুপন ${code} মুছে ফেলতে চান?`, `Delete coupon ${code}?`))) return;
    try {
      await api.deleteAdminCoupon(id);
      showToast(t('কুপন মুছে ফেলা হয়েছে', 'Coupon deleted'), 'success');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('কুপন মুছতে ব্যর্থ হয়েছে', 'Failed to delete coupon'), 'error');
    }
  };

  // Action: Resolve Fraud Alert
  const handleResolveFraudAlert = async (id: string) => {
    try {
      await api.resolveAdminFraudAlert(id);
      showToast(t('ফ্রড অ্যালার্ট নিষ্পন্ন হিসেবে চিহ্নিত করা হয়েছে', 'Fraud alert marked resolved'), 'success');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('ফ্রড অ্যালার্ট নিষ্পন্ন করতে ব্যর্থ হয়েছে', 'Failed to resolve alert'), 'error');
    }
  };

  // Action: Create Notification
  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminNotification(broadcastForm);
      showToast(t('সাইটওয়াইড নোটিফিকেশন ব্রডকাস্ট সফল হয়েছে', 'Notification broadcast published'), 'success');
      setBroadcastModalOpen(false);
      setBroadcastForm({
        title: '',
        message: '',
        targetAudience: 'all',
        type: 'info'
      });
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('নোটিফিকেশন তৈরি ব্যর্থ হয়েছে', 'Failed to publish notification'), 'error');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await api.deleteAdminNotification(id);
      showToast(t('নোটিফিকেশন সরানো হয়েছে', 'Notification removed'), 'success');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('নোটিফিকেশন মুছতে ব্যর্থ হয়েছে', 'Failed to remove notification'), 'error');
    }
  };

  // Action: Backup Export & Restore
  const handleExportBackup = async () => {
    try {
      const data = await api.exportAdminBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alif_trust_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(t('নিরাপদ ব্যাকআপ ফাইল ডাউনলোড সম্পন্ন হয়েছে', 'Database backup downloaded successfully'), 'success');
    } catch (err: any) {
      showToast(err.message || t('ব্যাকআপ ডাউনলোড ব্যর্থ হয়েছে', 'Failed to export backup'), 'error');
    }
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await api.restoreAdminBackup(json);
        showToast(t('ডাটাবেজ সফলভাবে রিস্টোর করা হয়েছে', 'Database restored successfully'), 'success');
        loadData(true);
      } catch (err: any) {
        showToast(err.message || t('ব্যাকআপ ফাইল অকার্যকর বা ত্রুটিপূর্ণ', 'Invalid backup file'), 'error');
      }
    };
    reader.readAsText(file);
  };

  // Filtering Logic
  const pendingApprovals = channels.filter((c) => c.verificationStatus === 'pending');
  const disputedOrders = orders.filter((o) => o.status === 'disputed');
  const activeEscrowOrders = orders.filter((o) => o.status === 'payment_confirmed' || o.status === 'transfer_in_progress');

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (userRoleFilter === 'banned') return !!u.isBanned;
    if (userRoleFilter !== 'all') return u.role === userRoleFilter;
    return true;
  });

  const filteredChannels = channels.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(channelSearch.toLowerCase()) ||
      c.handle.toLowerCase().includes(channelSearch.toLowerCase()) ||
      c.sellerName.toLowerCase().includes(channelSearch.toLowerCase()) ||
      c.niche.toLowerCase().includes(channelSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (channelStatusFilter !== 'all') return c.verificationStatus === channelStatusFilter;
    return true;
  });

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all') return o.status === orderStatusFilter;
    return true;
  });

  const filteredTransactions = transactions.filter((tx) => {
    if (paymentFilter !== 'all') return tx.status === paymentFilter;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
      {/* 1. TOP ADMIN CONTROL HEADER */}
      <div className="border-b border-slate-200 bg-white py-6 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>{t('আলিফ ট্রাস্ট সুপার অ্যাডমিন কনসোল', 'Alif Trust Super Admin Console')}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t('এসক্রো ভল্ট সক্রিয়', 'Escrow Vault Active')}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                {t('প্ল্যাটফর্ম প্রশাসন ও এসক্রো আরবিট্রেশন প্যানেল', 'Platform Governance & Escrow Arbitration Control')}
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                {t(
                  'চ্যানেল লিস্টিং যাচাই, ওনারশিপ হস্তান্তর ট্র্যাকিং, ব্যবহারকারী নিয়ন্ত্রণ, বিরোধ নিষ্পত্তি ও স্বয়ংক্রিয় প্ল্যাটফর্ম কমিশন পরিচালনা করুন।',
                  'Verify listings, audit ownership transfers, regulate users, mediate escrow disputes, and oversee transactions.'
                )}
              </p>
            </div>

            {/* Quick Header Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                title={t('ডাটা রিফ্রেশ করুন', 'Refresh Data')}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-rose-600' : ''}`} />
                <span>{refreshing ? t('লোড হচ্ছে...', 'Syncing...') : t('রিফ্রেশ', 'Sync')}</span>
              </button>

              <button
                onClick={handleExportBackup}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('ব্যাকআপ ডাউনলোড', 'Export DB')}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs">
                <span className="text-[11px] text-slate-500 block font-semibold">{t('মোট লেনদেন (GMV)', 'Settled GMV Volume')}</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">${stats.totalVolume.toLocaleString()}</p>
                <span className="text-[10px] text-emerald-600 font-bold">100% {t('সুরক্ষিত এসক্রো', 'Protected Escrow')}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 shadow-2xs">
                <span className="text-[11px] text-emerald-800 block font-semibold">{t('প্ল্যাটফর্ম কমিশন (৫%)', 'Platform Net Fees')}</span>
                <p className="text-lg font-black text-emerald-700 mt-0.5">${stats.totalFees.toLocaleString()}</p>
                <span className="text-[10px] text-emerald-600 font-semibold">{t('সরাসরি প্ল্যাটফর্ম লাভ', 'Platform Revenue')}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs cursor-pointer hover:bg-amber-100/70 transition" onClick={() => setActiveTab('channels')}>
                <span className="text-[11px] text-amber-800 block font-semibold">{t('অনুমোদন অপেক্ষমাণ', 'Pending Approvals')}</span>
                <p className="text-lg font-black text-amber-700 mt-0.5">{stats.pendingApprovalsCount}</p>
                <span className="text-[10px] text-amber-600 font-bold">{t('পর্যালোচনা প্রয়োজন', 'Requires Review')} →</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-2xs cursor-pointer hover:bg-rose-100/70 transition" onClick={() => setActiveTab('disputes')}>
                <span className="text-[11px] text-rose-800 block font-semibold">{t('চলমান বিরোধ', 'Active Disputes')}</span>
                <p className="text-lg font-black text-rose-700 mt-0.5">{stats.disputedOrdersCount}</p>
                <span className="text-[10px] text-rose-600 font-bold">{t('আরবিট্রেশন সেন্টার', 'Arbitration Center')} →</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-2xs cursor-pointer hover:bg-blue-100/70 transition" onClick={() => setActiveTab('users')}>
                <span className="text-[11px] text-blue-800 block font-semibold">{t('নিবন্ধিত ইউজার', 'Total Members')}</span>
                <p className="text-lg font-black text-blue-700 mt-0.5">{stats.totalUsers}</p>
                <span className="text-[10px] text-blue-600 font-semibold">{stats.sellersCount} {t('সেলার', 'sellers')} / {stats.buyersCount} {t('বায়ার', 'buyers')}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 shadow-2xs cursor-pointer hover:bg-purple-100/70 transition" onClick={() => setActiveTab('tickets')}>
                <span className="text-[11px] text-purple-800 block font-semibold">{t('সাপোর্ট টিকিট', 'Helpdesk Tickets')}</span>
                <p className="text-lg font-black text-purple-700 mt-0.5">{stats.openTicketsCount || tickets.filter(t => t.status !== 'closed').length}</p>
                <span className="text-[10px] text-purple-600 font-bold">{t('ওপেন রিকোয়েস্ট', 'Open inquiries')} →</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. DYNAMIC ADMIN TABS (Categorized & Scrollable) */}
      <div className="border-b border-slate-200 bg-white sticky top-16 z-20 backdrop-blur-md shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 sm:gap-4 overflow-x-auto py-2.5 scrollbar-none text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-rose-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t('১. ড্যাশবোর্ড ওভারভিউ', '1. Overview')}</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-rose-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('২. ইউজার ম্যানেজমেন্ট', '2. User Management')}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 ml-0.5">
                {usersList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('channels')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'channels'
                  ? 'bg-rose-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>{t('৩. চ্যানেল লিস্টিং', '3. Channel Listings')}</span>
              {pendingApprovals.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white animate-pulse">
                  {pendingApprovals.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-rose-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>{t('৪. অর্ডার ও হস্তান্তর', '4. Orders & Transfer')}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 ml-0.5">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-rose-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{t('৫. পেমেন্ট ও কমিশন', '5. Payments & Escrow')}</span>
            </button>

            <button
              onClick={() => setActiveTab('disputes')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'disputes'
                  ? 'bg-rose-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>{t('৬. বিরোধ ও আরবিট্রেশন', '6. Dispute & Refund')}</span>
              {disputedOrders.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-600 text-white font-black animate-bounce">
                  {disputedOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-rose-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{t('৭. ওয়েবসাইট সেটিংস', '7. Website Settings')}</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-rose-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('৮. নিরাপত্তা ও রোল', '8. Security & Roles')}</span>
            </button>

            {/* Advanced Section Divider */}
            <span className="h-6 w-px bg-slate-300 self-center shrink-0 mx-1" />

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                  : 'text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{t('রিপোর্ট ও অ্যানালিটিক্স', 'Reports & Analytics')}</span>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'coupons'
                  ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                  : 'text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>{t('কুপন ও অফার', 'Coupons')}</span>
              <span className="text-[10px] px-1 py-0.2 rounded-full bg-indigo-200 text-indigo-900 ml-0.5">
                {coupons.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                  : 'text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>{t('নোটিফিকেশন সেন্টার', 'Notifications')}</span>
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'tickets'
                  ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                  : 'text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>{t('সাপোর্ট টিকেট', 'Support Tickets')}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-200 text-indigo-900 ml-0.5">
                {tickets.filter(t => t.status !== 'closed').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('fraud')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'fraud'
                  ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                  : 'text-rose-700 bg-rose-50/70 hover:bg-rose-100'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              <span>{t('ফ্রড মনিটরিং শিল্ড', 'Fraud Monitoring')}</span>
              {fraudAlerts.filter(a => !a.resolved).length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-600 text-white animate-pulse">
                  {fraudAlerts.filter(a => !a.resolved).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* ============================================================== */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Quick Banner Alert if disputes or pending approvals */}
            {(pendingApprovals.length > 0 || disputedOrders.length > 0) && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-950">
                      {t('মনোযোগ প্রয়োজন: পেন্ডিং টাস্ক রিকোয়েস্ট', 'Action Required: Pending Platform Requests')}
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      {t(
                        `${pendingApprovals.length} টি চ্যানেল অনুমোদন অপেক্ষমাণ এবং ${disputedOrders.length} টি অর্ডার ডিস্পিউট আরবিট্রেশন সেন্টারে মীমাংসা চাচ্ছে।`,
                        `${pendingApprovals.length} channels awaiting audit and ${disputedOrders.length} orders need mediation.`
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {pendingApprovals.length > 0 && (
                    <button
                      onClick={() => setActiveTab('channels')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      {t('লিস্টিং দেখুন', 'Review Listings')}
                    </button>
                  )}
                  {disputedOrders.length > 0 && (
                    <button
                      onClick={() => setActiveTab('disputes')}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      {t('বিরোধ নিষ্পত্তি', 'Resolve Disputes')}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Quick Action Shortcuts Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('channels')}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-rose-400 hover:shadow-md transition text-left cursor-pointer group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-3">{t('চ্যানেল যাচাইকরণ', 'Verify Listings')}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{t('নতুন আপলোড অনুমোদন বা বাতিল করুন', 'Audit & approve channels')}</p>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition text-left cursor-pointer group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-3">{t('সেলার ভেরিফিকেশন', 'Seller Badges')}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{t('NID/KYC যাচাই ও ব্যাজ প্রদান', 'Regulate accounts & badges')}</p>
              </button>

              <button
                onClick={() => setActiveTab('disputes')}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition text-left cursor-pointer group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-3">{t('এসক্রো তহবিল নিয়ন্ত্রণ', 'Escrow Vault')}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{t('পেমেন্ট হোল্ড ও বিক্রেতার পাওনা', 'Manage hold & releases')}</p>
              </button>

              <button
                onClick={() => setBroadcastModalOpen(true)}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition text-left cursor-pointer group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
                  <Bell className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-3">{t('ব্রডকাস্ট নোটিশ', 'Broadcast Alert')}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{t('সকল ইউজারকে জরুরি মেসেজ পাঠান', 'Send announcement banner')}</p>
              </button>
            </div>

            {/* Two Column Layout: Recent Orders & Recent Audit Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Active & Recent Orders */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-rose-600" />
                    <h3 className="font-bold text-sm text-slate-900">{t('সাম্প্রতিক অর্ডার ও এসক্রো ট্র্যাকিং', 'Recent Orders in Escrow')}</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    {t('সকল দেখুন', 'View All')} →
                  </button>
                </div>

                <div className="divide-y divide-slate-100 mt-2">
                  {orders.slice(0, 5).map((ord) => (
                    <div key={ord.id} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 truncate">{ord.channelTitle}</span>
                          <span className="text-[10px] font-mono text-slate-400">#{ord.id}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {t('ক্রেতা:', 'Buyer:')} <span className="font-medium text-slate-700">{ord.buyerName}</span> • {t('বিক্রেতা:', 'Seller:')} <span className="font-medium text-slate-700">{ord.sellerName}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-xs text-slate-900 block">${ord.amount.toLocaleString()}</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                          ord.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ord.status === 'disputed'
                            ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {ORDER_STATUS_TRANSLATIONS[ord.status]?.[language] || ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Audit Logs */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-sm text-slate-900">{t('অ্যাডমিন অ্যাক্টিভিটি অডিট লগ', 'Admin Action Audit Log')}</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('security')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    {t('পূর্ণাঙ্গ লগ', 'Full Trail')} →
                  </button>
                </div>

                <div className="divide-y divide-slate-100 mt-2">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="py-3.5 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-800">{log.action}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-mono">
                            {log.targetType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{log.details}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{log.adminName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: USER MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            {/* Search and Filters Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('নাম, ইমেইল বা ইউজার আইডি দিয়ে সার্চ করুন...', 'Search by name, email, or user ID...')}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {(['all', 'seller', 'buyer', 'admin', 'banned'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setUserRoleFilter(role)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition capitalize cursor-pointer shrink-0 ${
                      userRoleFilter === role
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {role === 'all'
                      ? t('সকল ইউজার', 'All Users')
                      : role === 'banned'
                      ? t('সাময়িক স্থগিত', 'Suspended')
                      : role === 'seller'
                      ? t('বিক্রেতা', 'Sellers')
                      : role === 'buyer'
                      ? t('ক্রেতা', 'Buyers')
                      : t('অ্যাডমিন', 'Admins')}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">{t('ব্যবহারকারী / প্রোফাইল', 'User Profile')}</th>
                      <th className="px-4 py-3.5">{t('রোল ও রোল পরিবর্তন', 'Role & Hierarchy')}</th>
                      <th className="px-4 py-3.5">{t('ভেরিফিকেশন স্ট্যাটাস', 'KYC Status')}</th>
                      <th className="px-4 py-3.5">{t('রেটিং ও লেনদেন', 'Deals & Rating')}</th>
                      <th className="px-4 py-3.5">{t('নিবন্ধন তারিখ', 'Joined')}</th>
                      <th className="px-5 py-3.5 text-right">{t('অ্যাকশন ও নিয়ন্ত্রণ', 'Action Controls')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`}
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover bg-slate-100 border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate flex items-center gap-1.5">
                                {u.name}
                                {u.isVerifiedSeller && (
                                  <BadgeCheck className="w-4 h-4 text-blue-600 shrink-0" title={t('যাচাইকৃত সেলার', 'Verified Seller')} />
                                )}
                              </span>
                              <span className="text-[11px] text-slate-400 block truncate font-mono">{u.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value as any)}
                            disabled={u.email === 'admin@channeltrust.com'}
                            className="text-xs font-bold rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 focus:outline-none focus:border-rose-500 cursor-pointer disabled:opacity-50"
                          >
                            <option value="buyer">{t('ক্রেতা (Buyer)', 'Buyer')}</option>
                            <option value="seller">{t('বিক্রেতা (Seller)', 'Seller')}</option>
                            <option value="admin">{t('অ্যাডমিন (Admin)', 'Admin')}</option>
                          </select>
                        </td>

                        <td className="px-4 py-3.5">
                          {u.isVerifiedSeller ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                              <BadgeCheck className="w-3 h-3" />
                              {t('যাচাইকৃত (KYC Verified)', 'Verified')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-semibold">
                              {t('অযাচাইকৃত', 'Standard')}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-slate-600">
                          <span className="font-bold text-slate-900">★ {u.rating || 5.0}</span>
                          <span className="text-[11px] text-slate-400 block">{u.dealsCount || 0} {t('সফল ডিল', 'deals')}</span>
                        </td>

                        <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {/* Toggle KYC Verified Badge */}
                          <button
                            onClick={() => handleToggleVerified(u.id)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                              u.isVerifiedSeller
                                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                            title={u.isVerifiedSeller ? t('ভেরিফাইড ব্যাজ বাতিল', 'Revoke Verified Badge') : t('ভেরিফাইড ব্যাজ দিন', 'Grant Verified Badge')}
                          >
                            <BadgeCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Suspend / Ban */}
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleBan(u.id)}
                              className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                                u.isBanned
                                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                              }`}
                              title={u.isBanned ? t('স্থগিতাদেশ প্রত্যাহার', 'Unban User') : t('অ্যাকাউন্ট স্থগিত করুন', 'Suspend Account')}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* View Profile Detail */}
                          <button
                            onClick={() => setSelectedUserDetail(u)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                            title={t('ইউজারের তথ্য ও ইতিহাস দেখুন', 'Inspect Activity')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: CHANNEL LISTINGS MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === 'channels' && (
          <div className="space-y-6 animate-fade-in">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('চ্যানেলের নাম, হ্যান্ডেল বা সেলার নাম দিয়ে সার্চ করুন...', 'Search listings by title, handle, or seller...')}
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setChannelStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition capitalize cursor-pointer shrink-0 ${
                      channelStatusFilter === st
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all'
                      ? t('সকল লিস্টিং', 'All Channels')
                      : st === 'pending'
                      ? t('অনুমোদন অপেক্ষমাণ', 'Pending Approvals')
                      : st === 'approved'
                      ? t('অনুমোদিত সক্রিয়', 'Approved Active')
                      : t('বাতিলকৃত', 'Rejected')}
                  </button>
                ))}
              </div>
            </div>

            {/* Channels Grid / List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="p-5">
                    {/* Header: Platform & Verification Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <PlatformLogo platform={channel.platform || 'youtube'} className="w-4 h-4" />
                        <span className="text-[11px] font-bold text-slate-600 capitalize">
                          {channel.platform || 'YouTube'}
                        </span>
                        <CategoryLogo categoryId={channel.accountType || ''} className="w-3.5 h-3.5" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        {channel.isFeatured && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-2xs">
                            <Sparkles className="w-2.5 h-2.5" />
                            Featured
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          channel.verificationStatus === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : channel.verificationStatus === 'rejected'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                        }`}>
                          {channel.verificationStatus}
                        </span>
                      </div>
                    </div>

                    {/* Title & Link */}
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
                      {channel.title}
                    </h3>
                    <a
                      href={channel.channelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 font-mono mt-0.5"
                    >
                      <span>{channel.handle}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    {/* Core Channel Stats */}
                    <div className="grid grid-cols-3 gap-2 py-3.5 my-3 border-y border-slate-100 text-center">
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block font-medium">{t('সাবস্ক্রাইবার', 'Followers')}</span>
                        <span className="text-xs font-bold text-slate-900">
                          {channel.subscribers >= 1000
                            ? (channel.subscribers / 1000).toFixed(1) + 'K'
                            : channel.subscribers}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block font-medium">{t('মাসিক আয়', 'Mo. Revenue')}</span>
                        <span className="text-xs font-bold text-emerald-600">${channel.monthlyRevenue}/mo</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block font-medium">{t('বিক্রয়মূল্য', 'Asking Price')}</span>
                        <span className="text-xs font-black text-rose-600">${channel.askingPrice}</span>
                      </div>
                    </div>

                    {/* Monetization & Strikes Compliance */}
                    <div className="space-y-1 text-[11px] text-slate-600 mb-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('মনিটাইজেশন অবস্থা:', 'Monetization:')}</span>
                        <span className="font-bold text-slate-800 capitalize">{channel.monetizationStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('কপিরাইট স্ট্রাইক:', 'Strike Status:')}</span>
                        <span className={`font-bold ${channel.strikeStatus === 'clean' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {channel.strikeStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('বিক্রেতা (Seller):', 'Seller:')}</span>
                        <span className="font-bold text-slate-800 truncate">{channel.sellerName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                    {/* View Proof & Evidence Button */}
                    <button
                      onClick={() => {
                        setSelectedProof({
                          screenshots: channel.analyticsScreenshots || [],
                          title: channel.title
                        });
                        setEvidenceModalOpen(true);
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('অ্যানালিটিক্স ও প্রমাণপত্র যাচাই করুন', 'Inspect Proof & Analytics')} ({channel.analyticsScreenshots?.length || 0})</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {channel.verificationStatus === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleReviewListing(channel.id, 'approved')}
                            className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t('অনুমোদন করুন', 'Approve')}</span>
                          </button>
                          <button
                            onClick={() => handleReviewListing(channel.id, 'rejected')}
                            className="flex-1 py-1.5 px-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{t('বাতিল করুন', 'Reject')}</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleToggleFeatured(channel.id)}
                            className={`flex-1 py-1.5 px-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                              channel.isFeatured
                                ? 'bg-amber-50 border-amber-300 text-amber-800'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>{channel.isFeatured ? t('Unfeature', 'Unfeature') : t('Feature', 'Feature')}</span>
                          </button>

                          <button
                            onClick={() => handleToggleChannelStatus(channel.id)}
                            className="flex-1 py-1.5 px-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>{channel.status === 'active' ? t('Pause', 'Pause') : t('Activate', 'Activate')}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteChannel(channel.id, channel.title)}
                            className="p-1.5 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition cursor-pointer"
                            title={t('ভুয়া/ডুপ্লিকেট লিস্টিং সরান', 'Delete Listing')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: ORDER MANAGEMENT & TRANSFER AUDIT */}
        {/* ============================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-700">{t('অর্ডার স্ট্যাটাস ফিল্টার:', 'Filter by Status:')}</span>
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {(['all', 'pending', 'payment_confirmed', 'transfer_in_progress', 'completed', 'disputed', 'cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition capitalize cursor-pointer shrink-0 ${
                      orderStatusFilter === st
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all'
                      ? t('সকল অর্ডার', 'All')
                      : ORDER_STATUS_TRANSLATIONS[st]?.[language] || st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">{t('অর্ডার আইডি ও চ্যানেল', 'Order ID & Channel')}</th>
                      <th className="px-4 py-3.5">{t('ক্রেতা ও বিক্রেতা', 'Buyer & Seller')}</th>
                      <th className="px-4 py-3.5">{t('মূল্য ও প্ল্যাটফর্ম ফি', 'Amount & Net Fee')}</th>
                      <th className="px-4 py-3.5">{t('এসক্রো ও পেমেন্ট স্ট্যাটাস', 'Escrow Payment')}</th>
                      <th className="px-4 py-3.5">{t('হস্তান্তর অগ্রগতি (Step)', 'Transfer Progress')}</th>
                      <th className="px-5 py-3.5 text-right">{t('অ্যাকশন', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredOrders.map((ord) => {
                      const completedSteps = ord.transferSteps?.filter(s => s.completed).length || 0;
                      const totalSteps = ord.transferSteps?.length || 5;

                      return (
                        <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-5 py-3.5">
                            <span className="font-bold text-slate-900 block">{ord.channelTitle}</span>
                            <span className="text-[11px] font-mono text-slate-400">#{ord.id}</span>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="text-xs">
                              <span className="font-semibold text-slate-800">{ord.buyerName}</span>
                              <span className="text-[10px] text-slate-400 block truncate">{ord.buyerEmail}</span>
                            </div>
                            <div className="text-xs mt-1">
                              <span className="font-semibold text-slate-800">{ord.sellerName}</span>
                              <span className="text-[10px] text-slate-400 block truncate">{ord.sellerEmail}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="font-black text-slate-900 block">${ord.amount.toLocaleString()}</span>
                            <span className="text-[10px] text-emerald-600 font-bold block">
                              +${ord.platformFee} {t('কমিশন ফি', 'Fee')}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : ord.status === 'disputed'
                                ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {ORDER_STATUS_TRANSLATIONS[ord.status]?.[language] || ord.status}
                            </span>
                            {ord.paymentDetails && (
                              <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                                {ord.paymentDetails.method} • {ord.paymentDetails.transactionRef}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-slate-600">
                                {completedSteps}/{totalSteps}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => onSelectOrder(ord.id)}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                            >
                              {t('অর্ডার বিস্তারিত', 'Inspect Order')}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: PAYMENT & COMMISSION MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Cards: Escrow Balance, Fee Revenue & Calculator */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">{t('এসক্রো তহবিলে মোট টাকা', 'Total Escrow Balance')}</span>
                <p className="text-3xl font-black text-slate-900 mt-2">
                  ${orders.filter(o => o.status === 'payment_confirmed' || o.status === 'transfer_in_progress').reduce((s, o) => s + o.amount, 0).toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {t('৭ দিনের ওনারশিপ ট্রায়াল শেষ হলে বিক্রেতাদের অ্যাকাউন্টে রিলিজ হবে।', 'Held safely in escrow until 7-day primary owner audit completes.')}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">{t('প্ল্যাটফর্মের অর্জিত কমিশন', 'Earned Commission Fees')}</span>
                <p className="text-3xl font-black text-emerald-600 mt-2">
                  ${stats?.totalFees.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {t(`বর্তমান কমিশন হার: ${settingsData?.commissionRate || 5}%`, `Current Commission Rate: ${settingsData?.commissionRate || 5}%`)}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xs">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">{t('বিক্রেতার নিট পাওনা ফর্মুলা', 'Net Seller Payout Formula')}</span>
                <p className="text-sm font-bold text-slate-200 mt-2">
                  {t('বিক্রয়মূল্য - ৫% প্ল্যাটফর্ম ফি = নিট পেআউট', 'Gross Amount - 5% Escrow Fee = Net Payout')}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{t('পেমেন্ট গেটওয়েসমূহ:', 'Supported Gateways:')}</span>
                  <span className="font-mono text-emerald-400 font-bold">bKash, Nagad, Bank, USDT</span>
                </div>
              </div>
            </div>

            {/* Transactions Log */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">{t('সকল এসক্রো ও পেআউট ট্রানজ্যাকশন', 'Escrow & Payout Transactions Ledger')}</h3>
                <div className="flex items-center gap-2">
                  {(['all', 'success', 'pending', 'failed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setPaymentFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize cursor-pointer transition ${
                        paymentFilter === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">{t('ট্রানজ্যাকশন আইডি ও রেফারেন্স', 'Tx ID & Ref')}</th>
                      <th className="px-4 py-3.5">{t('ইউজার ও রোল', 'User & Role')}</th>
                      <th className="px-4 py-3.5">{t('ধরন', 'Type')}</th>
                      <th className="px-4 py-3.5">{t('পরিমাণ ($)', 'Amount')}</th>
                      <th className="px-4 py-3.5">{t('পেমেন্ট মেথড', 'Method / Gateway')}</th>
                      <th className="px-4 py-3.5">{t('স্ট্যাটাস', 'Status')}</th>
                      <th className="px-5 py-3.5 text-right">{t('তারিখ', 'Date')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3.5 font-mono">
                          <span className="font-bold text-slate-900 block">{tx.transactionRef}</span>
                          <span className="text-[10px] text-slate-400">{tx.id}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-slate-800 block">{tx.userName}</span>
                          <span className="text-[10px] text-slate-400 capitalize">{tx.userRole}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold capitalize">
                            {tx.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-black text-slate-900">
                          ${tx.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-700">
                          {tx.paymentProvider || tx.paymentMethod}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            tx.status === 'success'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : tx.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-[11px] text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: DISPUTE & REFUND CENTER */}
        {/* ============================================================== */}
        {activeTab === 'disputes' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-rose-950">
                    {t('আলিফ ট্রাস্ট নিরপেক্ষ এসক্রো আরবিট্রেশন সেন্টার', 'Alif Trust Neutral Escrow Arbitration Center')}
                  </h3>
                  <p className="text-xs text-rose-800 mt-0.5">
                    {t(
                      'উভয় পক্ষের প্রমাণ ও চ্যাট নিরীক্ষা করে নিরাপদ রিফান্ড প্রদান অথবা বিক্রেতার একাউন্টে পেমেন্ট রিলিজ করুন।',
                      'Review evidence, chat transcripts, and release escrow funds or issue a full refund to the buyer.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {disputedOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 mt-3">
                  {t('কোনো চলমান বিরোধ নেই!', 'No Open Disputes!')}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  {t('প্ল্যাটফর্মের সকল লেনদেন সুচারুভাবে পরিচালিত হচ্ছে এবং কোনো পেন্ডিং অভিযোগ নেই।', 'All orders are operating smoothly with zero active disputes.')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputedOrders.map((ord) => (
                  <div key={ord.id} className="bg-white rounded-2xl border border-red-200 p-6 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider">
                            {t('চলমান বিরোধ (Active Dispute)', 'Active Dispute')}
                          </span>
                          <span className="text-xs font-mono text-slate-400">#{ord.id}</span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base mt-1">{ord.channelTitle}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {t('অভিযোগকারী:', 'Raised By:')} <span className="font-bold text-slate-700 capitalize">{ord.disputeRaisedBy || 'Buyer'}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">{t('এসক্রো তহবিল:', 'Locked Escrow:')}</span>
                        <span className="text-xl font-black text-rose-600">${ord.amount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="p-4 my-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="font-bold text-slate-800 block mb-1">{t('বিরোধের কারণ ও অভিযোগ:', 'Dispute Grounds:')}</span>
                      <p className="text-slate-600 leading-relaxed">{ord.disputeReason || t('কোনো বিস্তারিত কারণ উল্লেখ করা হয়নি।', 'No dispute description provided.')}</p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => onSelectOrder(ord.id)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                      >
                        {t('চ্যাট ও প্রমাণ দেখুন', 'Audit Chat & Evidence')}
                      </button>

                      <button
                        onClick={() => {
                          setResolvingOrder(ord);
                          setResolutionAction('refund_buyer');
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                      >
                        {t('নিষ্পত্তি ও সিদ্ধান্ত রেকর্ড করুন', 'Arbitrate & Resolve')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: WEBSITE SETTINGS */}
        {/* ============================================================== */}
        {activeTab === 'settings' && settingsData && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">{t('প্ল্যাটফর্ম জেনারেল সেটিংস ও পলিসি', 'Platform Settings & Policies')}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{t('ওয়েবসাইটের নাম, কমিশন ফি, যোগাযোগ ও আইনি চুক্তি হালনাগাদ করুন।', 'Manage branding, fees, contact info, and legal policies.')}</p>
              </div>
              <button
                type="submit"
                form="settingsForm"
                disabled={savingSettings}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{savingSettings ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('পরিবর্তন সংরক্ষণ করুন', 'Save Settings')}</span>
              </button>
            </div>

            <form id="settingsForm" onSubmit={handleSaveSettings} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('ওয়েবসাইটের নাম', 'Site Name')}</label>
                  <input
                    type="text"
                    value={settingsData.siteName}
                    onChange={(e) => setSettingsData({ ...settingsData, siteName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('ওয়েবসাইটের ট্যাগলাইন', 'Site Tagline')}</label>
                  <input
                    type="text"
                    value={settingsData.siteTagline}
                    onChange={(e) => setSettingsData({ ...settingsData, siteTagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('প্ল্যাটফর্ম কমিশন (%)', 'Commission Rate (%)')}</label>
                  <input
                    type="number"
                    value={settingsData.commissionRate}
                    onChange={(e) => setSettingsData({ ...settingsData, commissionRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('ফিচার্ড লিস্টিং ফি ($)', 'Featured Fee ($)')}</label>
                  <input
                    type="number"
                    value={settingsData.featuredListingFee}
                    onChange={(e) => setSettingsData({ ...settingsData, featuredListingFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('সর্বনিম্ন লিস্টিং মূল্য ($)', 'Min Listing Price ($)')}</label>
                  <input
                    type="number"
                    value={settingsData.minimumListingPrice}
                    onChange={(e) => setSettingsData({ ...settingsData, minimumListingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('বিকাশ মার্চেন্ট নম্বর', 'bKash Merchant')}</label>
                  <input
                    type="text"
                    value={settingsData.bkashMerchantNumber}
                    onChange={(e) => setSettingsData({ ...settingsData, bkashMerchantNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('নগদ মার্চেন্ট নম্বর', 'Nagad Merchant')}</label>
                  <input
                    type="text"
                    value={settingsData.nagadMerchantNumber}
                    onChange={(e) => setSettingsData({ ...settingsData, nagadMerchantNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('অফিসিয়াল ব্যাংক একাউন্ট বিস্তারিত', 'Official Bank Details')}</label>
                <input
                  type="text"
                  value={settingsData.bankDetails}
                  onChange={(e) => setSettingsData({ ...settingsData, bankDetails: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Legal Policies Content */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm">{t('আইনি নীতিমালা ও রিফান্ড চুক্তি', 'Legal Terms & Refund Protocols')}</h4>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('Terms of Service (ব্যবহারের শর্তাবলী)', 'Terms of Service')}</label>
                  <textarea
                    rows={3}
                    value={settingsData.termsOfService}
                    onChange={(e) => setSettingsData({ ...settingsData, termsOfService: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t('Refund Policy (রিফান্ড নীতিমালা)', 'Refund Policy')}</label>
                  <textarea
                    rows={3}
                    value={settingsData.refundPolicy}
                    onChange={(e) => setSettingsData({ ...settingsData, refundPolicy: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 8: SECURITY & ADMIN ROLES */}
        {/* ============================================================== */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            {/* 2FA & Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{t('টু-ফ্যাক্টর অথেনটিকেশন (2FA)', 'Two-Factor Authentication')}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{t('সকল অ্যাডমিন ও বিক্রেতাদের জন্য বাধ্যতামূলক 2FA', 'Enforce 2FA for all administrative accounts')}</p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{t('2FA পলিসি এনফোর্সমেন্ট:', '2FA Enforcement:')}</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    {t('সক্রিয় (Active)', 'Active Enforced')}
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{t('ডাটাবেজ ব্যাকআপ ও রিস্টোর', 'Database Backup & Disaster Recovery')}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{t('সম্পূর্ণ এনক্রিপ্টেড ডাটাবেজ ব্যাকআপ সংরক্ষণ করুন', 'Export JSON snapshots and import securely')}</p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
                  <button
                    onClick={handleExportBackup}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('ব্যাকআপ এক্সপোর্ট', 'Export Backup')}</span>
                  </button>

                  <label className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t('রিস্টোর ফাইল', 'Restore DB')}</span>
                    <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">{t('সম্পূর্ণ অ্যাডমিন কার্যক্রমের হিস্ট্রি (Activity Log)', 'Comprehensive Audit Trail Log')}</h3>
                <span className="text-xs text-slate-500 font-mono">{auditLogs.length} {t('টি রেকর্ড সংরক্ষিত', 'records')}</span>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold sticky top-0">
                    <tr>
                      <th className="px-5 py-3.5">{t('তারিখ ও সময়', 'Timestamp')}</th>
                      <th className="px-4 py-3.5">{t('অ্যাডমিন', 'Admin')}</th>
                      <th className="px-4 py-3.5">{t('অ্যাকশন', 'Action Taken')}</th>
                      <th className="px-4 py-3.5">{t('টার্গেট টাইপ ও আইডি', 'Target Entity')}</th>
                      <th className="px-5 py-3.5">{t('বিস্তারিত বিবরণ', 'Event Details')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-slate-900 font-bold whitespace-nowrap">
                          {log.adminName}
                        </td>
                        <td className="px-4 py-3 text-rose-600 font-bold whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {log.targetType} ({log.targetId})
                        </td>
                        <td className="px-5 py-3 text-slate-700 font-sans">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ADVANCED TAB: REPORTS & ANALYTICS */}
        {/* ============================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-fade-in">
            {/* High Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-400 block font-semibold">{t('মোট লেনদেন (GMV)', 'Total Gross GMV')}</span>
                <p className="text-2xl font-black text-slate-900 mt-1">${stats?.totalVolume.toLocaleString()}</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[85%]" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-400 block font-semibold">{t('নিট প্ল্যাটফর্ম রেভিনিউ', 'Net Platform Profit')}</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">${stats?.totalFees.toLocaleString()}</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[70%]" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-400 block font-semibold">{t('সফল সমাপ্তির হার', 'Order Completion Rate')}</span>
                <p className="text-2xl font-black text-blue-600 mt-1">96.8%</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-blue-600 h-full w-[96%]" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-400 block font-semibold">{t('গড় হস্তান্তর সময়', 'Avg Transfer Time')}</span>
                <p className="text-2xl font-black text-purple-600 mt-1">7 {t('দিন', 'Days')}</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-purple-600 h-full w-[100%]" />
                </div>
              </div>
            </div>

            {/* Platform & Category Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <h3 className="font-bold text-sm text-slate-900 mb-4">{t('প্ল্যাটফর্ম ভিত্তিক চ্যানেল শেয়ার', 'Channels Share by Platform')}</h3>
                <div className="space-y-3">
                  {[
                    { name: 'YouTube Channels', count: channels.filter(c => !c.platform || c.platform === 'youtube').length, color: 'bg-red-500' },
                    { name: 'Facebook Pages', count: channels.filter(c => c.platform === 'facebook').length, color: 'bg-blue-600' },
                    { name: 'TikTok Accounts', count: channels.filter(c => c.platform === 'tiktok').length, color: 'bg-black' },
                    { name: 'Instagram Pages', count: channels.filter(c => c.platform === 'instagram').length, color: 'bg-pink-600' },
                    { name: 'Telegram Channels', count: channels.filter(c => c.platform === 'telegram').length, color: 'bg-sky-500' },
                    { name: 'X / Twitter Handles', count: channels.filter(c => c.platform === 'twitter').length, color: 'bg-slate-700' }
                  ].map(p => (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-sm ${p.color}`} />
                        <span className="font-semibold text-slate-700">{p.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">{p.count} {t('টি', 'listings')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <h3 className="font-bold text-sm text-slate-900 mb-4">{t('শীর্ষ জনপ্রিয় ক্যাটাগরি ভলিউম', 'Top Category Volume')}</h3>
                <div className="space-y-3">
                  {[
                    { cat: 'Cooking & Lifestyle (রান্না ও কিচেন)', pct: '38%', amount: '$42,500' },
                    { cat: 'Faceless Cash Cow (ফেসলেস)', pct: '26%', amount: '$29,100' },
                    { cat: 'High CPM Finance (ফিন্যান্স)', pct: '18%', amount: '$20,200' },
                    { cat: 'Viral Shorts Creators (শর্টস)', pct: '12%', amount: '$13,400' },
                    { cat: 'Aged Vintage Accounts (ভিন্টেজ)', pct: '6%', amount: '$6,800' }
                  ].map(c => (
                    <div key={c.cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{c.cat}</span>
                        <span className="text-slate-900 font-bold">{c.amount}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: c.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ADVANCED TAB: COUPON MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === 'coupons' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{t('ডিসকাউন্ট কুপন ও প্রমোশনাল অফার', 'Promotional Coupons & Deals')}</h3>
                <p className="text-xs text-slate-500">{t('ক্রেতাদের জন্য প্ল্যাটফর্ম ফি ছাড়ের কুপন কোড তৈরি ও পরিচালনা করুন।', 'Create discount promo codes for platform fees.')}</p>
              </div>

              <button
                onClick={() => setCouponModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{t('নতুন কুপন যোগ করুন', 'Create New Coupon')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {coupons.map((cpn) => (
                <div key={cpn.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-mono font-black text-sm tracking-widest">
                        {cpn.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cpn.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {cpn.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      {cpn.discountType === 'percentage'
                        ? t(`প্ল্যাটফর্ম ফি-তে ${cpn.discountValue}% ছাড়`, `${cpn.discountValue}% OFF Platform Fees`)
                        : t(`সরাসরি $${cpn.discountValue} ডলার ছাড়`, `$${cpn.discountValue} Flat Discount`)}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                      <div className="flex justify-between">
                        <span>{t('ব্যবহার সীমা:', 'Usage Limit:')}</span>
                        <span className="font-bold text-slate-800">{cpn.usageCount} / {cpn.usageLimit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('মেয়াদ শেষ:', 'Valid Until:')}</span>
                        <span className="font-bold text-slate-800">{new Date(cpn.validUntil).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => handleDeleteCoupon(cpn.id, cpn.code)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title={t('কুপন মুছুন', 'Delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ADVANCED TAB: NOTIFICATION CENTER */}
        {/* ============================================================== */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{t('সাইটওয়াইড ব্রডকাস্ট ব্যানার ও পুশ নোটিফিকেশন', 'Broadcast Announcements & Alerts')}</h3>
                <p className="text-xs text-slate-500">{t('ওয়েবসাইটের শীর্ষ ব্যানার ও গ্রাহক নোটিফিকেশন নিয়ন্ত্রণ করুন।', 'Publish banners to inform all buyers and sellers.')}</p>
              </div>

              <button
                onClick={() => setBroadcastModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{t('নতুন ব্রডকাস্ট পাঠান', 'Broadcast Announcement')}</span>
              </button>
            </div>

            <div className="space-y-4">
              {notifications.map((n) => (
                <div key={n.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      n.type === 'urgent'
                        ? 'bg-red-50 text-red-600'
                        : n.type === 'promo'
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase">
                          {n.targetAudience}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 block mt-2 font-mono">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteNotification(n.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ADVANCED TAB: SUPPORT TICKETS */}
        {/* ============================================================== */}
        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">{t('গ্রাহক সহায়তা ও হেল্পডেস্ক টিকেট', 'Customer Support Tickets')}</h3>
                <span className="text-xs text-slate-500 font-bold">{tickets.length} {t('টি টিকেট', 'total tickets')}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">{t('টিকেট নম্বর ও বিষয়', 'Ticket & Subject')}</th>
                      <th className="px-4 py-3.5">{t('ব্যবহারকারী', 'User')}</th>
                      <th className="px-4 py-3.5">{t('ক্যাটাগরি', 'Category')}</th>
                      <th className="px-4 py-3.5">{t('অগ্রাধিকার', 'Priority')}</th>
                      <th className="px-4 py-3.5">{t('স্ট্যাটাস', 'Status')}</th>
                      <th className="px-5 py-3.5 text-right">{t('রিপ্লাই ও অ্যাকশন', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {tickets.map((tkt) => (
                      <tr key={tkt.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-slate-900 block truncate max-w-xs">{tkt.subject}</span>
                          <span className="text-[10px] text-slate-400 font-mono">#{tkt.ticketNumber}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-slate-800 block">{tkt.userName}</span>
                          <span className="text-[10px] text-slate-400">{tkt.userEmail}</span>
                        </td>
                        <td className="px-4 py-3.5 capitalize text-slate-600">
                          {tkt.category}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            tkt.priority === 'urgent'
                              ? 'bg-red-100 text-red-700'
                              : tkt.priority === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {tkt.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <select
                            value={tkt.status}
                            onChange={(e) => handleUpdateTicketStatus(tkt.id, e.target.value)}
                            className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-700"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedTicket(tkt)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                          >
                            {t('চ্যাট ও রিপ্লাই', 'View Thread')} ({tkt.messages?.length || 0})
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ADVANCED TAB: FRAUD MONITORING */}
        {/* ============================================================== */}
        {activeTab === 'fraud' && (
          <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-rose-950">
                    {t('স্বয়ংক্রিয় প্রতারণা ও ঝুঁকি শনাক্তকরণ শিল্ড (Fraud Shield)', 'Automated Fraud & Threat Detection Shield')}
                  </h3>
                  <p className="text-xs text-rose-800 mt-0.5">
                    {t('একই চ্যানেলের একাধিক নকল লিস্টিং, দ্রুত আইপি পরিবর্তন ও সন্দেহজনক আচরণ চিহ্নিত করুন।', 'Real-time heuristics for duplicate channels, bot logins, and anomalous deals.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {fraudAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-6 rounded-2xl border transition shadow-2xs ${
                    alert.resolved
                      ? 'bg-white border-slate-200 opacity-70'
                      : 'bg-white border-red-200 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        alert.riskLevel === 'critical'
                          ? 'bg-red-600 text-white'
                          : alert.riskLevel === 'high'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        Risk Score: {alert.riskScore}/100 • {alert.riskLevel}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm">{alert.triggerReason}</h4>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mt-3 leading-relaxed">{alert.details}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-slate-500">
                      {t('ইউজার:', 'Target:')} <span className="font-bold text-slate-800">{alert.userName}</span> ({alert.userEmail})
                    </div>

                    {alert.resolved ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('নিষ্পন্ন করেছেন:', 'Resolved by')} {alert.resolvedBy}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleResolveFraudAlert(alert.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer shadow-xs"
                      >
                        {t('অ্যালার্ট নিষ্পন্ন করুন', 'Mark Resolved')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: EVIDENCE & SCREENSHOT INSPECTOR */}
      {/* ============================================================== */}
      <EvidenceModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        screenshots={selectedProof.screenshots}
        channelTitle={selectedProof.title}
      />

      {/* ============================================================== */}
      {/* MODAL 2: DISPUTE RESOLUTION ARBITRATION FORM */}
      {/* ============================================================== */}
      {resolvingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900">{t('বিরোধ নিষ্পত্তি ও সিদ্ধান্ত', 'Resolve Order Dispute')}</h3>
              </div>
              <button
                onClick={() => setResolvingOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">{t('অর্ডার ও চ্যানেল:', 'Order & Channel:')}</span>
              <p className="font-extrabold text-slate-900 text-sm mt-0.5">{resolvingOrder.channelTitle}</p>
              <p className="text-xs font-mono text-emerald-600 font-bold mt-1">
                {t('আটকে থাকা এসক্রো ফান্ড:', 'Locked Amount:')} ${resolvingOrder.amount.toLocaleString()}
              </p>
            </div>

            <form onSubmit={handleResolveDispute} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-2">{t('আরবিট্রেশন সিদ্ধান্ত নির্বাচন করুন *', 'Select Final Decision *')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setResolutionAction('refund_buyer')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      resolutionAction === 'refund_buyer'
                        ? 'border-red-500 bg-red-50/70 text-red-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span className="block font-bold text-xs">{t('১. বায়ারকে শতভাগ রিফান্ড', '1. Full Refund to Buyer')}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">{t('সেলার প্রাইমারি ওনারশিপ দিতে ব্যর্থ হলে', 'If seller failed handover')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolutionAction('complete_order')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      resolutionAction === 'complete_order'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span className="block font-bold text-xs">{t('২. সেলারকে পেআউট রিলিজ', '2. Release to Seller')}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">{t('ওনারশিপ হস্তান্তর সঠিক প্রমাণিত হলে', 'If primary ownership confirmed')}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {t('সিদ্ধান্তের কারণ ও অডিট নোট *', 'Arbitration Reason & Documentation *')}
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder={t('উভয় পক্ষকে প্রেরণের জন্য বিস্তারিত কারণ লিখুন...', 'Enter explanation sent to both buyer and seller...')}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setResolvingOrder(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submittingResolution}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submittingResolution ? t('প্রক্রিয়াকরণ...', 'Executing...') : t('চূড়ান্ত কার্যকর করুন', 'Execute Resolution')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: USER DETAILS DRAWER */}
      {/* ============================================================== */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">{t('ব্যবহারকারীর সম্পূর্ণ প্রোফাইল ও হিস্ট্রি', 'User Profile Overview')}</h3>
              <button onClick={() => setSelectedUserDetail(null)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={selectedUserDetail.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUserDetail.id}`}
                alt={selectedUserDetail.name}
                className="w-16 h-16 rounded-full border border-slate-200 object-cover"
              />
              <div>
                <h4 className="font-extrabold text-base text-slate-900">{selectedUserDetail.name}</h4>
                <p className="text-xs text-slate-500 font-mono">{selectedUserDetail.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                    {selectedUserDetail.role}
                  </span>
                  {selectedUserDetail.isVerifiedSeller && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px]">
                      Verified KYC
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block">{t('রেটিং:', 'Rating:')}</span>
                <span className="font-bold text-slate-800">★ {selectedUserDetail.rating || 5.0}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('সম্পন্ন ডিল:', 'Completed Deals:')}</span>
                <span className="font-bold text-slate-800">{selectedUserDetail.dealsCount || 0}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600">
              <span className="font-bold text-slate-800 block mb-1">{t('বায়ো / বিবরণ:', 'Bio / Info:')}</span>
              <p className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                {selectedUserDetail.bio || t('কোনো বায়ো তথ্য নেই।', 'No profile bio provided.')}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                {t('বন্ধ করুন', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: SUPPORT TICKET REPLY THREAD */}
      {/* ============================================================== */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono text-slate-400">#{selectedTicket.ticketNumber}</span>
                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{selectedTicket.subject}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-[250px]">
              {selectedTicket.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-2xl text-xs max-w-[85%] ${
                    msg.senderRole === 'admin'
                      ? 'ml-auto bg-rose-600 text-white shadow-2xs'
                      : 'mr-auto bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-80 mb-1">
                    <span className="font-bold">{msg.senderName} ({msg.senderRole})</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendTicketReply} className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                required
                placeholder={t('অফিসিয়াল অ্যাডমিন রিপ্লাই লিখুন...', 'Type administrative support reply...')}
                value={ticketReplyText}
                onChange={(e) => setTicketReplyText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={submittingTicketReply}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('পাঠান', 'Reply')}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: CREATE COUPON FORM */}
      {/* ============================================================== */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">{t('নতুন প্রমোশনাল কুপন তৈরি', 'Create Promo Coupon')}</h3>
              <button onClick={() => setCouponModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('কুপন কোড *', 'Coupon Code *')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EID2026"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold uppercase focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('ডিসকাউন্ট ধরন', 'Type')}</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="percentage">{t('শতাংশ (%)', 'Percentage (%)')}</option>
                    <option value="fixed">{t('ফিক্সড ডলার ($)', 'Fixed Amount ($)')}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('ডিসকাউন্ট মান *', 'Discount Value *')}</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('ব্যবহার সীমা', 'Usage Limit')}</label>
                  <input
                    type="number"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('মেয়াদ শেষ তারিখ', 'Valid Until')}</label>
                  <input
                    type="date"
                    value={couponForm.validUntil}
                    onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs"
                >
                  {t('কুপন তৈরি করুন', 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: BROADCAST ANNOUNCEMENT MODAL */}
      {/* ============================================================== */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">{t('জরুরি সাইটওয়াইড নোটিফিকেশন ব্রডকাস্ট', 'Broadcast Announcement')}</h3>
              <button onClick={() => setBroadcastModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>

            <form onSubmit={handleCreateNotification} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('নোটিফিকেশন শিরোনাম *', 'Title *')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 📢 ঈদ স্পেশাল অফার শুরু হয়েছে!"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:border-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('বার্তার বিবরণ *', 'Message Text *')}</label>
                <textarea
                  rows={3}
                  required
                  placeholder={t('ব্যবহারকারীদের জন্য সুস্পষ্ট নির্দেশনা বা অফার লিখুন...', 'Enter message details...')}
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('প্রাপক অডিয়েন্স', 'Target')}</label>
                  <select
                    value={broadcastForm.targetAudience}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, targetAudience: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="all">{t('সকল ইউজার', 'All Users')}</option>
                    <option value="buyers">{t('শুধুমাত্র ক্রেতা (Buyers)', 'Buyers Only')}</option>
                    <option value="sellers">{t('শুধুমাত্র বিক্রেতা (Sellers)', 'Sellers Only')}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('ধরন', 'Type')}</label>
                  <select
                    value={broadcastForm.type}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="info">Info</option>
                    <option value="promo">Promo</option>
                    <option value="warning">Warning</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setBroadcastModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs"
                >
                  {t('ব্রডকাস্ট প্রকাশ করুন', 'Publish Broadcast')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
