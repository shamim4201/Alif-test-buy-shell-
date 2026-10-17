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
  LayoutDashboard,
  Tv,
  Users,
  ShoppingBag,
  CreditCard,
  Scale,
  Settings,
  ShieldCheck,
  TrendingUp,
  Percent,
  Bell,
  Ticket,
  AlertOctagon,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Eye,
  BadgeCheck,
  Ban,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Send,
  Sparkles,
  UserCheck,
  Menu,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  ArrowUpRight,
  Check,
  ShieldAlert
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
  const { currency, setCurrency, formatPrice, language, t } = useCurrency();

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Core Data States
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
  const [globalSearch, setGlobalSearch] = useState('');
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

  // Action Handlers
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

  const handleToggleFeatured = async (channelId: string) => {
    try {
      await api.toggleChannelFeatured(channelId);
      showToast(t('ফিচার্ড স্ট্যাটাস আপডেট হয়েছে', 'Featured status updated'), 'success');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('আপডেট ব্যর্থ হয়েছে', 'Failed to update featured flag'), 'error');
    }
  };

  const handleToggleChannelStatus = async (channelId: string) => {
    try {
      await api.toggleChannelStatus(channelId);
      showToast(t('চ্যানেল ভিজিবিলিটি আপডেট হয়েছে', 'Channel visibility status updated'), 'success');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('আপডেট ব্যর্থ হয়েছে', 'Failed to update channel status'), 'error');
    }
  };

  const handleDeleteChannel = async (channelId: string, title: string) => {
    if (!window.confirm(t(`আপনি কি নিশ্চিত যে "${title}" চ্যানেল লিস্টিংটি মুছে ফেলতে চান?`, `Are you sure you want to delete "${title}"?`))) {
      return;
    }
    try {
      await api.deleteAdminChannel(channelId);
      showToast(t('লিস্টিং সফলভাবে সরানো হয়েছে', 'Listing removed successfully'), 'success');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('মুছে ফেলতে সমস্যা হয়েছে', 'Failed to delete listing'), 'error');
    }
  };

  const handleToggleBan = async (userId: string) => {
    try {
      const res = await api.toggleUserBan(userId);
      showToast(res.message || t('ব্যবহারকারীর স্ট্যাটাস পরিবর্তিত হয়েছে', 'User status updated'), 'info');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('ইউজার আপডেট ব্যর্থ হয়েছে', 'Failed to update user'), 'error');
    }
  };

  const handleToggleVerified = async (userId: string) => {
    try {
      const res = await api.toggleUserVerified(userId);
      showToast(res.message || t('সেলার ভেরিফিকেশন স্ট্যাটাস আপডেট হয়েছে', 'Seller verified status updated'), 'success');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('ভেরিফিকেশন পরিবর্তন ব্যর্থ হয়েছে', 'Failed to toggle verification'), 'error');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'buyer' | 'seller' | 'admin') => {
    try {
      await api.updateUserRole(userId, newRole);
      showToast(t(`ব্যবহারকারীর রোল "${newRole}" করা হয়েছে`, `User role changed to ${newRole}`), 'success');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('রোল পরিবর্তন ব্যর্থ হয়েছে', 'Failed to update role'), 'error');
    }
  };

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

  const handleResolveFraudAlert = async (id: string) => {
    try {
      await api.resolveAdminFraudAlert(id);
      showToast(t('ফ্রড অ্যালার্ট নিষ্পন্ন হিসেবে চিহ্নিত করা হয়েছে', 'Fraud alert marked resolved'), 'success');
      loadData(true);
    } catch (err: any) {
      showToast(err.message || t('ফ্রড অ্যালার্ট নিষ্পন্ন করতে ব্যর্থ হয়েছে', 'Failed to resolve alert'), 'error');
    }
  };

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
      showToast(t('ব্যাকআপ ফাইল ডাউনলোড সম্পন্ন হয়েছে', 'Database backup downloaded successfully'), 'success');
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

  // Computed Filters
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

  // Sidebar Menu Items
  const navMenuItems = [
    { id: 'overview', label: t('ড্যাশবোর্ড', 'Dashboard'), icon: LayoutDashboard },
    { id: 'channels', label: t('চ্যানেল লিস্টিং', 'Channels'), icon: Tv, badge: pendingApprovals.length, badgeColor: 'bg-amber-500' },
    { id: 'users', label: t('ইউজার কন্ট্রোল', 'Users'), icon: Users, badge: usersList.length, badgeColor: 'bg-slate-700' },
    { id: 'orders', label: t('অর্ডার ও এসক্রো', 'Orders & Escrow'), icon: ShoppingBag, badge: activeEscrowOrders.length, badgeColor: 'bg-emerald-500' },
    { id: 'payments', label: t('পেমেন্ট ও কমিশন', 'Payments'), icon: CreditCard },
    { id: 'disputes', label: t('বিরোধ ও আরবিট্রেশন', 'Disputes'), icon: Scale, badge: disputedOrders.length, badgeColor: 'bg-rose-500 animate-pulse' },
    { id: 'settings', label: t('ওয়েবসাইট সেটিংস', 'Settings'), icon: Settings },
    { id: 'security', label: t('নিরাপত্তা ও রোল', 'Security & Roles'), icon: ShieldCheck },
    { id: 'reports', label: t('রিপোর্ট ও অ্যানালিটিক্স', 'Reports'), icon: TrendingUp },
    { id: 'coupons', label: t('কুপন ও অফার', 'Coupons'), icon: Percent },
    { id: 'notifications', label: t('নোটিফিকেশন সেন্টার', 'Notifications'), icon: Bell },
    { id: 'tickets', label: t('সাপোর্ট টিকেট', 'Support Tickets'), icon: Ticket, badge: tickets.filter(t => t.status !== 'closed').length, badgeColor: 'bg-purple-500' },
    { id: 'fraud', label: t('ফ্রড শিল্ড', 'Fraud Shield'), icon: AlertOctagon, badge: fraudAlerts.filter(a => !a.resolved).length, badgeColor: 'bg-rose-600' }
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col antialiased">
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* ============================================================== */}
        {/* 1. DEEP NAVY SAAS SIDEBAR (Matches Image Reference) */}
        {/* ============================================================== */}
        <aside
          className={`bg-[#0f172a] text-slate-300 transition-all duration-300 z-30 shrink-0 flex flex-col justify-between border-r border-slate-800 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          } hidden md:flex min-h-screen sticky top-0`}
        >
          <div>
            {/* Brand Logo Header */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-rose-500 flex items-center justify-center text-white shrink-0 shadow-md">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <span className="font-black text-white text-base tracking-tight block truncate">
                      Alif Trust
                    </span>
                    <span className="text-[10px] text-sky-400 font-bold block uppercase tracking-wider">
                      Admin Console
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {/* Admin User Profile Card in Sidebar */}
            <div className={`p-4 border-b border-slate-800/60 bg-slate-900/40 ${sidebarCollapsed ? 'text-center' : ''}`}>
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt="Admin Profile"
                  className="w-10 h-10 rounded-full border-2 border-sky-500 object-cover shrink-0 mx-auto"
                />
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <span className="font-extrabold text-white text-xs block truncate">
                      {user?.name || 'Alif Sheen Admin'}
                    </span>
                    <span className="text-[10px] text-rose-400 font-bold block flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      Super Administrator
                    </span>
                  </div>
                )}
              </div>

              {!sidebarCollapsed && (
                <div className="flex items-center justify-between text-slate-400 text-xs mt-3 pt-2.5 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[170px]" title={user?.email || 'alifsheenshopping@gmail.com'}>
                    {user?.email || 'alifsheenshopping@gmail.com'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="hover:text-white transition"
                      title={t('সেটিংস', 'Settings')}
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => loadData(true)}
                      className="hover:text-white transition"
                      title={t('ডাটা রিফ্রেশ', 'Sync')}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Menu List */}
            <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-none">
              {navMenuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as TabType)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'}`} />
                    {!sidebarCollapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}
                    {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black text-white ${item.badgeColor || 'bg-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          {!sidebarCollapsed && (
            <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 text-center text-[10px] text-slate-500 font-mono">
              <span>Alif Trust v2.8 • Escrow Protected</span>
            </div>
          )}
        </aside>

        {/* Mobile Header Drawer Toggle */}
        <div className="md:hidden fixed top-20 left-4 z-40">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-xl bg-slate-900 text-white shadow-lg cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex">
            <div className="w-72 bg-[#0f172a] text-slate-300 h-full p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-black text-white text-base">Alif Trust Admin</span>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400 hover:text-white p-1">✕</button>
              </div>
              <nav className="space-y-1">
                {navMenuItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as TabType);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                        isActive ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black text-white ${item.badgeColor || 'bg-slate-700'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. MAIN WORKSPACE / RIGHT CONTENT AREA */}
        {/* ============================================================== */}
        <main className="flex-1 min-w-0 flex flex-col overflow-y-auto pb-32">
          
          {/* Top Bar (Header with Search & Top Summary Indicators) */}
          <header className="bg-white border-b border-slate-200/90 py-3.5 px-4 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
            {/* Search Input Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('চ্যানেল, ইউজার বা ট্রানজ্যাকশন সার্চ করুন...', 'Search channels, users, or transactions...')}
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setChannelSearch(e.target.value);
                  setUserSearch(e.target.value);
                }}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition"
              />
            </div>

            {/* Top Right Summary Badges (Exact from Screenshot: $826M & $689M Style) */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/70 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  $
                </div>
                <div>
                  <span className="text-[10px] text-blue-800 font-bold block">{t('মোট লেনদেন', 'Settled Volume')}</span>
                  <span className="text-xs font-black text-blue-950">${stats?.totalVolume.toLocaleString() || '826,000'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200/70 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  🛡️
                </div>
                <div>
                  <span className="text-[10px] text-sky-800 font-bold block">{t('এসক্রো তহবিল', 'Escrow Vault')}</span>
                  <span className="text-xs font-black text-sky-950">${stats?.totalFees ? (stats.totalVolume * 0.95).toLocaleString() : '689,000'}</span>
                </div>
              </div>

              {/* Sync & Backup Actions */}
              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                title={t('ডাটা রিফ্রেশ', 'Sync')}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
              </button>

              <button
                onClick={handleExportBackup}
                className="p-2 rounded-xl bg-slate-900 hover:bg-black text-white transition cursor-pointer shadow-xs"
                title={t('ডাটাবেজ ব্যাকআপ ডাউনলোড', 'Export Database Backup')}
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Workspace Body */}
          <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
            
            {/* Header Greeting Banner (VENDOR & ADMIN CONSOLE) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-lg shadow-2xs shrink-0">
                  🌐
                </div>
                <div>
                  <span className="text-[11px] font-black text-sky-600 uppercase tracking-widest block">
                    VENDOR &amp; ADMIN CONSOLE
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {activeTab === 'overview'
                      ? t('আলিফ ট্রাস্ট এসক্রো ও লজিস্টিক্স ড্যাশবোর্ড', 'Alif Trust Escrow & Channel Dashboard')
                      : activeTab === 'channels'
                      ? t('চ্যানেল লিস্টিং ও অনুমোদন কেন্দ্র', 'Channel Listings & Verification')
                      : activeTab === 'users'
                      ? t('ইউজার ম্যানেজমেন্ট ও একাউন্ট কন্ট্রোল', 'User Access & Account Regulation')
                      : activeTab === 'orders'
                      ? t('অর্ডার ট্র্যাকিং ও ওনারশিপ হ্যান্ডওভার', 'Orders & Ownership Handover Audit')
                      : activeTab === 'payments'
                      ? t('পেমেন্ট ও কমিশন অডিট লেজার', 'Payments & Commission Ledger')
                      : activeTab === 'disputes'
                      ? t('বিরোধ নিষ্পত্তি ও আরবিট্রেশন সেন্টার', 'Dispute Arbitration Center')
                      : t('সুপার অ্যাডমিন প্ল্যাটফর্ম সেটিংস', 'Administrative Platform Governance')}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t('সিস্টেম ১০০% সক্রিয়', 'System Operational')}
                </span>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 3. THE 8 ICONIC TWO-TONE CAPSULE STAT CARDS (Matches Image!) */}
            {/* ============================================================== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Capsule 1: Total Channels (Electric Blue) */}
              <div
                onClick={() => setActiveTab('channels')}
                className="bg-gradient-to-r from-sky-400 to-blue-600 text-white rounded-full p-2.5 sm:px-4 sm:py-3 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <Tv className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-bold text-white/90 block truncate uppercase tracking-wider">
                      {t('মোট চ্যানেল', 'Total Channels')}
                    </span>
                    <span className="text-lg sm:text-2xl font-black block leading-none">
                      {channels.length || 869}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/70 group-hover:text-white transition shrink-0" />
              </div>

              {/* Capsule 2: Pending Approval (Coral Red) */}
              <div
                onClick={() => setActiveTab('channels')}
                className="bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-full p-2.5 sm:px-4 sm:py-3 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-bold text-white/90 block truncate uppercase tracking-wider">
                      {t('অপেক্ষমাণ', 'Pending')}
                    </span>
                    <span className="text-lg sm:text-2xl font-black block leading-none">
                      {pendingApprovals.length || 562}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/70 group-hover:text-white transition shrink-0" />
              </div>

              {/* Capsule 3: Orders in Escrow (Purple/Indigo) */}
              <div
                onClick={() => setActiveTab('orders')}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full p-2.5 sm:px-4 sm:py-3 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-bold text-white/90 block truncate uppercase tracking-wider">
                      {t('চলমান অর্ডার', 'Orders In Escrow')}
                    </span>
                    <span className="text-lg sm:text-2xl font-black block leading-none">
                      {activeEscrowOrders.length || 624}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/70 group-hover:text-white transition shrink-0" />
              </div>

              {/* Capsule 4: Settled Deals (Deep Navy) */}
              <div
                onClick={() => setActiveTab('orders')}
                className="bg-gradient-to-r from-blue-700 to-slate-900 text-white rounded-full p-2.5 sm:px-4 sm:py-3 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-bold text-white/90 block truncate uppercase tracking-wider">
                      {t('সম্পন্ন ডিল', 'Completed')}
                    </span>
                    <span className="text-lg sm:text-2xl font-black block leading-none">
                      {stats?.completedOrdersCount || 47}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/70 group-hover:text-white transition shrink-0" />
              </div>

              {/* Capsule 5: Verified Sellers (Lime/Green) */}
              <div
                onClick={() => setActiveTab('users')}
                className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-full p-2.5 sm:px-4 sm:py-3 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <BadgeCheck className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-bold text-white/90 block truncate uppercase tracking-wider">
                      {t('ভেরিফাইড সেলার', 'Verified Sellers')}
                    </span>
                    <span className="text-lg sm:text-2xl font-black block leading-none">
                      {usersList.filter(u => u.isVerifiedSeller).length || 365}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/70 group-hover:text-white transition shrink-0" />
              </div>

              {/* Capsule 6: Active Disputes (Warm Amber) */}
              <div
                onClick={() => setActiveTab('disputes')}
                className="bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-full p-2.5 sm:px-4 sm:py-3 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <Scale className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-bold text-white/90 block truncate uppercase tracking-wider">
                      {t('সক্রিয় বিরোধ', 'Active Disputes')}
                    </span>
                    <span className="text-lg sm:text-2xl font-black block leading-none">
                      {disputedOrders.length || 98}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/70 group-hover:text-white transition shrink-0" />
              </div>

              {/* Capsule 7: Platform Fees (Teal/Mint) */}
              <div
                onClick={() => setActiveTab('payments')}
                className="bg-gradient-to-r from-teal-400 to-emerald-600 text-white rounded-full p-2.5 sm:px-4 sm:py-3 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-bold text-white/90 block truncate uppercase tracking-wider">
                      {t('কমিশন আয় (৫%)', 'Platform Net Fees')}
                    </span>
                    <span className="text-lg sm:text-2xl font-black block leading-none">
                      ${stats?.totalFees || 78}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/70 group-hover:text-white transition shrink-0" />
              </div>

              {/* Capsule 8: Open Tickets / Alerts (Tangerine Orange) */}
              <div
                onClick={() => setActiveTab('tickets')}
                className="bg-gradient-to-r from-orange-400 to-rose-600 text-white rounded-full p-2.5 sm:px-4 sm:py-3 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <Ticket className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-bold text-white/90 block truncate uppercase tracking-wider">
                      {t('সাপোর্ট টিকেট', 'Support Tickets')}
                    </span>
                    <span className="text-lg sm:text-2xl font-black block leading-none">
                      {tickets.length || 15}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/70 group-hover:text-white transition shrink-0" />
              </div>
            </div>

            {/* ============================================================== */}
            {/* 4. MAIN DATA TABLE WITH SOLID SKY-BLUE HEADER BANNER */}
            {/* (Matches the "Vehicle List" style in the user's screenshot) */}
            {/* ============================================================== */}
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
              {/* Sky-Blue Table Accent Header Banner */}
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-sm tracking-wide">
                    {activeTab === 'users'
                      ? t('ব্যবহারকারী তালিকা (User Management Ledger)', 'User Management Ledger')
                      : activeTab === 'orders'
                      ? t('অর্ডার ও এসক্রো ট্র্যাকিং (Order Escrow Ledger)', 'Order Escrow Ledger')
                      : activeTab === 'payments'
                      ? t('পেমেন্ট ও ট্রানজ্যাকশন হিস্ট্রি (Payment & Payout Ledger)', 'Payment & Payout Ledger')
                      : activeTab === 'disputes'
                      ? t('বিরোধ আরবিট্রেশন তালিকা (Dispute Arbitration Queue)', 'Dispute Arbitration Queue')
                      : t('চ্যানেল লিস্টিং ও যাচাইকরণ (Channel Listing & Verification Ledger)', 'Channel Listing & Verification Ledger')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
                    {activeTab === 'users'
                      ? filteredUsers.length
                      : activeTab === 'orders'
                      ? filteredOrders.length
                      : activeTab === 'payments'
                      ? filteredTransactions.length
                      : filteredChannels.length}{' '}
                    {t('আইটেম', 'records')}
                  </span>
                </div>

                {/* Table Filter Controls */}
                <div className="flex items-center gap-2">
                  {activeTab === 'channels' && (
                    <div className="flex items-center gap-1 text-[11px]">
                      {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setChannelStatusFilter(st)}
                          className={`px-2.5 py-1 rounded-lg font-bold capitalize transition cursor-pointer ${
                            channelStatusFilter === st
                              ? 'bg-white text-sky-700 shadow-xs'
                              : 'text-white/80 hover:bg-white/10'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeTab === 'users' && (
                    <div className="flex items-center gap-1 text-[11px]">
                      {(['all', 'seller', 'buyer', 'admin', 'banned'] as const).map((role) => (
                        <button
                          key={role}
                          onClick={() => setUserRoleFilter(role)}
                          className={`px-2.5 py-1 rounded-lg font-bold capitalize transition cursor-pointer ${
                            userRoleFilter === role
                              ? 'bg-white text-sky-700 shadow-xs'
                              : 'text-white/80 hover:bg-white/10'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Table Body Container */}
              <div className="overflow-x-auto">
                {activeTab === 'users' ? (
                  /* USERS TABLE */
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">{t('ব্যবহারকারী / প্রোফাইল', 'User ID & Profile')}</th>
                        <th className="px-4 py-3.5">{t('রোল ও অধিকার', 'Role')}</th>
                        <th className="px-4 py-3.5">{t('KYC ভেরিফিকেশন', 'KYC Status')}</th>
                        <th className="px-4 py-3.5">{t('রেটিং ও ডিল', 'Rating / Deals')}</th>
                        <th className="px-4 py-3.5">{t('নিবন্ধন তারিখ', 'Joined Date')}</th>
                        <th className="px-5 py-3.5 text-right">{t('অ্যাকশন', 'Actions')}</th>
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
                                    <BadgeCheck className="w-4 h-4 text-blue-600 shrink-0" />
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
                              className="text-xs font-bold rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 focus:outline-none focus:border-sky-500"
                            >
                              <option value="buyer">Buyer</option>
                              <option value="seller">Seller</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-4 py-3.5">
                            {u.isVerifiedSeller ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                                Verified
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                                Standard
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-slate-800">★ {u.rating || 5.0}</span>
                            <span className="text-[11px] text-slate-400 block">{u.dealsCount || 0} deals</span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleVerified(u.id)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                              title={t('ভেরিফাইড ব্যাজ টগল', 'Toggle Verified')}
                            >
                              <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleToggleBan(u.id)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                              title={t('ব্যান / আনব্যান', 'Ban/Unban')}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSelectedUserDetail(u)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                              title={t('প্রোফাইল অডিট', 'Audit')}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : activeTab === 'orders' ? (
                  /* ORDERS TABLE */
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">{t('অর্ডার আইডি ও চ্যানেল', 'Order ID & Channel')}</th>
                        <th className="px-4 py-3.5">{t('ক্রেতা ও বিক্রেতা', 'Buyer / Seller')}</th>
                        <th className="px-4 py-3.5">{t('মূল্য ও ফি', 'Deal Price')}</th>
                        <th className="px-4 py-3.5">{t('এসক্রো স্ট্যাটাস', 'Escrow Status')}</th>
                        <th className="px-4 py-3.5">{t('হস্তান্তর ধাপ (Step)', 'Step Progress')}</th>
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
                              <span className="font-bold text-slate-900 block truncate max-w-xs">{ord.channelTitle}</span>
                              <span className="text-[11px] font-mono text-slate-400">#{ord.id}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="font-bold text-slate-800 block">{ord.buyerName}</span>
                              <span className="text-[11px] text-slate-500 font-medium">To: {ord.sellerName}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="font-black text-slate-900 block">${ord.amount.toLocaleString()}</span>
                              <span className="text-[10px] text-emerald-600 font-bold block">+${ord.platformFee} Fee</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : ord.status === 'disputed'
                                  ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {ORDER_STATUS_TRANSLATIONS[ord.status]?.[language] || ord.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
                                  <div
                                    className="h-full bg-sky-500 rounded-full"
                                    style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-slate-600">
                                  {completedSteps}/{totalSteps}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => onSelectOrder(ord.id)}
                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer shadow-xs"
                              >
                                {t('অর্ডার বিস্তারিত', 'Inspect')}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  /* CHANNELS TABLE (DEFAULT - Exact match to screenshot layout!) */
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">{t('চ্যানেল আইডি ও নাম', 'Item ID & Title')}</th>
                        <th className="px-4 py-3.5">{t('প্ল্যাটফর্ম ও ক্যাটাগরি', 'Type / Platform')}</th>
                        <th className="px-4 py-3.5">{t('স্ট্যাটাস', 'Status')}</th>
                        <th className="px-4 py-3.5">{t('সাবস্ক্রাইবার ও অডিয়েন্স', 'Metrics / Followers')}</th>
                        <th className="px-4 py-3.5">{t('বিক্রয়মূল্য ও আয়', 'Price & Revenue')}</th>
                        <th className="px-4 py-3.5">{t('নিবন্ধিত সেলার', 'Seller Assigned')}</th>
                        <th className="px-5 py-3.5 text-right">{t('অ্যাকশন ও রিভিউ', 'Actions & Audit')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredChannels.map((channel) => (
                        <tr key={channel.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-5 py-3.5">
                            <span className="font-bold text-slate-900 block truncate max-w-xs">{channel.title}</span>
                            <a
                              href={channel.channelUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-sky-600 hover:underline flex items-center gap-1 font-mono mt-0.5"
                            >
                              <span>{channel.handle}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <PlatformLogo platform={channel.platform || 'youtube'} className="w-4 h-4" />
                              <span className="font-bold text-slate-700 capitalize">
                                {channel.platform || 'YouTube'}
                              </span>
                              <CategoryLogo categoryId={channel.accountType || ''} className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{channel.niche}</span>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              channel.verificationStatus === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : channel.verificationStatus === 'rejected'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                            }`}>
                              {channel.verificationStatus}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="font-bold text-slate-900 block">
                              {channel.subscribers >= 1000 ? (channel.subscribers / 1000).toFixed(1) + 'K' : channel.subscribers}
                            </span>
                            <span className="text-[10px] text-slate-400 block">{channel.creationYear} • {channel.monetizationStatus}</span>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="font-black text-slate-900 block">${channel.askingPrice.toLocaleString()}</span>
                            <span className="text-[10px] text-emerald-600 font-bold block">${channel.monthlyRevenue}/mo</span>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${channel.sellerId}`}
                                alt="Seller"
                                className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200"
                              />
                              <span className="font-semibold text-slate-800 truncate max-w-[120px]">{channel.sellerName}</span>
                            </div>
                          </td>

                          <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedProof({
                                  screenshots: channel.analyticsScreenshots || [],
                                  title: channel.title
                                });
                                setEvidenceModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                              title={t('প্রমাণপত্র অডিট', 'Inspect Proof')}
                            >
                              <Eye className="w-3.5 h-3.5 text-sky-600" />
                            </button>

                            {channel.verificationStatus === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleReviewListing(channel.id, 'approved')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                                >
                                  {t('অনুমোদন', 'Approve')}
                                </button>
                                <button
                                  onClick={() => handleReviewListing(channel.id, 'rejected')}
                                  className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                                >
                                  {t('বাতিল', 'Reject')}
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleToggleFeatured(channel.id)}
                                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                    channel.isFeatured ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                  title={channel.isFeatured ? 'Unfeature' : 'Feature'}
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                </button>

                                <button
                                  onClick={() => handleDeleteChannel(channel.id, channel.title)}
                                  className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                                  title={t('লিস্টিং মুছুন', 'Delete')}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* ============================================================== */}
            {/* 5. BOTTOM 3-COLUMN ANALYTICS SECTION (Exact Match from Image) */}
            {/* ============================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Widget 1: Multi-Color Segmented Status Progress Bar */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-900 block mb-3">
                  {t('চ্যানেল স্ট্যাটাস বণ্টন (Status Distribution)', 'Channel Status Distribution')}
                </span>
                
                {/* Segmented Multi-Color Bar */}
                <div className="w-full h-3 rounded-full flex overflow-hidden mb-3 shadow-inner">
                  <div className="bg-emerald-500 h-full w-[65%]" title="Approved: 65%" />
                  <div className="bg-sky-500 h-full w-[20%]" title="In Escrow: 20%" />
                  <div className="bg-amber-500 h-full w-[10%]" title="Pending: 10%" />
                  <div className="bg-rose-500 h-full w-[5%]" title="Disputed: 5%" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>{t('অনুমোদিত (Approved): 65%', 'Approved: 65%')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span>{t('হস্তান্তর চলছে (Escrow): 20%', 'In Escrow: 20%')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>{t('অপেক্ষমাণ (Pending): 10%', 'Pending: 10%')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>{t('বিরোধপূর্ণ (Disputed): 5%', 'Disputed: 5%')}</span>
                  </div>
                </div>
              </div>

              {/* Widget 2: Platform Distribution by Country/Network */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-900 block mb-3">
                  {t('প্ল্যাটফর্ম ও অডিয়েন্স হিসেব', 'Network & Platform Breakdown')}
                </span>

                <div className="space-y-2 text-xs">
                  {[
                    { name: 'YouTube (USA & Global)', pct: '48%', color: 'bg-red-500' },
                    { name: 'Facebook Pages (BD/India)', pct: '30%', color: 'bg-blue-600' },
                    { name: 'TikTok Accounts (Viral)', pct: '14%', color: 'bg-black' },
                    { name: 'Instagram Themes', pct: '8%', color: 'bg-pink-500' }
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-slate-700 font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">{item.pct}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Widget 3: Escrow SLA & Average Handover Time */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block mb-1">
                    {t('এসক্রো রিলিজ সময়সীমা (SLA)', 'Average Handover Time')}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {t('৭ দিনের ইউটিউব প্রাইমারি ওনারশিপ ট্রায়াল সমাপ্তির গড় সময়', 'YouTube 7-day primary owner audit timeline')}
                  </p>
                </div>

                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-3xl font-black text-sky-600 tracking-tight">7.2</span>
                  <span className="text-xs font-bold text-slate-500">{t('দিন (Days)', 'Days Average')}</span>
                  <span className="text-[11px] font-bold text-emerald-600 ml-auto">99.4% {t('সাফল্য', 'Success')}</span>
                </div>

                <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
                  {t('এসক্রো সিকিউরিটি পলিসি সর্বদা কার্যকর', '100% Escrow Protection Guaranteed')}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* ============================================================== */}
      {/* 6. FLOATING BOTTOM DOCK NAVIGATION BAR (MATCHES IMAGE BLUE DOCK!) */}
      {/* ============================================================== */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[92%] sm:w-auto">
        <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white rounded-full shadow-2xl px-4 sm:px-8 py-2.5 flex items-center justify-between sm:justify-center gap-2 sm:gap-6 text-[11px] sm:text-xs font-bold backdrop-blur-md border border-white/20">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-full transition cursor-pointer whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-white text-sky-700 shadow-xs' : 'hover:bg-white/20'
            }`}
          >
            {t('ড্যাশবোর্ড', 'Overview')}
          </button>

          <button
            onClick={() => setActiveTab('channels')}
            className={`px-3 py-1.5 rounded-full transition cursor-pointer whitespace-nowrap ${
              activeTab === 'channels' ? 'bg-white text-sky-700 shadow-xs' : 'hover:bg-white/20'
            }`}
          >
            {t('চ্যানেল লিস্টিং', 'Channels')}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-full transition cursor-pointer whitespace-nowrap ${
              activeTab === 'users' ? 'bg-white text-sky-700 shadow-xs' : 'hover:bg-white/20'
            }`}
          >
            {t('ইউজার কন্ট্রোল', 'Users')}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-full transition cursor-pointer whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-white text-sky-700 shadow-xs' : 'hover:bg-white/20'
            }`}
          >
            {t('অর্ডার ও এসক্রো', 'Orders')}
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 rounded-full transition cursor-pointer whitespace-nowrap ${
              activeTab === 'payments' ? 'bg-white text-sky-700 shadow-xs' : 'hover:bg-white/20'
            }`}
          >
            {t('পেমেন্ট ও কমিশন', 'Payments')}
          </button>

          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-3 py-1.5 rounded-full transition cursor-pointer whitespace-nowrap ${
              activeTab === 'disputes' ? 'bg-white text-rose-600 shadow-xs' : 'hover:bg-white/20'
            }`}
          >
            {t('বিরোধ ও রিফান্ড', 'Disputes')}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-full transition cursor-pointer whitespace-nowrap hidden sm:block ${
              activeTab === 'reports' ? 'bg-white text-sky-700 shadow-xs' : 'hover:bg-white/20'
            }`}
          >
            {t('অ্যানালিটিক্স', 'Reports')}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-full transition cursor-pointer whitespace-nowrap hidden sm:block ${
              activeTab === 'settings' ? 'bg-white text-sky-700 shadow-xs' : 'hover:bg-white/20'
            }`}
          >
            {t('সেটিংস', 'Settings')}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODALS */}
      {/* ============================================================== */}
      {/* Evidence Modal */}
      <EvidenceModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        screenshots={selectedProof.screenshots}
        channelTitle={selectedProof.title}
      />

      {/* Dispute Modal */}
      {resolvingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">{t('বিরোধ নিষ্পত্তি ও এসক্রো রিলিজ', 'Resolve Escrow Dispute')}</h3>
              <button onClick={() => setResolvingOrder(null)} className="text-slate-400 p-1">✕</button>
            </div>

            <p className="font-bold text-slate-800">{resolvingOrder.channelTitle}</p>
            <p className="font-mono text-rose-600 font-bold">${resolvingOrder.amount.toLocaleString()} locked</p>

            <form onSubmit={handleResolveDispute} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setResolutionAction('refund_buyer')}
                  className={`p-3 rounded-xl border font-bold ${
                    resolutionAction === 'refund_buyer' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-200'
                  }`}
                >
                  {t('বায়ারকে রিফান্ড দিন', 'Refund Buyer')}
                </button>
                <button
                  type="button"
                  onClick={() => setResolutionAction('complete_order')}
                  className={`p-3 rounded-xl border font-bold ${
                    resolutionAction === 'complete_order' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200'
                  }`}
                >
                  {t('সেলারকে পেআউট রিলিজ', 'Release to Seller')}
                </button>
              </div>

              <div>
                <label className="font-bold block mb-1">{t('সিদ্ধান্তের বিবরণ *', 'Resolution Notes *')}</label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Audit reason..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setResolvingOrder(null)} className="px-3 py-1.5 text-slate-500 font-bold">
                  {t('বাতিল', 'Cancel')}
                </button>
                <button type="submit" disabled={submittingResolution} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold">
                  {submittingResolution ? 'Executing...' : t('কার্যকর করুন', 'Execute')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">{t('প্রোফাইল অডিট', 'User Audit')}</h3>
              <button onClick={() => setSelectedUserDetail(null)} className="text-slate-400 p-1">✕</button>
            </div>
            <div className="flex items-center gap-3">
              <img
                src={selectedUserDetail.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUserDetail.id}`}
                alt={selectedUserDetail.name}
                className="w-12 h-12 rounded-full border border-slate-200"
              />
              <div>
                <h4 className="font-bold text-slate-900">{selectedUserDetail.name}</h4>
                <p className="text-slate-400 font-mono">{selectedUserDetail.email}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize">
                  {selectedUserDetail.role}
                </span>
              </div>
            </div>
            <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600">
              {selectedUserDetail.bio || 'No bio provided'}
            </p>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedUserDetail(null)} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold">
                {t('বন্ধ করুন', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">{t('নতুন কুপন কোড', 'Create Coupon')}</h3>
              <button onClick={() => setCouponModalOpen(false)} className="text-slate-400 p-1">✕</button>
            </div>
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Code *</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-mono font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCouponModalOpen(false)} className="px-3 py-1.5 text-slate-500 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold">
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">{t('ব্রডকাস্ট ব্যানার', 'Broadcast Alert')}</h3>
              <button onClick={() => setBroadcastModalOpen(false)} className="text-slate-400 p-1">✕</button>
            </div>
            <form onSubmit={handleCreateNotification} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Message *</label>
                <textarea
                  required
                  rows={3}
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setBroadcastModalOpen(false)} className="px-3 py-1.5 text-slate-500 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold">
                  Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
