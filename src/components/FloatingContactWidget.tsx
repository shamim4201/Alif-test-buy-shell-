import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { WebsiteSettings } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { getWhatsAppUrl, getEmailMailtoUrl, buildGeneralInquiryWhatsAppMessage, buildGeneralInquiryEmail } from '../services/notificationService';
import { MessageCircle, Mail, Phone, X, ShieldCheck, Headphones } from 'lucide-react';

export const FloatingContactWidget: React.FC = () => {
  const { t } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  useEffect(() => {
    api.getWebsiteSettings().then((res: { settings: any }) => {
      if (res?.settings) {
        setSettings(res.settings);
      }
    }).catch(() => {
      // Fallback
    });
  }, []);

  const whatsappNumber = settings?.whatsappSupport || settings?.contactPhone || '+8801700000000';
  const emailAddress = settings?.contactEmail || 'alifsheenshopping@gmail.com';

  const handleOpenWhatsApp = () => {
    const msg = buildGeneralInquiryWhatsAppMessage();
    const url = getWhatsAppUrl(whatsappNumber, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenEmail = () => {
    const { subject, body } = buildGeneralInquiryEmail();
    const url = getEmailMailtoUrl(emailAddress, subject, body);
    window.location.href = url;
  };

  return (
    <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end">
      {/* Popover Card */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-white border border-slate-200 rounded-3xl p-4 shadow-2xl animate-fade-in text-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">
                  {t('এডমিন সাপোর্ট ও হেল্পলাইন', 'Admin Support & Helpline')}
                </h4>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('সার্বক্ষণিক সক্রিয়', 'Instant Online Support')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            {t(
              'কোনো অর্ডার, অ্যাকাউন্ট কেনাবেচা বা তথ্যের জন্য সরাসরি এডমিনের সাথে যোগাযোগ করুন:',
              'Contact Admin directly for orders, escrow verification, or marketplace inquiries:'
            )}
          </p>

          <div className="space-y-2 pt-1">
            {/* WhatsApp Button */}
            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-between transition cursor-pointer shadow-xs active:scale-[0.98] group"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/80 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <span>{t('WhatsApp-এ চ্যাট করুন', 'Chat on WhatsApp')}</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-mono">
                {t('তাৎক্ষণিক', 'Instant')}
              </span>
            </button>

            {/* Email Button */}
            <button
              onClick={handleOpenEmail}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between transition cursor-pointer border border-slate-200 active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span>{t('ইমেইলে বার্তা পাঠান', 'Send an Email')}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {emailAddress.split('@')[0]}
              </span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Alif Sheen Group
            </span>
            <span>{t('১০০% নিরাপদ এসক্রো', '100% Secure Escrow')}</span>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-white/30 group"
        title={t('এডমিনের সাথে যোগাযোগ করুন', 'Contact Admin')}
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 text-white animate-bounce" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-emerald-600" />
        </div>
        <span className="tracking-wide">
          {isOpen ? t('বন্ধ করুন', 'Close') : t('সাপোর্ট / WhatsApp', 'Support / WhatsApp')}
        </span>
      </button>
    </div>
  );
};
