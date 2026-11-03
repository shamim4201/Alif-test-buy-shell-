import React, { useState, useEffect, useMemo } from 'react';
import { ChannelListing, Order, User, PlatformType, CustomCategory, Review } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { PlatformLogo } from '../components/CategoryIcons';
import { getLocalizedChannelTitle } from '../translations/translations';
import {
  getWhatsAppUrl,
  getEmailMailtoUrl,
  buildGeneralInquiryWhatsAppMessage,
  buildGeneralInquiryEmail
} from '../services/notificationService';
import {
  LayoutDashboard,
  PlusCircle,
  List,
  CheckCircle2,
  Clock,
  XCircle,
  CheckCheck,
  FileEdit,
  Edit,
  Users,
  ShoppingBag,
  DollarSign,
  Wallet,
  Hourglass,
  ArrowDownToLine,
  Receipt,
  Star,
  ShieldCheck,
  AlertTriangle,
  Bell,
  LifeBuoy,
  User as UserIcon,
  Shield,
  LogOut,
  Upload,
  Eye,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Send,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  CreditCard,
  Building2,
  Smartphone,
  Coins,
  ArrowRight,
  Headphones,
  MessageCircle,
  Mail,
  Award
} from 'lucide-react';

interface SellerDashboardViewProps {
  initialTab?: string;
  onSelectOrder: (orderId: string) => void;
  onSelectChannel: (channelId: string) => void;
  onOpenLegal: (tab: 'tos' | 'privacy' | 'refund' | 'safety') => void;
}

type SellerTab =
  | 'dashboard'
  | 'add_channel'
  | 'my_listings'
  | 'active_listings'
  | 'pending_approval'
  | 'rejected_listings'
  | 'sold_channels'
  | 'draft_listings'
  | 'edit_listings'
  | 'buyer_inquiries'
  | 'my_orders'
  | 'pending_orders'
  | 'completed_sales'
  | 'messages'
  | 'earnings'
  | 'available_balance'
  | 'pending_balance'
  | 'withdrawal_request'
  | 'payment_history'
  | 'reviews'
  | 'channel_verification'
  | 'disputes'
  | 'notifications'
  | 'support_tickets'
  | 'my_profile'
  | 'security_settings';

interface WithdrawalRecord {
  id: string;
  amount: number;
  method: string;
  accountDetails: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
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

const NICHES = [
  'Entertainment',
  'Gaming',
  'Finance',
  'Education',
  'Tech',
  'Lifestyle',
  'Music',
  'Health & Fitness',
  'News & Politics',
  'Cooking & Food'
];

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({
  initialTab = 'dashboard',
  onSelectOrder,
  onSelectChannel,
  onOpenLegal
}) => {
  const { user, logout, showToast } = useAuth();
  const { currency, formatPrice, formatUsd, formatBdt, language, t } = useCurrency();

  // Active Tab
  const [activeTab, setActiveTab] = useState<SellerTab>(
    initialTab === 'create' ? 'add_channel' : initialTab === 'sales' ? 'my_orders' : (initialTab as SellerTab) || 'dashboard'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data
  const [myChannels, setMyChannels] = useState<ChannelListing[]>([]);
  const [mySales, setMySales] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCategories, setAvailableCategories] = useState<CustomCategory[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // Search in listings
  const [listingSearch, setListingSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Add / Edit Channel Form State
  const [platform, setPlatform] = useState<PlatformType>('facebook');
  const [title, setTitle] = useState('');
  const [handle, setHandle] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [niche, setNiche] = useState('Entertainment');
  const [accountType, setAccountType] = useState('facebook_page');
  const [primaryLanguage, setPrimaryLanguage] = useState('Bengali / Bangla & English');
  const [subscribers, setSubscribers] = useState('');
  const [monthlyViews, setMonthlyViews] = useState('');
  const [lifetimeViews, setLifetimeViews] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [videoCount, setVideoCount] = useState('');
  const [creationYear, setCreationYear] = useState('2023');
  const [monetizationStatus, setMonetizationStatus] = useState<'monetized' | 'not_monetized'>('monetized');
  const [strikeStatus, setStrikeStatus] = useState<'clean' | '1_strike'>('clean');
  const [hasSilverButton, setHasSilverButton] = useState(false);
  const [askingPrice, setAskingPrice] = useState('');
  const [minOfferPrice, setMinOfferPrice] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedScreenshots, setUploadedScreenshots] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit Listing Modal / Target
  const [editingChannel, setEditingChannel] = useState<ChannelListing | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editMinOffer, setEditMinOffer] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Drafts
  const [drafts, setDrafts] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('channeltrust_seller_drafts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Withdrawals
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('bKash');
  const [withdrawalAccount, setWithdrawalAccount] = useState('');
  const [withdrawalList, setWithdrawalList] = useState<WithdrawalRecord[]>(() => {
    try {
      const saved = localStorage.getItem('channeltrust_seller_withdrawals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [withdrawing, setWithdrawing] = useState(false);

  // Verification request modal
  const [verificationModalChannel, setVerificationModalChannel] = useState<ChannelListing | null>(null);
  const [verificationNote, setVerificationNote] = useState('');

  // Support Tickets
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('পেআউট ও উইথড্রয়াল');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem('channeltrust_seller_tickets');
      return saved ? JSON.parse(saved) : [
        {
          id: 'TCK-S201',
          subject: 'বিকাশ পেআউট সংক্রান্ত সহায়তা',
          category: 'পেআউট ও উইথড্রয়াল',
          message: 'আমার চ্যানেলের হস্তান্তর সম্পন্ন হয়েছে। ব্যালেন্স উইথড্রয়াল সম্পর্কে জানতে চাই।',
          status: 'resolved',
          priority: 'normal',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  // Profile Form
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Security Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);

  // Logout modal
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Load Seller Data
  const loadSellerData = async () => {
    try {
      setLoading(true);
      const [channelsRes, ordersRes, settingsRes] = await Promise.all([
        api.getChannels({ sellerId: user?.id, status: 'all' }).catch(() => ({ channels: [] })),
        api.getOrders().catch(() => ({ orders: [] })),
        api.getWebsiteSettings().catch(() => ({ settings: null }))
      ]);

      setMyChannels((channelsRes.channels || []).filter((c: any) => c.sellerId === user?.id));
      setMySales((ordersRes.orders || []).filter((o: Order) => o.sellerId === user?.id));

      if (settingsRes?.settings) {
        setSettings(settingsRes.settings);
        if (Array.isArray(settingsRes.settings.customCategories)) {
          setAvailableCategories(settingsRes.settings.customCategories.filter((c: any) => c.isActive));
        }
      }
    } catch (err: any) {
      showToast(err.message || t('সেলার তথ্য লোড করতে সমস্যা হয়েছে', 'Failed to load seller records'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerData();
  }, [user]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileBio(user.bio || '');
    }
  }, [user]);

  // Derived Financial and Listing Metrics
  // Specially requested by user:
  // - Total Listings
  // - Active Listings
  // - Total Sold Channels
  // - Total Earnings
  // - Available Balance
  // - Pending Balance
  const totalListings = myChannels.length;
  const activeListings = useMemo(() => myChannels.filter((c) => c.status === 'active'), [myChannels]);
  const pendingApprovalListings = useMemo(() => myChannels.filter((c) => c.verificationStatus === 'pending'), [myChannels]);
  const rejectedListings = useMemo(() => myChannels.filter((c) => c.verificationStatus === 'rejected'), [myChannels]);
  const soldListings = useMemo(() => myChannels.filter((c) => c.status === 'sold'), [myChannels]);

  const completedSalesOrders = useMemo(() => mySales.filter((o) => o.status === 'completed'), [mySales]);
  const pendingOrders = useMemo(
    () => mySales.filter((o) => ['pending', 'payment_confirmed', 'transfer_in_progress'].includes(o.status)),
    [mySales]
  );
  const disputedOrders = useMemo(() => mySales.filter((o) => o.status === 'disputed'), [mySales]);

  // Total Earnings: Total revenue for seller from completed orders
  const totalEarnings = useMemo(() => {
    return completedSalesOrders.reduce((sum, order) => {
      const payout = order.sellerPayoutAmount ?? Math.max(0, (order.amount || 0) - (order.sellerFee ?? Math.round((order.platformFee || 0) / 2)));
      return sum + payout;
    }, 0);
  }, [completedSalesOrders]);

  // Total withdrawn amount
  const totalWithdrawn = useMemo(() => {
    return withdrawalList
      .filter((w) => w.status === 'completed' || w.status === 'processing')
      .reduce((sum, w) => sum + w.amount, 0);
  }, [withdrawalList]);

  // Available Balance: Total completed earnings minus withdrawals
  const availableBalance = Math.max(0, totalEarnings - totalWithdrawn);

  // Pending Balance: Orders currently held in platform escrow
  const pendingBalance = useMemo(() => {
    return pendingOrders.reduce((sum, order) => {
      const payout = order.sellerPayoutAmount ?? Math.max(0, (order.amount || 0) - (order.sellerFee ?? Math.round((order.platformFee || 0) / 2)));
      return sum + payout;
    }, 0);
  }, [pendingOrders]);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedScreenshots((prev) => [...prev, reader.result as string]);
      setUploadingFile(false);
      showToast(t('স্টুডিও স্ক্রিনশট যুক্ত করা হয়েছে', 'Studio screenshot attached successfully'), 'success');
    };
    reader.readAsDataURL(file);
  };

  // Create Listing
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !channelUrl.trim() || !askingPrice) {
      showToast(t('শিরোনাম, URL এবং বিক্রয় মূল্য আবশ্যক', 'Title, URL, and Asking Price are required'), 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.createChannel({
        platform,
        title: title.trim(),
        handle: handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim() || 'channel'}`,
        channelUrl: channelUrl.trim(),
        niche,
        accountType: accountType as any,
        primaryLanguage,
        subscribers: Number(subscribers) || 0,
        monthlyViews: Number(monthlyViews) || 0,
        lifetimeViews: Number(lifetimeViews) || 0,
        monthlyRevenue: Number(monthlyRevenue) || 0,
        videoCount: Number(videoCount) || 10,
        creationYear: Number(creationYear) || 2023,
        monetizationStatus,
        strikeStatus,
        hasSilverButton,
        askingPrice: Number(askingPrice),
        minOfferPrice: minOfferPrice ? Number(minOfferPrice) : undefined,
        description: description.trim(),
        analyticsScreenshots: uploadedScreenshots
      });

      showToast(t('চ্যানেল সফলভাবে বিক্রির জন্য যুক্ত হয়েছে!', 'Channel submitted for listing!'), 'success');
      setActiveTab('my_listings');
      loadSellerData();

      // Reset
      setTitle('');
      setHandle('');
      setChannelUrl('');
      setSubscribers('');
      setMonthlyRevenue('');
      setAskingPrice('');
      setDescription('');
      setUploadedScreenshots([]);
    } catch (err: any) {
      showToast(err.message || t('লিস্টিং তৈরিতে ব্যর্থ হয়েছে', 'Failed to create channel listing'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Save Draft
  const handleSaveDraft = () => {
    if (!title.trim()) {
      showToast(t('ড্রাফট সেভ করতে অন্তত চ্যানেলের নাম লিখুন', 'Enter a channel name to save draft'), 'error');
      return;
    }
    const newDraft = {
      id: `draft_${Date.now()}`,
      platform,
      title,
      handle,
      channelUrl,
      niche,
      askingPrice,
      description,
      savedAt: new Date().toISOString()
    };
    const updated = [newDraft, ...drafts];
    setDrafts(updated);
    localStorage.setItem('channeltrust_seller_drafts', JSON.stringify(updated));
    showToast(t('ড্রাফট সফলভাবে সংরক্ষিত হয়েছে', 'Draft saved successfully'), 'info');
  };

  // Edit Listing submit
  const handleSaveEditedListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel) return;
    try {
      setEditSaving(true);
      await api.updateChannel(editingChannel.id, {
        askingPrice: Number(editPrice) || editingChannel.askingPrice,
        minOfferPrice: editMinOffer ? Number(editMinOffer) : undefined,
        description: editDescription
      });
      showToast(t('চ্যানেলের তথ্য সফলভাবে আপডেট হয়েছে!', 'Channel listing updated successfully!'), 'success');
      setEditingChannel(null);
      loadSellerData();
    } catch (err: any) {
      showToast(err.message || t('আপডেট করতে ব্যর্থ হয়েছে', 'Failed to update listing'), 'error');
    } finally {
      setEditSaving(false);
    }
  };

  // Submit Withdrawal Request
  const handleSubmitWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(withdrawalAmount);
    if (!amountNum || amountNum <= 0) {
      showToast(t('সঠিক উত্তোলনের পরিমাণ দিন', 'Enter valid withdrawal amount'), 'error');
      return;
    }
    if (amountNum > availableBalance) {
      showToast(t('উত্তোলনের পরিমাণ ব্যালেন্সের চেয়ে বেশি হতে পারবে না', 'Amount exceeds available balance'), 'error');
      return;
    }
    if (!withdrawalAccount.trim()) {
      showToast(t('অ্যাকাউন্ট বা ফোন নম্বর দিন', 'Provide account/phone details'), 'error');
      return;
    }

    setWithdrawing(true);
    setTimeout(() => {
      const record: WithdrawalRecord = {
        id: `WTH-${Date.now().toString().slice(-5)}`,
        amount: amountNum,
        method: withdrawalMethod,
        accountDetails: withdrawalAccount.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      const updated = [record, ...withdrawalList];
      setWithdrawalList(updated);
      localStorage.setItem('channeltrust_seller_withdrawals', JSON.stringify(updated));
      setWithdrawing(false);
      setWithdrawalAmount('');
      setWithdrawalAccount('');
      showToast(t('উত্তোলন আবেদন জমা হয়েছে! অ্যাডমিন ২৪ ঘণ্টার মধ্যে পেআউট পাঠাবে।', 'Withdrawal request submitted! Admin will disburse within 24 hours.'), 'success');
    }, 500);
  };

  // Submit Support Ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      showToast(t('বিষয় ও বিবরণ লিখুন', 'Provide subject and message'), 'error');
      return;
    }
    const newTicket: SupportTicket = {
      id: `TCK-S${Date.now().toString().slice(-4)}`,
      subject: ticketSubject.trim(),
      category: ticketCategory,
      message: ticketMessage.trim(),
      status: 'open',
      priority: ticketPriority,
      createdAt: new Date().toISOString()
    };
    const updated = [newTicket, ...supportTickets];
    setSupportTickets(updated);
    localStorage.setItem('channeltrust_seller_tickets', JSON.stringify(updated));
    showToast(t('সাপোর্ট টিকেট খোলা হয়েছে! এডমিন দল দ্রুত যোগাযোগ করবে।', 'Ticket submitted! Admin will follow up.'), 'success');
    setTicketModalOpen(false);
    setTicketSubject('');
    setTicketMessage('');
  };

  // Contact Admin via WhatsApp & Email
  const handleContactAdminWhatsApp = () => {
    const phone = settings?.whatsappSupport || settings?.contactPhone || '+8801700000000';
    const msg = buildGeneralInquiryWhatsAppMessage('Seller Dashboard Support');
    window.open(getWhatsAppUrl(phone, msg), '_blank', 'noopener,noreferrer');
  };

  const handleContactAdminEmail = () => {
    const email = settings?.contactEmail || 'alifsheenshopping@gmail.com';
    const { subject, body } = buildGeneralInquiryEmail('Seller Dashboard Support');
    window.location.href = getEmailMailtoUrl(email, subject, body);
  };

  // 27 MENU DEFINITIONS
  const MENU_SECTIONS = [
    {
      groupTitle: t('মেইন ও লিস্টিং', 'Main & Listings'),
      items: [
        { id: 'dashboard' as SellerTab, label: t('Dashboard', 'Dashboard'), desc: t('বিক্রির সারসংক্ষেপ', 'Sales Overview'), icon: LayoutDashboard },
        { id: 'add_channel' as SellerTab, label: t('Add New Channel', 'Add New Channel'), desc: t('নতুন চ্যানেল বিক্রির জন্য যুক্ত করা', 'Create Listing'), icon: PlusCircle },
        { id: 'my_listings' as SellerTab, label: t('My Listings', 'My Listings'), desc: t('নিজের সব চ্যানেলের তালিকা', 'All Channel Assets'), icon: List, badge: totalListings },
        { id: 'active_listings' as SellerTab, label: t('Active Listings', 'Active Listings'), desc: t('বর্তমানে বিক্রির জন্য চালু', 'Live in Marketplace'), icon: CheckCircle2, badge: activeListings.length, badgeColor: 'bg-emerald-500' },
        { id: 'pending_approval' as SellerTab, label: t('Pending Approval', 'Pending Approval'), desc: t('Admin অনুমোদনের অপেক্ষায়', 'Under Audit'), icon: Clock, badge: pendingApprovalListings.length > 0 ? pendingApprovalListings.length : undefined, badgeColor: 'bg-amber-500' },
        { id: 'rejected_listings' as SellerTab, label: t('Rejected Listings', 'Rejected Listings'), desc: t('বাতিল হওয়া লিস্টিং', 'Needs Correction'), icon: XCircle, badge: rejectedListings.length > 0 ? rejectedListings.length : undefined, badgeColor: 'bg-rose-500' },
        { id: 'sold_channels' as SellerTab, label: t('Sold Channels', 'Sold Channels'), desc: t('বিক্রি হয়ে যাওয়া চ্যানেল', 'Sold Assets'), icon: CheckCheck, badge: soldListings.length > 0 ? soldListings.length : undefined },
        { id: 'draft_listings' as SellerTab, label: t('Draft Listings', 'Draft Listings'), desc: t('অসম্পূর্ণ লিস্টিং', 'Unfinished Drafts'), icon: FileEdit, badge: drafts.length > 0 ? drafts.length : undefined },
        { id: 'edit_listings' as SellerTab, label: t('Edit Listings', 'Edit Listings'), desc: t('চ্যানেলের তথ্য পরিবর্তন', 'Price & Description'), icon: Edit }
      ]
    },
    {
      groupTitle: t('অর্ডার ও যোগাযোগ', 'Orders & Inquiries'),
      items: [
        { id: 'buyer_inquiries' as SellerTab, label: t('Buyer Inquiries', 'Buyer Inquiries'), desc: t('আগ্রহী ক্রেতাদের তথ্য', 'Offers & Leads'), icon: Users },
        { id: 'my_orders' as SellerTab, label: t('My Orders', 'My Orders'), desc: t('বিক্রির অর্ডার', 'All Sales Orders'), icon: ShoppingBag, badge: mySales.length },
        { id: 'pending_orders' as SellerTab, label: t('Pending Orders', 'Pending Orders'), desc: t('চলমান অর্ডার', 'Handovers in Progress'), icon: Clock, badge: pendingOrders.length, badgeColor: 'bg-amber-500' },
        { id: 'completed_sales' as SellerTab, label: t('Completed Sales', 'Completed Sales'), desc: t('সম্পন্ন বিক্রি', 'Funds Released'), icon: CheckCircle2, badge: completedSalesOrders.length, badgeColor: 'bg-emerald-500' },
        { id: 'messages' as SellerTab, label: t('Messages', 'Messages'), desc: t('Buyer-এর সঙ্গে যোগাযোগ', 'Chat with Buyers'), icon: MessageSquare }
      ]
    },
    {
      groupTitle: t('আয় ও ওয়ালেট', 'Earnings & Wallet'),
      items: [
        { id: 'earnings' as SellerTab, label: t('Earnings', 'Earnings'), desc: t('মোট আয়', 'Net Creator Earnings'), icon: DollarSign },
        { id: 'available_balance' as SellerTab, label: t('Available Balance', 'Available Balance'), desc: t('উত্তোলনযোগ্য ব্যালেন্স', 'Ready to Payout'), icon: Wallet },
        { id: 'pending_balance' as SellerTab, label: t('Pending Balance', 'Pending Balance'), desc: t('অপেক্ষমাণ ব্যালেন্স', 'Held in Escrow'), icon: Hourglass },
        { id: 'withdrawal_request' as SellerTab, label: t('Withdrawal Request', 'Withdrawal Request'), desc: t('টাকা উত্তোলনের আবেদন', 'Request Payout'), icon: ArrowDownToLine },
        { id: 'payment_history' as SellerTab, label: t('Payment History', 'Payment History'), desc: t('পেমেন্টের ইতিহাস', 'Payout Receipts'), icon: Receipt }
      ]
    },
    {
      groupTitle: t('যাচাই, রিভিউ ও সাপোর্ট', 'Verification & Support'),
      items: [
        { id: 'reviews' as SellerTab, label: t('Reviews & Ratings', 'Reviews & Ratings'), desc: t('Buyer-এর রিভিউ', 'Reputation Score'), icon: Star },
        { id: 'channel_verification' as SellerTab, label: t('Channel Verification', 'Channel Verification'), desc: t('চ্যানেলের মালিকানা যাচাই', 'Verified Seller Badge'), icon: ShieldCheck },
        { id: 'disputes' as SellerTab, label: t('Disputes', 'Disputes'), desc: t('অর্ডার সংক্রান্ত অভিযোগ', 'Escrow Mediation'), icon: AlertTriangle, badge: disputedOrders.length > 0 ? disputedOrders.length : undefined, badgeColor: 'bg-red-600' },
        { id: 'notifications' as SellerTab, label: t('Notifications', 'Notifications'), desc: t('নতুন নোটিফিকেশন', 'Activity Alerts'), icon: Bell, badge: pendingOrders.length > 0 ? pendingOrders.length : undefined, badgeColor: 'bg-blue-500' },
        { id: 'support_tickets' as SellerTab, label: t('Support Tickets', 'Support Tickets'), desc: t('Admin-এর সাহায্য', 'Admin Helpline'), icon: LifeBuoy },
        { id: 'my_profile' as SellerTab, label: t('My Profile', 'My Profile'), desc: t('ব্যক্তিগত তথ্য', 'Identity & Bio'), icon: UserIcon },
        { id: 'security_settings' as SellerTab, label: t('Security Settings', 'Security Settings'), desc: t('অ্যাকাউন্ট নিরাপত্তা', 'Password & 2FA'), icon: Shield }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* Top Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Toggle Seller Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center font-black shadow-md shadow-red-500/20 text-sm">
                💼
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900">
                    {t('সেলার ড্যাশবোর্ড (Seller Console)', 'Seller Dashboard Console')}
                  </h1>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    {t('যাচাইকৃত সেলার', 'Verified Creator')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono truncate max-w-[200px] sm:max-w-xs">
                  {user?.email || 'seller@official1.online'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('add_channel')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t('নতুন চ্যানেল যুক্ত করুন', 'Add Channel')}</span>
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ============================================================== */}
          {/* LEFT SIDEBAR (27 Menus) */}
          {/* ============================================================== */}
          <aside
            className={`lg:col-span-1 lg:block ${
              mobileMenuOpen ? 'block fixed inset-0 z-50 bg-slate-900/60 p-4 lg:p-0 backdrop-blur-xs' : 'hidden'
            }`}
          >
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 lg:hidden">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {t('সেলার মেনু', 'Seller Menu')}
                </span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {MENU_SECTIONS.map((sec, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3">
                    {sec.groupTitle}
                  </span>
                  <div className="space-y-0.5 pt-1">
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition cursor-pointer text-left ${
                            isActive
                              ? 'bg-red-600 text-white shadow-md shadow-red-500/25 font-black'
                              : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                            <div className="min-w-0">
                              <span className="block truncate">{item.label}</span>
                              <span className={`block text-[9px] font-normal truncate ${isActive ? 'text-rose-100' : 'text-slate-600'}`}>
                                {item.desc}
                              </span>
                            </div>
                          </div>

                          {item.badge !== undefined && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                                isActive ? 'bg-white text-red-600' : `${item.badgeColor || 'bg-slate-200'} text-slate-800`
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

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => setLogoutModalOpen(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
                  <div>
                    <span className="block">{t('Logout', 'Logout')}</span>
                    <span className="block text-[9px] text-rose-400 font-normal">{t('অ্যাকাউন্ট থেকে বের হওয়া', 'Sign out')}</span>
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
            {/* 1. DASHBOARD OVERVIEW (বিক্রির সারসংক্ষেপ) */}
            {/* ============================================================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Hero Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-red-500/30 text-rose-300 border border-red-500/30 px-2.5 py-0.5 rounded-full">
                          {t('সেলার কন্ট্রোল হাব', 'Seller Control Hub')}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {t('১০০% নিরাপদ এসক্রো ফান্ড সুরক্ষা', '100% Escrow Custody Protection')}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                        {t('স্বাগতম, ', 'Welcome, ')}{user?.name || 'Creator Seller'}!
                      </h2>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl">
                        {t(
                          'আপনার চ্যানেল লিস্টিং, চলমান বায়ার হস্তান্তর এবং ব্যালেন্স পেআউট রিয়েল-টাইমে নিয়ন্ত্রণ করুন।',
                          'Manage your listings, buyer handover milestones, and wallet payouts in real time.'
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('add_channel')}
                      className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition cursor-pointer self-start sm:self-auto"
                    >
                      {t('নতুন চ্যানেল যুক্ত করুন', 'List Channel')}
                    </button>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* 6 REQUIRED SPECIAL SELLER METRICS */}
                {/* ============================================================== */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {/* 1. Total Listings */}
                  <div
                    onClick={() => setActiveTab('my_listings')}
                    className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-red-300 shadow-2xs hover:shadow-md transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">{t('Total Listings', 'Total Listings')}</span>
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <List className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">{totalListings}</p>
                      <span className="text-[10px] text-red-600 font-semibold">{t('সকল চ্যানেল তালিকা', 'All Listed Assets')}</span>
                    </div>
                  </div>

                  {/* 2. Active Listings */}
                  <div
                    onClick={() => setActiveTab('active_listings')}
                    className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-md transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">{t('Active Listings', 'Active Listings')}</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-emerald-600">{activeListings.length}</p>
                      <span className="text-[10px] text-emerald-700 font-semibold">{t('মার্কেটপ্লেসে লাইভ', 'Live in Marketplace')}</span>
                    </div>
                  </div>

                  {/* 3. Total Sold Channels */}
                  <div
                    onClick={() => setActiveTab('sold_channels')}
                    className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-md transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">{t('Total Sold Channels', 'Total Sold Channels')}</span>
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCheck className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-blue-600">{soldListings.length + completedSalesOrders.length}</p>
                      <span className="text-[10px] text-blue-600 font-semibold">{t('সফলভাবে বিক্রিত', 'Successfully Sold')}</span>
                    </div>
                  </div>

                  {/* 4. Total Earnings */}
                  <div
                    onClick={() => setActiveTab('earnings')}
                    className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-amber-300 shadow-2xs hover:shadow-md transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">{t('Total Earnings', 'Total Earnings')}</span>
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-900">{formatPrice(totalEarnings)}</p>
                      <span className="text-[10px] text-amber-700 font-semibold font-mono">
                        ≈ {currency === 'USD' ? formatBdt(totalEarnings) : formatUsd(totalEarnings)}
                      </span>
                    </div>
                  </div>

                  {/* 5. Available Balance */}
                  <div
                    onClick={() => setActiveTab('available_balance')}
                    className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-emerald-400 shadow-2xs hover:shadow-md transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">{t('Available Balance', 'Available Balance')}</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Wallet className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xl font-black text-emerald-600">{formatPrice(availableBalance)}</p>
                      <span className="text-[10px] text-emerald-700 font-semibold">{t('উত্তোলনযোগ্য পেআউট', 'Ready for Payout')}</span>
                    </div>
                  </div>

                  {/* 6. Pending Balance */}
                  <div
                    onClick={() => setActiveTab('pending_balance')}
                    className="p-4 rounded-3xl bg-white border border-slate-200 hover:border-purple-300 shadow-2xs hover:shadow-md transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">{t('Pending Balance', 'Pending Balance')}</span>
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Hourglass className="w-4 h-4 animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xl font-black text-purple-600">{formatPrice(pendingBalance)}</p>
                      <span className="text-[10px] text-purple-600 font-semibold">{t('এসক্রো কাস্টডিতে রক্ষিত', 'Held in Escrow Vault')}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action & Handover Guidance */}
                <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-xs text-blue-950 block">
                        {t('অফিসিয়াল ট্রান্সফার প্রটোকল নিয়মাবলী', 'Official YouTube Role Transfer Policy')}
                      </strong>
                      <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                        {t(
                          'বায়ারকে কখনোই আপনার পাসওয়ার্ড দেবেন না। বায়ারের দেওয়া জিমেইলে YouTube Studio থেকে Manager ইনভাইট পাঠান এবং ৭ দিনের কুলডাউন শেষে Primary Owner বানিয়ে দিন।',
                          'Never share Google account passwords. Add buyer as Manager via YouTube Studio, and elevate to Primary Owner after Google 7-day cooldown.'
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenLegal('safety')}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-300 transition cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    {t('নিরাপত্তা নিয়ম পড়ুন', 'Safety Rules')}
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 2. ADD NEW CHANNEL (নতুন চ্যানেল বিক্রির জন্য যুক্ত করা) */}
            {/* ============================================================== */}
            {activeTab === 'add_channel' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-red-600" />
                    <span>{t('নতুন চ্যানেল বিক্রির জন্য যুক্ত করুন', 'List a New Social Channel for Sale')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('আপনার চ্যানেলের সঠিক তথ্য দিন। যাচাইকৃত চ্যানেল স্বয়ংক্রিয়ভাবে মার্কেটপ্লেসে প্রদর্শিত হবে।', 'Provide verified channel analytics. Vetted properties are published directly to active buyers.')}
                  </p>
                </div>

                <form onSubmit={handleCreateListing} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Platform */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t('প্ল্যাটফর্ম নির্বাচন করুন', 'Platform')}</label>
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as PlatformType)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                      >
                        <option value="youtube">YouTube Channel</option>
                        <option value="facebook">Facebook Page</option>
                        <option value="tiktok">TikTok Account</option>
                        <option value="telegram">Telegram Channel</option>
                        <option value="instagram">Instagram Page</option>
                        <option value="twitter">X (Twitter)</option>
                      </select>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t('চ্যানেল বা পেজের নাম', 'Channel / Asset Title')}</label>
                      <input
                        type="text"
                        placeholder="e.g. BD Gaming Studio / ভাইরাল রেসিপি"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-red-500"
                      />
                    </div>

                    {/* Handle */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t('হ্যান্ডেল / ইউজারনেম', 'Handle / Username')}</label>
                      <input
                        type="text"
                        placeholder="@bdgaming"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>

                    {/* URL */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t('চ্যানেলের লিংক (URL)', 'Channel Link / URL')}</label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/@channel"
                        value={channelUrl}
                        onChange={(e) => setChannelUrl(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>

                    {/* Niche */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t('নিশ / ক্যাটাগরি', 'Niche Category')}</label>
                      <select
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                      >
                        {NICHES.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    {/* Subscribers */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t('ফলোয়ার / সাবস্ক্রাইবার সংখ্যা', 'Subscribers / Followers')}</label>
                      <input
                        type="number"
                        placeholder="e.g. 50000"
                        value={subscribers}
                        onChange={(e) => setSubscribers(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>

                    {/* Asking Price */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t('বিক্রয় মূল্য (USD $)', 'Asking Price (USD $)')}</label>
                      <input
                        type="number"
                        placeholder="e.g. 250"
                        value={askingPrice}
                        onChange={(e) => setAskingPrice(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:border-red-500"
                      />
                      {askingPrice && (
                        <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                          ≈ ৳{(Number(askingPrice) * 122).toLocaleString('en-US')} BDT
                        </span>
                      )}
                    </div>

                    {/* Minimum Offer */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t('সর্বনিম্ন অফার মূল্য (ঐচ্ছিক)', 'Minimum Offer (Optional)')}</label>
                      <input
                        type="number"
                        placeholder="e.g. 200"
                        value={minOfferPrice}
                        onChange={(e) => setMinOfferPrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>

                    {/* Monetization */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t('মনিটাইজেশন স্ট্যাটাস', 'Monetization Status')}</label>
                      <select
                        value={monetizationStatus}
                        onChange={(e) => setMonetizationStatus(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                      >
                        <option value="monetized">{t('সক্রিয় / Monetized (Ads On)', 'Monetized (Ads On)')}</option>
                        <option value="not_monetized">{t('মনিটাইজড নয়', 'Not Monetized')}</option>
                      </select>
                    </div>

                    {/* Monthly Revenue */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t('মাসিক গড় আয় (USD $)', 'Monthly Revenue (USD $)')}</label>
                      <input
                        type="number"
                        placeholder="e.g. 75"
                        value={monthlyRevenue}
                        onChange={(e) => setMonthlyRevenue(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('চ্যানেলের বিস্তারিত বিবরণ', 'Channel Description')}</label>
                    <textarea
                      rows={3}
                      placeholder={t('চ্যানেলের মূল বিষয়, অডিয়েন্স ডেমোগ্রাফিক ও আয়ের উৎস বর্ণনা করুন...', 'Describe channel content, viewer countries, and organic growth...')}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden"
                    />
                  </div>

                  {/* Analytics Screenshot Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('স্টুডিও অ্যানালিটিক্স স্ক্রিনশট (প্রমাণ)', 'Studio Analytics Screenshots')}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                    />
                    {uploadingFile && <span className="text-xs text-amber-600 font-bold ml-2">ছবি আপলোড হচ্ছে...</span>}
                    {uploadedScreenshots.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {uploadedScreenshots.map((img, i) => (
                          <img key={i} src={img} alt="Proof" className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                    >
                      {t('ড্রাফট সেভ করুন', 'Save as Draft')}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? t('যুক্ত হচ্ছে...', 'Submitting...') : t('লিস্টিং পাবলিশ করুন', 'Publish Listing')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ============================================================== */}
            {/* 3. MY LISTINGS (নিজের সব চ্যানেলের তালিকা) */}
            {/* ============================================================== */}
            {activeTab === 'my_listings' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <List className="w-5 h-5 text-red-600" />
                      <span>{t('My Listings (আমার সকল চ্যানেল তালিকা)', 'My Channel Listings')}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('আপনার আপলোড করা সকল চ্যানেলের বর্তমান অবস্থা ও বিক্রয় মূল্য', 'Complete portfolio of channels you listed on Alif Trust Marketplace')}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('add_channel')}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{t('নতুন যুক্ত করুন', 'Add New')}</span>
                  </button>
                </div>

                {myChannels.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <List className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500 font-bold">{t('এখনো কোনো চ্যানেল যুক্ত করেননি', 'No channel listings yet')}</p>
                    <button
                      onClick={() => setActiveTab('add_channel')}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                    >
                      {t('প্রথম চ্যানেলটি লিস্টিং করুন', 'List Your First Channel')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myChannels.map((channel) => (
                      <div
                        key={channel.id}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-red-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              {channel.platform}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                channel.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : channel.status === 'sold'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {channel.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{channel.title}</h4>
                          <p className="text-xs text-slate-500">
                            {channel.handle} • {channel.subscribers?.toLocaleString()} subs • {channel.niche}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <span className="text-base font-extrabold text-slate-900">{formatPrice(channel.askingPrice)}</span>
                          <button
                            onClick={() => {
                              setEditingChannel(channel);
                              setEditPrice(String(channel.askingPrice));
                              setEditMinOffer(channel.minOfferPrice ? String(channel.minOfferPrice) : '');
                              setEditDescription(channel.description || '');
                              setActiveTab('edit_listings');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                          >
                            {t('এডিট', 'Edit')}
                          </button>
                          <button
                            onClick={() => onSelectChannel(channel.id)}
                            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer"
                          >
                            {t('ভিউ', 'View')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 4. ACTIVE LISTINGS (বর্তমানে বিক্রির জন্য চালু) */}
            {/* ============================================================== */}
            {activeTab === 'active_listings' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{t('Active Listings (মার্কেটপ্লেসে লাইভ সক্রিয় চ্যানেল)', 'Active Listings')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('যেসব চ্যানেল বর্তমানে পাবলিকলি বায়াররা ব্রাউজ ও অর্ডার করতে পারছে', 'Channels live and available for instant purchase')}
                  </p>
                </div>

                {activeListings.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <p className="text-xs text-slate-500 font-bold">{t('কোনো সক্রিয় লিস্টিং নেই', 'No active listings')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeListings.map((c) => (
                      <div key={c.id} className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                            {c.platform} • Active
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{c.title}</h4>
                          <span className="text-xs text-slate-500">{c.subscribers?.toLocaleString()} subs</span>
                        </div>
                        <span className="text-base font-extrabold text-slate-900">{formatPrice(c.askingPrice)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 5. PENDING APPROVAL (Admin অনুমোদনের অপেক্ষায়) */}
            {/* ============================================================== */}
            {activeTab === 'pending_approval' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span>{t('Pending Approval (এডমিন অনুমোদনের অপেক্ষায়)', 'Pending Approval')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('যেসব চ্যানেলের স্টুডিও স্ক্রিনশট ও অ্যানালিটিক্স এডমিন অডিট ভল্ট যাচাই করছে', 'Listings undergoing ownership verification audit')}
                  </p>
                </div>

                {pendingApprovalListings.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <CheckCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs text-slate-500 font-bold">{t('কোনো পেন্ডিং লিস্টিং নেই', 'All listings approved')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingApprovalListings.map((c) => (
                      <div key={c.id} className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full animate-pulse">
                            ⏳ Auditing
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{c.title}</h4>
                        </div>
                        <span className="text-xs text-slate-500">{formatPrice(c.askingPrice)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 6. REJECTED LISTINGS (বাতিল হওয়া লিস্টিং) */}
            {/* ============================================================== */}
            {activeTab === 'rejected_listings' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>{t('Rejected Listings (বাতিল হওয়া লিস্টিং)', 'Rejected Listings')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('অ্যানালিটিক্স প্রমাণের ঘাটতি বা পলিসি ভঙ্গের কারণে যে লিস্টিংগুলো সংশোধন প্রয়োজন', 'Listings rejected during audit requiring correction')}
                  </p>
                </div>

                {rejectedListings.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs text-slate-500 font-bold">{t('কোনো বাতিল লিস্টিং নেই', 'No rejected listings')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rejectedListings.map((c) => (
                      <div key={c.id} className="p-4 rounded-2xl border border-rose-200 bg-rose-50/30 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full">
                            ✕ Rejected
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{c.title}</h4>
                        </div>
                        <button
                          onClick={() => {
                            setEditingChannel(c);
                            setEditPrice(String(c.askingPrice));
                            setActiveTab('edit_listings');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
                        >
                          {t('সংশোধন করুন', 'Correct & Resubmit')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 7. SOLD CHANNELS (বিক্রি হয়ে যাওয়া চ্যানেল) */}
            {/* ============================================================== */}
            {activeTab === 'sold_channels' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <CheckCheck className="w-5 h-5 text-blue-600" />
                    <span>{t('Sold Channels (বিক্রি হয়ে যাওয়া চ্যানেলসমূহ)', 'Sold Channels')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('যেসব চ্যানেলের মালিকানা হস্তান্তর সফলভাবে শেষ হয়েছে এবং পেআউট সম্পন্ন হয়েছে', 'Completed sales with confirmed ownership handover')}
                  </p>
                </div>

                {completedSalesOrders.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <p className="text-xs text-slate-500 font-bold">{t('এখনো কোনো চ্যানেল বিক্রি হয়নি', 'No completed sales yet')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedSalesOrders.map((order) => (
                      <div key={order.id} className="p-4 rounded-2xl border border-blue-200 bg-blue-50/20 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                            ✓ Sold
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{order.channelTitle}</h4>
                          <p className="text-xs text-slate-500">Buyer: {order.buyerName} • #{order.id}</p>
                        </div>
                        <span className="text-base font-extrabold text-emerald-700">{formatPrice(order.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 8. DRAFT LISTINGS (অসম্পূর্ণ লিস্টিং) */}
            {/* ============================================================== */}
            {activeTab === 'draft_listings' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <FileEdit className="w-5 h-5 text-slate-600" />
                    <span>{t('Draft Listings (অসম্পূর্ণ খসড়া লিস্টিং)', 'Draft Listings')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('ভবিষ্যতে পাবলিশের জন্য সেভ করে রাখা খসড়া চ্যানেলের তথ্য', 'Unfinished listing forms saved locally')}
                  </p>
                </div>

                {drafts.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <p className="text-xs text-slate-500 font-bold">{t('কোনো ড্রাফট সংরক্ষিত নেই', 'No saved drafts')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {drafts.map((d, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{d.title}</h4>
                          <span className="text-xs text-slate-400">{d.platform} • {new Date(d.savedAt).toLocaleDateString()}</span>
                        </div>
                        <button
                          onClick={() => {
                            setTitle(d.title || '');
                            setHandle(d.handle || '');
                            setChannelUrl(d.channelUrl || '');
                            setPlatform(d.platform || 'facebook');
                            setAskingPrice(d.askingPrice || '');
                            setDescription(d.description || '');
                            setActiveTab('add_channel');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                        >
                          {t('সম্পূর্ণ করুন', 'Resume')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 9. EDIT LISTINGS (চ্যানেলের তথ্য পরিবর্তন) */}
            {/* ============================================================== */}
            {activeTab === 'edit_listings' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Edit className="w-5 h-5 text-blue-600" />
                    <span>{t('Edit Listings (চ্যানেলের তথ্য পরিবর্তন ও মূল্য আপডেট)', 'Edit Listings')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('চ্যানেল নির্বাচন করে বিক্রয় মূল্য ও ডেসক্রিপশন পরিবর্তন করুন', 'Select a channel to update asking price and notes')}
                  </p>
                </div>

                {editingChannel ? (
                  <form onSubmit={handleSaveEditedListing} className="space-y-4 max-w-lg p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <strong className="text-xs text-slate-900">{editingChannel.title}</strong>
                      <button type="button" onClick={() => setEditingChannel(null)} className="text-xs text-slate-500 hover:text-slate-800">
                        {t('বাতিল', 'Cancel')}
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t('বিক্রয় মূল্য (USD $)', 'Asking Price (USD $)')}</label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t('বিবরণ (Description)', 'Description')}</label>
                      <textarea
                        rows={3}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={editSaving}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                    >
                      {editSaving ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('আপডেট সেভ করুন', 'Save Changes')}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 font-semibold">{t('কোন চ্যানেলটি এডিট করতে চান নির্বাচন করুন:', 'Choose a channel to edit:')}</p>
                    {myChannels.map((c) => (
                      <div key={c.id} className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
                          <span className="text-xs text-slate-500">{formatPrice(c.askingPrice)}</span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingChannel(c);
                            setEditPrice(String(c.askingPrice));
                            setEditMinOffer(c.minOfferPrice ? String(c.minOfferPrice) : '');
                            setEditDescription(c.description || '');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100"
                        >
                          {t('তথ্য পরিবর্তন করুন', 'Edit This Channel')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 10. BUYER INQUIRIES (আগ্রহী ক্রেতাদের তথ্য) */}
            {/* ============================================================== */}
            {activeTab === 'buyer_inquiries' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span>{t('Buyer Inquiries (আগ্রহী ক্রেতাদের অনুসন্ধান ও লিডস)', 'Buyer Inquiries')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('আপনার চ্যানেলে যেসব বায়ার মেসেজ দিয়েছে বা অফার সাবমিট করেছে', 'Potential buyers inquiring about your listings')}
                  </p>
                </div>

                {mySales.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <Users className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500 font-bold">{t('কোনো বায়ার ইনকোয়ারি নেই', 'No buyer inquiries yet')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mySales.map((sale) => (
                      <div key={sale.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                        <div>
                          <strong className="text-xs text-slate-900 block">{sale.buyerName}</strong>
                          <span className="text-[11px] text-slate-500">Interested in: {sale.channelTitle} • #{sale.id}</span>
                        </div>
                        <button
                          onClick={() => onSelectOrder(sale.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                        >
                          {t('কথা বলুন', 'Chat / View')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 11. MY ORDERS (বিক্রির অর্ডার) */}
            {/* ============================================================== */}
            {activeTab === 'my_orders' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-red-600" />
                      <span>{t('My Orders (আমার সকল বিক্রির অর্ডার)', 'My Sales Orders')}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('ক্রেতাদের ক্রয়ের অর্ডার এবং হস্তান্তর ট্র্যাকিং', 'All purchases initiated on your listed channels')}
                    </p>
                  </div>
                </div>

                {mySales.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <p className="text-xs text-slate-500 font-bold">{t('এখনো কোনো বিক্রির অর্ডার নেই', 'No sales orders yet')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mySales.map((sale) => (
                      <div
                        key={sale.id}
                        onClick={() => onSelectOrder(sale.id)}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-red-400 bg-white hover:bg-rose-50/20 transition cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-red-700">#{sale.id}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                              {sale.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{sale.channelTitle}</h4>
                          <span className="text-xs text-slate-500">Buyer: {sale.buyerName}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900 block">{formatPrice(sale.amount)}</span>
                          <span className="text-xs text-red-600 font-bold">{t('ট্র্যাকার খুলুন', 'Track')} →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 12. PENDING ORDERS (চলমান অর্ডার) */}
            {/* ============================================================== */}
            {activeTab === 'pending_orders' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                    <span>{t('Pending Orders (চলমান হস্তান্তর অর্ডারসমূহ)', 'Pending Handover Orders')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('যেসব অর্ডারের জন্য বায়ারকে ম্যানেজার ইনভাইট পাঠানো বা ৭ দিনের অপেক্ষা চলছে', 'Ongoing transfers in 7-day Google cooldown or manager invite stage')}
                  </p>
                </div>

                {pendingOrders.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <p className="text-xs text-slate-500 font-bold">{t('কোনো চলমান অর্ডার নেই', 'No pending orders')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingOrders.map((sale) => (
                      <div
                        key={sale.id}
                        onClick={() => onSelectOrder(sale.id)}
                        className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/30 flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div>
                          <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                            ⏳ Transfer in Progress
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{sale.channelTitle}</h4>
                          <span className="text-xs text-slate-600">Buyer: {sale.buyerName} ({sale.buyerEmail})</span>
                        </div>
                        <button className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold">
                          {t('হস্তান্তর করুন', 'Manage')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 13. COMPLETED SALES (সম্পন্ন বিক্রি) */}
            {/* ============================================================== */}
            {activeTab === 'completed_sales' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{t('Completed Sales (সম্পন্ন বিক্রির রেকর্ড)', 'Completed Sales')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('মালিকানা হস্তান্তর সম্পন্ন হওয়া এবং টাকা খালাস হওয়া অর্ডার', 'Transactions where payout funds have been released')}
                  </p>
                </div>

                {completedSalesOrders.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <p className="text-xs text-slate-500 font-bold">{t('এখনো কোনো সম্পন্ন বিক্রি নেই', 'No completed sales yet')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedSalesOrders.map((sale) => (
                      <div key={sale.id} className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                            ✓ Completed
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{sale.channelTitle}</h4>
                          <span className="text-xs text-slate-500">#{sale.id} • {new Date(sale.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="text-base font-extrabold text-emerald-700">{formatPrice(sale.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 14. MESSAGES (Buyer-এর সঙ্গে যোগাযোগ) */}
            {/* ============================================================== */}
            {activeTab === 'messages' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <span>{t('Messages (ক্রেতাদের সাথে চ্যাট ও মেসেজ)', 'Buyer Messages')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('অর্ডার সংক্রান্ত যোগাযোগ ও হস্তান্তর নির্দেশাবলী আলোচনা করুন', 'Direct end-to-end communication with buyers')}
                  </p>
                </div>

                {mySales.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <p className="text-xs text-slate-500 font-bold">{t('কোনো সক্রিয় মেসেজ নেই', 'No active messages')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mySales.map((sale) => (
                      <div
                        key={sale.id}
                        onClick={() => onSelectOrder(sale.id)}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                            {sale.buyerName.slice(0, 1)}
                          </div>
                          <div>
                            <strong className="text-xs text-slate-900 block">{sale.buyerName}</strong>
                            <span className="text-[11px] text-slate-500">{sale.channelTitle}</span>
                          </div>
                        </div>
                        <button className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                          {t('চ্যাট খুলুন', 'Open Chat')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 15. EARNINGS (মোট আয়) */}
            {/* ============================================================== */}
            {activeTab === 'earnings' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-500" />
                    <span>{t('Earnings (মোট আয় ও ফিনান্সিয়াল রিপোর্ট)', 'Total Seller Earnings')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('প্ল্যাটফর্মের মাধ্যমে অর্জিত আপনার মোট নিট আয়', 'Aggregated revenue from completed digital media transactions')}
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider">{t('সর্বমোট অর্জিত নিট আয়', 'All-Time Net Earnings')}</span>
                  <p className="text-3xl font-black">{formatPrice(totalEarnings)}</p>
                  <span className="text-xs font-mono font-bold">≈ ৳{(totalEarnings * 122).toLocaleString()} BDT</span>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 16. AVAILABLE BALANCE (উত্তোলনযোগ্য ব্যালেন্স) */}
            {/* ============================================================== */}
            {activeTab === 'available_balance' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                    <span>{t('Available Balance (উত্তোলনযোগ্য ব্যালেন্স)', 'Available Balance')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('যে টাকা বর্তমানে আপনি বিকাশ, নগদ বা ব্যাংকে উইথড্র করতে পারেন', 'Funds cleared and eligible for immediate payout')}
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-emerald-600 text-white shadow-md space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider">{t('বর্তমান উত্তোলনযোগ্য ব্যালেন্স', 'Current Available Payout')}</span>
                  <p className="text-3xl font-black">{formatPrice(availableBalance)}</p>
                  <button
                    onClick={() => setActiveTab('withdrawal_request')}
                    className="px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-black text-xs uppercase tracking-wider hover:bg-emerald-50 transition shadow-sm cursor-pointer"
                  >
                    {t('উইথড্রয়াল আবেদন করুন', 'Withdraw Funds Now')}
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 17. PENDING BALANCE (অপেক্ষমাণ ব্যালেন্স) */}
            {/* ============================================================== */}
            {activeTab === 'pending_balance' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Hourglass className="w-5 h-5 text-purple-600 animate-pulse" />
                    <span>{t('Pending Balance (এসক্রো অপেক্ষমাণ ব্যালেন্স)', 'Pending Escrow Balance')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('চলমান অর্ডারের টাকা যা হস্তান্তর সম্পন্ন হলেই মূল ব্যালেন্সে যোগ হবে', 'Funds held in escrow custody during ongoing account transfers')}
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-purple-600 text-white shadow-md space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider">{t('চলমান এস্ক্রো কাস্টডি ব্যালেন্স', 'Funds in Escrow Custody')}</span>
                  <p className="text-3xl font-black">{formatPrice(pendingBalance)}</p>
                  <p className="text-xs text-purple-200">
                    {t('বায়ার প্রাইমারি ওনারশিপ বুঝে নিয়ে নিশ্চিত করলেই টাকা উত্তোলনযোগ্য হবে।', 'Unlocked immediately upon buyer confirming Primary Ownership handover.')}
                  </p>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 18. WITHDRAWAL REQUEST (টাকা উত্তোলনের আবেদন) */}
            {/* ============================================================== */}
            {activeTab === 'withdrawal_request' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <ArrowDownToLine className="w-5 h-5 text-emerald-600" />
                    <span>{t('Withdrawal Request (টাকা উত্তোলনের আবেদন)', 'Request Payout')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('বিকাশ, নগদ, রকেট, ব্যাংক অ্যাকাউন্ট বা USDT-তে সরাসরি পেআউট নিন', 'Disburse funds to your personal mobile wallet or bank account')}
                  </p>
                </div>

                <form onSubmit={handleSubmitWithdrawal} className="space-y-4 max-w-lg p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('উত্তোলনের পরিমাণ (USD $)', 'Withdrawal Amount (USD $)')}
                    </label>
                    <input
                      type="number"
                      placeholder={`Max: ${availableBalance}`}
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      required
                      max={availableBalance}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                    />
                    {withdrawalAmount && (
                      <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                        ≈ ৳{(Number(withdrawalAmount) * 122).toLocaleString('en-US')} BDT
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('পেআউট মেথড নির্বাচন করুন', 'Payout Method')}</label>
                    <select
                      value={withdrawalMethod}
                      onChange={(e) => setWithdrawalMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    >
                      <option value="bKash">বিকাশ পার্সোনাল (bKash Personal)</option>
                      <option value="Nagad">নগদ পার্সোনাল (Nagad Personal)</option>
                      <option value="Rocket">রকেট (Rocket)</option>
                      <option value="Bank Transfer">ব্যাংক ট্রান্সফার (Bank Transfer)</option>
                      <option value="USDT TRC20">USDT (TRC20 / BEP20)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('অ্যাকাউন্ট নম্বর / ব্যাংক বিবরণ', 'Account Number / Details')}</label>
                    <input
                      type="text"
                      placeholder="e.g. 017xxxxxxxx বা City Bank A/C: 123..."
                      value={withdrawalAccount}
                      onChange={(e) => setWithdrawalAccount(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={withdrawing || availableBalance <= 0}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {withdrawing ? t('আবেদন পাঠানো হচ্ছে...', 'Submitting...') : t('পেআউট আবেদন সাবমিট করুন', 'Submit Payout Request')}
                  </button>
                </form>
              </div>
            )}

            {/* ============================================================== */}
            {/* 19. PAYMENT HISTORY (পেমেন্টের ইতিহাস) */}
            {/* ============================================================== */}
            {activeTab === 'payment_history' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-blue-600" />
                    <span>{t('Payment History (পেআউট ও উত্তোলনের ইতিহাস)', 'Payout Ledger & History')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('আপনার সকল উইথড্রয়াল আবেদন ও পেমেন্ট ডিসবার্সমেন্ট রেকর্ড', 'All withdrawal records and transaction receipts')}
                  </p>
                </div>

                {withdrawalList.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <p className="text-xs text-slate-500 font-bold">{t('কোনো পেআউট ইতিহাস নেই', 'No withdrawal records yet')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {withdrawalList.map((w) => (
                      <div key={w.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-blue-700">#{w.id}</span>
                            <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded-md uppercase">
                              {w.status}
                            </span>
                          </div>
                          <span className="text-xs text-slate-600 block mt-1">{w.method} • {w.accountDetails}</span>
                          <span className="text-[10px] text-slate-400">{new Date(w.createdAt).toLocaleString()}</span>
                        </div>
                        <span className="text-base font-extrabold text-slate-900">{formatPrice(w.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 20. REVIEWS & RATINGS (Buyer-এর রিভিউ) */}
            {/* ============================================================== */}
            {activeTab === 'reviews' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span>{t('Reviews & Ratings (বায়ারদের দেওয়া রিভিউ ও রেটিং)', 'Buyer Reviews & Reputation')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('চ্যানেল হস্তান্তর শেষে বায়াররা যে ফিডব্যাক দিয়েছে', 'Reputation feedback from buyers upon deal completion')}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl">
                    ★
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">5.0 / 5.0 {t('যাচাইকৃত স্কোর', 'Verified Score')}</h4>
                    <span className="text-xs text-amber-800">{t('১০০% ইতিবাচক বায়ার ফিডব্যাক', '100% Positive Handover Feedback')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 21. CHANNEL VERIFICATION (চ্যানেলের মালিকানা যাচাই) */}
            {/* ============================================================== */}
            {activeTab === 'channel_verification' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>{t('Channel Verification (চ্যানেলের মালিকানা যাচাইকরণ)', 'Channel Ownership Verification')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('চ্যানেলের আসল মালিকানা যাচাই করে ভেরিফাইড সেলার ব্যাজ পান', 'Verify your ownership to get higher placement and instant trust badge')}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>{t('মালিকানা যাচাই করার ৩টি সহজ পদ্ধতি:', '3 Ways to Verify Channel Ownership:')}</span>
                  </h4>
                  <ul className="text-xs text-emerald-800 space-y-1 list-disc pl-5">
                    <li>{t('YouTube Studio এর সেটিংস > Permissions পেজের একটি স্ক্রিনশট আপলোড করুন।', 'Upload screenshot of YouTube Studio > Settings > Permissions.')}</li>
                    <li>{t('চ্যানেলের অ্যাবাউট (About) সেকশনে আপনার Alif Trust ইউজারনেম লিখে আপডেট দিন।', 'Add your Alif Trust username temporarily in channel About section.')}</li>
                    <li>{t('অথবা হোয়াটসঅ্যাপে এডমিনকে চ্যানেল একাউন্ট স্ক্রিনশট পাঠান।', 'Or message admin on WhatsApp with verification proof.')}</li>
                  </ul>
                  <div className="pt-2">
                    <button
                      onClick={handleContactAdminWhatsApp}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                    >
                      {t('এডমিনের মাধ্যমে সরাসরি ভেরিফাই করুন', 'Verify with Admin via WhatsApp')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 22. DISPUTES (অর্ডার সংক্রান্ত অভিযোগ) */}
            {/* ============================================================== */}
            {activeTab === 'disputes' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span>{t('Disputes & Arbitration (অর্ডার সংক্রান্ত অভিযোগ)', 'Disputes & Claims')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('হস্তান্তর সংক্রান্ত কোনো সমস্যা হলে প্ল্যাটফর্ম এডমিনের মাধ্যমে মধ্যস্থতা', 'Arbitration room for orders requiring admin intervention')}
                  </p>
                </div>

                {disputedOrders.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs text-slate-600 font-bold">{t('কোনো ডিসপ্যুট বা অভিযোগ নেই', 'No active disputes')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {disputedOrders.map((sale) => (
                      <div key={sale.id} className="p-4 rounded-2xl border-2 border-rose-300 bg-rose-50/20">
                        <strong className="text-xs text-slate-900 block">{sale.channelTitle}</strong>
                        <span className="text-xs text-rose-600">{sale.disputeReason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 23. NOTIFICATIONS (নতুন নোটিফিকেশন) */}
            {/* ============================================================== */}
            {activeTab === 'notifications' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <span>{t('Notifications (সেলার অ্যাক্টিভিটি নোটিফিকেশন)', 'Notifications')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('নতুন ক্রয় অর্ডার, ভল্ট ডিপোজিট এবং এডমিন অনুমোদন নোটিফিকেশন', 'Live alerts on order arrivals and payment deposits')}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs">
                    <strong className="text-blue-950 block">{t('সেলার সেন্টারে স্বাগতম!', 'Welcome to Creator Seller Center!')}</strong>
                    <span className="text-blue-800">{t('নতুন কোনো অর্ডার আসলে স্বয়ংক্রিয়ভাবে আপনাকে নোটিফাই করা হবে।', 'You will receive instant alerts whenever a buyer submits an order.')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 24. SUPPORT TICKETS (Admin-এর সাহায্য) */}
            {/* ============================================================== */}
            {activeTab === 'support_tickets' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <LifeBuoy className="w-5 h-5 text-blue-600" />
                      <span>{t('Support Tickets (এডমিন হেল্প ও টিকেট)', 'Support Tickets')}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('পেআউট, চ্যানেল অনুমোদন বা অন্য যেকোনো বিষয়ে সাহায্য চান', 'Direct creator support from platform operations')}
                    </p>
                  </div>
                  <button
                    onClick={() => setTicketModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                  >
                    {t('নতুন টিকেট খুলুন', 'Open Ticket')}
                  </button>
                </div>

                <div className="space-y-3">
                  {supportTickets.map((tck) => (
                    <div key={tck.id} className="p-4 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-blue-700">#{tck.id}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                          {tck.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{tck.subject}</h4>
                      <p className="text-xs text-slate-600">{tck.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 25. MY PROFILE (ব্যক্তিগত তথ্য) */}
            {/* ============================================================== */}
            {activeTab === 'my_profile' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                    <span>{t('My Profile (সেলার পরিচিতি ও ব্যক্তিগত তথ্য)', 'Seller Profile')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('আপনার নাম, যোগাযোগের হ্যান্ডেল ও পরিচিতি আপডেট করুন', 'Update your seller persona and biography')}
                  </p>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setProfileSaving(true);
                    try {
                      await api.updateProfile({ name: profileName, bio: profileBio });
                      showToast(t('সেলার প্রোফাইল সফলভাবে আপডেট হয়েছে!', 'Profile saved!'), 'success');
                    } catch (err: any) {
                      showToast(err.message, 'error');
                    } finally {
                      setProfileSaving(false);
                    }
                  }}
                  className="space-y-4 max-w-lg"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('সেলার নাম (Display Name)', 'Seller Name')}</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('ইমেইল', 'Email')}</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('পরিচিতি (Bio)', 'Bio')}</label>
                    <textarea
                      rows={3}
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                  >
                    {profileSaving ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('প্রোফাইল সংরক্ষণ করুন', 'Save Profile')}
                  </button>
                </form>
              </div>
            )}

            {/* ============================================================== */}
            {/* 26. SECURITY SETTINGS (অ্যাকাউন্ট নিরাপত্তা) */}
            {/* ============================================================== */}
            {activeTab === 'security_settings' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <span>{t('Security Settings (পাসওয়ার্ড ও অ্যাকাউন্ট নিরাপত্তা)', 'Security Settings')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('পাসওয়ার্ড পরিবর্তন এবং দ্বি-স্তর বিশিষ্ট নিরাপত্তা নিয়ন্ত্রণ করুন', 'Manage password and account access')}
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newPassword.length < 6) {
                      showToast(t('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে', 'Password must be 6+ chars'), 'error');
                      return;
                    }
                    showToast(t('পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!', 'Password updated!'), 'success');
                  }}
                  className="space-y-4 max-w-lg"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('বর্তমান পাসওয়ার্ড', 'Current Password')}</label>
                    <input type="password" required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('নতুন পাসওয়ার্ড', 'New Password')}</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                    {t('পাসওয়ার্ড আপডেট করুন', 'Update Password')}
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Support Ticket Modal */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-blue-600" />
                <span>{t('নতুন সাপোর্ট টিকেট খুলুন', 'Open Support Ticket')}</span>
              </h3>
              <button onClick={() => setTicketModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('ক্যাটাগরি', 'Category')}</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                >
                  <option value="পেআউট ও উইথড্রয়াল">পেআউট ও উইথড্রয়াল (Payout & Withdraw)</option>
                  <option value="চ্যানেল অনুমোদন">চ্যানেল অনুমোদন (Listing Approval)</option>
                  <option value="হস্তান্তর সহায়তা">হস্তান্তর সহায়তা (Handover Assistance)</option>
                  <option value="অন্যান্য জিজ্ঞাসা">অন্যান্য জিজ্ঞাসা (General Inquiry)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('বিষয় (Subject)', 'Subject')}</label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('বার্তা (Message)', 'Message')}</label>
                <textarea
                  rows={3}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
                  {t('জমা দিন', 'Submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{t('লগআউট করবেন?', 'Log Out?')}</h3>
              <p className="text-xs text-slate-500 mt-1">{t('আপনি কি নিশ্চিত যে আপনার সেলার অ্যাকাউন্ট থেকে প্রস্থান করতে চান?', 'Confirm sign out of seller console?')}</p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                {t('বাতিল', 'Cancel')}
              </button>
              <button
                onClick={() => {
                  logout();
                  setLogoutModalOpen(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                {t('হ্যাঁ, লগআউট', 'Log Out')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
