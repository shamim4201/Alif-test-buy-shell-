import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, Lock, AlertTriangle, Scale, CheckCircle2, Sparkles } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../services/api';
import { WebsiteSettings } from '../types';
import { DEFAULT_POLICIES } from '../data/defaultPolicies';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'tos' | 'privacy' | 'refund' | 'safety' | 'marketplace';
  customSettings?: WebsiteSettings | null;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'tos',
  customSettings = null
}) => {
  const { language, t } = useCurrency();
  const [activeTab, setActiveTab] = useState<'tos' | 'privacy' | 'refund' | 'safety' | 'marketplace'>(initialTab);
  const [liveSettings, setLiveSettings] = useState<WebsiteSettings | null>(customSettings);
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Sync tab with initialTab when opened
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  // Load website settings if not passed as prop
  useEffect(() => {
    if (customSettings) {
      setLiveSettings(customSettings);
      return;
    }

    if (isOpen) {
      let isMounted = true;
      setLoadingSettings(true);
      api
        .getWebsiteSettings()
        .then((res) => {
          if (isMounted && res.settings) {
            setLiveSettings(res.settings);
          }
        })
        .catch((err) => {
          console.warn('Failed to load legal settings:', err);
        })
        .finally(() => {
          if (isMounted) setLoadingSettings(false);
        });

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
    }
  }, [isOpen, customSettings]);

  if (!isOpen) return null;

  // Helper to format custom text into paragraphs, bold headers, and bullet points
  const renderFormattedText = (rawText: string) => {
    const paragraphs = rawText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    return (
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        {paragraphs.map((p, idx) => {
          // Check if paragraph is a list of lines
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

          // If headline (short line or starts with #)
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
    );
  };

  // Determine which custom or default text is active
  const activeCustomText =
    activeTab === 'tos'
      ? liveSettings?.termsOfService
      : activeTab === 'privacy'
      ? liveSettings?.privacyPolicy
      : activeTab === 'refund'
      ? liveSettings?.refundPolicy
      : activeTab === 'marketplace'
      ? liveSettings?.marketplaceGuide
      : liveSettings?.safetyProtocol;

  const defaultPolicyText = DEFAULT_POLICIES[activeTab as keyof typeof DEFAULT_POLICIES] || '';
  const resolvedText = (activeCustomText && activeCustomText.trim()) ? activeCustomText : defaultPolicyText;
  const isCustomized = Boolean(activeCustomText && activeCustomText.trim());

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-red-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {t('আলিফ ট্রাস্ট লিগ্যাল ও পলিসি সেন্টার', 'Alif Trust Legal & Compliance Center')}
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">
                {t('অফিশিয়াল অ্যাডমিন পলিসি ম্যানেজমেন্ট সিস্টেম', 'Official Governance & Legal Compliance')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('safety')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'safety'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {liveSettings?.policyLinkSafety || t('নিরাপদ ওনারশিপ প্রটোকল', 'Safe Ownership Protocol')}
          </button>
          <button
            onClick={() => setActiveTab('tos')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tos'
                ? 'border-red-600 text-red-600 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-red-600" />
            {liveSettings?.policyLinkTos || t('টার্মস অফ সার্ভিস ও সেলার ওয়ারেন্টি', 'Terms of Service & Warranty')}
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-blue-600 text-blue-600 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4 text-blue-600" />
            {liveSettings?.policyLinkPrivacy || t('প্রাইভেসি পলিসি ও তথ্য সুরক্ষা', 'Privacy & Protection Policy')}
          </button>
          <button
            onClick={() => setActiveTab('refund')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'refund'
                ? 'border-amber-600 text-amber-600 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            {liveSettings?.policyLinkRefund || t('রিফান্ড ও বিরোধ নিষ্পত্তি পলিসি', 'Refund & Dispute Arbitration')}
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'marketplace'
                ? 'border-purple-600 text-purple-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            {liveSettings?.marketplaceLinkHowTransferWorks || t('মার্কেটপ্লেস ও ট্রান্সফার গাইডলাইন', 'Marketplace & Transfer Protocol')}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* Admin Managed Policy Status Badge */}
          {isCustomized ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-sky-900">
                  {t('অফিশিয়াল পলিসি • অ্যাডমিন প্যানেল থেকে কনফিগারকৃত', 'Official Policy • Configured from Admin Console')}
                </span>
              </div>
              <span className="text-[10px] bg-white border border-sky-200 text-sky-700 px-2 py-0.5 rounded-full font-bold">
                {t('সক্রিয় ও কার্যকর', 'Active & Verified')}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
              <span>{t('স্ট্যান্ডার্ড গ্লোবাল এসক্রো কমপ্লায়েন্স নির্দেশিকা', 'Standard Global Escrow Compliance Framework')}</span>
              <span className="font-mono text-[10px]">{t('ডিফল্ট টেমপ্লেট', 'Default Template')}</span>
            </div>
          )}

          {/* Render Formatted Text */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            {renderFormattedText(resolvedText)}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {t('আলিফ ট্রাস্ট এসক্রো ও কমপ্লায়েন্স ফ্রেমওয়ার্ক ২০২৬', 'Alif Trust Escrow & Compliance Framework 2026')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs transition cursor-pointer shadow-xs"
          >
            {t('আমি বুঝতে পেরেছি ও সম্মত', 'I Understand & Agree')}
          </button>
        </div>
      </div>
    </div>
  );
};
