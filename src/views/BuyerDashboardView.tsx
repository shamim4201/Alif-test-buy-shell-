import React, { useState, useEffect } from 'react';
import { Order, ChannelListing } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  ShoppingBag,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Lock,
  Sparkles
} from 'lucide-react';

interface BuyerDashboardViewProps {
  onSelectOrder: (orderId: string) => void;
  onBrowseChannels: () => void;
  onOpenLegal: (tab: 'tos' | 'privacy' | 'refund' | 'safety') => void;
}

export const BuyerDashboardView: React.FC<BuyerDashboardViewProps> = ({
  onSelectOrder,
  onBrowseChannels,
  onOpenLegal
}) => {
  const { user, showToast } = useAuth();
  const { currency, formatPrice, formatUsd, formatBdt, t } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getOrders();
      setOrders(res.orders.filter((o) => o.buyerId === user?.id));
    } catch (err: any) {
      showToast(err.message || t('বায়ারের অর্ডার লোড করতে ব্যর্থ হয়েছে', 'Failed to load buyer orders'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const activeOrders = orders.filter((o) => ['pending', 'payment_confirmed', 'transfer_in_progress'].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === 'completed');

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* Top Header */}
      <div className="border-b border-slate-200 bg-white py-8 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                {t('বায়ার পোর্টফোলিও হাব', 'Buyer Portfolio Hub')}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {t('অ্যাকাউন্ট ক্রয় ও অর্ডারসমূহ', 'Account Acquisitions & Orders')}
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                {t('আপনার ক্রয়কৃত অ্যাকাউন্ট ও কাস্টডি সুরক্ষিত অর্ডার ট্র্যাক করুন।', 'Track your account manager handovers and custody-secured purchases.')}
              </p>
            </div>

            <button
              onClick={onBrowseChannels}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition self-start sm:self-auto cursor-pointer"
            >
              {t('নতুন অ্যাকাউন্ট ব্রাউজ করুন', 'Browse New Accounts')}
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">{t('মোট পারচেজ অর্ডার', 'Total Purchase Orders')}</span>
              <p className="text-xl font-black text-slate-900 mt-1">{orders.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">{t('চলমান হস্তান্তর (Active)', 'Active Handovers')}</span>
              <p className="text-xl font-black text-amber-600 mt-1">{activeOrders.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">{t('সফলভাবে হস্তান্তরিত', 'Successfully Acquired')}</span>
              <p className="text-xl font-black text-emerald-600 mt-1">{completedOrders.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">{t('বায়ার নিরাপত্তা', 'Buyer Protection')}</span>
              <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                {t('কাস্টডি গ্যারান্টি সক্রিয়', 'Custody Guarantee Active')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Buyer Protection Reminder Box */}
        <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-blue-900">
                {t('প্ল্যাটফর্ম কাস্টডি যেভাবে আপনাকে সুরক্ষিত রাখে', 'How Platform Custody Protects You')}
              </h3>
              <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                {t(
                  'টাকা সুরক্ষিত ভল্টে সংরক্ষিত থাকে। যতক্ষণ পর্যন্ত না সেলার আপনাকে প্রাইমারি ওনার বানিয়ে নিজেকে রিমুভ করেন, ততক্ষণ টাকা রিলিজ করবেন না।',
                  'Funds are held in platform custody. Never release payment until you verify that the seller has elevated your account to Primary Owner and removed themselves.'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenLegal('safety')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-blue-100 border border-blue-300 text-blue-800 text-xs font-semibold whitespace-nowrap transition cursor-pointer shadow-xs"
          >
            {t('নিরাপত্তা চেকলিস্ট পড়ুন', 'Review Safe Checklist')}
          </button>
        </div>

        {/* Orders List */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">{t('আমার অ্যাকাউন্ট ক্রয়ের তালিকা', 'My Account Acquisitions')}</h2>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3 shadow-xs">
              <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">{t('এখনো কোনো অ্যাকাউন্ট কেনা হয়নি', 'No Account Acquisitions Yet')}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t('আমাদের যাচাইকৃত সোশ্যাল মিডিয়া অ্যাকাউন্ট এবং চ্যানেল ক্যাটালগ ঘুরে দেখুন।', 'Explore our catalog of vetted social media accounts and channels to start building your digital media portfolio.')}
              </p>
              <button
                onClick={onBrowseChannels}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
              >
                {t('অ্যাকাউন্ট ব্রাউজ করুন', 'Browse Accounts & Channels')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order.id)}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">{order.id}</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase ${
                          order.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.status === 'disputed'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {order.status === 'completed' ? t('সম্পন্ন', 'Completed') : order.status === 'disputed' ? t('ডিসপ্যুট', 'Disputed') : t('চলমান', 'In Progress')}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{order.channelTitle}</h3>
                    <p className="text-xs text-slate-500">
                      {t('সেলার: ', 'Seller: ')}<strong>{order.sellerName}</strong> ({order.sellerEmail}) •{' '}
                      {t('তারিখ: ', 'Created: ')}{new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Right side metrics and link */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">{t('সর্বমোট মূল্য', 'Total Price')}</span>
                      <span className="text-base font-extrabold text-slate-900">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        ≈ {currency === 'USD' ? formatBdt(order.totalAmount) : formatUsd(order.totalAmount)}
                      </span>
                    </div>

                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-200">
                      <span>{t('হ্যান্ডওভার ট্র্যাকার দেখুন', 'View Handover Tracker')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
