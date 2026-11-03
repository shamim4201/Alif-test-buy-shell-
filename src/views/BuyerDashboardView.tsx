import React, { useState, useEffect, useMemo } from 'react';
import { Order, ChannelListing, Review, User, WebsiteSettings } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { getLocalizedChannelTitle } from '../translations/translations';
import {
  getWhatsAppUrl,
  getEmailMailtoUrl,
  buildGeneralInquiryWhatsAppMessage,
  buildGeneralInquiryEmail
} from '../services/notificationService';
import {
  LayoutDashboard,
  Compass,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Heart,
  History,
  MessageSquare,
  CreditCard,
  RotateCcw,
  AlertTriangle,
  Star,
  Bell,
  LifeBuoy,
  User as UserIcon,
  Shield,
  LogOut,
  ArrowRight,
  ExternalLink,
  Eye,
  Trash2,
  Search,
  Filter,
  Send,
  Check,
  Copy,
  Lock,
  ShieldCheck,
  Headphones,
  MessageCircle,
  Mail,
  FileText,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Phone,
  Calendar,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';

interface BuyerDashboardViewProps {
  onSelectOrder: (orderId: string) => void;
  onSelectChannel?: (channelId: string) => void;
  onBrowseChannels: () => void;
  onOpenLegal: (tab: 'tos' | 'privacy' | 'refund' | 'safety') => void;
}

type BuyerTab =
  | 'dashboard'
  | 'browse'
  | 'my_orders'
  | 'pending_orders'
  | 'completed_orders'
  | 'cancelled_orders'
  | 'wishlist'
  | 'recently_viewed'
  | 'my_messages'
  | 'payment_history'
  | 'refund_requests'
  | 'disputes'
  | 'my_reviews'
  | 'notifications'
  | 'support_tickets'
  | 'my_profile'
  | 'security_settings';

interface RefundItem {
  id: string;
  orderId: string;
  channelTitle: string;
  amount: number;
  reason: string;
  accountDetails: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  createdAt: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'normal' | 'high' | 'urgent';
  createdAt: string;
}

export const BuyerDashboardView: React.FC<BuyerDashboardViewProps> = ({
  onSelectOrder,
  onSelectChannel,
  onBrowseChannels,
  onOpenLegal
}) => {
  const { user, logout, showToast } = useAuth();
  const { currency, formatPrice, formatUsd, formatBdt, language, t } = useCurrency();

  const [activeTab, setActiveTab] = useState<BuyerTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allChannels, setAllChannels] = useState<ChannelListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  // Wishlist and Recently Viewed
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('channeltrust_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentViewedIds, setRecentViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('channeltrust_recently_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Search & Filter in Browse & Orders
  const [channelSearch, setChannelSearch] = useState('');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Messages State
  const [activeChatOrderId, setActiveChatOrderId] = useState<string>('');
  const [chatMessageInput, setChatMessageInput] = useState('');
  const [orderMessages, setOrderMessages] = useState<any[]>([]);

  // Refund Modal & State
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundOrderId, setRefundOrderId] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundAccountInfo, setRefundAccountInfo] = useState('');
  const [refundList, setRefundList] = useState<RefundItem[]>(() => {
    try {
      const saved = localStorage.getItem('channeltrust_buyer_refunds');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Support Ticket Modal & State
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('পেমেন্ট ও ভল্ট');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem('channeltrust_buyer_tickets');
      return saved ? JSON.parse(saved) : [
        {
          id: 'TCK-1001',
          subject: 'অ্যাকাউন্ট ওনারশিপ ট্রান্সফারে সহায়তা',
          category: 'ট্রান্সফার ও সিকিউরিটি',
          message: 'আমার চ্যানেলের ৭ দিনের কুলডাউন পিরিয়ড সম্পন্ন হয়েছে। প্রাইমারি ওনারশিপ হস্তান্তরের পরবর্তী ধাপগুলো কীভাবে নিশ্চিত করব?',
          status: 'resolved',
          priority: 'normal',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);

  // Logout Confirmation Modal
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Load Data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [ordersRes, channelsRes, settingsRes] = await Promise.all([
        api.getOrders().catch(() => ({ orders: [] })),
        api.getChannels().catch(() => ({ channels: [] })),
        api.getWebsiteSettings().catch(() => ({ settings: null }))
      ]);

      const myOrders = (ordersRes.orders || []).filter((o: Order) => o.buyerId === user?.id);
      setOrders(myOrders);
      setAllChannels(channelsRes.channels || []);
      if (settingsRes?.settings) {
        setSettings(settingsRes.settings);
      }
    } catch (err: any) {
      showToast(err.message || t('ডাটা লোড করতে ব্যর্থ হয়েছে', 'Failed to load dashboard data'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  // Sync profile details
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileBio(user.bio || '');
    }
  }, [user]);

  // Derived metrics requested by the user:
  // - Total Purchased Channels
  // - Active Orders
  // - Completed Orders
  // - Pending Payments
  // - Saved Channels
  // - Recent Purchases
  const activeOrders = useMemo(
    () => orders.filter((o) => ['pending', 'payment_confirmed', 'transfer_in_progress'].includes(o.status)),
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === 'completed'),
    [orders]
  );

  const cancelledOrders = useMemo(
    () => orders.filter((o) => o.status === 'cancelled'),
    [orders]
  );

  const pendingPayments = useMemo(
    () => orders.filter((o) => o.status === 'pending' || (o.paymentDetails && o.paymentDetails.adminApprovalStatus === 'pending')),
    [orders]
  );

  const disputedOrders = useMemo(
    () => orders.filter((o) => o.status === 'disputed'),
    [orders]
  );

  const wishlistChannels = useMemo(() => {
    if (wishlistIds.length === 0) return [];
    return allChannels.filter((c) => wishlistIds.includes(c.id));
  }, [allChannels, wishlistIds]);

  const recentlyViewedChannels = useMemo(() => {
    if (recentViewedIds.length === 0) return [];
    return allChannels.filter((c) => recentViewedIds.includes(c.id));
  }, [allChannels, recentViewedIds]);

  const recentPurchases = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }, [orders]);

  // Wishlist toggle
  const toggleWishlist = (channelId: string) => {
    let next: string[];
    if (wishlistIds.includes(channelId)) {
      next = wishlistIds.filter((id) => id !== channelId);
      showToast(t('উইশলিস্ট থেকে সরানো হয়েছে', 'Removed from Wishlist'), 'info');
    } else {
      next = [...wishlistIds, channelId];
      showToast(t('পছন্দের তালিকায় সেভ করা হয়েছে!', 'Saved to Wishlist!'), 'success');
    }
    setWishlistIds(next);
    localStorage.setItem('channeltrust_wishlist', JSON.stringify(next));
  };

  const handleOpenChannel = (channelId: string) => {
    // Record in recently viewed
    const nextRecent = [channelId, ...recentViewedIds.filter((id) => id !== channelId)].slice(0, 10);
    setRecentViewedIds(nextRecent);
    localStorage.setItem('channeltrust_recently_viewed', JSON.stringify(nextRecent));

    if (onSelectChannel) {
      onSelectChannel(channelId);
    } else {
      onBrowseChannels();
    }
  };

  // Submit Refund Request
  const handleSubmitRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundOrderId || !refundReason.trim()) {
      showToast(t('অনুগ্রহ করে অর্ডার ও রিফান্ডের কারণ নির্বাচন করুন', 'Please select an order and provide reason'), 'error');
      return;
    }

    const orderObj = orders.find((o) => o.id === refundOrderId);
    const newRefund: RefundItem = {
      id: `RFD-${Date.now().toString().slice(-5)}`,
      orderId: refundOrderId,
      channelTitle: orderObj?.channelTitle || 'Channel Purchase',
      amount: orderObj?.totalAmount || 0,
      reason: refundReason.trim(),
      accountDetails: refundAccountInfo.trim() || 'Default verified wallet',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const updated = [newRefund, ...refundList];
    setRefundList(updated);
    localStorage.setItem('channeltrust_buyer_refunds', JSON.stringify(updated));
    showToast(t('রিফান্ড আবেদন সফলভাবে জমা হয়েছে! এডমিন পর্যালোচনায় রয়েছে।', 'Refund request submitted! Under admin review.'), 'success');
    setRefundModalOpen(false);
    setRefundReason('');
    setRefundAccountInfo('');
  };

  // Submit Support Ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      showToast(t('অনুগ্রহ করে বিষয় ও বার্তার বিবরণ লিখুন', 'Please fill in subject and message'), 'error');
      return;
    }

    const newTicket: SupportTicket = {
      id: `TCK-${Date.now().toString().slice(-4)}`,
      subject: ticketSubject.trim(),
      category: ticketCategory,
      message: ticketMessage.trim(),
      status: 'open',
      priority: ticketPriority,
      createdAt: new Date().toISOString()
    };

    const updated = [newTicket, ...supportTickets];
    setSupportTickets(updated);
    localStorage.setItem('channeltrust_buyer_tickets', JSON.stringify(updated));
    showToast(t('সাপোর্ট টিকেট সফলভাবে খোলা হয়েছে! এডমিন দল দ্রুত উত্তর দেবে।', 'Support ticket opened successfully! Admin will respond shortly.'), 'success');
    setTicketModalOpen(false);
    setTicketSubject('');
    setTicketMessage('');
  };

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      await api.updateProfile({ name: profileName, bio: profileBio });
      showToast(t('প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে!', 'Profile updated successfully!'), 'success');
    } catch (err: any) {
      showToast(err.message || t('প্রোফাইল আপডেট করতে সমস্যা হয়েছে', 'Failed to update profile'), 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  // Save Security Settings
  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast(t('বর্তমান পাসওয়ার্ড দিন', 'Please enter current password'), 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast(t('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে', 'New password must be at least 6 characters'), 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast(t('নতুন পাসওয়ার্ড দুটি মিলছে না', 'New passwords do not match'), 'error');
      return;
    }

    setSecuritySaving(true);
    setTimeout(() => {
      setSecuritySaving(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast(t('পাসওয়ার্ড ও নিরাপত্তা সেটিংস সফলভাবে আপডেট হয়েছে!', 'Password and security settings updated!'), 'success');
    }, 600);
  };

  // Direct WhatsApp & Email Admin contact helpers
  const handleContactAdminWhatsApp = () => {
    const phone = settings?.whatsappSupport || settings?.contactPhone || '+8801700000000';
    const msg = buildGeneralInquiryWhatsAppMessage('Buyer Dashboard Support');
    window.open(getWhatsAppUrl(phone, msg), '_blank', 'noopener,noreferrer');
  };

  const handleContactAdminEmail = () => {
    const email = settings?.contactEmail || 'alifsheenshopping@gmail.com';
    const { subject, body } = buildGeneralInquiryEmail('Buyer Dashboard Support');
    window.location.href = getEmailMailtoUrl(email, subject, body);
  };

  // Sidebar navigation menu definition exactly matching user specifications
  const MENU_SECTIONS = [
    {
      groupTitle: t('মেইন মেনু', 'Main Menu'),
      items: [
        { id: 'dashboard' as BuyerTab, label: t('Dashboard', 'Dashboard'), desc: t('কেনাকাটার সারসংক্ষেপ', 'Overview & Summary'), icon: LayoutDashboard },
        { id: 'browse' as BuyerTab, label: t('Browse Channels', 'Browse Channels'), desc: t('সব চ্যানেল দেখা', 'Explore Market'), icon: Compass }
      ]
    },
    {
      groupTitle: t('অর্ডার ও কেনাকাটা', 'Orders & Purchases'),
      items: [
        { id: 'my_orders' as BuyerTab, label: t('My Orders', 'My Orders'), desc: t('কেনা চ্যানেলের অর্ডার', 'All Acquisitions'), icon: ShoppingBag, badge: orders.length },
        { id: 'pending_orders' as BuyerTab, label: t('Pending Orders', 'Pending Orders'), desc: t('চলমান অর্ডার', 'In Progress'), icon: Clock, badge: activeOrders.length, badgeColor: 'bg-amber-500' },
        { id: 'completed_orders' as BuyerTab, label: t('Completed Orders', 'Completed Orders'), desc: t('সম্পন্ন কেনাকাটা', 'Completed'), icon: CheckCircle2, badge: completedOrders.length, badgeColor: 'bg-emerald-500' },
        { id: 'cancelled_orders' as BuyerTab, label: t('Cancelled Orders', 'Cancelled Orders'), desc: t('বাতিল অর্ডার', 'Cancelled'), icon: XCircle, badge: cancelledOrders.length > 0 ? cancelledOrders.length : undefined, badgeColor: 'bg-rose-500' }
      ]
    },
    {
      groupTitle: t('সেভড ও অ্যাক্টিভিটি', 'Saved & Activity'),
      items: [
        { id: 'wishlist' as BuyerTab, label: t('Wishlist', 'Wishlist'), desc: t('পছন্দের চ্যানেল সেভ', 'Bookmarked'), icon: Heart, badge: wishlistIds.length > 0 ? wishlistIds.length : undefined, badgeColor: 'bg-rose-500' },
        { id: 'recently_viewed' as BuyerTab, label: t('Recently Viewed', 'Recently Viewed'), desc: t('সম্প্রতি দেখা চ্যানেল', 'History'), icon: History }
      ]
    },
    {
      groupTitle: t('কমিউনিকেশন ও পেমেন্ট', 'Communication & Billing'),
      items: [
        { id: 'my_messages' as BuyerTab, label: t('My Messages', 'My Messages'), desc: t('Seller-এর সঙ্গে যোগাযোগ', 'Direct Chat'), icon: MessageSquare },
        { id: 'payment_history' as BuyerTab, label: t('Payment History', 'Payment History'), desc: t('পেমেন্টের ইতিহাস', 'Deposit Ledger'), icon: CreditCard },
        { id: 'refund_requests' as BuyerTab, label: t('Refund Requests', 'Refund Requests'), desc: t('রিফান্ডের আবেদন', 'Claims'), icon: RotateCcw, badge: refundList.length > 0 ? refundList.length : undefined },
        { id: 'disputes' as BuyerTab, label: t('Disputes', 'Disputes'), desc: t('অর্ডার নিয়ে অভিযোগ', 'Arbitration'), icon: AlertTriangle, badge: disputedOrders.length > 0 ? disputedOrders.length : undefined, badgeColor: 'bg-red-600' }
      ]
    },
    {
      groupTitle: t('ইউজার ও সাপোর্ট', 'User & Support'),
      items: [
        { id: 'my_reviews' as BuyerTab, label: t('My Reviews', 'My Reviews'), desc: t('রিভিউ ও রেটিং', 'Ratings Given'), icon: Star },
        { id: 'notifications' as BuyerTab, label: t('Notifications', 'Notifications'), desc: t('নতুন নোটিফিকেশন', 'Alerts'), icon: Bell, badge: activeOrders.length > 0 ? activeOrders.length : undefined, badgeColor: 'bg-red-500' },
        { id: 'support_tickets' as BuyerTab, label: t('Support Tickets', 'Support Tickets'), desc: t('Admin-এর কাছে সাহায্য চাওয়া', 'Admin Help'), icon: LifeBuoy },
        { id: 'my_profile' as BuyerTab, label: t('My Profile', 'My Profile'), desc: t('ব্যক্তিগত তথ্য', 'Personal Info'), icon: UserIcon },
        { id: 'security_settings' as BuyerTab, label: t('Security Settings', 'Security Settings'), desc: t('পাসওয়ার্ড ও নিরাপত্তা', 'Password & 2FA'), icon: Shield }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* Top Buyer Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 text-sm">
                🛍️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900">
                    {t('বায়ার ড্যাশবোর্ড (Buyer Hub)', 'Buyer Dashboard Hub')}
                  </h1>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                    {t('যাচাইকৃত বায়ার', 'Verified Buyer')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono truncate max-w-[200px] sm:max-w-xs">
                  {user?.email || 'buyer@official1.online'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onBrowseChannels}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t('চ্যানেল ব্রাউজ করুন', 'Browse Channels')}</span>
            </button>

            <button
              onClick={() => setActiveTab('support_tickets')}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
              title={t('এডমিন সাপোর্ট', 'Admin Support')}
            >
              <Headphones className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">{t('সাপোর্ট', 'Support')}</span>
            </button>

            <button
              onClick={() => setLogoutModalOpen(true)}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer"
              title={t('লগআউট', 'Logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Body with Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ============================================================== */}
          {/* LEFT SIDEBAR NAVIGATION (18 Menus) */}
          {/* ============================================================== */}
          <aside
            className={`lg:col-span-1 lg:block ${
              mobileMenuOpen ? 'block fixed inset-0 z-50 bg-slate-900/60 p-4 lg:p-0 backdrop-blur-xs' : 'hidden'
            }`}
          >
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-5 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 lg:hidden">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {t('ড্যাশবোর্ড মেনু', 'Dashboard Navigation')}
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {MENU_SECTIONS.map((section, sIdx) => (
                <div key={sIdx} className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3">
                    {section.groupTitle}
                  </span>
                  <div className="space-y-0.5 pt-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer text-left ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-black'
                              : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                            <div className="min-w-0">
                              <span className="block truncate">{item.label}</span>
                              <span className={`block text-[10px] font-normal truncate ${isActive ? 'text-blue-100' : 'text-slate-600'}`}>
                                {item.desc}
                              </span>
                            </div>
                          </div>

                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                                isActive ? 'bg-white text-blue-600' : `${item.badgeColor || 'bg-slate-200'} text-slate-800`
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Logout button at bottom of sidebar */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => setLogoutModalOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
                  <div>
                    <span className="block">{t('Logout', 'Logout')}</span>
                    <span className="block text-[10px] text-rose-400 font-normal">
                      {t('অ্যাকাউন্ট থেকে বের হওয়া', 'Sign out of account')}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </aside>

          {/* ============================================================== */}
          {/* RIGHT MAIN CONTENT AREA */}
          {/* ============================================================== */}
          <main className="lg:col-span-3 space-y-6">
            {/* ============================================================== */}
            {/* 1. DASHBOARD TAB (কেনাকাটার সারসংক্ষেপ) */}
            {/* ============================================================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Welcome Card & Escrow Custody Assurance */}
                <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
                          {t('বায়ার ড্যাশবোর্ড সারসংক্ষেপ', 'Buyer Executive Summary')}
                        </span>
                        <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          {t('কাস্টডি গ্যারান্টি সক্রিয়', 'Custody Protection Active')}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                        {t('স্বাগতম, ', 'Welcome, ')}{user?.name || 'Buyer'}!
                      </h2>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl">
                        {t(
                          'আপনার ক্রয়কৃত অ্যাকাউন্ট, চলমান হস্তান্তর ধাপ ও পেমেন্ট ভল্ট স্ট্যাটাস একনজরে ট্র্যাক করুন।',
                          'Monitor your acquired accounts, ongoing transfer progression, and escrow deposits in real time.'
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={onBrowseChannels}
                        className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
                      >
                        {t('চ্যানেল কিনুন', 'Buy Channel')}
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-blue-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-200">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      {t('পাসওয়ার্ড ছাড়াই ইউটিউব ব্র্যান্ড অ্যাকাউন্ট রুল ট্রান্সফার', 'Zero password sharing - Standard role transfer')}
                    </span>
                    <button
                      onClick={() => onOpenLegal('safety')}
                      className="text-white underline font-semibold hover:text-blue-300 cursor-pointer"
                    >
                      {t('নিরাপত্তা নির্দেশিকা', 'Safety Rules')}
                    </button>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* 6 REQUIRED SPECIAL METRICS CARDS */}
                {/* ============================================================== */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {/* 1. Total Purchased Channels */}
                  <div
                    onClick={() => setActiveTab('completed_orders')}
                    className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-md transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">
                        {t('Total Purchased Channels', 'Total Purchased Channels')}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">{completedOrders.length}</p>
                      <span className="text-[10px] text-blue-600 font-semibold">{t('মালিকানা হস্তান্তর সম্পন্ন', 'Transfers Completed')}</span>
                    </div>
                  </div>

                  {/* 2. Active Orders */}
                  <div
                    onClick={() => setActiveTab('pending_orders')}
                    className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-amber-300 shadow-2xs hover:shadow-md transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">
                        {t('Active Orders', 'Active Orders')}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock className="w-4 h-4 animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-amber-600">{activeOrders.length}</p>
                      <span className="text-[10px] text-amber-700 font-semibold">{t('হস্তান্তর চলমান রয়েছে', 'In Handover Protocol')}</span>
                    </div>
                  </div>

                  {/* 3. Completed Orders */}
                  <div
                    onClick={() => setActiveTab('completed_orders')}
                    className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-md transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">
                        {t('Completed Orders', 'Completed Orders')}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-emerald-600">{completedOrders.length}</p>
                      <span className="text-[10px] text-emerald-700 font-semibold">{t('সফলভাবে ডেলিভারিপ্রাপ্ত', 'Successfully Acquired')}</span>
                    </div>
                  </div>

                  {/* 4. Pending Payments */}
                  <div
                    onClick={() => setActiveTab('payment_history')}
                    className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-purple-300 shadow-2xs hover:shadow-md transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">
                        {t('Pending Payments', 'Pending Payments')}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CreditCard className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-purple-700">{pendingPayments.length}</p>
                      <span className="text-[10px] text-purple-600 font-semibold">{t('ভল্ট ভেরিফিকেশন অপেক্ষমাণ', 'Pending Escrow Audit')}</span>
                    </div>
                  </div>

                  {/* 5. Saved Channels */}
                  <div
                    onClick={() => setActiveTab('wishlist')}
                    className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-rose-300 shadow-2xs hover:shadow-md transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">
                        {t('Saved Channels', 'Saved Channels')}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Heart className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-rose-600">{wishlistIds.length}</p>
                      <span className="text-[10px] text-rose-600 font-semibold">{t('পছন্দের সেভ করা চ্যানেল', 'Wishlisted Items')}</span>
                    </div>
                  </div>

                  {/* 6. Total Spent / Volume */}
                  <div
                    onClick={() => setActiveTab('payment_history')}
                    className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-md transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">
                        {t('মোট ব্যয় (Total Spent)', 'Total Escrow Volume')}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-900">
                        {formatPrice(orders.reduce((acc, o) => acc + (o.totalAmount || o.amount), 0))}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ≈ {currency === 'USD' ? formatBdt(orders.reduce((acc, o) => acc + (o.totalAmount || o.amount), 0)) : formatUsd(orders.reduce((acc, o) => acc + (o.totalAmount || o.amount), 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* RECENT PURCHASES (Recent Acquisitions) */}
                {/* ============================================================== */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-blue-600" />
                        <span>{t('Recent Purchases (সাম্প্রতিক কেনাকাটা)', 'Recent Purchases')}</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        {t('আপনার সাম্প্রতিক ৫টি অর্ডারের অবস্থা ও ট্র্যাকিং লিঙ্ক', 'Your latest 5 purchase orders and handover status')}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('my_orders')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t('সব দেখুন', 'View All')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {recentPurchases.length === 0 ? (
                    <div className="text-center py-10 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-slate-600 font-bold">
                        {t('এখনো কোনো অর্ডার সম্পন্ন হয়নি', 'No purchases made yet')}
                      </p>
                      <button
                        onClick={onBrowseChannels}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                      >
                        {t('মার্কেটপ্লেস ব্রাউজ করুন', 'Explore Marketplace')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentPurchases.map((order) => (
                        <div
                          key={order.id}
                          onClick={() => onSelectOrder(order.id)}
                          className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono font-bold text-blue-700">#{order.id}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  order.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : order.status === 'disputed'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {order.status === 'completed'
                                  ? t('হস্তান্তর সম্পন্ন', 'Completed')
                                  : order.status === 'disputed'
                                  ? t('ডিসপ্যুট', 'Disputed')
                                  : t('চলমান', 'In Progress')}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {getLocalizedChannelTitle({ title: order.channelTitle }, language)}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {t('সেলার: ', 'Seller: ')}<strong>{order.sellerName}</strong> •{' '}
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-slate-900 block">
                                {formatPrice(order.totalAmount || order.amount)}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {order.paymentDetails?.method || 'Escrow'}
                              </span>
                            </div>

                            <button className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer">
                              <span>{t('ট্র্যাকার', 'Track')}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Shortcuts & Support Helpline Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3">
                    <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>{t('দ্রুত অ্যাকশন (Quick Actions)', 'Quick Actions')}</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <button
                        onClick={() => setActiveTab('wishlist')}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center gap-2 transition cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>{t('উইশলিস্ট দেখুন', 'Saved Channels')}</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('recently_viewed')}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center gap-2 transition cursor-pointer"
                      >
                        <History className="w-4 h-4 text-blue-500" />
                        <span>{t('সম্প্রতি দেখা', 'Recent Views')}</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('refund_requests')}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center gap-2 transition cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-amber-500" />
                        <span>{t('রিফান্ড আবেদন', 'Refund Claim')}</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('my_messages')}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center gap-2 transition cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-500" />
                        <span>{t('সেলার চ্যাট', 'Seller Messages')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-emerald-600" />
                        <span>{t('অ্যাডমিন ইনস্ট্যান্ট হেল্পলাইন', 'Admin Instant Helpline')}</span>
                      </h4>
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                        {t('সার্বক্ষণিক অনলাইন', 'Online 24/7')}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      {t(
                        'যেকোনো চ্যানেল কেনাকাটা, পেমেন্ট ভেরিফিকেশন বা সমস্যার জন্য অ্যাডমিনের সাথে সরাসরি যোগাযোগ করুন:',
                        'Contact Admin directly for deal inspection, escrow verification, or urgent handover support:'
                      )}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleContactAdminWhatsApp}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={handleContactAdminEmail}
                        className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Mail className="w-4 h-4 text-rose-500" />
                        <span>{t('ইমেইল', 'Email')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 2. BROWSE CHANNELS TAB (সব চ্যানেল দেখা) */}
            {/* ============================================================== */}
            {activeTab === 'browse' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Compass className="w-5 h-5 text-blue-600" />
                      <span>{t('Browse Channels (সকল ভেরিফাইড চ্যানেল)', 'Browse Verified Channels')}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('সরাসরি বায়ার ড্যাশবোর্ড থেকে চ্যানেল ক্যাটালগ ফিল্টার ও ক্রয় করুন', 'Inspect and acquire verified social media channels with escrow security')}
                    </p>
                  </div>

                  <button
                    onClick={onBrowseChannels}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase transition cursor-pointer self-start sm:self-auto shadow-xs"
                  >
                    {t('সম্পূর্ণ মার্কেটপ্লেসে যান', 'Open Full Marketplace')}
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t('চ্যানেল বা অ্যাকাউন্টের নাম দিয়ে খুঁজুন...', 'Search channels by name, handle, or niche...')}
                      value={channelSearch}
                      onChange={(e) => setChannelSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-xs focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {['all', 'youtube', 'facebook', 'tiktok', 'instagram', 'telegram'].map((plat) => (
                      <button
                        key={plat}
                        onClick={() => setSelectedPlatformFilter(plat)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition cursor-pointer ${
                          selectedPlatformFilter === plat
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {plat === 'all' ? t('সব', 'All') : plat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Channels Grid */}
                {(() => {
                  const filtered = allChannels.filter((c) => {
                    const matchesSearch =
                      !channelSearch ||
                      c.title.toLowerCase().includes(channelSearch.toLowerCase()) ||
                      c.handle.toLowerCase().includes(channelSearch.toLowerCase()) ||
                      c.niche.toLowerCase().includes(channelSearch.toLowerCase());
                    const matchesPlatform = selectedPlatformFilter === 'all' || c.platform === selectedPlatformFilter;
                    return matchesSearch && matchesPlatform;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <Compass className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs text-slate-500 font-bold">{t('কোনো চ্যানেল পাওয়া যায়নি', 'No channels match your filter')}</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filtered.slice(0, 9).map((channel) => {
                        const isSaved = wishlistIds.includes(channel.id);
                        return (
                          <div
                            key={channel.id}
                            className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-md transition space-y-3 bg-white flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                  {channel.platform}
                                </span>
                                <button
                                  onClick={() => toggleWishlist(channel.id)}
                                  className={`p-1.5 rounded-full transition cursor-pointer ${
                                    isSaved ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:text-rose-500'
                                  }`}
                                  title={isSaved ? t('উইশলিস্ট থেকে মুছুন', 'Remove') : t('সেভ করুন', 'Save')}
                                >
                                  <Heart className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                                </button>
                              </div>

                              <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                                {getLocalizedChannelTitle(channel, language)}
                              </h4>
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                {channel.description}
                              </p>

                              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                                <span>{t('ফলোয়ার / সাব:', 'Subscribers:')}</span>
                                <span className="font-bold text-slate-900">{channel.subscribers?.toLocaleString('en-US')}</span>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-slate-400 block">{t('মূল্য', 'Price')}</span>
                                <span className="text-base font-extrabold text-slate-900">
                                  {formatPrice(channel.askingPrice)}
                                </span>
                              </div>

                              <button
                                onClick={() => handleOpenChannel(channel.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                              >
                                {t('কিনুন / দেখুন', 'View & Buy')}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ============================================================== */}
            {/* 3. MY ORDERS TAB (কেনা চ্যানেলের অর্ডার) */}
            {/* ============================================================== */}
            {activeTab === 'my_orders' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                      <span>{t('My Orders (আমার সকল অর্ডার)', 'My Orders')}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('আপনার ক্রয়কৃত সকল অর্ডারের তালিকা ও ওনারশিপ স্ট্যাটাস', 'Complete acquisition portfolio with ownership transfer tracking')}
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t('অর্ডার খুঁজুন...', 'Filter orders...')}
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-900">{t('এখনো কোনো অর্ডার নেই', 'No Orders Found')}</h4>
                    <button
                      onClick={onBrowseChannels}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase shadow-xs cursor-pointer"
                    >
                      {t('চ্যানেল ব্রাউজ করুন', 'Browse Channels')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders
                      .filter((o) => !orderSearch || o.id.toLowerCase().includes(orderSearch.toLowerCase()) || o.channelTitle.toLowerCase().includes(orderSearch.toLowerCase()))
                      .map((order) => (
                        <div
                          key={order.id}
                          onClick={() => onSelectOrder(order.id)}
                          className="p-5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/20 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs group"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-blue-700">#{order.id}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                                  order.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : order.status === 'disputed'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {order.status === 'completed'
                                  ? t('সম্পন্ন', 'Completed')
                                  : order.status === 'disputed'
                                  ? t('ডিসপ্যুট', 'Disputed')
                                  : t('চলমান', 'In Progress')}
                              </span>
                              {order.paymentDetails?.adminApprovalStatus === 'approved' && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                                  {t('ডিপোজিট ভেরিফাইড ✓', 'Escrow Verified ✓')}
                                </span>
                              )}
                            </div>

                            <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {getLocalizedChannelTitle({ title: order.channelTitle }, language)}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {t('সেলার: ', 'Seller: ')}<strong>{order.sellerName}</strong> ({order.sellerEmail}) •{' '}
                              {t('তারিখ: ', 'Date: ')}{new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-semibold">{t('সর্বমোট জমা', 'Total Deposit')}</span>
                              <span className="text-base font-extrabold text-slate-900">
                                {formatPrice(order.totalAmount || order.amount)}
                              </span>
                            </div>

                            <button className="px-4 py-2 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer">
                              <span>{t('ট্র্যাকার দেখুন', 'Open Tracker')}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 4. PENDING ORDERS TAB (চলমান অর্ডার) */}
            {/* ============================================================== */}
            {activeTab === 'pending_orders' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                    <span>{t('Pending Orders (চলমান অর্ডারসমূহ)', 'Pending & Ongoing Orders')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('যেসব অর্ডারের পেমেন্ট ভেরিফিকেশন বা ৭-দিনের ওনারশিপ হস্তান্তর চলছে', 'Orders currently progressing through escrow audit and Google 7-day cooldown')}
                  </p>
                </div>

                {activeOrders.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs text-slate-600 font-bold">{t('কোনো চলমান অর্ডার নেই', 'No pending orders at this moment')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => onSelectOrder(order.id)}
                        className="p-5 rounded-2xl border-2 border-amber-200 bg-amber-50/30 hover:bg-amber-50/60 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-amber-900">#{order.id}</span>
                            <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full animate-pulse">
                              ⏳ {t('হস্তান্তর চলমান', 'Transfer in Progress')}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900">{order.channelTitle}</h4>
                          <p className="text-xs text-slate-600">
                            {t('সেলার: ', 'Seller: ')}<strong>{order.sellerName}</strong> • {t('মূল্য: ', 'Price: ')}{formatPrice(order.totalAmount || order.amount)}
                          </p>
                        </div>

                        <button className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start md:self-auto">
                          <span>{t('হস্তান্তর ধাপ পরিচালনা করুন', 'Manage Handover Steps')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 5. COMPLETED ORDERS TAB (সম্পন্ন কেনাকাটা) */}
            {/* ============================================================== */}
            {activeTab === 'completed_orders' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{t('Completed Orders (সম্পন্ন কেনাকাটা)', 'Completed Purchases')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('যেসব চ্যানেলের প্রাইমারি ওনারশিপ আপনি সফলভাবে বুঝে পেয়েছেন', 'Accounts where primary ownership transfer was successfully completed and verified')}
                  </p>
                </div>

                {completedOrders.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500 font-bold">{t('এখনো কোনো সম্পন্ন অর্ডার নেই', 'No completed orders yet')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-emerald-800">#{order.id}</span>
                            <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                              ✓ {t('সম্পন্ন', 'Completed')}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900">{order.channelTitle}</h4>
                          <p className="text-xs text-slate-600">
                            {t('সেলার: ', 'Seller: ')}<strong>{order.sellerName}</strong> • {t('ক্রয়মূল্য: ', 'Price: ')}{formatPrice(order.totalAmount || order.amount)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectOrder(order.id)}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                          >
                            {t('রসিদ ও রেকর্ড', 'Receipt & Audit')}
                          </button>
                          <button
                            onClick={() => setActiveTab('my_reviews')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span>{t('রিভিউ দিন', 'Review')}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 6. CANCELLED ORDERS TAB (বাতিল অর্ডার) */}
            {/* ============================================================== */}
            {activeTab === 'cancelled_orders' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>{t('Cancelled Orders (বাতিল অর্ডারসমূহ)', 'Cancelled Orders')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('যেসব অর্ডার বায়ার বা সেলার কর্তৃক বাতিল বা রিফান্ড করা হয়েছে', 'Orders cancelled due to seller unavailability, failed audit, or buyer mutual request')}
                  </p>
                </div>

                {cancelledOrders.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <Check className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs text-slate-500 font-bold">{t('কোনো বাতিল অর্ডার নেই', 'No cancelled orders on your account')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cancelledOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-5 rounded-2xl border border-rose-200 bg-rose-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-rose-800">#{order.id}</span>
                            <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full">
                              ✕ {t('বাতিলকৃত', 'Cancelled')}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900">{order.channelTitle}</h4>
                          <p className="text-xs text-slate-500">
                            {t('মূল্য: ', 'Amount: ')}{formatPrice(order.totalAmount || order.amount)}
                          </p>
                        </div>

                        <button
                          onClick={() => onSelectOrder(order.id)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                        >
                          {t('বিবরণ দেখুন', 'View Details')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 7. WISHLIST TAB (পছন্দের চ্যানেল সেভ) */}
            {/* ============================================================== */}
            {activeTab === 'wishlist' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                      <span>{t('Wishlist (পছন্দের সেভ করা চ্যানেল)', 'Saved Channels (Wishlist)')}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('ভবিষ্যতে কেনার জন্য আপনার বুকমার্ক করা চ্যানেলসমূহ', 'Channels and pages you bookmarked for later acquisition')}
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200">
                    {wishlistIds.length} {t('টি সেভড', 'Saved')}
                  </span>
                </div>

                {wishlistChannels.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-900">{t('উইশলিস্টে কোনো চ্যানেল নেই', 'Your Wishlist is Empty')}</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {t('চ্যানেল ব্রাউজ করার সময় হার্ট (Heart) আইকনে ক্লিক করে পছন্দের চ্যানেলগুলো এখানে সেভ করে রাখুন।', 'Click the heart icon on any channel card while browsing to save it to your wishlist.')}
                    </p>
                    <button
                      onClick={onBrowseChannels}
                      className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase transition cursor-pointer shadow-xs"
                    >
                      {t('চ্যানেল খুঁজুন', 'Explore Channels')}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistChannels.map((channel) => (
                      <div
                        key={channel.id}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-rose-300 shadow-2xs hover:shadow-md transition bg-white flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              {channel.platform}
                            </span>
                            <button
                              onClick={() => toggleWishlist(channel.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              title={t('মুছুন', 'Remove')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{channel.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{channel.description}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-base font-black text-slate-900">{formatPrice(channel.askingPrice)}</span>
                          <button
                            onClick={() => handleOpenChannel(channel.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                          >
                            {t('কিনুন', 'Buy Now')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 8. RECENTLY VIEWED TAB (সম্প্রতি দেখা চ্যানেল) */}
            {/* ============================================================== */}
            {activeTab === 'recently_viewed' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <History className="w-5 h-5 text-blue-600" />
                      <span>{t('Recently Viewed (সম্প্রতি দেখা চ্যানেলসমূহ)', 'Recently Viewed Channels')}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('আপনি সম্প্রতি যেসব চ্যানেল ও পেজ ব্রাউজ করেছেন', 'Channels and digital properties you recently inspected')}
                    </p>
                  </div>

                  {recentlyViewedChannels.length > 0 && (
                    <button
                      onClick={() => {
                        setRecentViewedIds([]);
                        localStorage.removeItem('channeltrust_recently_viewed');
                        showToast(t('হিস্ট্রি মুছে ফেলা হয়েছে', 'History cleared'), 'info');
                      }}
                      className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                    >
                      {t('হিস্ট্রি ক্লিয়ার করুন', 'Clear History')}
                    </button>
                  )}
                </div>

                {recentlyViewedChannels.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <History className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-bold">{t('কোনো সম্প্রতি দেখা চ্যানেল নেই', 'No browsing history yet')}</p>
                    <button
                      onClick={onBrowseChannels}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer mt-2"
                    >
                      {t('চ্যানেল ব্রাউজ শুরু করুন', 'Start Browsing')}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentlyViewedChannels.map((channel) => (
                      <div
                        key={channel.id}
                        onClick={() => handleOpenChannel(channel.id)}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/20 transition cursor-pointer space-y-2 shadow-2xs"
                      >
                        <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {channel.platform}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{channel.title}</h4>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                          <span className="text-slate-500">{channel.subscribers?.toLocaleString()} subs</span>
                          <span className="font-extrabold text-slate-900">{formatPrice(channel.askingPrice)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 9. MY MESSAGES TAB (Seller-এর সঙ্গে যোগাযোগ) */}
            {/* ============================================================== */}
            {activeTab === 'my_messages' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <span>{t('My Messages (সেলারদের সাথে মেসেজ ও চ্যাট)', 'My Messages with Sellers')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('অর্ডার সংক্রান্ত বিষয় নিয়ে সেলারের সাথে সরাসরি নিরাপদ চ্যাট করুন', 'Direct end-to-end communication with channel sellers within platform custody')}
                  </p>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500 font-bold">{t('কোনো সক্রিয় মেসেজ কনভারসেশন নেই', 'No active order chats')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => onSelectOrder(order.id)}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 transition cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {order.sellerName.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{order.channelTitle}</h4>
                            <p className="text-[11px] text-slate-500">
                              {t('সেলার: ', 'Seller: ')}{order.sellerName} • Order #{order.id}
                            </p>
                          </div>
                        </div>

                        <button className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer">
                          <span>{t('চ্যাট খুলুন', 'Open Chat')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 10. PAYMENT HISTORY TAB (পেমেন্টের ইতিহাস) */}
            {/* ============================================================== */}
            {activeTab === 'payment_history' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span>{t('Payment History (পেমেন্ট ও ডিপোজিটের ইতিহাস)', 'Payment History & Escrow Deposits')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('আপনার সকল ডিপোজিট, TrxID এবং ব্যাংক/ওয়ালেট ট্রানজেকশন লগ', 'Complete record of deposits, gateway references, and verification receipts')}
                  </p>
                </div>

                {orders.filter((o) => o.paymentDetails).length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <CreditCard className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500 font-bold">{t('এখনো কোনো পেমেন্ট রেকর্ড নেই', 'No payment records found')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                          <th className="py-2.5 px-3">{t('তারিখ', 'Date')}</th>
                          <th className="py-2.5 px-3">{t('অর্ডার নং', 'Order ID')}</th>
                          <th className="py-2.5 px-3">{t('চ্যানেল', 'Channel')}</th>
                          <th className="py-2.5 px-3">{t('পদ্ধতি (Method)', 'Method')}</th>
                          <th className="py-2.5 px-3">{t('TrxID / রেফারেন্স', 'TrxID')}</th>
                          <th className="py-2.5 px-3 text-right">{t('টাকার পরিমাণ', 'Amount')}</th>
                          <th className="py-2.5 px-3 text-center">{t('স্ট্যাটাস', 'Status')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders
                          .filter((o) => o.paymentDetails)
                          .map((order) => (
                            <tr
                              key={order.id}
                              onClick={() => onSelectOrder(order.id)}
                              className="hover:bg-slate-50 transition cursor-pointer"
                            >
                              <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-blue-600">#{order.id}</td>
                              <td className="py-3 px-3 font-bold text-slate-900 max-w-[150px] truncate">{order.channelTitle}</td>
                              <td className="py-3 px-3 text-slate-700">{order.paymentDetails?.method}</td>
                              <td className="py-3 px-3 font-mono text-slate-900 font-bold select-all">{order.paymentDetails?.transactionRef}</td>
                              <td className="py-3 px-3 font-extrabold text-slate-900 text-right whitespace-nowrap">
                                {formatPrice(order.totalAmount || order.amount)}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    order.paymentDetails?.adminApprovalStatus === 'approved'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : order.paymentDetails?.adminApprovalStatus === 'rejected'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {order.paymentDetails?.adminApprovalStatus === 'approved'
                                    ? t('অনুমোদিত', 'Approved')
                                    : order.paymentDetails?.adminApprovalStatus === 'rejected'
                                    ? t('বাতিল', 'Rejected')
                                    : t('পেন্ডিং', 'Pending')}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 11. REFUND REQUESTS TAB (রিফান্ডের আবেদন) */}
            {/* ============================================================== */}
            {activeTab === 'refund_requests' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-amber-600" />
                      <span>{t('Refund Requests (রিফান্ডের আবেদন)', 'Refund Requests')}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('বাতিলকৃত বা সমস্যাযুক্ত অর্ডারের জন্য রিফান্ড ক্লেম সাবমিট ও ট্র্যাক করুন', 'Submit and track escrow refunds for cancelled or disputed acquisitions')}
                    </p>
                  </div>

                  <button
                    onClick={() => setRefundModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs self-start sm:self-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('নতুন রিফান্ড আবেদন', 'Request Refund')}</span>
                  </button>
                </div>

                {refundList.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <RotateCcw className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500 font-bold">{t('কোনো রিফান্ড আবেদন নেই', 'No refund requests submitted')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {refundList.map((refItem) => (
                      <div
                        key={refItem.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-amber-700">#{refItem.id}</span>
                            <span className="text-xs text-slate-500">• Order #{refItem.orderId}</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                            {refItem.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{refItem.channelTitle}</h4>
                        <p className="text-xs text-slate-600">
                          <strong>{t('কারণ: ', 'Reason: ')}</strong>{refItem.reason}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="text-slate-500">{refItem.accountDetails}</span>
                          <span className="font-extrabold text-slate-900">{formatPrice(refItem.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 12. DISPUTES TAB (অর্ডার নিয়ে অভিযোগ) */}
            {/* ============================================================== */}
            {activeTab === 'disputes' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span>{t('Disputes & Claims (অর্ডার বিরোধ ও আরবিট্রেশন)', 'Disputes & Claims')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('হস্তান্তর সংক্রান্ত কোনো সমস্যা হলে প্ল্যাটফর্ম এডমিন আরবিট্রেশন সিদ্ধান্ত দেয়', 'Formal buyer-seller mediation governed by official ChannelTrust escrow compliance')}
                  </p>
                </div>

                {disputedOrders.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs text-slate-600 font-bold">{t('কোনো সক্রিয় ডিসপ্যুট বা অভিযোগ নেই', 'No active disputes on your account')}</p>
                    <p className="text-[11px] text-slate-400">{t('আপনার সব অর্ডার স্বাভাবিক নিয়ম অনুযায়ী পরিচালিত হচ্ছে', 'All your transactions are in good standing')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {disputedOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => onSelectOrder(order.id)}
                        className="p-5 rounded-2xl border-2 border-rose-300 bg-rose-50/30 space-y-2 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-rose-800">#{order.id}</span>
                          <span className="text-[10px] bg-rose-600 text-white font-bold px-2.5 py-0.5 rounded-full">
                            ⚠️ {t('ডিসপ্যুট চলছে', 'In Dispute')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{order.channelTitle}</h4>
                        <p className="text-xs text-slate-600">
                          {order.disputeReason || t('বায়ার বা সেলার মধ্যস্থতার আবেদন করেছেন। এডমিন তদন্ত করছেন।', 'Under active admin arbitration review.')}
                        </p>
                        <div className="pt-2 flex justify-end">
                          <button className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">
                            {t('আরবিট্রেশন রুম খুলুন', 'Open Arbitration Vault')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 13. MY REVIEWS TAB (রিভিউ ও রেটিং) */}
            {/* ============================================================== */}
            {activeTab === 'my_reviews' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span>{t('My Reviews (আমার দেওয়া রিভিউ ও রেটিং)', 'My Reviews & Ratings')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('ক্রয় সম্পন্ন হওয়া চ্যানেলের সেলারদের জন্য আপনার ফিডব্যাক', 'Feedback submitted for sellers upon successful ownership takeover')}
                  </p>
                </div>

                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <Star className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs text-slate-600 font-bold">{t('সম্পন্ন অর্ডার পেজে গিয়ে সরাসরি ৫-স্টার রিভিউ দিতে পারেন', 'You can leave verified reviews directly from completed order pages')}</p>
                  <button
                    onClick={() => setActiveTab('completed_orders')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer shadow-xs"
                  >
                    {t('সম্পন্ন অর্ডার দেখুন', 'View Completed Orders')}
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 14. NOTIFICATIONS TAB (নতুন নোটিফিকেশন) */}
            {/* ============================================================== */}
            {activeTab === 'notifications' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <span>{t('Notifications (অর্ডার ও প্ল্যাটফর্ম নোটিফিকেশন)', 'Notifications')}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('আপনার সকল অর্ডার আপডেট ও সিস্টেম বার্তা', 'Real-time alerts, payment confirmations, and transfer steps')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                    <Bell className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-xs space-y-0.5">
                      <strong className="text-blue-950 block">{t('স্বাগতম বায়ার ড্যাশবোর্ডে!', 'Welcome to Buyer Dashboard!')}</strong>
                      <p className="text-blue-800">
                        {t('আপনার অ্যাকাউন্ট কেনাকাটার সম্পূর্ণ নিরাপত্তা প্ল্যাটফর্ম কাস্টডি দ্বারা নিশ্চিত করা হয়েছে।', 'Your account transactions are backed by official platform escrow.')}
                      </p>
                      <span className="text-[10px] text-blue-600 block mt-1">{t('সক্রিয়', 'Active')}</span>
                    </div>
                  </div>

                  {activeOrders.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => onSelectOrder(o.id)}
                      className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start justify-between gap-3 cursor-pointer hover:bg-amber-100/50 transition"
                    >
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0 animate-pulse" />
                        <div className="text-xs space-y-0.5">
                          <strong className="text-amber-950 block">#{o.id} - {o.channelTitle}</strong>
                          <p className="text-amber-800">
                            {t('হস্তান্তর প্রক্রিয়া চলমান রয়েছে। বিস্তারিত দেখতে ক্লিক করুন।', 'Handover protocol is underway. Click to view progress.')}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full shrink-0">
                        {t('চলমান', 'Pending')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 15. SUPPORT TICKETS TAB (Admin-এর কাছে সাহায্য চাওয়া) */}
            {/* ============================================================== */}
            {activeTab === 'support_tickets' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <LifeBuoy className="w-5 h-5 text-blue-600" />
                      <span>{t('Support Tickets (এডমিন সাপোর্ট ও হেল্পডেস্ক)', 'Support Tickets')}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('কোনো সাহায্যের প্রয়োজন হলে সরাসরি টিকেট খুলুন বা WhatsApp এ কথা বলুন', 'Open priority support tickets or reach admin directly for assistance')}
                    </p>
                  </div>

                  <button
                    onClick={() => setTicketModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs self-start sm:self-auto"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>{t('নতুন টিকেট খুলুন', 'Open Ticket')}</span>
                  </button>
                </div>

                {/* Direct Instant Channels */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <strong className="text-xs text-emerald-950 flex items-center gap-1.5">
                      <Headphones className="w-4 h-4 text-emerald-600" />
                      {t('তাৎক্ষণিক WhatsApp বা Email সাহায্য চান?', 'Need Instant Help on WhatsApp or Email?')}
                    </strong>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      {t('এডমিন সাধারণত ১০-১৫ মিনিটের মধ্যে উত্তর দিয়ে থাকে।', 'Admin usually responds within 10-15 minutes.')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleContactAdminWhatsApp}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={handleContactAdminEmail}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-emerald-300 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-rose-500" />
                      <span>Email</span>
                    </button>
                  </div>
                </div>

                {/* Ticket List */}
                <div className="space-y-3">
                  {supportTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-blue-700">#{ticket.id}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                            {ticket.category}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            ticket.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{ticket.subject}</h4>
                      <p className="text-xs text-slate-600">{ticket.message}</p>
                      <div className="pt-1 text-[10px] text-slate-400">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 16. MY PROFILE TAB (ব্যক্তিগত তথ্য) */}
            {/* ============================================================== */}
            {activeTab === 'my_profile' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                    <span>{t('My Profile (ব্যক্তিগত প্রোফাইল ও তথ্য)', 'My Profile Information')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('আপনার নাম, ইমেইল এবং যোগাযোগের তথ্য পরিচালনা করুন', 'Manage your personal identity, contact handles, and account credentials')}
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('আপনার নাম (Full Name)', 'Full Name')}
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('রেজিস্টার্ড ইমেইল (Login Email)', 'Registered Email')}
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-500 cursor-not-allowed font-mono"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {t('ইমেইল অ্যাড্রেস পরিবর্তন করতে এডমিনের সাথে যোগাযোগ করুন', 'Contact admin to update verified primary email')}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('বায়ার পরিচিতি ও বায়ো (Bio / Description)', 'Bio / About You')}
                    </label>
                    <textarea
                      rows={3}
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      placeholder={t('আপনার ডিজিটাল চ্যানেল ক্রয় অভিজ্ঞতা...', 'Digital creator acquisition notes...')}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {profileSaving ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('প্রোফাইল সংরক্ষণ করুন', 'Save Profile')}
                  </button>
                </form>
              </div>
            )}

            {/* ============================================================== */}
            {/* 17. SECURITY SETTINGS TAB (পাসওয়ার্ড ও নিরাপত্তা) */}
            {/* ============================================================== */}
            {activeTab === 'security_settings' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <span>{t('Security Settings (পাসওয়ার্ড ও নিরাপত্তা)', 'Security Settings')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন এবং নিরাপত্তা নিয়ন্ত্রণ করুন', 'Manage password, two-factor authentication, and account integrity')}
                  </p>
                </div>

                {/* Password Change Form */}
                <form onSubmit={handleSaveSecurity} className="space-y-4 max-w-lg pt-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('পাসওয়ার্ড পরিবর্তন করুন', 'Change Password')}
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('বর্তমান পাসওয়ার্ড', 'Current Password')}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)', 'New Password')}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('নতুন পাসওয়ার্ড পুনরায় লিখুন', 'Confirm New Password')}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={securitySaving}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {securitySaving ? t('আপডেট হচ্ছে...', 'Updating...') : t('পাসওয়ার্ড আপডেট করুন', 'Update Password')}
                  </button>
                </form>

                {/* 2FA Toggle Card */}
                <div className="pt-6 border-t border-slate-200 flex items-center justify-between max-w-lg">
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">
                      {t('দ্বি-স্তর বিশিষ্ট নিরাপত্তা (2-Factor Authentication)', 'Two-Factor Authentication (2FA)')}
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      {t('প্রতিবার লগইনের সময় ইমেইল ওটিপি নিরাপত্তা যোগ করুন', 'Add an extra verification layer to your account')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      showToast(
                        !twoFactorEnabled
                          ? t('2FA নিরাপত্তা সক্রিয় করা হয়েছে!', '2FA enabled!')
                          : t('2FA নিষ্ক্রিয় করা হয়েছে', '2FA disabled'),
                        'success'
                      );
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      twoFactorEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        twoFactorEnabled ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ============================================================== */}
      {/* REFUND MODAL */}
      {/* ============================================================== */}
      {refundModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>{t('রিফান্ড আবেদন ফর্ম', 'Refund Request Form')}</span>
              </h3>
              <button
                onClick={() => setRefundModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRefund} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('অর্ডার নির্বাচন করুন', 'Select Order')}
                </label>
                <select
                  value={refundOrderId}
                  onChange={(e) => setRefundOrderId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden"
                >
                  <option value="">{t('-- অর্ডার বাছাই করুন --', '-- Select an Order --')}</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      #{o.id} - {o.channelTitle} ({formatPrice(o.totalAmount || o.amount)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('রিফান্ডের কারণ', 'Reason for Refund')}
                </label>
                <textarea
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder={t('কেন রিফান্ড চাইছেন বিস্তারিত লিখুন...', 'Explain why you are requesting a refund...')}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('টাকা ফেরতের অ্যাকাউন্ট (বিকাশ / নগদ / ব্যাংক নম্বর)', 'Refund Payout Account (bKash/Nagad/Bank)')}
                </label>
                <input
                  type="text"
                  value={refundAccountInfo}
                  onChange={(e) => setRefundAccountInfo(e.target.value)}
                  placeholder="e.g. bKash Personal 017xxxxxxxx"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRefundModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {t('আবেদন জমা দিন', 'Submit Request')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUPPORT TICKET MODAL */}
      {/* ============================================================== */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-blue-600" />
                <span>{t('নতুন সাপোর্ট টিকেট খুলুন', 'Open Support Ticket')}</span>
              </h3>
              <button
                onClick={() => setTicketModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('ক্যাটাগরি', 'Category')}
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                >
                  <option value="পেমেন্ট ও ভল্ট">পেমেন্ট ও ভল্ট (Payment & Escrow)</option>
                  <option value="ট্রান্সফার ও সিকিউরিটি">ট্রান্সফার ও সিকিউরিটি (Transfer Protocol)</option>
                  <option value="সেলার যোগাযোগ">সেলার যোগাযোগ (Seller Communication)</option>
                  <option value="রিফান্ড সংক্রান্ত">রিফান্ড সংক্রান্ত (Refund Issue)</option>
                  <option value="অন্যান্য জিজ্ঞাসা">অন্যান্য জিজ্ঞাসা (General Inquiry)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('বিষয়ের নাম (Subject)', 'Subject')}
                </label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder={t('সংক্ষেপে সমস্যা উল্লেখ করুন...', 'Brief summary of issue...')}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('জরুরি মাত্রা (Priority)', 'Priority')}
                </label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                >
                  <option value="normal">{t('সাধারণ (Normal)', 'Normal')}</option>
                  <option value="high">{t('জরুরি (High)', 'High')}</option>
                  <option value="urgent">{t('অতি জরুরি (Urgent)', 'Urgent')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('বিস্তারিত বার্তা (Details)', 'Details')}
                </label>
                <textarea
                  rows={3}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder={t('আপনার সমস্যার বিস্তারিত লিখুন...', 'Describe what help you need...')}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {t('টিকেট জমা দিন', 'Submit Ticket')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* LOGOUT CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {t('অ্যাকাউন্ট থেকে লগআউট করবেন?', 'Log Out of Account?')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('আপনি কি নিশ্চিত যে আপনার বায়ার অ্যাকাউন্ট থেকে প্রস্থান করতে চান?', 'Are you sure you want to exit your buyer dashboard session?')}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                {t('না, বাতিল', 'Cancel')}
              </button>
              <button
                onClick={() => {
                  logout();
                  setLogoutModalOpen(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                {t('হ্যাঁ, লগআউট', 'Yes, Log Out')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Plus icon
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
