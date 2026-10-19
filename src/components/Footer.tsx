import React, { useState, useEffect } from 'react';
import { Youtube, ShieldCheck, Lock, Award } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { BrandLogo } from './BrandLogo';
import { api } from '../services/api';
import { WebsiteSettings } from '../types';

interface FooterProps {
  onOpenLegal: (tab: 'tos' | 'privacy' | 'refund' | 'safety' | 'marketplace') => void;
  onNavigate: (view: string) => void;
  customSettings?: WebsiteSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onNavigate, customSettings = null }) => {
  const { t } = useCurrency();
  const [liveSettings, setLiveSettings] = useState<WebsiteSettings | null>(customSettings);

  useEffect(() => {
    if (customSettings) {
      setLiveSettings(customSettings);
      return;
    }
    let isMounted = true;
    api
      .getWebsiteSettings()
      .then((res) => {
        if (isMounted && res.settings) {
          setLiveSettings(res.settings);
        }
      })
      .catch(() => {});

    const handleSettingsUpdated = (e: any) => {
      if (e.detail && isMounted) {
        setLiveSettings(e.detail);
      }
    };
    window.addEventListener('website-settings-updated', handleSettingsUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('website-settings-updated', handleSettingsUpdated);
    };
  }, [customSettings]);

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-sm mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        {/* Top Brand & Mission - Completely Centered */}
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="flex items-center justify-center">
            <BrandLogo theme="light" size="lg" showSubtitle={true} />
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-center">
            {t(
              'বাংলাদেশ ও আন্তর্জাতিক সোশ্যাল মিডিয়া অ্যাকাউন্ট মার্কেটপ্লেস। ফেসবুক পেজ, ইউটিউব চ্যানেল, টিকটক আইডি ও টেলিগ্রাম চ্যানেলের ১০০% নিরাপদ লেনদেন ও অফিসিয়াল ওনারশিপ ট্রান্সফার।',
              'The premier verified marketplace for digital media assets. 100% secure escrow transactions and official primary ownership transfers for YouTube, Facebook, TikTok, and Telegram.'
            )}
          </p>

          <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{liveSettings?.trustBadgeText || t('১০০% ভেরিফাইড এস্ক্রো ও সুরক্ষিত ট্রাস্ট কাস্টডি', '100% Verified Escrow & Protected Custody')}</span>
          </div>
        </div>

        {/* Centered Menus Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-8 border-y border-slate-200 text-center">
          {/* Menu 1: Marketplace */}
          <div className="flex flex-col items-center text-center space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 border-b-2 border-red-500 inline-block">
              {liveSettings?.marketplaceMenuTitle || t('মার্কেটপ্লেস', 'Marketplace')}
            </h4>
            <ul className="space-y-2.5 text-xs flex flex-col items-center">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-red-600 transition cursor-pointer font-medium"
                >
                  {liveSettings?.marketplaceLinkBrowse || t('অ্যাকাউন্ট ব্রাউজ করুন', 'Browse Accounts')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('seller-dashboard')}
                  className="hover:text-red-600 transition cursor-pointer font-medium"
                >
                  {liveSettings?.marketplaceLinkSell || t('অ্যাকাউন্ট বিক্রির লিস্টিং করুন', 'List Account for Sale')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('marketplace')}
                  className="hover:text-red-600 transition cursor-pointer font-medium text-red-600 font-bold"
                >
                  {liveSettings?.marketplaceLinkHowTransferWorks || t('কিভাবে অ্যাকাউন্ট ট্রান্সফার হয়', 'How Transfer Protocol Works')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('buyer-dashboard')}
                  className="hover:text-red-600 transition cursor-pointer font-medium"
                >
                  {liveSettings?.marketplaceLinkBuyerHub || t('বায়ার অ্যাকুইজিশন ড্যাশবোর্ড', 'Buyer Acquisitions Hub')}
                </button>
              </li>
            </ul>
          </div>

          {/* Menu 2: Legal & Trust Policies */}
          <div className="flex flex-col items-center text-center space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 border-b-2 border-red-500 inline-block">
              {liveSettings?.policiesMenuTitle || t('পলিসি ও নিরাপত্তা', 'Policies & Security')}
            </h4>
            <ul className="space-y-2.5 text-xs flex flex-col items-center">
              <li>
                <button
                  onClick={() => onOpenLegal('tos')}
                  className="hover:text-red-600 transition cursor-pointer font-medium"
                >
                  {liveSettings?.policyLinkTos || t('টার্মস অফ সার্ভিস ও সেলার ওয়ারেন্টি', 'Terms of Service & Warranty')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-red-600 transition cursor-pointer font-medium"
                >
                  {liveSettings?.policyLinkPrivacy || t('প্রাইভেসি পলিসি ও তথ্য সুরক্ষা', 'Privacy Policy & Protection')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('refund')}
                  className="hover:text-red-600 transition cursor-pointer font-medium"
                >
                  {liveSettings?.policyLinkRefund || t('রিফান্ড, বিরোধ ও পরিদর্শন নীতি', 'Refund & Inspection Policy')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('safety')}
                  className="hover:text-red-600 transition cursor-pointer font-medium"
                >
                  {liveSettings?.policyLinkSafety || t('অ্যান্টি-স্ক্যাম ও সুরক্ষা নীতি', 'Anti-Scam & Password Safety')}
                </button>
              </li>
            </ul>
          </div>

          {/* Menu 3: Security & Escrow Standard */}
          <div className="flex flex-col items-center text-center space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 border-b-2 border-red-500 inline-block">
              {liveSettings?.securityStandardMenuTitle || t('সিকিউরিটি স্ট্যান্ডার্ড', 'Security Standard')}
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 max-w-xs text-center shadow-2xs">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-900 font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                {liveSettings?.securityStandardTitle || t('সুরক্ষিত এস্ক্রো কাস্টডি', 'Protected Escrow Custody')}
              </div>
              <p className="text-[11px] text-slate-600 leading-normal text-center whitespace-pre-line">
                {liveSettings?.securityStandardDescription ||
                  t(
                    'বায়ারের পেমেন্ট সুরক্ষিত থাকে এবং বায়ার নিজে প্রাইমারি ওনারশিপ গ্রহণ নিশ্চিত করার পরই সেলারের কাছে টাকা রিলিজ হয়।',
                    'Buyer funds are held in secure escrow custody until the buyer confirms primary ownership handover and full access control.'
                  )}
              </p>
            </div>
            <div className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-600 font-medium">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>{liveSettings?.securityStandardBadge || t('স্ট্রিক্ট ৭-দিনের অফিসিয়াল কুলডাউন রুলস', 'Strict 7-Day Transfer Protocol')}</span>
            </div>
          </div>
        </div>

        {/* Quick Menu Centered Links */}
        <div className="py-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600">
          <button onClick={() => onNavigate('home')} className="hover:text-red-600 transition cursor-pointer">
            {t('হোমপেজ', 'Home')}
          </button>
          <span className="text-slate-300">•</span>
          <button onClick={() => onOpenLegal('tos')} className="hover:text-red-600 transition cursor-pointer">
            {t('টার্মস অফ সার্ভিস', 'Terms of Service')}
          </button>
          <span className="text-slate-300">•</span>
          <button onClick={() => onOpenLegal('privacy')} className="hover:text-red-600 transition cursor-pointer">
            {t('প্রাইভেসি পলিসি', 'Privacy Policy')}
          </button>
          <span className="text-slate-300">•</span>
          <button onClick={() => onOpenLegal('refund')} className="hover:text-red-600 transition cursor-pointer">
            {t('রিফান্ড ও বিরোধ নিষ্পত্তি', 'Refunds & Disputes')}
          </button>
          <span className="text-slate-300">•</span>
          <button onClick={() => onOpenLegal('safety')} className="hover:text-red-600 transition cursor-pointer">
            {t('নিরাপত্তা প্রটোকল', 'Safety Protocol')}
          </button>
        </div>

        {/* Bottom Disclaimer & Copyright Centered */}
        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-2 max-w-3xl mx-auto text-center">
          <p className="leading-relaxed whitespace-pre-line">
            <strong className="text-slate-700">{t('গুরুত্বপূর্ণ নোটিশ: ', 'Important Notice: ')}</strong>
            {liveSettings?.footerDisclaimer ||
              t(
                'Alif Trust (alif sheen group) একটি স্বাধীন সোশ্যাল ও মিডিয়া একাউন্ট মার্কেটপ্লেস। কোনো প্ল্যাটফর্মের গোপন পাসওয়ার্ড কখনো শেয়ার করা হয় না; সম্পূর্ণ প্রক্রিয়া অফিসিয়াল অ্যাডমিন/ওনারশিপ হস্তান্তরের মাধ্যমে সুরক্ষিতভাবে সম্পন্ন হয়।',
                'Alif Trust (alif sheen group) is an independent verified marketplace for social and media assets. Private passwords are never shared; the entire process is conducted via official manager and ownership permissions.'
              )}
          </p>
          <p className="text-slate-400 pt-1">
            © {new Date().getFullYear()} Alif Trust Buy &amp; Sell (alif sheen group). {t('সর্বস্বত্ব সংরক্ষিত।', 'All rights reserved.')}
          </p>
        </div>
      </div>
    </footer>
  );
};
