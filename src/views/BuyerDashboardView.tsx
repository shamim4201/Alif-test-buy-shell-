import React, { useState, useEffect } from 'react';
import { Order, ChannelListing } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getOrders();
      setOrders(res.orders.filter((o) => o.buyerId === user?.id));
    } catch (err: any) {
      showToast(err.message || 'Failed to load buyer orders', 'error');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Header */}
      <div className="border-b border-slate-900 bg-slate-950/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Buyer Portfolio Hub
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Channel Acquisitions &amp; Orders
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Track your YouTube Brand Account manager handovers and custody-secured purchases.
              </p>
            </div>

            <button
              onClick={onBrowseChannels}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition self-start sm:self-auto"
            >
              Browse New Channels
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400">Total Purchase Orders</span>
              <p className="text-xl font-black text-white mt-1">{orders.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400">Active Handovers</span>
              <p className="text-xl font-black text-amber-400 mt-1">{activeOrders.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400">Successfully Acquired</span>
              <p className="text-xl font-black text-emerald-400 mt-1">{completedOrders.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400">Buyer Protection</span>
              <p className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Custody Guarantee Active
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Buyer Protection Reminder Box */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white">How Channel Custody Protects You</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Funds are held in platform custody. Never release payment until you verify that the seller has elevated your Google Account to Primary Owner and removed themselves.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenLegal('safety')}
            className="px-4 py-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800 text-blue-300 text-xs font-semibold whitespace-nowrap transition"
          >
            Review Safe Checklist
          </button>
        </div>

        {/* Orders List */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">My Channel Acquisitions</h2>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Channel Acquisitions Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore our catalog of vetted YouTube channels with verified analytics to start building your media portfolio.
              </p>
              <button
                onClick={onBrowseChannels}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-white text-xs font-bold uppercase tracking-wider"
              >
                Browse Monetized Channels
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order.id)}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">{order.id}</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase ${
                          order.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-400'
                            : order.status === 'disputed'
                            ? 'bg-red-950 text-red-400'
                            : 'bg-amber-950 text-amber-400'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{order.channelTitle}</h3>
                    <p className="text-xs text-slate-400">
                      Seller: <strong>{order.sellerName}</strong> ({order.sellerEmail}) •{' '}
                      Created: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Right side metrics and link */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block">Total Price</span>
                      <span className="text-base font-extrabold text-white">
                        ${order.totalAmount.toLocaleString()} USD
                      </span>
                    </div>

                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
                      <span>View Handover Tracker</span>
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
