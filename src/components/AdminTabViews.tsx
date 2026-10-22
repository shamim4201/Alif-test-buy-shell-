import React, { useState } from 'react';
import { api } from '../services/api';
import {
  AdminStats,
  ChannelListing,
  Order,
  User,
  Transaction,
  WebsiteSettings,
  CustomPaymentGateway,
  AdminAuditLog,
  SupportTicket,
  Coupon,
  FraudAlert,
  NotificationItem
} from '../types';
import { CategoryLogo, PlatformLogo } from './CategoryIcons';
import { ORDER_STATUS_TRANSLATIONS } from '../translations/translations';
import { DEFAULT_POLICIES } from '../data/defaultPolicies';
import {
  Tv,
  Users,
  ShoppingBag,
  CreditCard,
  Scale,
  Settings,
  ShieldCheck,
  Percent,
  Bell,
  Ticket,
  AlertOctagon,
  Eye,
  BadgeCheck,
  Ban,
  Download,
  Trash2,
  Sparkles,
  ExternalLink,
  Plus,
  Send,
  CheckCircle2,
  FileText,
  Lock,
  AlertTriangle,
  RotateCcw,
  Building2,
  Smartphone,
  Coins,
  Copy,
  Check,
  Edit2,
  Image as ImageIcon,
  ZoomIn,
  X
} from 'lucide-react';

export type TabType =
  | 'overview'
  | 'channels'
  | 'users'
  | 'orders'
  | 'payments'
  | 'disputes'
  | 'policies'
  | 'settings'
  | 'security'
  | 'reports'
  | 'coupons'
  | 'notifications'
  | 'tickets'
  | 'fraud';

interface AdminTabViewsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  stats: AdminStats | null;
  channels: ChannelListing[];
  filteredChannels: ChannelListing[];
  pendingApprovals: ChannelListing[];
  orders: Order[];
  filteredOrders: Order[];
  disputedOrders: Order[];
  usersList: User[];
  filteredUsers: User[];
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  auditLogs: AdminAuditLog[];
  coupons: Coupon[];
  notifications: NotificationItem[];
  tickets: SupportTicket[];
  fraudAlerts: FraudAlert[];
  settingsData: WebsiteSettings | null;
  setSettingsData: React.Dispatch<React.SetStateAction<WebsiteSettings | null>>;
  savingSettings: boolean;
  language: 'BN' | 'EN';
  t: (bn: string, en: string) => string;
  channelStatusFilter: string;
  setChannelStatusFilter: (st: any) => void;
  userRoleFilter: string;
  setUserRoleFilter: (role: any) => void;
  orderStatusFilter: string;
  setOrderStatusFilter: (st: any) => void;
  paymentFilter: string;
  setPaymentFilter: (st: any) => void;
  onSelectOrder: (orderId: string) => void;
  setSelectedProof: (proof: { screenshots: string[]; title: string }) => void;
  setEvidenceModalOpen: (open: boolean) => void;
  handleReviewListing: (id: string, st: 'approved' | 'rejected') => void;
  handleToggleFeatured: (id: string) => void;
  handleDeleteChannel: (id: string, title: string) => void;
  setSelectedUserDetail: (user: User | null) => void;
  handleToggleVerified: (userId: string) => void;
  handleToggleBan: (userId: string) => void;
  setResolvingOrder: (order: Order | null) => void;
  setResolutionAction: (action: 'refund_buyer' | 'complete_order') => void;
  handleSaveSettings: (e: React.FormEvent) => void;
  handleExportBackup: () => void;
  setCouponModalOpen: (open: boolean) => void;
  handleDeleteCoupon: (id: string, code: string) => void;
  setBroadcastModalOpen: (open: boolean) => void;
  handleDeleteNotification: (id: string) => void;
  setSelectedTicket: (ticket: SupportTicket | null) => void;
  handleResolveFraudAlert: (id: string) => void;
}

export const AdminTabViews: React.FC<AdminTabViewsProps> = ({
  activeTab,
  setActiveTab,
  stats,
  filteredChannels,
  pendingApprovals,
  orders = [],
  filteredOrders,
  disputedOrders,
  usersList,
  filteredUsers,
  transactions,
  filteredTransactions,
  auditLogs,
  coupons,
  notifications,
  tickets,
  fraudAlerts,
  settingsData,
  setSettingsData,
  savingSettings,
  language,
  t,
  channelStatusFilter,
  setChannelStatusFilter,
  userRoleFilter,
  setUserRoleFilter,
  orderStatusFilter,
  setOrderStatusFilter,
  paymentFilter,
  setPaymentFilter,
  onSelectOrder,
  setSelectedProof,
  setEvidenceModalOpen,
  handleReviewListing,
  handleToggleFeatured,
  handleDeleteChannel,
  setSelectedUserDetail,
  handleToggleVerified,
  handleToggleBan,
  setResolvingOrder,
  setResolutionAction,
  handleSaveSettings,
  handleExportBackup,
  setCouponModalOpen,
  handleDeleteCoupon,
  setBroadcastModalOpen,
  handleDeleteNotification,
  setSelectedTicket,
  handleResolveFraudAlert
}) => {
  const [activePolicyTab, setActivePolicyTab] = useState<'safety' | 'tos' | 'privacy' | 'refund' | 'marketplace'>('safety');
  const [activePolicyGroup, setActivePolicyGroup] = useState<'policies' | 'security' | 'marketplace'>('policies');
  const [showPolicyPreview, setShowPolicyPreview] = useState(false);

  // Dynamic Gateway and Bank Management States
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [editingGatewayId, setEditingGatewayId] = useState<string | null>(null);
  const [gatewayForm, setGatewayForm] = useState<Partial<CustomPaymentGateway>>({
    name: '',
    type: 'bdt',
    category: 'bank',
    accountNumber: '',
    accountHolderName: '',
    bankName: '',
    branchName: '',
    routingNumber: '',
    swiftCode: '',
    instructions: '',
    isActive: true
  });
  const [gatewayFilterType, setGatewayFilterType] = useState<'all' | 'bdt' | 'usdt'>('all');
  const [adminProofModalUrl, setAdminProofModalUrl] = useState<string | null>(null);

  const handleOpenAddGateway = (defaultType: 'bdt' | 'usdt' = 'bdt', defaultCategory: 'bank' | 'mobile_banking' | 'crypto' = 'bank') => {
    setEditingGatewayId(null);
    setGatewayForm({
      name: '',
      type: defaultType,
      category: defaultCategory,
      accountNumber: '',
      accountHolderName: '',
      bankName: '',
      branchName: '',
      routingNumber: '',
      swiftCode: '',
      instructions: '',
      isActive: true
    });
    setGatewayModalOpen(true);
  };

  const handleOpenEditGateway = (gw: CustomPaymentGateway) => {
    setEditingGatewayId(gw.id);
    setGatewayForm({ ...gw });
    setGatewayModalOpen(true);
  };

  const handleSaveGateway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatewayForm.name?.trim() || !gatewayForm.accountNumber?.trim()) return;

    setSettingsData((prev) => {
      if (!prev) return prev;
      const currentGateways = prev.customGateways ? [...prev.customGateways] : [];
      let updated: CustomPaymentGateway[];
      if (editingGatewayId) {
        updated = currentGateways.map((g) =>
          g.id === editingGatewayId ? ({ ...g, ...gatewayForm, id: g.id } as CustomPaymentGateway) : g
        );
      } else {
        const newGw: CustomPaymentGateway = {
          id: `gw_${Date.now()}`,
          name: (gatewayForm.name || '').trim(),
          type: gatewayForm.type || 'bdt',
          category: gatewayForm.category || 'bank',
          accountNumber: (gatewayForm.accountNumber || '').trim(),
          accountHolderName: gatewayForm.accountHolderName?.trim() || '',
          bankName: gatewayForm.bankName?.trim() || '',
          branchName: gatewayForm.branchName?.trim() || '',
          routingNumber: gatewayForm.routingNumber?.trim() || '',
          swiftCode: gatewayForm.swiftCode?.trim() || '',
          instructions: gatewayForm.instructions?.trim() || '',
          isActive: gatewayForm.isActive ?? true,
          createdAt: new Date().toISOString()
        };
        updated = [newGw, ...currentGateways];
      }
      // Persist directly to storage/server
      api.updateWebsiteSettings({ customGateways: updated }).catch(console.error);
      return { ...prev, customGateways: updated };
    });

    setGatewayModalOpen(false);
  };

  const handleToggleGatewayStatus = (id: string) => {
    setSettingsData((prev) => {
      if (!prev || !prev.customGateways) return prev;
      const updated = prev.customGateways.map((g) =>
        g.id === id ? { ...g, isActive: !g.isActive } : g
      );
      api.updateWebsiteSettings({ customGateways: updated }).catch(console.error);
      return { ...prev, customGateways: updated };
    });
  };

  const handleDeleteGateway = (id: string) => {
    if (!window.confirm(t('আপনি কি নিশ্চিত যে এই গেটওয়েটি তালিকা থেকে মুছে ফেলতে চান?', 'Are you sure you want to delete this payment gateway?'))) {
      return;
    }
    setSettingsData((prev) => {
      if (!prev || !prev.customGateways) return prev;
      const updated = prev.customGateways.filter((g) => g.id !== id);
      api.updateWebsiteSettings({ customGateways: updated }).catch(console.error);
      return { ...prev, customGateways: updated };
    });
  };

  // Helper to get current active policy text
  const getCurrentPolicyText = () => {
    if (!settingsData) return '';
    if (activePolicyTab === 'safety') return settingsData.safetyProtocol !== undefined ? settingsData.safetyProtocol : DEFAULT_POLICIES.safety;
    if (activePolicyTab === 'tos') return settingsData.termsOfService !== undefined ? settingsData.termsOfService : DEFAULT_POLICIES.tos;
    if (activePolicyTab === 'privacy') return settingsData.privacyPolicy !== undefined ? settingsData.privacyPolicy : DEFAULT_POLICIES.privacy;
    if (activePolicyTab === 'refund') return settingsData.refundPolicy !== undefined ? settingsData.refundPolicy : DEFAULT_POLICIES.refund;
    return settingsData.marketplaceGuide !== undefined ? settingsData.marketplaceGuide : DEFAULT_POLICIES.marketplace;
  };

  // Helper to update current active policy text
  const updateCurrentPolicyText = (val: string) => {
    setSettingsData((prev) => {
      if (!prev) return null;
      if (activePolicyTab === 'safety') return { ...prev, safetyProtocol: val };
      if (activePolicyTab === 'tos') return { ...prev, termsOfService: val };
      if (activePolicyTab === 'privacy') return { ...prev, privacyPolicy: val };
      if (activePolicyTab === 'refund') return { ...prev, refundPolicy: val };
      return { ...prev, marketplaceGuide: val };
    });
  };

  // Helper to get current active policy link label
  const getCurrentPolicyLinkLabel = () => {
    if (!settingsData) return '';
    if (activePolicyTab === 'safety') return settingsData.policyLinkSafety ?? '';
    if (activePolicyTab === 'tos') return settingsData.policyLinkTos ?? '';
    if (activePolicyTab === 'privacy') return settingsData.policyLinkPrivacy ?? '';
    if (activePolicyTab === 'refund') return settingsData.policyLinkRefund ?? '';
    return settingsData.marketplaceLinkHowTransferWorks ?? '';
  };

  // Helper to update current active policy link label
  const updateCurrentPolicyLinkLabel = (val: string) => {
    setSettingsData((prev) => {
      if (!prev) return null;
      if (activePolicyTab === 'safety') return { ...prev, policyLinkSafety: val };
      if (activePolicyTab === 'tos') return { ...prev, policyLinkTos: val };
      if (activePolicyTab === 'privacy') return { ...prev, policyLinkPrivacy: val };
      if (activePolicyTab === 'refund') return { ...prev, policyLinkRefund: val };
      return { ...prev, marketplaceLinkHowTransferWorks: val };
    });
  };

  const getCurrentPolicyDefaultLinkLabel = () => {
    if (activePolicyTab === 'safety') return DEFAULT_POLICIES.policyLinkSafety;
    if (activePolicyTab === 'tos') return DEFAULT_POLICIES.policyLinkTos;
    if (activePolicyTab === 'privacy') return DEFAULT_POLICIES.policyLinkPrivacy;
    if (activePolicyTab === 'refund') return DEFAULT_POLICIES.policyLinkRefund;
    return DEFAULT_POLICIES.marketplaceLinkHowTransferWorks;
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. OVERVIEW TAB */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Admin Action Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setActiveTab('channels')}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-sky-400 hover:shadow-md text-left transition cursor-pointer flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('লিস্টিং অডিট', 'Review Listings')}
                </span>
                <span className="text-xs font-black text-slate-800 group-hover:text-sky-600 transition">
                  {pendingApprovals.length} {t('টি অনুমোদনের অপেক্ষায়', 'pending')}
                </span>
              </div>
              <Tv className="w-5 h-5 text-sky-500 shrink-0" />
            </button>

            <button
              onClick={() => setActiveTab('disputes')}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-rose-400 hover:shadow-md text-left transition cursor-pointer flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('আরবিট্রেশন সেন্টার', 'Arbitration')}
                </span>
                <span className="text-xs font-black text-slate-800 group-hover:text-rose-600 transition">
                  {disputedOrders.length} {t('টি বিরোধ সমাধান বাকি', 'active disputes')}
                </span>
              </div>
              <Scale className="w-5 h-5 text-rose-500 shrink-0" />
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md text-left transition cursor-pointer flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('প্ল্যাটফর্ম কনফিগার', 'Site Config')}
                </span>
                <span className="text-xs font-black text-slate-800 group-hover:text-amber-600 transition">
                  {settingsData?.commissionRate || 5}% {t('কমিশন ও গেটওয়ে', 'fee & gateways')}
                </span>
              </div>
              <Settings className="w-5 h-5 text-amber-500 shrink-0" />
            </button>

            <button
              onClick={() => setBroadcastModalOpen(true)}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md text-left transition cursor-pointer flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('ব্রডকাস্ট নোটিশ', 'Broadcast Alert')}
                </span>
                <span className="text-xs font-black text-slate-800 group-hover:text-purple-600 transition">
                  {t('নতুন নোটিফিকেশন পাঠান', 'Send broadcast')}
                </span>
              </div>
              <Bell className="w-5 h-5 text-purple-500 shrink-0" />
            </button>
          </div>

          {/* Recent High Priority Transactions & Activity Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-5 py-3.5 flex items-center justify-between">
              <span className="font-black text-sm tracking-wide">
                {t('সাম্প্রতিক লেনদেন ও এসক্রো কার্যক্রম (Recent Escrow Activity)', 'Recent Escrow Activity')}
              </span>
              <button
                onClick={() => setActiveTab('payments')}
                className="text-xs text-white/90 hover:text-white font-bold underline cursor-pointer"
              >
                {t('সব লেনদেন দেখুন →', 'View all transactions →')}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3">{t('ট্রানজ্যাকশন আইডি', 'Tx ID')}</th>
                    <th className="px-4 py-3">{t('ইউজার ও রোল', 'User & Role')}</th>
                    <th className="px-4 py-3">{t('পরিমাণ ও ফি', 'Amount / Fee')}</th>
                    <th className="px-4 py-3">{t('পদ্ধতি (Method)', 'Method')}</th>
                    <th className="px-4 py-3">{t('স্ট্যাটাস', 'Status')}</th>
                    <th className="px-4 py-3">{t('সময়', 'Timestamp')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {transactions.slice(0, 5).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3 font-mono font-bold text-slate-900">{tx.transactionRef || tx.id}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800 block">{tx.userName}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{tx.userRole}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-black text-slate-900 block">${tx.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-emerald-600 font-bold block">+${tx.fee} fee</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] font-bold text-slate-700">
                        {tx.paymentProvider || tx.paymentMethod}
                      </td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 text-[11px] text-slate-400 font-mono">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3-Column Visual Metrics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-900 block mb-3">
                {t('চ্যানেল স্ট্যাটাস বণ্টন (Status Distribution)', 'Channel Status Distribution')}
              </span>
              <div className="w-full h-3 rounded-full flex overflow-hidden mb-3 shadow-inner">
                <div className="bg-emerald-500 h-full w-[65%]" title="Approved: 65%" />
                <div className="bg-sky-500 h-full w-[20%]" title="In Escrow: 20%" />
                <div className="bg-amber-500 h-full w-[10%]" title="Pending: 10%" />
                <div className="bg-rose-500 h-full w-[5%]" title="Disputed: 5%" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>{t('অনুমোদিত: 65%', 'Approved: 65%')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span>{t('হস্তান্তর: 20%', 'In Escrow: 20%')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>{t('অপেক্ষমাণ: 10%', 'Pending: 10%')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>{t('বিরোধপূর্ণ: 5%', 'Disputed: 5%')}</span>
                </div>
              </div>
            </div>

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
      )}

      {/* ============================================================== */}
      {/* 2. CHANNELS TAB */}
      {/* ============================================================== */}
      {activeTab === 'channels' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="font-black text-sm tracking-wide">
                {t('চ্যানেল লিস্টিং ও যাচাইকরণ (Channel Listing & Verification Ledger)', 'Channel Listing & Verification Ledger')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
                {filteredChannels.length} {t('চ্যানেল', 'channels')}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setChannelStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition cursor-pointer ${
                    channelStatusFilter === st ? 'bg-white text-sky-700 shadow-xs' : 'text-white/80 hover:bg-white/10'
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
                        <span className="font-bold text-slate-700 capitalize">{channel.platform || 'YouTube'}</span>
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
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. USERS TAB */}
      {/* ============================================================== */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="font-black text-sm tracking-wide">
                {t('ব্যবহারকারী তালিকা (User Management Ledger)', 'User Management Ledger')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
                {filteredUsers.length} {t('জন', 'users')}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              {(['all', 'seller', 'buyer', 'admin', 'banned'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setUserRoleFilter(role)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition cursor-pointer ${
                    userRoleFilter === role ? 'bg-white text-sky-700 shadow-xs' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">{t('ব্যবহারকারী / প্রোফাইল', 'User ID & Profile')}</th>
                  <th className="px-4 py-3.5">{t('রোল ও অধিকার', 'Role')}</th>
                  <th className="px-4 py-3.5">{t('KYC ভেরিফিকেশন', 'KYC Status')}</th>
                  <th className="px-4 py-3.5">{t('রেটিং ও ডিল', 'Rating / Deals')}</th>
                  <th className="px-4 py-3.5">{t('যোগদানের তারিখ', 'Member Since')}</th>
                  <th className="px-5 py-3.5 text-right">{t('ম্যানেজমেন্ট অ্যাকশন', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`}
                          alt={u.name}
                          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 object-cover"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{u.name}</span>
                          <span className="text-[11px] font-mono text-slate-500">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        u.role === 'admin'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : u.role === 'seller'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {u.isVerifiedSeller ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                          {t('ভেরিফাইড', 'Verified')}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                          {t('সাধারণ', 'Standard')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-800">{u.rating ? `⭐ ${u.rating}` : '—'}</span>
                      <span className="text-[10px] text-slate-400 block">{u.dealsCount || 0} {t('ডিল সমাপ্ত', 'deals')}</span>
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-slate-400 font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedUserDetail(u)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        title={t('প্রোফাইল অডিট', 'Audit')}
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-600" />
                      </button>
                      <button
                        onClick={() => handleToggleVerified(u.id)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          u.isVerifiedSeller ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                        title={t('ভেরিফিকেশন টগল', 'Toggle Verification')}
                      >
                        <BadgeCheck className="w-3.5 h-3.5" />
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleBan(u.id)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            u.isBanned ? 'bg-red-500 border-red-600 text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={u.isBanned ? t('ব্যান প্রত্যাহার', 'Unban') : t('ব্যান করুন', 'Ban')}
                        >
                          <Ban className="w-3.5 h-3.5" />
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

      {/* ============================================================== */}
      {/* 4. ORDERS TAB */}
      {/* ============================================================== */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="font-black text-sm tracking-wide">
                {t('অর্ডার ও এসক্রো ট্র্যাকিং (Order Escrow Ledger)', 'Order Escrow Ledger')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
                {filteredOrders.length} {t('অর্ডার', 'orders')}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              {(['all', 'in_escrow', 'completed', 'disputed', 'cancelled'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition cursor-pointer ${
                    orderStatusFilter === st ? 'bg-white text-sky-700 shadow-xs' : 'text-white/80 hover:bg-white/10'
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
                        <div className="text-[10px] space-y-0.5">
                          <span className="text-amber-700 font-semibold block">
                            +{t('বায়ার ফি:', 'Buyer:')} ${ord.buyerFee !== undefined ? ord.buyerFee : Math.round(ord.platformFee / 2)}
                          </span>
                          <span className="text-rose-600 font-semibold block">
                            -{t('সেলার ফি:', 'Seller:')} ${ord.sellerFee !== undefined ? ord.sellerFee : Math.round(ord.platformFee / 2)}
                          </span>
                          <span className="text-emerald-700 font-black block">
                            {t('মোট আয়:', 'Net Earned:')} ${ord.platformFee}
                          </span>
                        </div>
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
                          <span className="text-[10px] font-bold text-slate-600">{completedSteps}/{totalSteps}</span>
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
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. PAYMENTS TAB */}
      {/* ============================================================== */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="font-black text-sm tracking-wide">
                {t('পেমেন্ট ও কমিশন অডিট লেজার (Payment & Payout Ledger)', 'Payment & Payout Ledger')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
                {filteredTransactions.length} {t('লেনদেন', 'transactions')}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              {(['all', 'success', 'pending', 'failed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setPaymentFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition cursor-pointer ${
                    paymentFilter === st ? 'bg-white text-sky-700 shadow-xs' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Commission Rate Banner */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-b border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-emerald-950 block text-xs sm:text-sm">
                    {t('কমিশন মডেল:', 'Commission Model:')}{' '}
                    <span className="text-emerald-800 font-bold">
                      {settingsData?.feeDeductionTarget === 'both' || !settingsData?.feeDeductionTarget
                        ? t('উভয় পক্ষ (বায়ার ও সেলার দুজনের থেকেই কাটা হয়)', 'Both Parties (Buyer & Seller Deducted)')
                        : settingsData?.feeDeductionTarget === 'buyer'
                        ? t('শুধুমাত্র বায়ারের থেকে', 'Buyer Only')
                        : t('শুধুমাত্র সেলারের থেকে', 'Seller Only')}
                    </span>
                  </span>
                  <span className="text-emerald-700 font-black text-xs px-2.5 py-0.5 rounded-lg bg-emerald-100 border border-emerald-300">
                    {settingsData?.feeDeductionTarget === 'both' || !settingsData?.feeDeductionTarget
                      ? `${settingsData?.buyerFeePercent ?? 2.5}% বায়ার + ${settingsData?.sellerFeePercent ?? 2.5}% সেলার = ${settingsData?.commissionRate ?? 5}% মোট`
                      : `${settingsData?.commissionRate ?? 5}%`}
                  </span>
                </div>
                <span className="text-[11px] text-slate-600 mt-0.5 block">
                  {t(
                    'বায়ারের ডিপোজিট থেকে কাস্টডি ফি এবং সেলারের পেআউট থেকে কমিশন স্বয়ংক্রিয়ভাবে হিসাব হয়ে প্ল্যাটফর্মের নেট লাভ তৈরি হয়।',
                    'Platform custody fees and seller payout deductions are automatically accounted for.'
                  )}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0 text-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{t('কমিশন ও মডেল পরিবর্তন করুন', 'Configure Commission & Split')}</span>
            </button>
          </div>

          {/* Dynamic Payment Gateways & Bank Accounts Studio */}
          <div className="p-5 border-b border-slate-200 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>{t('পেমেন্ট গেটওয়ে ও ব্যাংক একাউন্ট কনফিগারেশন', 'Payment Gateways & Bank Accounts Suite')}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {(settingsData?.customGateways || []).length} {t('গেটওয়ে সক্রিয়', 'Configured')}
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t(
                    'বায়ারদের পেমেন্ট ডিপোজিটের জন্য একাধিক ব্যাংক একাউন্ট (City, Islami, DBBL ইত্যাদি), বিকাশ, নগদ, রকেট এবং USDT ক্রিপ্টো ওয়ালেট যুক্ত ও পরিচালনা করুন।',
                    'Manage multiple bank accounts, mobile banking numbers, and crypto USDT wallets for escrow deposits.'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleOpenAddGateway('bdt', 'bank')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{t('+ নতুন ব্যাংক একাউন্ট যোগ করুন', '+ Add Bank Account')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAddGateway('bdt', 'mobile_banking')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('+ গেটওয়ে / ওয়ালেট যোগ করুন', '+ Add Gateway')}</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 pt-1">
              {(['all', 'bdt', 'usdt'] as const).map((ft) => {
                const count = (settingsData?.customGateways || []).filter(g => ft === 'all' || g.type === ft).length;
                return (
                  <button
                    key={ft}
                    type="button"
                    onClick={() => setGatewayFilterType(ft)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      gatewayFilterType === ft
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <span>
                      {ft === 'all' ? t('সকল গেটওয়ে ও ব্যাংক', 'All Gateways') : ft === 'bdt' ? t('🇧🇩 BDT গেটওয়ে ও ব্যাংক', 'BDT & Banks') : t('🪙 USDT ক্রিপ্টো', 'USDT Crypto')}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${gatewayFilterType === ft ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Gateway Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {(settingsData?.customGateways || [])
                .filter(gw => gatewayFilterType === 'all' || gw.type === gatewayFilterType)
                .map((gw) => (
                  <div
                    key={gw.id}
                    className={`p-4 rounded-2xl border-2 transition space-y-2.5 relative ${
                      gw.isActive
                        ? gw.category === 'bank'
                          ? 'bg-blue-50/40 border-blue-200/90 hover:border-blue-300'
                          : gw.type === 'usdt'
                          ? 'bg-amber-50/40 border-amber-200/90 hover:border-amber-300'
                          : 'bg-emerald-50/40 border-emerald-200/90 hover:border-emerald-300'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          gw.category === 'bank'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : gw.type === 'usdt'
                            ? 'bg-amber-500 text-white shadow-2xs'
                            : 'bg-pink-600 text-white shadow-2xs'
                        }`}>
                          {gw.category === 'bank' ? <Building2 className="w-4 h-4" /> : gw.type === 'usdt' ? <Coins className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                        </div>
                        <div>
                          <h5 className="font-black text-xs text-slate-900 leading-tight">{gw.name}</h5>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold uppercase text-slate-500">{gw.type.toUpperCase()}</span>
                            <span>•</span>
                            <span className="text-[10px] font-semibold text-slate-600">
                              {gw.category === 'bank' ? t('ব্যাংক', 'Bank') : gw.category === 'mobile_banking' ? t('মোবাইল ব্যাংকিং', 'Mobile') : t('ক্রিপ্টো', 'Crypto')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleGatewayStatus(gw.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                          gw.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                        title={gw.isActive ? t('নিষ্ক্রিয় করুন', 'Deactivate') : t('সক্রিয় করুন', 'Activate')}
                      >
                        {gw.isActive ? `● ${t('সক্রিয়', 'Active')}` : `○ ${t('নিষ্ক্রিয়', 'Disabled')}`}
                      </button>
                    </div>

                    {/* Account Details Box */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 space-y-1 text-xs font-mono">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-sans">{gw.category === 'bank' ? t('একাউন্ট নং:', 'A/C No:') : t('নম্বর / ঠিকানা:', 'Number / Address:')}</span>
                        <span className="font-bold text-slate-900 select-all truncate max-w-[170px]">{gw.accountNumber}</span>
                      </div>
                      {gw.accountHolderName && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-sans">{t('হোল্ডার নাম:', 'Holder:')}</span>
                          <span className="font-sans font-semibold text-slate-800 truncate max-w-[170px]">{gw.accountHolderName}</span>
                        </div>
                      )}
                      {gw.bankName && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-sans">{t('ব্যাংক:', 'Bank:')}</span>
                          <span className="font-sans font-bold text-blue-700 truncate max-w-[170px]">{gw.bankName}</span>
                        </div>
                      )}
                      {gw.branchName && (
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-sans">{t('শাখা:', 'Branch:')}</span>
                          <span className="font-sans text-slate-600 truncate max-w-[170px]">{gw.branchName}</span>
                        </div>
                      )}
                      {gw.routingNumber && (
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-sans">{t('রাউটিং:', 'Routing:')}</span>
                          <span className="text-slate-800">{gw.routingNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 truncate max-w-[160px]">
                        {gw.instructions || t('বায়ারের জন্য সক্রিয় গেটওয়ে', 'Active for buyer checkout')}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditGateway(gw)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          title={t('এডিট করুন', 'Edit')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGateway(gw.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                          title={t('মুছে ফেলুন', 'Delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">{t('ট্রানজ্যাকশন আইডি ও রেফারেন্স', 'Tx Ref')}</th>
                  <th className="px-4 py-3.5">{t('ব্যবহারকারী / পক্ষ', 'Party')}</th>
                  <th className="px-4 py-3.5">{t('ধরণ (Type)', 'Transaction Type')}</th>
                  <th className="px-4 py-3.5">{t('পরিমাণ ও ফি', 'Gross / Net Fee')}</th>
                  <th className="px-4 py-3.5">{t('পেমেন্ট গেটওয়ে', 'Gateway')}</th>
                  <th className="px-4 py-3.5">{t('প্রুফ স্লিপ', 'Slip Proof')}</th>
                  <th className="px-4 py-3.5">{t('স্ট্যাটাস', 'Status')}</th>
                  <th className="px-5 py-3.5 text-right">{t('তারিখ', 'Date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTransactions.map((tx) => {
                  const matchedOrd = orders.find(o => o.id === tx.orderId || o.paymentDetails?.transactionRef === tx.transactionRef);
                  const proofUrl = matchedOrd?.paymentDetails?.screenshotUrl;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-slate-900 block">{tx.transactionRef || tx.id}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Order: {tx.orderId || 'Direct Escrow'}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800 block">{tx.userName}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{tx.userRole}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-black text-slate-900 block">${tx.amount.toLocaleString()} {tx.currency}</span>
                        <span className="text-[10px] text-emerald-600 font-bold block">+${tx.fee} commission</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-semibold text-slate-700">
                        {tx.paymentProvider || tx.paymentMethod}
                      </td>
                      <td className="px-4 py-3.5">
                        {proofUrl ? (
                          <button
                            type="button"
                            onClick={() => setAdminProofModalUrl(proofUrl)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <ImageIcon className="w-3 h-3 text-emerald-600" />
                            <span>{t('রসিদ দেখুন', 'View Slip')}</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[11px] font-mono">—</span>
                        )}
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
                      <td className="px-5 py-3.5 text-right text-[11px] text-slate-400 font-mono">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. DISPUTES TAB */}
      {/* ============================================================== */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-rose-600 to-red-600 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-white" />
                <span className="font-black text-sm tracking-wide">
                  {t('বিরোধ নিষ্পত্তি ও আরবিট্রেশন সেন্টার (Dispute Arbitration Center)', 'Dispute Arbitration Center')}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
                {disputedOrders.length} {t('টি বিরোধ বিচারাধীন', 'cases pending')}
              </span>
            </div>

            {disputedOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">{t('বর্তমানে কোনো সক্রিয় বিরোধ নেই', 'No Active Disputes in Queue')}</h4>
                <p className="text-xs">{t('সকল এসক্রো ট্রানজ্যাকশন স্বাভাবিক গতিতে হস্তান্তর হচ্ছে।', 'All escrows operating smoothly without hold.')}</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {disputedOrders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-xs">
                          #{ord.id}
                        </span>
                        <span className="font-black text-slate-900 text-sm">{ord.channelTitle}</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <span className="font-bold">{t('বায়ার:', 'Buyer:')}</span> {ord.buyerName} • <span className="font-bold">{t('সেলার:', 'Seller:')}</span> {ord.sellerName}
                      </p>
                      <p className="text-xs font-bold text-rose-600">
                        {t('এসক্রো তহবিল লক:', 'Escrow Locked:')} ${ord.amount.toLocaleString()} + ${ord.platformFee} Platform Fee
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onSelectOrder(ord.id)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
                      >
                        {t('অর্ডার দেখুন', 'Inspect Order')}
                      </button>
                      <button
                        onClick={() => {
                          setResolvingOrder(ord);
                          setResolutionAction('refund_buyer');
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-bold shadow-md cursor-pointer transition"
                      >
                        {t('বিরোধ নিষ্পত্তি করুন', 'Arbitrate & Resolve')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. POLICIES & FOOTER CONTENT CONTROL TAB */}
      {/* ============================================================== */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          {/* Hero Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 via-rose-600 to-red-700 flex items-center justify-center text-white text-2xl shadow-lg shrink-0">
                  <Scale className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-rose-400 uppercase tracking-widest">
                      {t('গভর্নেন্স ও কমপ্লায়েন্স', 'Governance & Compliance')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      {t('ওয়েবসাইট লাইভ সিঙ্ক', 'Live Site Sync')}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                    {t('পলিসি, সিকিউরিটি স্ট্যান্ডার্ড ও মার্কেটপ্লেস কন্ট্রোল', 'Policies, Security Standards & Marketplace Editor')}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    {t(
                      'ওয়েবসাইটের ৩টি মূল অংশ: Policies & Security, Security Standard এবং Marketplace এর সমস্ত লেখা এখান থেকে সরাসরি পরিবর্তন করুন।',
                      'Directly configure all content for Policies & Security, Security Standard, and Marketplace sections.'
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{savingSettings ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('সকল পরিবর্তন সংরক্ষণ করুন', 'Save All Changes')}</span>
              </button>
            </div>

            {/* 3 Main Pillar Switcher Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-slate-700/80">
              <button
                type="button"
                onClick={() => setActivePolicyGroup('policies')}
                className={`p-3 rounded-2xl text-left transition cursor-pointer flex items-center gap-3 border ${
                  activePolicyGroup === 'policies'
                    ? 'bg-white/15 border-rose-400 text-white shadow-xs'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black block text-white">
                    ১. {t('Policies & Security', 'Policies & Security')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {t('টার্মস, প্রাইভেসি, রিফান্ড ও নিরাপত্তা', 'TOS, Privacy, Refund, Safety')}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActivePolicyGroup('security')}
                className={`p-3 rounded-2xl text-left transition cursor-pointer flex items-center gap-3 border ${
                  activePolicyGroup === 'security'
                    ? 'bg-white/15 border-emerald-400 text-white shadow-xs'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black block text-white">
                    ২. {t('Security Standard', 'Security Standard')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {t('সুরক্ষিত কাস্টডি বক্স ও কুলডাউন ব্যাজ', 'Custody box & cooldown badge')}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActivePolicyGroup('marketplace')}
                className={`p-3 rounded-2xl text-left transition cursor-pointer flex items-center gap-3 border ${
                  activePolicyGroup === 'marketplace'
                    ? 'bg-white/15 border-purple-400 text-white shadow-xs'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black block text-white">
                    ৩. {t('Marketplace', 'Marketplace')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {t('ট্রান্সফার গাইডলাইন ও ডিসক্লেমার', 'Transfer guide & footer notice')}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* ========================================================== */}
          {/* GROUP 1: POLICIES & SECURITY */}
          {/* ========================================================== */}
          {activePolicyGroup === 'policies' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-600" />
                    <span>{t('Policies & Security (পলিসি ও নিরাপত্তা নীতিমালা)', 'Policies & Security')}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('নিচের ৪টি পলিসি ও এদের ফুটার লিংক শিরোনাম সরাসরি পরিবর্তন করুন:', 'Customize all 4 policies and their navigation labels:')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPolicyPreview(!showPolicyPreview)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>{showPolicyPreview ? t('এডিটর দেখুন', 'Show Editor') : t('লাইভ প্রিভিউ দেখুন', 'Live Preview')}</span>
                  </button>
                </div>
              </div>

              {/* Section Header Title Setting */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {t('১. ফুটারের কলামের প্রধান শিরোনাম (Policies Column Header)', 'Policies Column Title in Footer')}
                  </label>
                  <input
                    type="text"
                    value={settingsData?.policiesMenuTitle ?? ''}
                    onChange={(e) =>
                      setSettingsData((prev) => (prev ? { ...prev, policiesMenuTitle: e.target.value } : null))
                    }
                    placeholder={DEFAULT_POLICIES.policiesMenuTitle}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-rose-500 focus:outline-hidden bg-white shadow-2xs"
                  />
                </div>
                <div className="text-[11px] text-slate-500 sm:max-w-xs">
                  {t('ওয়েবসাইটের ফুটারের ২য় কলামের নাম। খালি রাখলে ডিফল্ট "পলিসি ও নিরাপত্তা" দেখাবে।', 'Column 2 header title in footer.')}
                </div>
              </div>

              {/* Subtabs for 4 policies */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {t('২. যে পলিসিটি এডিট করতে চান নির্বাচন করুন:', 'Select policy to customize:')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setActivePolicyTab('safety')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      activePolicyTab === 'safety'
                        ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{settingsData?.policyLinkSafety || t('নিরাপত্তা প্রটোকল', 'Anti-Scam Safety')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePolicyTab('tos')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      activePolicyTab === 'tos'
                        ? 'bg-white text-red-600 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="truncate">{settingsData?.policyLinkTos || t('টার্মস অফ সার্ভিস', 'Terms of Service')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePolicyTab('privacy')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      activePolicyTab === 'privacy'
                        ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">{settingsData?.policyLinkPrivacy || t('প্রাইভেসি পলিসি', 'Privacy Policy')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePolicyTab('refund')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      activePolicyTab === 'refund'
                        ? 'bg-white text-amber-600 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="truncate">{settingsData?.policyLinkRefund || t('রিফান্ড ও পরিদর্শন', 'Refund & Dispute')}</span>
                  </button>
                </div>
              </div>

              {/* Sub-item Link Label Customization */}
              <div className="p-3.5 bg-rose-50/50 border border-rose-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-rose-950 mb-1">
                    {t('৩. এই পলিসির লিংক ও ট্যাবের শিরোনাম (Link / Tab Label)', 'Policy Link / Tab Title')}
                  </label>
                  <input
                    type="text"
                    value={getCurrentPolicyLinkLabel()}
                    onChange={(e) => updateCurrentPolicyLinkLabel(e.target.value)}
                    placeholder={getCurrentPolicyDefaultLinkLabel()}
                    className="w-full px-3.5 py-2 rounded-xl border border-rose-300 text-xs font-bold focus:border-rose-600 focus:outline-hidden bg-white shadow-2xs"
                  />
                </div>
                <div className="text-[11px] text-rose-800 sm:max-w-xs">
                  {t('ফুটার মেনুতে এবং লিগ্যাল সেন্টারের ট্যাবে এই নাম প্রদর্শিত হবে।', 'Label shown in footer menu and popup tabs.')}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {t('পলিসি সক্রিয়', 'Policy Active')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {getCurrentPolicyText().length} {t('অক্ষর', 'chars')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateCurrentPolicyText(DEFAULT_POLICIES[activePolicyTab as keyof typeof DEFAULT_POLICIES] || '')}
                    className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-sky-600" />
                    <span>{t('ডিফল্ট ড্রাফট লোড করুন', 'Load Default Draft')}</span>
                  </button>

                  {getCurrentPolicyText().trim() && (
                    <button
                      type="button"
                      onClick={() => updateCurrentPolicyText('')}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3 text-rose-600" />
                      <span>{t('ক্লিয়ার', 'Clear')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Formatting Helper Tip */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
                <span className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  {t('ফরম্যাটিং গাইড:', 'Formatting Guide:')}
                </span>
                <span>• {t('বড় শিরোনাম দিতে লাইনের শুরুতে "# শিরোনাম" লিখুন', 'Use "# Header" for large titles')}</span>
                <span>• {t('বুলেট পয়েন্ট দিতে লাইনের শুরুতে "- পয়েন্ট" লিখুন', 'Use "- Point" for list items')}</span>
                <span>• {t('প্যারাগ্রাফ আলাদা করতে একটি ফাঁকা লাইন দিন', 'Use blank line between paragraphs')}</span>
              </div>

              {/* Editor or Preview */}
              {showPolicyPreview ? (
                <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-sky-400/40 shadow-inner space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                      {t('লাইভ প্রিভিউ (ওয়েবসাইটে যেভাবে দেখা যাবে)', 'Live Preview (As users will see it)')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Rendered Modal View</span>
                  </div>

                  {getCurrentPolicyText().trim() ? (
                    <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {getCurrentPolicyText()
                        .split(/\n\s*\n/)
                        .map((p) => p.trim())
                        .filter(Boolean)
                        .map((p, idx) => {
                          const lines = p.split('\n').map((l) => l.trim()).filter(Boolean);
                          const isList = lines.length > 1 && lines.every((l) => /^[-•*]|\d+[\.)]/.test(l));

                          if (isList) {
                            return (
                              <ul key={idx} className="space-y-2 pl-4 border-l-2 border-sky-400 bg-sky-50/40 p-3 rounded-r-xl">
                                {lines.map((item, lineIdx) => {
                                  const cleaned = item.replace(/^[-•*]|\d+[\.)]/, '').trim();
                                  return (
                                    <li key={lineIdx} className="flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0 mt-1.5" />
                                      <span>{cleaned}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            );
                          }

                          if (p.startsWith('#') || (p.length < 60 && !p.endsWith('.'))) {
                            return (
                              <h4 key={idx} className="font-extrabold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-1 pt-2">
                                {p.replace(/^#+\s*/, '')}
                              </h4>
                            );
                          }

                          return (
                            <p key={idx} className="whitespace-pre-line">
                              {p}
                            </p>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs italic">
                      {t('বর্তমানে কোনো লেখা নেই। ডিফল্ট স্ট্যান্ডার্ড পলিসি প্রযোজ্য হবে।', 'No text entered. Default policy active.')}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <textarea
                    rows={14}
                    value={getCurrentPolicyText()}
                    onChange={(e) => updateCurrentPolicyText(e.target.value)}
                    placeholder={DEFAULT_POLICIES[activePolicyTab as keyof typeof DEFAULT_POLICIES] || ''}
                    className="w-full p-4 rounded-2xl border-2 border-slate-300 focus:border-rose-500 focus:outline-hidden text-xs sm:text-sm font-sans text-slate-800 leading-relaxed shadow-inner placeholder:text-slate-300 resize-y"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-1">
                    <span>
                      {t('পরিবর্তন সম্পন্ন হলে উপরে বা নিচে "সকল পলিসি ও কনটেন্ট সংরক্ষণ করুন" বাটনে ক্লিক করুন।', 'Click save button to commit changes.')}
                    </span>
                    <span className="font-mono">
                      Field: {activePolicyTab === 'safety' ? 'safetyProtocol' : activePolicyTab === 'tos' ? 'termsOfService' : activePolicyTab === 'privacy' ? 'privacyPolicy' : 'refundPolicy'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* GROUP 2: SECURITY STANDARD */}
          {/* ========================================================== */}
          {activePolicyGroup === 'security' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>{t('Security Standard (সিকিউরিটি স্ট্যান্ডার্ড বক্স ও ট্রাস্ট বার)', 'Security Standard Governance')}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t(
                    'ওয়েবসাইটের ফুটারের ৩য় কলামে যে "সিকিউরিটি স্ট্যান্ডার্ড" বক্স ও ৭-দিনের কুলডাউন ব্যাজ এবং শীর্ষ ট্রাস্ট বার প্রদর্শিত হয়, তার সমস্ত লেখা এখান থেকে পরিবর্তন করুন:',
                    'Customize all text inside the Security Standard box, cooldown badge, and escrow trust custody bar:'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Column Header Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('১. কলামের প্রধান শিরোনাম (Column Header)', 'Column Header Title in Footer')}
                    </label>
                    <input
                      type="text"
                      value={settingsData?.securityStandardMenuTitle ?? ''}
                      onChange={(e) =>
                        setSettingsData((prev) => (prev ? { ...prev, securityStandardMenuTitle: e.target.value } : null))
                      }
                      placeholder={DEFAULT_POLICIES.securityStandardMenuTitle}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Box Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('২. বক্সের শিরোনাম (Security Standard Box Title)', 'Box Title')}
                    </label>
                    <input
                      type="text"
                      value={settingsData?.securityStandardTitle ?? ''}
                      onChange={(e) =>
                        setSettingsData((prev) => (prev ? { ...prev, securityStandardTitle: e.target.value } : null))
                      }
                      placeholder={DEFAULT_POLICIES.securityStandardTitle}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Box Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('৩. বিস্তারিত নিরাপত্তা বিবরণ (Box Description)', 'Box Description')}
                    </label>
                    <textarea
                      rows={4}
                      value={settingsData?.securityStandardDescription ?? ''}
                      onChange={(e) =>
                        setSettingsData((prev) => (prev ? { ...prev, securityStandardDescription: e.target.value } : null))
                      }
                      placeholder={DEFAULT_POLICIES.securityStandardDescription}
                      className="w-full p-3.5 rounded-xl border border-slate-300 text-xs leading-relaxed focus:border-emerald-500 focus:outline-hidden resize-y"
                    />
                  </div>

                  {/* Badge Text */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('৪. কুলডাউন / নিরাপত্তা ব্যাজ টেক্সট (Transfer Protocol Badge)', 'Badge Text')}
                    </label>
                    <input
                      type="text"
                      value={settingsData?.securityStandardBadge ?? ''}
                      onChange={(e) =>
                        setSettingsData((prev) => (prev ? { ...prev, securityStandardBadge: e.target.value } : null))
                      }
                      placeholder={DEFAULT_POLICIES.securityStandardBadge}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Trust Bar Text */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('৫. ফুটারের শীর্ষ ট্রাস্ট ব্যাজ (Top Escrow Custody Bar)', 'Top Escrow Custody Trust Bar')}
                    </label>
                    <input
                      type="text"
                      value={settingsData?.trustBadgeText ?? ''}
                      onChange={(e) =>
                        setSettingsData((prev) => (prev ? { ...prev, trustBadgeText: e.target.value } : null))
                      }
                      placeholder={DEFAULT_POLICIES.trustBadgeText}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsData((prev) =>
                          prev
                            ? {
                                ...prev,
                                securityStandardMenuTitle: DEFAULT_POLICIES.securityStandardMenuTitle,
                                securityStandardTitle: DEFAULT_POLICIES.securityStandardTitle,
                                securityStandardDescription: DEFAULT_POLICIES.securityStandardDescription,
                                securityStandardBadge: DEFAULT_POLICIES.securityStandardBadge,
                                trustBadgeText: DEFAULT_POLICIES.trustBadgeText
                              }
                            : null
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-emerald-600" />
                      <span>{t('ডিফল্ট সিকিউরিটি টেক্সট লোড করুন', 'Load Default Security Text')}</span>
                    </button>
                  </div>
                </div>

                {/* Live Preview of the Security Standard Box & Trust Bar */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('লাইভ ফুটার প্রিভিউ (ওয়েবসাইটে যেভাবে দেখা যাবে)', 'Live Footer Preview')}
                  </label>

                  {/* Top Trust Bar Preview */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-center">
                    <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold shadow-2xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {settingsData?.trustBadgeText?.trim() || DEFAULT_POLICIES.trustBadgeText}
                      </span>
                    </div>
                  </div>

                  {/* Column 3 Security Box Preview */}
                  <div className="bg-slate-100/70 p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 border-b-2 border-red-500 inline-block">
                      {settingsData?.securityStandardMenuTitle?.trim() || DEFAULT_POLICIES.securityStandardMenuTitle}
                    </h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 max-w-xs text-center shadow-2xs w-full">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-900 font-bold">
                        <Lock className="w-4 h-4 text-emerald-600" />
                        <span>
                          {settingsData?.securityStandardTitle?.trim() || DEFAULT_POLICIES.securityStandardTitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-normal text-center whitespace-pre-line">
                        {settingsData?.securityStandardDescription?.trim() || DEFAULT_POLICIES.securityStandardDescription}
                      </p>
                    </div>
                    <div className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-600 font-medium">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>
                        {settingsData?.securityStandardBadge?.trim() || DEFAULT_POLICIES.securityStandardBadge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* GROUP 3: MARKETPLACE */}
          {/* ========================================================== */}
          {activePolicyGroup === 'marketplace' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>{t('Marketplace (মার্কেটপ্লেস কলাম, লিংক, গাইডলাইন ও ডিসক্লেমার)', 'Marketplace Guidelines & Disclaimer')}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t(
                    'ফুটারের ১ম কলাম "মার্কেটপ্লেস"-এর শিরোনাম, ৪টি লিংকের নাম, "কিভাবে একাউন্ট ট্রান্সফার হয়" গাইডলাইন এবং ফুটারের অফিসিয়াল ডিসক্লেমার পরিবর্তন করুন:',
                    'Customize the Marketplace column title, link labels, transfer protocol guide, and footer disclaimer:'
                  )}
                </p>
              </div>

              <div className="space-y-6">
                {/* 1. Marketplace Column Title */}
                <div className="p-4 bg-purple-50/50 border border-purple-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-purple-950 mb-1">
                      {t('১. মার্কেটপ্লেস কলামের প্রধান শিরোনাম (Marketplace Column Title)', 'Marketplace Column Title in Footer')}
                    </label>
                    <input
                      type="text"
                      value={settingsData?.marketplaceMenuTitle ?? ''}
                      onChange={(e) =>
                        setSettingsData((prev) => (prev ? { ...prev, marketplaceMenuTitle: e.target.value } : null))
                      }
                      placeholder={DEFAULT_POLICIES.marketplaceMenuTitle}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-purple-300 text-xs font-bold focus:border-purple-600 focus:outline-hidden bg-white shadow-2xs"
                    />
                  </div>
                  <div className="text-[11px] text-purple-800 sm:max-w-xs">
                    {t('ফুটারের ১ম কলামের নাম এটি। খালি রাখলে ডিফল্ট "মার্কেটপ্লেস" দেখাবে।', 'Column 1 header in footer.')}
                  </div>
                </div>

                {/* 2. Four Navigation Links in Marketplace Menu */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <label className="block text-xs font-bold text-slate-800">
                    {t('২. মার্কেটপ্লেস মেনুর ৪টি লিংকের প্রদর্শিত নাম (Link Labels):', 'Marketplace Navigation Link Labels:')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                        {t('লিংক ১ (ব্রাউজ একাউন্ট):', 'Link 1 (Browse):')}
                      </span>
                      <input
                        type="text"
                        value={settingsData?.marketplaceLinkBrowse ?? ''}
                        onChange={(e) =>
                          setSettingsData((prev) => (prev ? { ...prev, marketplaceLinkBrowse: e.target.value } : null))
                        }
                        placeholder={DEFAULT_POLICIES.marketplaceLinkBrowse}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:border-purple-500 focus:outline-hidden bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                        {t('লিংক ২ (বিক্রির লিস্টিং):', 'Link 2 (List for Sale):')}
                      </span>
                      <input
                        type="text"
                        value={settingsData?.marketplaceLinkSell ?? ''}
                        onChange={(e) =>
                          setSettingsData((prev) => (prev ? { ...prev, marketplaceLinkSell: e.target.value } : null))
                        }
                        placeholder={DEFAULT_POLICIES.marketplaceLinkSell}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:border-purple-500 focus:outline-hidden bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                        {t('লিংক ৩ (ট্রান্সফার প্রটোকল গাইড):', 'Link 3 (Transfer Protocol):')}
                      </span>
                      <input
                        type="text"
                        value={settingsData?.marketplaceLinkHowTransferWorks ?? ''}
                        onChange={(e) =>
                          setSettingsData((prev) => (prev ? { ...prev, marketplaceLinkHowTransferWorks: e.target.value } : null))
                        }
                        placeholder={DEFAULT_POLICIES.marketplaceLinkHowTransferWorks}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:border-purple-500 focus:outline-hidden bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                        {t('লিংক ৪ (বায়ার ড্যাশবোর্ড):', 'Link 4 (Buyer Hub):')}
                      </span>
                      <input
                        type="text"
                        value={settingsData?.marketplaceLinkBuyerHub ?? ''}
                        onChange={(e) =>
                          setSettingsData((prev) => (prev ? { ...prev, marketplaceLinkBuyerHub: e.target.value } : null))
                        }
                        placeholder={DEFAULT_POLICIES.marketplaceLinkBuyerHub}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:border-purple-500 focus:outline-hidden bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. "How Transfer Works" Transfer Protocol Full Guideline */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      {t('৩. "কিভাবে একাউন্ট ট্রান্সফার হয়" গাইডলাইন (Transfer Protocol Guide)', 'How Transfer Works Full Guide')}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsData((prev) =>
                          prev ? { ...prev, marketplaceGuide: DEFAULT_POLICIES.marketplace } : null
                        )
                      }
                      className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{t('ডিফল্ট গাইডলাইন লোড করুন', 'Load Default Guide')}</span>
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={settingsData?.marketplaceGuide ?? ''}
                    onChange={(e) =>
                      setSettingsData((prev) => (prev ? { ...prev, marketplaceGuide: e.target.value } : null))
                    }
                    placeholder={DEFAULT_POLICIES.marketplace}
                    className="w-full p-4 rounded-2xl border-2 border-slate-300 focus:border-purple-500 focus:outline-hidden text-xs leading-relaxed resize-y shadow-inner font-sans"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">
                    {t('ইউজার যখন ফুটারের লিংকটিতে ক্লিক করবেন তখন এই বিস্তারিত গাইডলাইন পপআপে প্রদর্শিত হবে।', 'Guideline displayed in modal when users click link.')}
                  </span>
                </div>

                {/* 4. Footer Disclaimer & Important Notice */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      {t('৪. ফুটার নিচের গুরুত্বপূর্ণ নোটিশ / ডিসক্লেমার (Important Notice & Disclaimer)', 'Footer Disclaimer')}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsData((prev) =>
                          prev ? { ...prev, footerDisclaimer: DEFAULT_POLICIES.footerDisclaimer } : null
                        )
                      }
                      className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{t('ডিফল্ট নোটিশ লোড করুন', 'Load Default Notice')}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={settingsData?.footerDisclaimer ?? ''}
                    onChange={(e) =>
                      setSettingsData((prev) => (prev ? { ...prev, footerDisclaimer: e.target.value } : null))
                    }
                    placeholder={DEFAULT_POLICIES.footerDisclaimer}
                    className="w-full p-4 rounded-2xl border-2 border-slate-300 focus:border-purple-500 focus:outline-hidden text-xs leading-relaxed resize-y shadow-inner font-sans"
                  />
                </div>

                {/* Live Preview of Bottom Notice */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {t('লাইভ ফুটার নোটিশ প্রিভিউ', 'Live Footer Notice Preview')}
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
                    <strong className="text-slate-800">{t('গুরুত্বপূর্ণ নোটিশ: ', 'Important Notice: ')}</strong>
                    {settingsData?.footerDisclaimer?.trim() || DEFAULT_POLICIES.footerDisclaimer}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-medium text-center sm:text-left">
              {t(
                'যেকোনো পলিসি বা টেক্সট পরিবর্তন করার পর অবশ্যই নিচে বাটনে ক্লিক করে সংরক্ষণ করুন।',
                'Remember to click save to synchronize all changes to the live site.'
              )}
            </span>
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{savingSettings ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('সকল পলিসি ও কনটেন্ট সংরক্ষণ করুন', 'Save All Policies & Content')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. SETTINGS TAB */}
      {/* ============================================================== */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-white" />
              <span className="font-black text-sm tracking-wide">
                {t('প্ল্যাটফর্ম ও ওয়েবসাইট সেটিংস কনফিগারেশন', 'Platform & Governance Settings')}
              </span>
            </div>
            <span className="text-xs text-white/80 font-mono">Alif Trust Engine v2.8</span>
          </div>

          <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('ওয়েবসাইটের নাম (Site Name)', 'Platform Brand Name')}
                </label>
                <input
                  type="text"
                  value={settingsData?.siteName || ''}
                  onChange={(e) => setSettingsData(prev => prev ? { ...prev, siteName: e.target.value } : null)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('ট্যাগলাইন (Site Tagline)', 'Site Tagline')}
                </label>
                <input
                  type="text"
                  value={settingsData?.siteTagline || ''}
                  onChange={(e) => setSettingsData(prev => prev ? { ...prev, siteTagline: e.target.value } : null)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-sky-500"
                />
              </div>

              {/* Dual Commission & Percentage Split Studio */}
              <div className="sm:col-span-2 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-sky-50/40 border-2 border-emerald-300 shadow-sm space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Percent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-emerald-950 flex items-center gap-2">
                        <span>{t('এসক্রো কমিশন ও ফি কর্তন ব্যবস্থা (Commission Split Policy)', 'Escrow Commission & Fee Split Policy')}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                          {t('লাইভ কনফিগারেশন', 'Live Setting')}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {t(
                          'কমিশন কার থেকে কাটা হবে (বায়ার, সেলার নাকি দুজনের থেকেই) তা নিচে নির্বাচন করুন এবং শতকরা হার সেট করুন।',
                          'Select who pays the commission (Buyer, Seller, or Both) and set the percentage rate for each.'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">{t('মোট প্ল্যাটফর্ম আয়:', 'Total Platform Fee:')}</span>
                    <span className="text-lg font-black text-emerald-700">
                      {(() => {
                        const target = settingsData?.feeDeductionTarget || 'both';
                        const bRate = settingsData?.buyerFeePercent !== undefined && settingsData?.buyerFeePercent !== null ? settingsData.buyerFeePercent : (target === 'seller' ? 0 : 2.5);
                        const sRate = settingsData?.sellerFeePercent !== undefined && settingsData?.sellerFeePercent !== null ? settingsData.sellerFeePercent : (target === 'buyer' ? 0 : 2.5);
                        return target === 'both' ? `${bRate + sRate}%` : `${settingsData?.commissionRate ?? 5}%`;
                      })()}
                    </span>
                  </div>
                </div>

                {/* 1. Who pays? Deduction Target Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    {t('১. কমিশন কার থেকে কাটা হবে? (Fee Deduction Model):', '1. Who pays the commission? (Fee Deduction Model):')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Option A: BOTH (Recommended) */}
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsData(prev => {
                          if (!prev) return null;
                          const b = prev.buyerFeePercent ?? 2.5;
                          const s = prev.sellerFeePercent ?? 2.5;
                          return {
                            ...prev,
                            feeDeductionTarget: 'both',
                            buyerFeePercent: b,
                            sellerFeePercent: s,
                            commissionRate: Number((b + s).toFixed(2))
                          };
                        });
                      }}
                      className={`p-3.5 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                        (settingsData?.feeDeductionTarget || 'both') === 'both'
                          ? 'border-emerald-500 bg-white shadow-md ring-2 ring-emerald-400/20'
                          : 'border-slate-200 bg-white/70 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-900">
                          {t('দুজনের থেকেই কাটা হবে', 'Both Buyer & Seller')}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          {t('সুপারিশকৃত', 'Recommended')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                        {t(
                          'বায়ার অতিরিক্ত কাস্টডি ফি দেবেন এবং সেলারের বিক্রয়মূল্য থেকে কমিশন কাটা হবে।',
                          'Buyer pays custody fee, and seller pays commission from payout.'
                        )}
                      </p>
                    </button>

                    {/* Option B: Buyer Only */}
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsData(prev => {
                          if (!prev) return null;
                          const rate = prev.buyerFeePercent || prev.commissionRate || 5;
                          return {
                            ...prev,
                            feeDeductionTarget: 'buyer',
                            buyerFeePercent: rate,
                            sellerFeePercent: 0,
                            commissionRate: rate
                          };
                        });
                      }}
                      className={`p-3.5 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                        settingsData?.feeDeductionTarget === 'buyer'
                          ? 'border-emerald-500 bg-white shadow-md ring-2 ring-emerald-400/20'
                          : 'border-slate-200 bg-white/70 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-900">
                          {t('শুধুমাত্র বায়ারের থেকে', 'Buyer Only')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                        {t(
                          'বায়ার দামের সাথে অতিরিক্ত ফি দেবেন, সেলার তার সম্পূর্ণ বিক্রয়মূল্য পাবেন।',
                          'Buyer pays total fee on top. Seller gets 100% of asking price.'
                        )}
                      </p>
                    </button>

                    {/* Option C: Seller Only */}
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsData(prev => {
                          if (!prev) return null;
                          const rate = prev.sellerFeePercent || prev.commissionRate || 5;
                          return {
                            ...prev,
                            feeDeductionTarget: 'seller',
                            buyerFeePercent: 0,
                            sellerFeePercent: rate,
                            commissionRate: rate
                          };
                        });
                      }}
                      className={`p-3.5 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                        settingsData?.feeDeductionTarget === 'seller'
                          ? 'border-emerald-500 bg-white shadow-md ring-2 ring-emerald-400/20'
                          : 'border-slate-200 bg-white/70 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-900">
                          {t('শুধুমাত্র সেলারের থেকে', 'Seller Only')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                        {t(
                          'বায়ার শুধু মূল দাম দেবেন, সেলারের পেআউট থেকে কমিশন কর্তন করা হবে।',
                          'Buyer pays exact price. Commission deducted from seller payout.'
                        )}
                      </p>
                    </button>
                  </div>
                </div>

                {/* 2. Percentage Rates Configuration */}
                <div className="p-4 rounded-xl bg-white border border-emerald-200/90 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      {t('২. শতকরা হার (% Rate) নির্ধারণ করুন:', '2. Configure Percentage (%):')}
                    </span>
                    {(settingsData?.feeDeductionTarget || 'both') === 'both' && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-500">{t('উভয় পক্ষের কুইক স্প্লিট:', 'Quick Splits:')}</span>
                        {[
                          { label: '১.৫% + ১.৫% = ৩%', b: 1.5, s: 1.5 },
                          { label: '২.৫% + ২.৫% = ৫%', b: 2.5, s: 2.5 },
                          { label: '৩.৫% + ৩.৫% = ৭%', b: 3.5, s: 3.5 },
                          { label: '৫% + ৫% = ১০%', b: 5, s: 5 }
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              setSettingsData(prev => prev ? {
                                ...prev,
                                feeDeductionTarget: 'both',
                                buyerFeePercent: preset.b,
                                sellerFeePercent: preset.s,
                                commissionRate: preset.b + preset.s
                              } : null);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-pointer transition"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Buyer Rate */}
                    <div className={`p-3 rounded-xl border transition ${
                      settingsData?.feeDeductionTarget === 'seller' ? 'opacity-40 bg-slate-50 border-slate-200' : 'bg-emerald-50/50 border-emerald-200'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-black text-emerald-950 flex items-center gap-1">
                          <span>{t('বায়ার ফি হার (% Buyer Custody Fee)', 'Buyer Custody Fee (%)')}</span>
                        </label>
                        <span className="text-xs font-black text-emerald-700">
                          {settingsData?.feeDeductionTarget === 'seller' ? '০% (অক্রিয়)' : `${settingsData?.buyerFeePercent ?? 2.5}%`}
                        </span>
                      </div>
                      <div className="relative mt-1">
                        <input
                          type="number"
                          min="0"
                          max="25"
                          step="0.1"
                          disabled={settingsData?.feeDeductionTarget === 'seller'}
                          value={settingsData?.feeDeductionTarget === 'seller' ? 0 : (settingsData?.buyerFeePercent ?? 2.5)}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSettingsData(prev => {
                              if (!prev) return null;
                              const s = prev.feeDeductionTarget === 'both' ? (prev.sellerFeePercent ?? 2.5) : 0;
                              return {
                                ...prev,
                                buyerFeePercent: val,
                                commissionRate: Number((val + s).toFixed(2))
                              };
                            });
                          }}
                          className="w-full px-3 py-2 pr-8 rounded-xl bg-white border border-emerald-300 text-sm font-black text-emerald-950 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-bold text-emerald-700">%</span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {t('বায়ার অ্যাকাউন্ট কেনার সময় এই শতাংশ অতিরিক্ত কাস্টডি চার্জ হিসেবে জমা দেবেন।', 'Buyer deposits this percentage as escrow custody fee.')}
                      </span>
                    </div>

                    {/* Seller Rate */}
                    <div className={`p-3 rounded-xl border transition ${
                      settingsData?.feeDeductionTarget === 'buyer' ? 'opacity-40 bg-slate-50 border-slate-200' : 'bg-rose-50/40 border-rose-200'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-black text-rose-950 flex items-center gap-1">
                          <span>{t('সেলার কমিশন হার (% Seller Commission)', 'Seller Commission (%)')}</span>
                        </label>
                        <span className="text-xs font-black text-rose-700">
                          {settingsData?.feeDeductionTarget === 'buyer' ? '০% (অক্রিয়)' : `${settingsData?.sellerFeePercent ?? 2.5}%`}
                        </span>
                      </div>
                      <div className="relative mt-1">
                        <input
                          type="number"
                          min="0"
                          max="25"
                          step="0.1"
                          disabled={settingsData?.feeDeductionTarget === 'buyer'}
                          value={settingsData?.feeDeductionTarget === 'buyer' ? 0 : (settingsData?.sellerFeePercent ?? 2.5)}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSettingsData(prev => {
                              if (!prev) return null;
                              const b = prev.feeDeductionTarget === 'both' ? (prev.buyerFeePercent ?? 2.5) : 0;
                              return {
                                ...prev,
                                sellerFeePercent: val,
                                commissionRate: Number((b + val).toFixed(2))
                              };
                            });
                          }}
                          className="w-full px-3 py-2 pr-8 rounded-xl bg-white border border-rose-300 text-sm font-black text-rose-950 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-bold text-rose-700">%</span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {t('সফল হস্তান্তর শেষে সেলারকে টাকা ছাড় করার সময় এই শতাংশ কমিশন কর্তন হবে।', 'Deducted from seller payout upon successful ownership release.')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Live 3-Way Split Simulation Box */}
                {(() => {
                  const target = settingsData?.feeDeductionTarget || 'both';
                  const bRate = target === 'seller' ? 0 : (settingsData?.buyerFeePercent ?? 2.5);
                  const sRate = target === 'buyer' ? 0 : (settingsData?.sellerFeePercent ?? 2.5);
                  const examplePrice = 1000;
                  const bFee = Math.round(examplePrice * (bRate / 100));
                  const sFee = Math.round(examplePrice * (sRate / 100));
                  const bTotal = examplePrice + bFee;
                  const sPayout = Math.max(0, examplePrice - sFee);
                  const totalProfit = bFee + sFee;

                  return (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-white via-slate-50 to-white border border-emerald-300 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>{t('লাইভ দ্বিমুখী স্প্লিট সিমুলেটর ($১,০০০ ডলারের ডিলে হিসাব)', 'Live 3-Way Split Simulation ($1,000 Deal)')}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">
                          {target === 'both' ? t('উভয় পক্ষ কর্তন সক্রিয়', 'Dual Split Active') : target}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                        {/* Buyer Pays */}
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">
                            {t('১. বায়ার সর্বমোট দেবেন:', '1. Buyer Deposits:')}
                          </span>
                          <span className="text-sm font-black text-slate-900 block">${bTotal.toLocaleString()}</span>
                          <span className="text-[10px] text-amber-700 block">
                            ${examplePrice} + ${bFee} ({bRate}% {t('কাস্টডি ফি', 'fee')})
                          </span>
                        </div>

                        {/* Seller Receives */}
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">
                            {t('২. সেলার নেট পাবেন:', '2. Seller Payout:')}
                          </span>
                          <span className="text-sm font-black text-slate-900 block">${sPayout.toLocaleString()}</span>
                          <span className="text-[10px] text-rose-600 block">
                            ${examplePrice} - ${sFee} ({sRate}% {t('কমিশন কর্তন', 'commission')})
                          </span>
                        </div>

                        {/* Platform Earns */}
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-1">
                          <span className="text-[10px] uppercase font-black text-emerald-800 block">
                            {t('৩. প্ল্যাটফর্মের মোট লাভ:', '3. Platform Net Profit:')}
                          </span>
                          <span className="text-sm font-black text-emerald-700 block">+${totalProfit.toLocaleString()}</span>
                          <span className="text-[10px] text-emerald-700 block font-semibold">
                            ${bFee} (বায়ার) + ${sFee} (সেলার)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('সর্বনিম্ন লিস্টিং মূল্য ($ Minimum Price)', 'Minimum Listing Price ($)')}
                </label>
                <input
                  type="number"
                  min="10"
                  value={settingsData?.minimumListingPrice || 50}
                  onChange={(e) => setSettingsData(prev => prev ? { ...prev, minimumListingPrice: Number(e.target.value) } : null)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('বিকাশ মার্চেন্ট নম্বর (bKash Merchant)', 'bKash Merchant Number')}
                </label>
                <input
                  type="text"
                  value={settingsData?.bkashMerchantNumber || ''}
                  onChange={(e) => setSettingsData(prev => prev ? { ...prev, bkashMerchantNumber: e.target.value } : null)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('নগদ মার্চেন্ট নম্বর (Nagad Merchant)', 'Nagad Merchant Number')}
                </label>
                <input
                  type="text"
                  value={settingsData?.nagadMerchantNumber || ''}
                  onChange={(e) => setSettingsData(prev => prev ? { ...prev, nagadMerchantNumber: e.target.value } : null)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('সাপোর্ট ইমেইল (Support Email)', 'Support Email')}
                </label>
                <input
                  type="email"
                  value={settingsData?.contactEmail || ''}
                  onChange={(e) => setSettingsData(prev => prev ? { ...prev, contactEmail: e.target.value } : null)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('হোয়াটসঅ্যাপ হটলাইন (WhatsApp Hotline)', 'WhatsApp Hotline')}
                </label>
                <input
                  type="text"
                  value={settingsData?.whatsappSupport || ''}
                  onChange={(e) => setSettingsData(prev => prev ? { ...prev, whatsappSupport: e.target.value } : null)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>

            {/* ============================================================== */}
            {/* POLICY & LEGAL DOCUMENTS MANAGEMENT SECTION */}
            {/* ============================================================== */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-2xl text-white shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-xs shrink-0">
                    <Scale className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white flex items-center gap-2">
                      <span>{t('পলিসি ও লিগ্যাল ডকুমেন্টস এডিটর', 'Legal Policies & Compliance Editor')}</span>
                      <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                        {t('লাইভ এডিটর', 'Live Editor')}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {t(
                        'এখান থেকে যে পলিসি লিখবেন তা সরাসরি ওয়েবসাইটে লিগ্যাল সেন্টারে দৃশ্যমান হবে।',
                        'Write and customize platform legal policies directly reflected in user legal modal.'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPolicyPreview(!showPolicyPreview)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showPolicyPreview ? t('এডিটর দেখুন', 'Show Editor') : t('প্রিভিউ দেখুন', 'Live Preview')}</span>
                  </button>
                </div>
              </div>

              {/* Policy Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setActivePolicyTab('safety')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activePolicyTab === 'safety'
                      ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{t('নিরাপদ প্রটোকল', 'Safe Protocol')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePolicyTab('tos')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activePolicyTab === 'tos'
                      ? 'bg-white text-red-600 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="truncate">{t('টার্মস অফ সার্ভিস', 'Terms of Service')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePolicyTab('privacy')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activePolicyTab === 'privacy'
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{t('প্রাইভেসি পলিসি', 'Privacy Policy')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePolicyTab('refund')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activePolicyTab === 'refund'
                      ? 'bg-white text-amber-600 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{t('রিফান্ড ও বিরোধ', 'Refund Policy')}</span>
                </button>
              </div>

              {/* Policy Editor Controls & Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2">
                  {getCurrentPolicyText().trim() ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 bg-sky-100/80 px-2.5 py-1 rounded-full border border-sky-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                      {t('কাস্টম পলিসি সক্রিয়', 'Custom Policy Active')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-full">
                      {t('ডিফল্ট টেমপ্লেট প্রযোজ্য', 'Using Default Template')}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">
                    {getCurrentPolicyText().length} {t('অক্ষর', 'chars')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateCurrentPolicyText(DEFAULT_POLICIES[activePolicyTab])}
                    className="px-3 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-sky-600" />
                    <span>{t('ডিফল্ট ড্রাফট লোড করুন', 'Load Default Draft')}</span>
                  </button>

                  {getCurrentPolicyText().trim() && (
                    <button
                      type="button"
                      onClick={() => updateCurrentPolicyText('')}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3 text-rose-600" />
                      <span>{t('ক্লিয়ার', 'Clear')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Formatting Helper Tip */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
                <span className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  {t('ফরম্যাটিং টিপস:', 'Formatting Guide:')}
                </span>
                <span>• {t('বড় শিরোনাম দিতে লাইনের শুরুতে "# শিরোনাম" লিখুন', 'Use "# Header" for large titles')}</span>
                <span>• {t('বুলেট পয়েন্ট দিতে লাইনের শুরুতে "- পয়েন্ট" লিখুন', 'Use "- Point" for list items')}</span>
                <span>• {t('প্যারাগ্রাফ আলাদা করতে একটি ফাঁকা লাইন দিন', 'Use a blank line between paragraphs')}</span>
              </div>

              {/* Editor or Live Preview */}
              {showPolicyPreview ? (
                /* Live Preview Mode */
                <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-sky-400/40 shadow-inner space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                      {t('লাইভ প্রিভিউ (ওয়েবসাইটে যেভাবে দেখা যাবে)', 'Live Preview (As users will see it)')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">HTML Formatted</span>
                  </div>

                  {getCurrentPolicyText().trim() ? (
                    <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {getCurrentPolicyText()
                        .split(/\n\s*\n/)
                        .map((p) => p.trim())
                        .filter(Boolean)
                        .map((p, idx) => {
                          const lines = p.split('\n').map((l) => l.trim()).filter(Boolean);
                          const isList = lines.length > 1 && lines.every((l) => /^[-•*]|\d+[\.)]/.test(l));

                          if (isList) {
                            return (
                              <ul key={idx} className="space-y-2 pl-4 border-l-2 border-sky-400 bg-sky-50/40 p-3 rounded-r-xl">
                                {lines.map((item, lineIdx) => {
                                  const cleaned = item.replace(/^[-•*]|\d+[\.)]/, '').trim();
                                  return (
                                    <li key={lineIdx} className="flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0 mt-1.5" />
                                      <span>{cleaned}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            );
                          }

                          if (p.startsWith('#') || (p.length < 60 && !p.endsWith('.'))) {
                            return (
                              <h4 key={idx} className="font-extrabold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-1 pt-2">
                                {p.replace(/^#+\s*/, '')}
                              </h4>
                            );
                          }

                          return (
                            <p key={idx} className="whitespace-pre-line">
                              {p}
                            </p>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs italic">
                      {t('বর্তমানে কোনো কাস্টম লেখা নেই। ডিফল্ট স্ট্যান্ডার্ড পলিসি প্রদর্শিত হচ্ছে।', 'No custom text entered. Default standard policy will be displayed.')}
                    </div>
                  )}
                </div>
              ) : (
                /* Textarea Editor */
                <div>
                  <textarea
                    rows={12}
                    value={getCurrentPolicyText()}
                    onChange={(e) => updateCurrentPolicyText(e.target.value)}
                    placeholder={DEFAULT_POLICIES[activePolicyTab]}
                    className="w-full p-4 rounded-2xl border-2 border-slate-300 focus:border-sky-500 focus:outline-hidden text-xs sm:text-sm font-sans text-slate-800 leading-relaxed shadow-inner placeholder:text-slate-300 resize-y"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 px-1">
                    <span>
                      {t(
                        'পলিসির পরিবর্তন কার্যকর করতে নিচে "সেটিংস সংরক্ষণ করুন" বাটনে ক্লিক করুন।',
                        'Click "Save Platform Settings" below to apply changes.'
                      )}
                    </span>
                    <span>
                      {activePolicyTab === 'safety' && 'safetyProtocol'}
                      {activePolicyTab === 'tos' && 'termsOfService'}
                      {activePolicyTab === 'privacy' && 'privacyPolicy'}
                      {activePolicyTab === 'refund' && 'refundPolicy'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('ব্যাকআপ ডাউনলোড', 'Export Database Backup')}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {savingSettings ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('সেটিংস সংরক্ষণ করুন', 'Save Platform Settings')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. SECURITY TAB */}
      {/* ============================================================== */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white text-2xl shadow-lg">
                  🛡️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black">অফিশিয়াল সুপার অ্যাডমিন অ্যাকাউন্ট</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500 text-white uppercase">Active</span>
                  </div>
                  <p className="text-xs font-mono text-rose-300 mt-0.5">alifsheenshopping@gmail.com</p>
                  <p className="text-[11px] text-slate-400 mt-1">পূর্ণ প্রশাসনিক ক্ষমতা, এসক্রো তহবিল রিলিজ ও প্ল্যাটফর্ম নিয়ন্ত্রণ সুরক্ষিত।</p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
                SHA512 Salted PBKDF2
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-white" />
                <span className="font-black text-sm tracking-wide">
                  {t('লাইভ সিকিউরিটি অডিট লগ (Security Audit Trail)', 'Live Security Audit Trail')}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
                {auditLogs.length} {t('টি রেকর্ড', 'events')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3">{t('কার্যক্রম (Action)', 'Action')}</th>
                    <th className="px-4 py-3">{t('সম্পাদনকারী অ্যাডমিন', 'Actor')}</th>
                    <th className="px-4 py-3">{t('টার্গেট ও বিবরণ', 'Details')}</th>
                    <th className="px-4 py-3">{t('আইপি অ্যাড্রেস', 'IP Address')}</th>
                    <th className="px-5 py-3 text-right">{t('তারিখ ও সময়', 'Timestamp')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3">
                        <span className="font-bold text-slate-900 block font-mono text-[11px]">{log.action}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-semibold">{log.adminName}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{log.details}</td>
                      <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">{log.ipAddress || '103.114.98.22'}</td>
                      <td className="px-5 py-3 text-right font-mono text-slate-400 text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
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
      {/* 9. REPORTS TAB */}
      {/* ============================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Gross Marketplace Volume</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">${stats?.totalVolume.toLocaleString() || '826,000'}</span>
              <span className="text-xs text-emerald-600 font-bold mt-1 block">+18.4% this quarter</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Net Platform Commission</span>
              <span className="text-2xl font-black text-blue-600 block mt-1">${(stats?.totalFees || 41300).toLocaleString()}</span>
              <span className="text-xs text-blue-600 font-bold mt-1 block">5.0% standard escrow rate</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Escrow Success Ratio</span>
              <span className="text-2xl font-black text-emerald-600 block mt-1">99.4%</span>
              <span className="text-xs text-slate-500 font-bold mt-1 block">7-day brand handover verified</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-5 py-3.5 flex items-center justify-between">
              <span className="font-black text-sm tracking-wide">
                {t('সেরা বিক্রেতা পারফরম্যান্স (Top Sellers by Completed Deals)', 'Top Verified Sellers')}
              </span>
              <span className="text-xs text-white/80">Platform Top 5</span>
            </div>
            <div className="p-4 space-y-2">
              {usersList.filter(u => u.role === 'seller').slice(0, 5).map((seller, idx) => (
                <div key={seller.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-black text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{seller.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{seller.email}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 text-xs block">{seller.dealsCount || 10} Deals</span>
                    <span className="text-[10px] text-emerald-600 font-bold">⭐ {seller.rating || 5.0} Rating</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 10. COUPONS TAB */}
      {/* ============================================================== */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-white" />
              <span className="font-black text-sm tracking-wide">
                {t('প্রোমোশনাল কুপন ও ডিসকাউন্ট কোড', 'Coupons & Promotional Discounts')}
              </span>
            </div>
            <button
              onClick={() => setCouponModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white text-sky-700 hover:bg-slate-100 font-bold text-xs cursor-pointer shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('নতুন কুপন তৈরি', 'New Coupon')}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">{t('কুপন কোড', 'Coupon Code')}</th>
                  <th className="px-4 py-3.5">{t('ছাড়ের পরিমাণ', 'Discount')}</th>
                  <th className="px-4 py-3.5">{t('ব্যবহার সীমা', 'Usage / Limit')}</th>
                  <th className="px-4 py-3.5">{t('মেয়াদ শেষ', 'Valid Until')}</th>
                  <th className="px-5 py-3.5 text-right">{t('অ্যাকশন', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      কোনো সক্রিয় কুপন পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  coupons.map((cpn) => (
                    <tr key={cpn.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3.5 font-mono font-black text-slate-900 text-sm">{cpn.code}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-600">
                        {cpn.discountType === 'percentage' ? `${cpn.discountValue}% OFF` : `$${cpn.discountValue} FLAT`}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {cpn.usageCount} / {cpn.usageLimit || '∞'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">{cpn.validUntil || '2026-12-31'}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(cpn.id, cpn.code)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 11. NOTIFICATIONS TAB */}
      {/* ============================================================== */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-white" />
              <span className="font-black text-sm tracking-wide">
                {t('সাইটওয়াইড ব্রডকাস্ট নোটিফিকেশন সেন্টার', 'Site-wide Broadcast Center')}
              </span>
            </div>
            <button
              onClick={() => setBroadcastModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white text-sky-700 hover:bg-slate-100 font-bold text-xs cursor-pointer shadow-xs transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('নতুন ব্রডকাস্ট বার্তা', 'New Broadcast')}</span>
            </button>
          </div>

          <div className="p-4 space-y-3">
            {notifications.length === 0 ? (
              <p className="text-center p-8 text-slate-400 text-xs">কোনো পূর্ববর্তী ব্রডকাস্ট নোটিফিকেশন নেই।</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{n.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700 uppercase">
                        {n.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        To: {n.targetAudience}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteNotification(n.id)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer shrink-0"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 12. TICKETS TAB */}
      {/* ============================================================== */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-white" />
              <span className="font-black text-sm tracking-wide">
                {t('কাস্টমার সাপোর্ট টিকেট ও চ্যাট কিউ', 'Support Tickets Queue')}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
              {tickets.length} {t('টিকেট', 'tickets')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">{t('টিকেট নম্বর ও বিষয়', 'Ticket / Subject')}</th>
                  <th className="px-4 py-3.5">{t('ব্যবহারকারী', 'User')}</th>
                  <th className="px-4 py-3.5">{t('ক্যাটাগরি', 'Category')}</th>
                  <th className="px-4 py-3.5">{t('অগ্রাধিকার', 'Priority')}</th>
                  <th className="px-4 py-3.5">{t('স্ট্যাটাস', 'Status')}</th>
                  <th className="px-5 py-3.5 text-right">{t('অ্যাকশন', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">কোনো সাপোর্ট টিকেট নেই।</td>
                  </tr>
                ) : (
                  tickets.map((tkt) => (
                    <tr key={tkt.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-sky-600 block">{tkt.ticketNumber || tkt.id}</span>
                        <span className="font-bold text-slate-900 block max-w-xs truncate">{tkt.subject}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800 block">{tkt.userName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{tkt.userEmail}</span>
                      </td>
                      <td className="px-4 py-3.5 capitalize text-slate-600">{tkt.category}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          tkt.priority === 'urgent'
                            ? 'bg-red-100 text-red-700'
                            : tkt.priority === 'high'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {tkt.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          tkt.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tkt.status === 'in_progress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {tkt.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedTicket(tkt)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer shadow-xs"
                        >
                          {t('রিপ্লাই দিন / দেখুন', 'Inspect & Reply')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 13. FRAUD TAB */}
      {/* ============================================================== */}
      {activeTab === 'fraud' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-rose-600 to-red-600 text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-white" />
              <span className="font-black text-sm tracking-wide">
                {t('ফ্রড ও রিস্ক ডিটেকশন সেন্টার (Fraud Detection & Risk Queue)', 'Fraud Detection & Risk Queue')}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
              {fraudAlerts.length} {t('সতর্কতা', 'alerts')}
            </span>
          </div>

          <div className="p-4 space-y-3">
            {fraudAlerts.length === 0 ? (
              <p className="text-center p-8 text-slate-400 text-xs">কোনো উচ্চ ঝুঁকির ফ্রড অ্যালার্ট নেই।</p>
            ) : (
              fraudAlerts.map((fa) => (
                <div key={fa.id} className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-rose-700 text-xs">Risk Score: {fa.riskScore}/100</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-600 text-white">
                        {fa.riskLevel}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">{fa.userName} ({fa.userEmail})</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{fa.triggerReason}</p>
                    <p className="text-xs text-slate-600">{fa.details}</p>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Target: {fa.targetType} ({fa.targetId}) • {new Date(fa.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="shrink-0">
                    {fa.resolved ? (
                      <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                        Resolved by {fa.resolvedBy}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleResolveFraudAlert(fa.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                      >
                        {t('নিষ্পন্ন করুন', 'Mark Resolved')}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT CUSTOM PAYMENT GATEWAY & BANK ACCOUNT */}
      {/* ============================================================== */}
      {gatewayModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in text-slate-800">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  {gatewayForm.category === 'bank' ? (
                    <Building2 className="w-5 h-5 text-emerald-400" />
                  ) : gatewayForm.type === 'usdt' ? (
                    <Coins className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-pink-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide">
                    {editingGatewayId
                      ? t('পেমেন্ট গেটওয়ে / ব্যাংক একাউন্ট এডিট করুন', 'Edit Gateway / Bank Account')
                      : t('নতুন পেমেন্ট গেটওয়ে বা ব্যাংক একাউন্ট যোগ করুন', 'Add Payment Gateway / Bank Account')}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {t('বায়ার পেমেন্ট করার সময় এই একাউন্ট তথ্য দেখতে পাবে।', 'Visible to buyers when making escrow deposit.')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGatewayModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveGateway} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Type Selection: BDT vs USDT */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  {t('১. কারেন্সি ও পেমেন্ট ধরণ (Currency & Gateway Type) *', '1. Gateway Currency Type *')}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setGatewayForm((prev) => ({ ...prev, type: 'bdt', category: prev.category === 'crypto' ? 'bank' : prev.category }))}
                    className={`p-3 rounded-xl border-2 text-left font-bold transition flex items-center gap-2.5 cursor-pointer ${
                      gatewayForm.type === 'bdt'
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-xl">🇧🇩</span>
                    <div>
                      <span className="block font-black text-xs">{t('BDT (বাংলাদেশী টাকা)', 'BDT (Bangladeshi Taka)')}</span>
                      <span className="text-[10px] font-normal text-slate-500">{t('ব্যাংক একাউন্ট, বিকাশ, নগদ, রকেট', 'Banks, bKash, Nagad, Rocket')}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGatewayForm((prev) => ({ ...prev, type: 'usdt', category: 'crypto' }))}
                    className={`p-3 rounded-xl border-2 text-left font-bold transition flex items-center gap-2.5 cursor-pointer ${
                      gatewayForm.type === 'usdt'
                        ? 'border-amber-500 bg-amber-50/80 text-amber-950 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-xl">🪙</span>
                    <div>
                      <span className="block font-black text-xs">{t('USDT (ক্রিপ্টোকারেন্সি)', 'USDT (Crypto / Blockchain)')}</span>
                      <span className="text-[10px] font-normal text-slate-500">{t('TRC-20, BEP-20, Binance Pay', 'TRC-20, BEP-20, Binance Pay')}</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  {t('২. গেটওয়ে ক্যাটাগরি (Gateway Category) *', '2. Category *')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setGatewayForm((prev) => ({ ...prev, category: 'bank' }))}
                    className={`p-2.5 rounded-xl border font-bold text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      gatewayForm.category === 'bank'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="text-[11px]">{t('ব্যাংক একাউন্ট', 'Bank Account')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGatewayForm((prev) => ({ ...prev, category: 'mobile_banking' }))}
                    className={`p-2.5 rounded-xl border font-bold text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      gatewayForm.category === 'mobile_banking'
                        ? 'border-pink-600 bg-pink-50 text-pink-900 shadow-2xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-pink-600" />
                    <span className="text-[11px]">{t('মোবাইল ব্যাংকিং', 'Mobile Banking')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGatewayForm((prev) => ({ ...prev, category: 'crypto' }))}
                    className={`p-2.5 rounded-xl border font-bold text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      gatewayForm.category === 'crypto'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-2xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Coins className="w-4 h-4 text-amber-600" />
                    <span className="text-[11px]">{t('ক্রিপ্টো ওয়ালেট', 'Crypto Wallet')}</span>
                  </button>
                </div>
              </div>

              {/* Quick Presets for Bangladeshi Banks & Wallets */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t('দ্রুত প্রিসেট (Quick Presets)', 'Quick Presets')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {gatewayForm.category === 'bank' ? (
                    <>
                      {[
                        { name: 'City Bank Corporate', bank: 'City Bank PLC', branch: 'Gulshan-2 Branch', routing: '120261839' },
                        { name: 'Islami Bank Bangladesh', bank: 'Islami Bank Bangladesh PLC', branch: 'Principal Branch', routing: '125272382' },
                        { name: 'Dutch-Bangla Bank (DBBL)', bank: 'Dutch-Bangla Bank Limited', branch: 'Motijheel Branch', routing: '090262438' },
                        { name: 'BRAC Bank Limited', bank: 'BRAC Bank Limited', branch: 'Banani Branch', routing: '060260783' },
                        { name: 'Eastern Bank PLC (EBL)', bank: 'Eastern Bank PLC', branch: 'Dhanmondi Branch', routing: '095261053' }
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() =>
                            setGatewayForm((prev) => ({
                              ...prev,
                              name: preset.name,
                              bankName: preset.bank,
                              branchName: preset.branch,
                              routingNumber: preset.routing
                            }))
                          }
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold transition cursor-pointer"
                        >
                          + {preset.name}
                        </button>
                      ))}
                    </>
                  ) : gatewayForm.category === 'mobile_banking' ? (
                    <>
                      {[
                        { name: 'বিকাশ মার্চেন্ট (bKash Merchant)', note: 'মার্চেন্ট পেমেন্ট সিলেক্ট করে কাউন্টার নম্বর দিন।' },
                        { name: 'বিকাশ পার্সোনাল (bKash Personal)', note: 'সেন্ড মানি করুন ও রেফারেন্সে অর্ডার আইডি দিন।' },
                        { name: 'নগদ মার্চেন্ট (Nagad Merchant)', note: 'নগদ মার্চেন্ট পেমেন্ট।' },
                        { name: 'নগদ পার্সোনাল (Nagad Personal)', note: 'নগদ সেন্ড মানি করুন।' },
                        { name: 'রকেট মার্চেন্ট (Rocket)', note: 'রকেট বিল পে বা পেমেন্ট।' },
                        { name: 'উপায় (Upay)', note: 'উপায় মার্চেন্ট বা পার্সোনাল।' },
                        { name: 'সেলফিন (Cellfin)', note: 'ইসলামী ব্যাংক সেলফিন ফান্ড ট্রান্সফার।' }
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() =>
                            setGatewayForm((prev) => ({
                              ...prev,
                              name: preset.name,
                              instructions: preset.note
                            }))
                          }
                          className="px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-200 text-[10px] font-bold transition cursor-pointer"
                        >
                          + {preset.name}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        { name: 'USDT (TRC-20 Tron)', note: 'Only send USDT via Tron (TRC-20) network.' },
                        { name: 'USDT (BEP-20 BSC)', note: 'Only send USDT via BNB Smart Chain (BEP-20).' },
                        { name: 'Binance Pay (Pay ID / Email)', note: 'Send zero-fee USDT via Binance Pay to our verified ID.' }
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() =>
                            setGatewayForm((prev) => ({
                              ...prev,
                              name: preset.name,
                              instructions: preset.note
                            }))
                          }
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold transition cursor-pointer"
                        >
                          + {preset.name}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Gateway Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('গেটওয়ে বা ব্যাংকের ডিসপ্লে নাম *', 'Gateway / Bank Title *')}
                </label>
                <input
                  type="text"
                  required
                  value={gatewayForm.name || ''}
                  onChange={(e) => setGatewayForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={
                    gatewayForm.category === 'bank'
                      ? 'e.g. City Bank Corporate Escrow'
                      : gatewayForm.type === 'usdt'
                      ? 'e.g. USDT (TRC-20) Vault'
                      : 'e.g. বিকাশ মার্চেন্ট (bKash Merchant Pay)'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Account Number / Phone / Wallet */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {gatewayForm.category === 'bank'
                    ? t('ব্যাংক একাউন্ট নম্বর (Account Number) *', 'Bank Account Number *')
                    : gatewayForm.type === 'usdt'
                    ? t('ক্রিপ্টো ওয়ালেট অ্যাড্রেস / Pay ID *', 'Crypto Wallet Address / Pay ID *')
                    : t('মোবাইল নম্বর / একাউন্ট নং *', 'Mobile Account Number *')}
                </label>
                <input
                  type="text"
                  required
                  value={gatewayForm.accountNumber || ''}
                  onChange={(e) => setGatewayForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder={
                    gatewayForm.category === 'bank'
                      ? 'e.g. 1502482910001'
                      : gatewayForm.type === 'usdt'
                      ? 'e.g. Txyz... or 0x55d3... or Binance Pay ID'
                      : 'e.g. 017XXXXXXXX / 018XXXXXXXX'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Account Holder Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('একাউন্ট হোল্ডারের নাম (Account Holder / Beneficiary Name)', 'Account Holder Name')}
                </label>
                <input
                  type="text"
                  value={gatewayForm.accountHolderName || ''}
                  onChange={(e) => setGatewayForm((prev) => ({ ...prev, accountHolderName: e.target.value }))}
                  placeholder="e.g. Alif Trust Media Platform / Md Alif"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden font-medium"
                />
              </div>

              {/* Bank Specific Fields (if Bank category) */}
              {gatewayForm.category === 'bank' && (
                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                    <Building2 className="w-4 h-4 text-blue-700" />
                    <span>{t('ব্যাংকের বিস্তারিত তথ্য (ব্রাঞ্চ ও রাউটিং)', 'Bank Routing & Branch Details')}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {t('ব্যাংকের নাম (Bank Name)', 'Bank Name')}
                      </label>
                      <input
                        type="text"
                        value={gatewayForm.bankName || ''}
                        onChange={(e) => setGatewayForm((prev) => ({ ...prev, bankName: e.target.value }))}
                        placeholder="e.g. City Bank PLC"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {t('শাখা (Branch Name)', 'Branch Name')}
                      </label>
                      <input
                        type="text"
                        value={gatewayForm.branchName || ''}
                        onChange={(e) => setGatewayForm((prev) => ({ ...prev, branchName: e.target.value }))}
                        placeholder="e.g. Gulshan-2 Branch, Dhaka"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {t('রাউটিং নম্বর (Routing Number)', 'Routing Number')}
                      </label>
                      <input
                        type="text"
                        value={gatewayForm.routingNumber || ''}
                        onChange={(e) => setGatewayForm((prev) => ({ ...prev, routingNumber: e.target.value }))}
                        placeholder="e.g. 120261839 (9 digits)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-hidden bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {t('সুইফট কোড (Swift Code - ঐচ্ছিক)', 'Swift Code (Optional)')}
                      </label>
                      <input
                        type="text"
                        value={gatewayForm.swiftCode || ''}
                        onChange={(e) => setGatewayForm((prev) => ({ ...prev, swiftCode: e.target.value }))}
                        placeholder="e.g. CIBLBDDH"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-hidden bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions / Note for Buyer */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('বায়ারের জন্য বিশেষ নির্দেশনা বা নোট (Instructions for Buyer)', 'Special Instructions / Notes')}
                </label>
                <textarea
                  rows={2}
                  value={gatewayForm.instructions || ''}
                  onChange={(e) => setGatewayForm((prev) => ({ ...prev, instructions: e.target.value }))}
                  placeholder={t(
                    'যেমন: ব্যাংক কাউন্টার বা অনলাইন ফান্ড ট্রান্সফার (NPSB/BEFTN) করে পেমেন্ট স্লিপের ছবি ও TrxID আপলোড করুন।',
                    'e.g. Deposit via online NPSB/BEFTN or branch counter, then attach receipt slip and TrxID.'
                  )}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="gw_isActive"
                  checked={gatewayForm.isActive ?? true}
                  onChange={(e) => setGatewayForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="gw_isActive" className="text-xs font-bold text-slate-800 cursor-pointer">
                  {t('এই পেমেন্ট গেটওয়েটি অবিলম্বে বায়ারদের জন্য সক্রিয় রাখুন', 'Keep this gateway active for buyers immediately')}
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setGatewayModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer text-center"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer text-center shadow-xs"
                >
                  {editingGatewayId
                    ? t('পরিবর্তন সংরক্ষণ করুন', 'Update Gateway')
                    : t('গেটওয়ে ও ব্যাংক সংরক্ষণ করুন', 'Save Gateway & Bank')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: PAYMENT PROOF SCREENSHOT LIGHTBOX */}
      {/* ============================================================== */}
      {adminProofModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-fade-in text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 font-black text-sm">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                <span>{t('বায়ারের জমা দেওয়া পেমেন্ট রসিদ / স্ক্রিনশট প্রুফ', 'Buyer Payment Proof / Receipt Slip')}</span>
              </div>
              <button
                type="button"
                onClick={() => setAdminProofModalUrl(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-2xl bg-slate-950 flex items-center justify-center p-2">
              <img
                src={adminProofModalUrl}
                alt="Payment Proof Receipt"
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 pt-1">
              <span>{t('এডমিন অডিট কনসোল: পেমেন্ট ও স্ক্রিনশট যাচাই করে এসক্রো তহবিল অনুমোদন করুন।', 'Admin Audit Console: Verify deposit slip before releasing escrow.')}</span>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={adminProofModalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t('নতুন ট্যাবে খুলুন', 'Open Tab')}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setAdminProofModalUrl(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition cursor-pointer"
                >
                  {t('বন্ধ করুন', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
