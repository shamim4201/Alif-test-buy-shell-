import React from 'react';
import { Youtube, ShieldCheck, Lock, Award, HeartHandshake, HelpCircle } from 'lucide-react';

interface FooterProps {
  onOpenLegal: (tab: 'tos' | 'privacy' | 'refund' | 'safety') => void;
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onNavigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                <Youtube className="w-5 h-5 fill-current" />
              </div>
              <span className="font-extrabold text-lg text-white">
                Channel<span className="text-red-500">Trust</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The premier verified marketplace connecting high-growth YouTube creators and media investors. Secure transactions, zero password sharing, and verified channel analytics.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Brand Account Transfer Protocol</span>
            </div>
          </div>

          {/* Col 2: Marketplace */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Marketplace</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition">
                  Browse Monetized Channels
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('seller-dashboard')} className="hover:text-white transition">
                  List Channel For Sale
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('safety')} className="hover:text-white transition">
                  How Brand Account Transfer Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('buyer-dashboard')} className="hover:text-white transition">
                  Buyer Acquisition Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Trust Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Policies & Trust</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onOpenLegal('tos')} className="hover:text-white transition">
                  Terms of Service & Seller Warranties
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition">
                  Privacy Policy & Analytics Redaction
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('refund')} className="hover:text-white transition">
                  Refund, Dispute & Inspection Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('safety')} className="hover:text-white transition">
                  Anti-Scam & Password Security Rule
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Escrow & Safe Custody Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Security Standards</h4>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                <Lock className="w-4 h-4 text-emerald-400" />
                Server-Verified Custody
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Funds are held in platform trust custody and released only after the buyer confirms Primary Ownership under YouTube Studio permissions.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Strict 7-day cooldown compliance</span>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="border-t border-slate-900 pt-8 text-[11px] text-slate-500 space-y-2">
          <p>
            <strong className="text-slate-400">Important Disclaimer:</strong> ChannelTrust is an independent digital media marketplace. YouTube™ and Google™ are registered trademarks of Google LLC. This platform is not endorsed by or affiliated with Google LLC. Channel ownership transfers are conducted via standard Google Brand Account user roles without ever transferring Google account credentials.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <p>© {new Date().getFullYear()} ChannelTrust Technologies Inc. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs">
              <button onClick={() => onOpenLegal('tos')} className="hover:text-slate-300">Terms</button>
              <button onClick={() => onOpenLegal('privacy')} className="hover:text-slate-300">Privacy</button>
              <button onClick={() => onOpenLegal('refund')} className="hover:text-slate-300">Refunds</button>
              <button onClick={() => onOpenLegal('safety')} className="hover:text-slate-300">Safety Protocol</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
