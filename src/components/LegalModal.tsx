import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, AlertTriangle, Scale } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'tos' | 'privacy' | 'refund' | 'safety';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'tos'
}) => {
  const { language, t } = useCurrency();
  const [activeTab, setActiveTab] = useState<'tos' | 'privacy' | 'refund' | 'safety'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-bold text-slate-900">
              {t('আলিফ ট্রাস্ট লিগ্যাল ও পলিসি সেন্টার', 'Alif Trust Legal & Compliance Center')}
            </h2>
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
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {t('নিরাপদ ওনারশিপ প্রটোকল', 'Safe Ownership Protocol')}
          </button>
          <button
            onClick={() => setActiveTab('tos')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tos'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            {t('টার্মস অফ সার্ভিস ও সেলার ওয়ারেন্টি', 'Terms of Service & Warranty')}
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            {t('প্রাইভেসি পলিসি ও তথ্য সুরক্ষা', 'Privacy & Protection Policy')}
          </button>
          <button
            onClick={() => setActiveTab('refund')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'refund'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {t('রিফান্ড ও বিরোধ নিষ্পত্তি পলিসি', 'Refund & Dispute Arbitration')}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {activeTab === 'safety' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">
                    {t('মূল নিরাপত্তা নির্দেশিকা: নো-পাসওয়ার্ড পলিসি', 'Core Security Directive: Zero Password Sharing')}
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    {t(
                      'আলিফ ট্রাস্ট বায়ার ও সেলারদের কোনো অবস্থাতেই গুগল/ফেসবুক ব্যক্তিগত পাসওয়ার্ড বিনিময় করার অনুমতি দেয় না। ওনারশিপ সম্পূর্ণ অফিসিয়াল ব্র্যান্ড একাউন্ট পারমিশন বা পেজ রোল হস্তান্তরের মাধ্যমে সম্পন্ন হতে হবে।',
                      'Alif Trust strictly forbids exchanging account passwords. Ownership transfers must occur purely through official platform permission invitations.'
                    )}
                  </p>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                {t('নিরাপদ অ্যাকাউন্ট হ্যান্ডওভারের ৫টি ধাপ', 'The 5-Stage Safe Account Handover Protocol')}
              </h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  <strong>{t('অফিসিয়াল রোল ইনভাইটেশন: ', 'Official Permission Invite: ')}</strong>
                  {t(
                    'বায়ারের পেমেন্ট প্ল্যাটফর্ম এস্ক্রো কাস্টডিতে নিশ্চিত হলে সেলার বায়ারের ইমেইলে ম্যানেজার হিসেবে আমন্ত্রণ পাঠান।',
                    'Once buyer payment is confirmed in escrow custody, seller sends an official Manager role invitation.'
                  )}
                </li>
                <li>
                  <strong>{t('গুগল/প্ল্যাটফর্ম ৭ দিনের সিকিউরিটি কুলডাউন: ', 'Mandatory Security Cooldown: ')}</strong>
                  {t(
                    'অফিসিয়াল পলিসি অনুযায়ী নতুন ব্যবহারকারীকে প্রাইমারি ওনারশিপ হস্তান্তরের আগে বাধ্যতামূলক ৭ দিন অতিবাহিত হতে হয়।',
                    'Per security rules, a newly added administrator must elapse the required safety period before elevation.'
                  )}
                </li>
                <li>
                  <strong>{t('প্রাইমারি ওনারশিপ হস্তান্তর: ', 'Primary Ownership Elevation: ')}</strong>
                  {t(
                    'নির্ধারিত সময় শেষে সেলার বায়ারকে একমাত্র প্রাইমারি ওনার করেন এবং নিজের অ্যাডমিন অ্যাক্সেস রিমুভ করেন।',
                    'On maturity, the seller elevates the buyer to sole Primary Owner and revokes their own access.'
                  )}
                </li>
                <li>
                  <strong>{t('অ্যাডসেন্স ও পেমেন্ট লিঙ্ক: ', 'AdSense & Revenue Linking: ')}</strong>
                  {t(
                    'বায়ার নিজের অনুমোদিত অ্যাডসেন্স বা পেআউট মেথড লিঙ্ক করে পূর্ণ নিয়ন্ত্রণ নিশ্চিত করেন।',
                    'Buyer links their own AdSense or payout profile and audits complete administrative rights.'
                  )}
                </li>
                <li>
                  <strong>{t('ফান্ড রিলিজ অনুমোদন: ', 'Escrow Fund Release: ')}</strong>
                  {t(
                    'বায়ার সম্পূর্ণভাবে সন্তুষ্ট হয়ে প্ল্যাটফর্মে রিলিজ অনুমোদন করলে সেলারের টাকা ছাড় করা হয়।',
                    'Buyer confirms complete satisfaction and authorizes platform payout to the seller.'
                  )}
                </li>
              </ol>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
                <strong>{t('প্রতারণা বিরোধী সতর্কবার্তা: ', 'Anti-Fraud Warning: ')}</strong>
                {t(
                  'প্ল্যাটফর্মের বাইরে কোনো লেনদেন বা ব্যক্তিগত লগইন তথ্য আদান-প্রদান করার চেষ্টা করলে অ্যাকাউন্ট অবিলম্বে স্থায়ীভাবে বন্ধ করা হবে এবং এস্ক্রো নিরাপত্তা সুবিধা বাতিল হবে।',
                  'Any attempt to transact off-platform or solicit personal login credentials will result in immediate permanent account termination.'
                )}
              </div>
            </div>
          )}

          {activeTab === 'tos' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                {t('টার্মস অফ সার্ভিস ও সেলার ওয়ারেন্টি', 'Terms of Service & Seller Representations')}
              </h3>
              <p>
                {t(
                  'আলিফ ট্রাস্ট প্ল্যাটফর্মে স্বাগতম। একাউন্ট তৈরি বা কোনো অর্ডারে অংশগ্রহণের মাধ্যমে আপনি ডিজিটাল মিডিয়া সম্পদ হস্তান্তরের এই আইনি শর্তাবলীতে সম্মতি প্রদান করছেন।',
                  'Welcome to Alif Trust. By creating an account or placing an order, you agree to these legally binding digital asset transfer terms.'
                )}
              </p>

              <h4 className="font-bold text-slate-900 text-sm">
                {t('১. সেলারের বৈধ ওনারশিপ ওয়ারেন্টি', '1. Seller Warranties & Clean Title')}
              </h4>
              <p>
                {t(
                  'প্রত্যেক সেলার নিশ্চয়তা দেন যে তিনি তালিকাভুক্ত চ্যানেলের একমাত্র বৈধ স্রষ্টা ও স্বত্বাধিকারী। কোনো অপ্রকাশিত কপিরাইট স্ট্রাইক, কমিউনিটি গাইডলাইন লঙ্ঘন বা নকল কৃত্রিম ভিউজ নেই।',
                  'Every seller warrants that they are the sole lawful owner of the social media account listed with zero undisclosed copyright strikes or bot activity.'
                )}
              </p>

              <h4 className="font-bold text-slate-900 text-sm">
                {t('২. প্ল্যাটফর্ম বাইপাস নিষেধাজ্ঞা', '2. Non-Circumvention Policy')}
              </h4>
              <p>
                {t(
                  'ক্রেতা ও বিক্রেতা আলিফ ট্রাস্টকে বাইপাস করে সরাসরি যোগাযোগ বা লেনদেন করবেন না। প্ল্যাটফর্মের গ্যারান্টি শুধুমাত্র সিস্টেমের ভেতরের লেনদেনের জন্যই প্রযোজ্য।',
                  'Buyers and sellers agree not to bypass Alif Trust to transact directly. Safety guarantees only apply to internal orders.'
                )}
              </p>

              <h4 className="font-bold text-slate-900 text-sm">
                {t('৩. কাস্টডি ও সার্ভার-ভেরিফাইড পেমেন্ট', '3. Custody & Escrow Payment Verification')}
              </h4>
              <p>
                {t(
                  'বায়ারের সকল পেমেন্ট প্ল্যাটফর্ম কাস্টডিতে সুরক্ষিত থাকে। বায়ার নিজে ওনারশিপ গ্রহণ নিশ্চিত না করা পর্যন্ত টাকা সুরক্ষিত অবস্থায় রাখা হয়।',
                  'All buyer funds are held in secure server-verified custody until the buyer explicitly approves release upon receiving primary ownership.'
                )}
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                {t('প্রাইভেসি পলিসি ও তথ্য সুরক্ষা', 'Privacy Policy & Data Protection')}
              </h3>
              <p>
                {t(
                  'আলিফ ট্রাস্ট ওনারশিপ হস্তান্তর ও যাচাইকরণের জন্য শুধুমাত্র প্রয়োজনীয় ন্যূনতম তথ্য সংগ্রহ করে।',
                  'Alif Trust collects only the necessary information to verify asset provenance and facilitate secure transfer.'
                )}
              </p>

              <h4 className="font-bold text-slate-900 text-sm">
                {t('অ্যানালিটিক্স ও সংবেদনশীল তথ্য গোপন রাখা', 'Analytics Redaction')}
              </h4>
              <p>
                {t(
                  'স্ক্রিনশটে সংবেদনশীল আর্থিক তথ্য (যেমন ব্যক্তিগত অ্যাডসেন্স আইডি বা ব্যাংক তথ্য) স্বয়ংক্রিয়ভাবে গোপন রাখা হয়।',
                  'Sensitive personal and banking identifiers are redacted from public audit analytics screenshots.'
                )}
              </p>

              <h4 className="font-bold text-slate-900 text-sm">
                {t('যোগাযোগের গোপনীয়তা', 'Communication Safety')}
              </h4>
              <p>
                {t(
                  'প্ল্যাটফর্ম মেসেজিং সিস্টেম শুধুমাত্র প্রতারণা ও স্ক্যাম রোধের উদ্দেশ্যে স্বয়ংক্রিয় সুরক্ষা ফিল্টারের মাধ্যমে পর্যবেক্ষণে থাকে।',
                  'Internal messages are safely filtered solely to prevent credential fraud, unauthorized URLs, and scam solicitations.'
                )}
              </p>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                {t('রিফান্ড, বিরোধ ও পরিদর্শন নীতি', 'Refund, Dispute & Arbitration Policy')}
              </h3>
              <p>
                {t(
                  'ডিজিটাল মিডিয়া ওনারশিপ একটি স্পর্শকাতর বিষয় হওয়ায় আলিফ ট্রাস্ট হস্তান্তরের পরবর্তী ৪৮ ঘণ্টার পূর্ণ পরিদর্শন গ্যারান্টি প্রদান করে।',
                  'Because digital media transfers are sensitive, Alif Trust enforces a strict 48-hour post-handover inspection guarantee.'
                )}
              </p>

              <h4 className="font-bold text-slate-900 text-sm">
                {t('যেসব কারণে বায়ার পূর্ণ রিফান্ড পাবেন:', 'Eligible Grounds for Full Buyer Refund:')}
              </h4>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>{t('পেমেন্ট নিশ্চিতের ৭২ ঘণ্টার মধ্যে সেলার অফিসিয়াল রোল ইনভাইটেশন পাঠাতে ব্যর্থ হলে।', 'Seller fails to send official role invite within 72 hours of payment confirmation.')}</li>
                <li>{t('পূর্বের কোনো অপ্রকাশিত কপিরাইট স্ট্রাইক বা মনিটাইজেশন সমস্যা বিদ্যমান থাকলে।', 'Undisclosed copyright strikes or demonetization occurred prior to transfer.')}</li>
                <li>{t('বাস্তব অ্যানালিটিক্স লিস্টিংয়ের তথ্যের তুলনায় ২৫% এর বেশি কম হলে।', 'Key metrics differ by more than 25% from verified listing proof screenshots.')}</li>
                <li>{t('হস্তান্তরের পর সেলার চ্যানেল ফিরিয়ে নেওয়ার চেষ্টা করলে।', 'Seller attempts to reclaim account via recovery mechanisms.')}</li>
              </ul>

              <h4 className="font-bold text-slate-900 text-sm">
                {t('বিরোধ নিষ্পত্তি পদ্ধতি', 'Arbitration Procedure')}
              </h4>
              <p>
                {t(
                  'কোনো বিরোধ তৈরি হলে তাৎক্ষণিকভাবে ফান্ড ফ্রিজ করা হয়। আলিফ ট্রাস্টের কমপ্লায়েন্স টিম অডিট লগ যাচাই করে চূড়ান্ত সিদ্ধান্ত গ্রহণ করে।',
                  'If a dispute is triggered, funds are immediately frozen. Alif Trust compliance officers audit proof and issue a binding resolution.'
                )}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {t('সর্বশেষ পরিমার্জন: অক্টোবর ২০২৬ • আলিফ ট্রাস্ট কমপ্লায়েন্স', 'Last revised: October 2026 • Alif Trust Compliance')}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
          >
            {t('আমি বুঝতে পেরেছি ও সম্মত', 'I Understand & Agree')}
          </button>
        </div>
      </div>
    </div>
  );
};
