import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency, Currency } from '../context/CurrencyContext';
import { BrandLogo } from './BrandLogo';
import {
  MapPin,
  Search,
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  LogOut,
  Layers,
  Award,
  Lock,
  Flame,
  Check,
  Globe,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenLegal: (tab: 'tos' | 'privacy' | 'refund' | 'safety') => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  selectedPlatform?: string;
  onSelectPlatform?: (platform: string) => void;
}

const getPlatformDropdownOptions = (t: (bn: string, en: string) => string) => [
  { id: 'all', label: t('সকল অ্যাকাউন্ট', 'All Accounts') },
  { id: 'youtube', label: t('ইউটিউব চ্যানেল', 'YouTube Channels') },
  { id: 'facebook', label: t('ফেসবুক পেজ', 'Facebook Pages') },
  { id: 'tiktok', label: t('টিকটক অ্যাকাউন্ট', 'TikTok Accounts') },
  { id: 'telegram', label: t('টেলিগ্রাম চ্যানেল', 'Telegram Channels') },
  { id: 'instagram', label: t('ইনস্টাগ্রাম পেজ', 'Instagram Pages') },
  { id: 'twitter', label: t('এক্স / টুইটার', 'X / Twitter') }
];

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenLegal,
  searchTerm = '',
  onSearchChange,
  selectedPlatform = 'all',
  onSelectPlatform
}) => {
  const { user, logout, openAuthModal, quickSwitch } = useAuth();
  const { currency, setCurrency, language, setLanguage, t, currencyModalOpen, setCurrencyModalOpen, openCurrencyModal } = useCurrency();
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [activeCategory, setActiveCategory] = useState(selectedPlatform || 'all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  // Automatic user location detection: checks storage first; if none, auto-detects user's real location
  const [userLocation, setUserLocation] = useState(() => {
    const saved = localStorage.getItem('channeltrust_delivery_location');
    if (saved) return saved;

    // Detect user timezone to give instant real local city/country
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes('Dhaka') || tz.includes('Asia/Dhaka')) {
        return 'Dhaka, Bangladesh';
      }
      if (tz.includes('Calcutta') || tz.includes('Kolkata')) {
        return 'Kolkata, India';
      }
      if (tz.includes('London')) return 'London, UK';
      if (tz.includes('New_York')) return 'New York, USA';
      if (tz.includes('Los_Angeles')) return 'Los Angeles, USA';
      if (tz.includes('Dubai')) return 'Dubai, UAE';
      if (tz.includes('Riyadh')) return 'Riyadh, KSA';
      // Fallback clean city name from timezone
      const city = tz.split('/')[1]?.replace(/_/g, ' ');
      if (city) return `${city}`;
    } catch {
      // ignore
    }
    return 'Dhaka, Bangladesh';
  });
  const [customLocationInput, setCustomLocationInput] = useState('');

  // Attempt real-time IP Geolocation on mount if user hasn't explicitly set a custom one
  useEffect(() => {
    const hasCustom = localStorage.getItem('channeltrust_delivery_location_custom');
    if (!hasCustom) {
      // Fetch user's real geographic location
      fetch('https://ipapi.co/json/')
        .then((r) => r.json())
        .then((data) => {
          if (data && data.city && data.country_name) {
            const detected = `${data.city}, ${data.country_code || data.country_name}`;
            setUserLocation(detected);
            localStorage.setItem('channeltrust_delivery_location', detected);
          }
        })
        .catch(() => {
          // If network blocked or offline, fallback to browser timezone already set
        });
    }
  }, []);

  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedPlatform) {
      setActiveCategory(selectedPlatform);
    }
  }, [selectedPlatform]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(e.target as Node)) {
        setCurrencyDropdownOpen(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(e.target as Node)) {
        setLanguageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange?.(localSearch);
    if (activeCategory !== 'all') {
      onSelectPlatform?.(activeCategory);
    }
    if (currentView !== 'home') {
      onNavigate('home');
    }
  };

  const handleCategorySelect = (catId: string) => {
    setActiveCategory(catId);
    setCategoryDropdownOpen(false);
    onSelectPlatform?.(catId);
    if (currentView !== 'home') {
      onNavigate('home');
    }
  };

  const handleSaveLocation = (loc: string) => {
    const finalLoc = loc.trim() || 'Jamalpur 2012';
    setUserLocation(finalLoc);
    localStorage.setItem('channeltrust_delivery_location', finalLoc);
    setLocationModalOpen(false);
    setCustomLocationInput('');
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'MD';

  const platformDropdownOptions = getPlatformDropdownOptions(t);
  const currentCategoryLabel =
    platformDropdownOptions.find((c) => c.id === activeCategory)?.label || t('সকল', 'All');

  return (
    <>
      {/* =========================================================
          TIER 1: AMAZON TOP MAIN HEADER (#131921)
         ========================================================= */}
      <header className="sticky top-0 z-40 bg-[#131921] text-white select-none w-full max-w-full">
        <div className="max-w-[1550px] mx-auto px-1.5 sm:px-4 py-1 sm:py-1.5 flex items-center justify-between gap-1 sm:gap-2 w-full">
          {/* 1. BRAND LOGO: Alif Trust buy&shell (alif sheen group) */}
          <div
            onClick={() => {
              onNavigate('home');
              onSelectPlatform?.('all');
            }}
            className="flex items-center px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-xs border border-transparent hover:border-white cursor-pointer transition shrink-0 group select-none"
            title="Alif Trust Buy & Sell - alif sheen group"
          >
            <BrandLogo theme="dark" size="md" showSubtitle={true} />
          </div>

          {/* 2. USER LOCATION PIN (Desktop & Tablet: hidden on small mobile) */}
          <button
            onClick={() => setLocationModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-2 py-1.5 rounded-xs border border-transparent hover:border-white cursor-pointer transition text-left shrink-0"
            title={t("আপনার লোকেশন পরিবর্তন করতে ক্লিক করুন", "Click to change your location")}
          >
            <MapPin className="w-4 h-4 text-[#febd69] shrink-0 mt-1" />
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] text-slate-300 font-medium">
                {t("আপনার লোকেশন:", "Your Location:")}
              </span>
              <span className="text-xs sm:text-[13px] font-bold text-white flex items-center gap-1">
                <span className="max-w-[100px] sm:max-w-[140px] truncate">{userLocation}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </span>
            </div>
          </button>

          {/* 3. CURRENCY & LANGUAGE SELECTOR ($ USD / ৳ BDT & বাংলা / EN) - Visible & responsive on both mobile and desktop */}
          <div className="relative shrink-0 mx-0.5 sm:mx-2 z-50" ref={currencyDropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // On mobile or smaller screens, open the centered modal which never clips
                if (window.innerWidth < 640) {
                  openCurrencyModal();
                } else {
                  setCurrencyDropdownOpen((prev) => !prev);
                }
              }}
              className="h-7 sm:h-9 bg-[#232f3e] sm:bg-[#e6e6e6] hover:bg-[#2c3b4e] sm:hover:bg-[#dadada] text-white sm:text-slate-900 text-[11px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 flex items-center gap-1 rounded-md border border-[#3d4f66] sm:border-[#cdcdcd] transition cursor-pointer select-none whitespace-nowrap active:bg-[#1a2430] sm:active:bg-[#ccc] shadow-xs"
              title={t("ওয়েবসাইটের কারেন্সি ও ভাষা পরিবর্তন করুন", "Change website currency & language")}
            >
              <span className="text-xs sm:text-sm font-black text-amber-400 sm:text-amber-700">
                {currency === 'USD' ? '$' : '৳'}
              </span>
              <span className="font-extrabold tracking-tight text-[11px] sm:text-xs">
                {currency}
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 sm:text-slate-600">
                • {language === 'BN' ? 'বাং' : 'EN'}
              </span>
              <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-300 sm:text-slate-600 shrink-0 transition-transform ${currencyDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* CURRENCY & LANGUAGE DROPDOWN POPUP */}
            {currencyDropdownOpen && (
              <div
                className="absolute right-0 sm:left-0 top-[38px] sm:top-[43px] w-[290px] sm:w-[335px] max-w-[calc(100vw-24px)] bg-white border border-slate-300 rounded-xl shadow-2xl p-3 sm:p-3.5 text-xs text-slate-800 z-50 animate-fade-in divide-y divide-slate-100"
                onClick={(e) => e.stopPropagation()}
              >
                {/* POPUP HEADER */}
                <div className="pb-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-black text-slate-900 text-[13px] flex items-center gap-1.5">
                      <span>{t("কারেন্সি ও ভাষা নির্বাচন", "Select Currency & Language")}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {t("মুদ্রা এবং প্রদর্শন ভাষা নির্বাচন করুন", "Choose currency and display language")}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrencyDropdownOpen(false)}
                    className="w-6 h-6 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center font-bold text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* 1. CURRENCY SELECTION SECTION (USD & BDT) */}
                <div className="py-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                    <span>{t("কারেন্সি (Currency):", "Currency:")}</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      1 USD = ৳122
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* USD Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrency('USD');
                      }}
                      className={`p-2.5 rounded-lg border-2 text-left cursor-pointer transition flex flex-col justify-between ${
                        currency === 'USD'
                          ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-1 ring-amber-400'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-emerald-600">$ USD</span>
                        {currency === 'USD' ? (
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 mt-1">{t("মার্কিন ডলার", "US Dollar")}</span>
                      <span className="text-[9px] text-slate-500">{t("আন্তর্জাতিক রেট", "Global Rate")}</span>
                    </button>

                    {/* BDT Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrency('BDT');
                      }}
                      className={`p-2.5 rounded-lg border-2 text-left cursor-pointer transition flex flex-col justify-between ${
                        currency === 'BDT'
                          ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-1 ring-amber-400'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-rose-600">৳ BDT</span>
                        {currency === 'BDT' ? (
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 mt-1">{t("বাংলাদেশি টাকা", "Bangladeshi Taka")}</span>
                      <span className="text-[9px] text-slate-500">{t("বিকাশ / নগদ রেট", "bKash / Nagad")}</span>
                    </button>
                  </div>
                </div>

                {/* 2. LANGUAGE SELECTION SECTION */}
                <div className="pt-2.5 space-y-2">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center justify-between">
                    <span>{t("ওয়েবসাইটে কি লেখা দেখতে চান?", "Select Website Language:")}</span>
                    <span className="text-[10px] text-amber-600 font-bold">{t("ভাষা নির্বাচন", "Language")}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* বাংলা (Bangla) Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLanguage('BN');
                      }}
                      className={`p-2.5 rounded-lg border-2 text-left cursor-pointer transition flex items-center justify-between ${
                        language === 'BN'
                          ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-1 ring-amber-400'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl leading-none">🇧🇩</span>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">বাংলা</div>
                          <div className="text-[9px] text-slate-500">{t("সব লেখা বাংলায়", "All in Bangla")}</div>
                        </div>
                      </div>
                      {language === 'BN' ? (
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </button>

                    {/* English (ইংরেজি) Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLanguage('EN');
                      }}
                      className={`p-2.5 rounded-lg border-2 text-left cursor-pointer transition flex items-center justify-between ${
                        language === 'EN'
                          ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-1 ring-amber-400'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl leading-none">🇺🇸</span>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">English</div>
                          <div className="text-[9px] text-slate-500">{t("সব লেখা ইংরেজিতে", "All in English")}</div>
                        </div>
                      </div>
                      {language === 'EN' ? (
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </button>
                  </div>

                  {/* STATUS BANNER & DONE BUTTON */}
                  <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="text-[11px] text-slate-600">
                      {t("সিলেক্টেড: ", "Selected: ")}<strong className="text-slate-900 font-extrabold">{currency}</strong> • <strong className="text-slate-900 font-extrabold">{language === 'BN' ? 'বাংলা' : 'English'}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrencyDropdownOpen(false)}
                      className="px-3 py-1 bg-[#febd69] hover:bg-[#f3a847] text-slate-950 font-bold rounded-md text-[11px] transition cursor-pointer shadow-xs"
                    >
                      {t("সম্পন্ন", "Done")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Spacer to give clean breathing room between left and right controls */}
          <div className="flex-1" />

          {/* 4. LANGUAGE SELECTOR (Flag + EN/BN) */}
          <div className="relative hidden lg:block" ref={languageDropdownRef}>
            <button
              onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xs border border-transparent hover:border-white cursor-pointer transition text-left"
              title={t("ওয়েবসাইটের ভাষা পরিবর্তন", "Change Language")}
            >
              <span className="text-base leading-none">
                {language === 'EN' ? '🇺🇸' : '🇧🇩'}
              </span>
              <span className="text-xs font-bold text-white uppercase ml-0.5">
                {language}
              </span>
              <ChevronDown className="w-3 h-3 text-[#aaa]" />
            </button>

            {languageDropdownOpen && (
              <div className="absolute right-0 top-11 w-48 bg-white border border-slate-300 rounded-md shadow-2xl py-2 text-xs text-slate-800 z-50 animate-fade-in">
                <div className="px-3 py-1 font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                  {t("ভাষা নির্বাচন", "Select Language")}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('BN');
                    setLanguageDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center justify-between cursor-pointer ${
                    language === 'BN' ? 'bg-amber-50 font-bold text-amber-900' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">🇧🇩</span> {t("বাংলা - BN", "Bangla - BN")}
                  </span>
                  {language === 'BN' && <Check className="w-3.5 h-3.5 text-[#ff9900]" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('EN');
                    setLanguageDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center justify-between cursor-pointer ${
                    language === 'EN' ? 'bg-amber-50 font-bold text-amber-900' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">🇺🇸</span> {t("ইংরেজি - EN", "English - EN")}
                  </span>
                  {language === 'EN' && <Check className="w-3.5 h-3.5 text-[#ff9900]" />}
                </button>
              </div>
            )}
          </div>

          {/* 5. HELLO, USER / MY ACCOUNT (মাই একাউন্ট) */}
          <div className="relative shrink-0" ref={accountDropdownRef}>
            <button
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              className="flex items-center sm:flex-col text-left px-1 sm:px-2 py-1 sm:py-1.5 rounded-xs border border-transparent hover:border-white cursor-pointer transition gap-1 sm:gap-0"
              title={t("মাই একাউন্ট", "My Account")}
            >
              <span className="hidden sm:inline text-[11px] text-[#ccc] leading-none truncate max-w-[120px]">
                {user ? `${t("হ্যালো, ", "Hello, ")}${displayName}` : t("হ্যালো, সাইন ইন", "Hello, Sign In")}
              </span>
              <span className="hidden sm:flex text-[13px] font-bold text-white items-center gap-0.5 leading-tight">
                {t("মাই একাউন্ট", "My Account")}
                <ChevronDown className="w-3 h-3 text-[#aaa] shrink-0" />
              </span>

              {/* Mobile View: Compact user pill with "মাই একাউন্ট" */}
              <div className="flex sm:hidden items-center gap-1">
                <UserIcon className="w-4 h-4 text-[#febd69] shrink-0" />
                <span className="text-[11px] font-bold text-white max-w-[70px] truncate">
                  {t("মাই একাউন্ট", "My Account")}
                </span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              </div>
            </button>

            {accountDropdownOpen && (
              <div className="absolute right-0 top-12 w-72 bg-white border border-slate-300 rounded-2xl shadow-2xl p-4 text-xs text-slate-800 z-50 animate-fade-in">
                {/* User Status / Sign In Button */}
                {!user ? (
                  <div className="text-center py-2 space-y-3">
                    <div className="text-xs font-black text-slate-900 flex items-center justify-center gap-1.5">
                      <UserIcon className="w-4 h-4 text-amber-500" />
                      <span>{t("মাই একাউন্ট", "My Account")}</span>
                    </div>

                    {/* Upgraded Premium Sign In Button */}
                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        openAuthModal('login');
                      }}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-amber-600/30 flex items-center justify-center gap-2 active:scale-95 group"
                    >
                      <LogIn className="w-4 h-4 text-slate-950 transition-transform group-hover:translate-x-0.5" />
                      <span>{t("সাইন ইন করুন", "Sign In")}</span>
                    </button>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      {t("নতুন অ্যাকাউন্ট খুলতে চান?", "New to Alif Trust?")}{' '}
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          openAuthModal('register');
                        }}
                        className="text-amber-600 hover:text-amber-700 hover:underline font-bold cursor-pointer"
                      >
                        {t("রেজিস্ট্রেশন করুন", "Register")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Logged in User Card */}
                    <div className="pb-3 border-b border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                          {t("মাই একাউন্ট", "My Account")}
                        </span>
                        {user.email.toLowerCase() === 'alifsheenshopping@gmail.com' ? (
                          <span className="px-2 py-0.5 bg-rose-100 border border-rose-300 text-rose-700 rounded text-[10px] font-black uppercase">
                            {t("সুপার অ্যাডমিন", "Super Admin")}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[10px] font-bold uppercase">
                            {t("রোল: ", "Role: ")}{user.role}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{user.email}</p>
                    </div>

                    {/* Special Admin Option - ONLY visible if logged in with alifsheenshopping@gmail.com */}
                    {user?.email?.toLowerCase() === 'alifsheenshopping@gmail.com' && (
                      <div className="py-2.5 border-b border-rose-200 bg-rose-50/70 -mx-4 px-4 my-1">
                        <button
                          onClick={() => {
                            setAccountDropdownOpen(false);
                            onNavigate('admin-dashboard');
                          }}
                          className="w-full text-left py-2 px-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-lg flex items-center justify-between cursor-pointer font-extrabold shadow-sm transition"
                        >
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-white" />
                            <span>{t("অ্যাডমিন প্যানেল", "Admin Panel")}</span>
                          </div>
                          <span className="text-[10px] bg-white text-rose-700 font-black px-1.5 py-0.5 rounded uppercase">
                            Admin
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Dual Action Hubs: Buyer & Seller Buttons (দোনোটাই করতে পারবে একাউন্ট দিয়ে) */}
                    <div className="pt-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                          {t("অ্যাকাউন্ট মোড ও হাব", "Account Mode & Hub")}
                        </span>
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                          {t("সব সুবিধাসমূহ", "All Access")}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* 1. BUYER BUTTON */}
                        <button
                          onClick={() => {
                            setAccountDropdownOpen(false);
                            onNavigate('buyer-dashboard');
                          }}
                          className="p-2.5 rounded-xl border-2 border-blue-200 bg-blue-50/70 hover:bg-blue-100 hover:border-blue-400 text-left transition-all cursor-pointer flex flex-col justify-between group shadow-xs active:scale-[0.98]"
                          title={t("বায়ার ড্যাশবোর্ড: অর্ডার ও কেনাকাটা", "Buyer Dashboard: Orders & Purchases")}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                              <ShoppingCart className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.5 rounded uppercase">
                              {t("কিনুন", "Buy")}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-900 block group-hover:text-blue-700 transition-colors">
                              {t("বায়ার হাব", "Buyer Hub")}
                            </span>
                            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                              {t("অর্ডার ও কেনাকাটা", "Orders & Deals")}
                            </span>
                          </div>
                        </button>

                        {/* 2. SELLER BUTTON */}
                        <button
                          onClick={() => {
                            setAccountDropdownOpen(false);
                            onNavigate('seller-dashboard');
                          }}
                          className="p-2.5 rounded-xl border-2 border-amber-200 bg-amber-50/70 hover:bg-amber-100 hover:border-amber-400 text-left transition-all cursor-pointer flex flex-col justify-between group shadow-xs active:scale-[0.98]"
                          title={t("সেলার ড্যাশবোর্ড: চ্যানেল বিক্রি ও ম্যানেজমেন্ট", "Seller Dashboard: Sell & Manage Listings")}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded uppercase">
                              {t("বিক্রি", "Sell")}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-900 block group-hover:text-amber-700 transition-colors">
                              {t("সেলার হাব", "Seller Hub")}
                            </span>
                            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                              {t("চ্যানেল বিক্রি করুন", "Sell Channels")}
                            </span>
                          </div>
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-500 italic text-center px-1 pt-0.5">
                        {t("* এই একটি অ্যাকাউন্ট দিয়েই আপনি একই সাথে কেনাকাটা ও বিক্রি করতে পারবেন।", "* You can buy and sell accounts seamlessly with this single account.")}
                      </p>

                      {/* Sign Out Button */}
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-center py-2 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-bold text-xs pt-2.5 border-t border-slate-100 flex items-center justify-center gap-1.5 cursor-pointer mt-2 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t("সাইন আউট করুন", "Sign Out")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 6. RETURNS & ORDERS */}
          <button
            onClick={() => onNavigate('buyer-dashboard')}
            className="hidden sm:flex flex-col text-left px-2 py-1.5 rounded-xs border border-transparent hover:border-white cursor-pointer transition shrink-0"
            title={t("আপনার অ্যাকাউন্ট অর্ডারসমূহ দেখুন", "View Your Acquisition Orders")}
          >
            <span className="text-[11px] text-[#ccc] leading-none">{t("রিটার্ন", "Returns")}</span>
            <span className="text-[13px] font-bold text-white leading-tight">&amp; {t("অর্ডার", "Orders")}</span>
          </button>

          {/* 7. CART / ESCROW VAULT */}
          <button
            onClick={() => onNavigate('buyer-dashboard')}
            className="flex items-center gap-1 px-1 sm:px-2 py-1 sm:py-1.5 rounded-xs border border-transparent hover:border-white cursor-pointer transition shrink-0"
            title={t("শপিং কার্ট ও এস্ক্রো অর্ডার", "Shopping Cart & Escrow Orders")}
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              <span className="absolute -top-1 -right-1 sm:top-0 sm:right-1 text-[10px] sm:text-xs font-black text-[#febd69] bg-[#131921] px-1 rounded-full leading-none">
                0
              </span>
            </div>
            <span className="text-[13px] font-bold text-white mt-2 hidden md:inline">{t("কার্ট", "Cart")}</span>
          </button>
        </div>

        {/* =========================================================
            TIER 2: AMAZON SUB-NAV BAR (#232f3e) (Matches screenshot)
           ========================================================= */}
        <div className="bg-[#232f3e] border-t border-[#37475a] text-white">
          <div className="max-w-[1550px] mx-auto px-2 sm:px-4 py-1 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none text-xs sm:text-[13px]">
            {/* "☰ All" Menu Button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xs border border-transparent hover:border-white cursor-pointer font-bold shrink-0 text-white"
            >
              <Menu className="w-4 h-4" />
              <span>{t("সব ক্যাটাগরি", "All Categories")}</span>
            </button>

            {/* Escrow Trust Vault Badge */}
            <button
              onClick={() => {
                onNavigate('home');
                onOpenLegal('safety');
              }}
              className="px-2.5 py-0.5 rounded-full bg-white text-slate-900 border border-amber-300 font-extrabold text-[11px] sm:text-xs flex items-center gap-1 shadow-xs hover:bg-slate-100 cursor-pointer shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="italic font-black text-amber-600 tracking-tight">{t("ট্রাস্টপে", "TrustPay")}</span>
              <span className="font-semibold text-slate-700">{t("এস্ক্রো সিকিউরড", "Escrow Secured")}</span>
            </button>

            {/* Quick Category & Navigation Links */}
            <button
              onClick={() => {
                onSelectPlatform?.('youtube');
                if (currentView !== 'home') onNavigate('home');
              }}
              className={`px-2 py-1 rounded-xs border transition cursor-pointer shrink-0 ${
                selectedPlatform === 'youtube'
                  ? 'border-white font-bold bg-[#37475a]'
                  : 'border-transparent hover:border-white text-[#eee]'
              }`}
            >
              {t("ইউটিউব চ্যানেল", "YouTube Channels")}
            </button>

            <button
              onClick={() => {
                onSelectPlatform?.('facebook');
                if (currentView !== 'home') onNavigate('home');
              }}
              className={`px-2 py-1 rounded-xs border transition cursor-pointer shrink-0 ${
                selectedPlatform === 'facebook'
                  ? 'border-white font-bold bg-[#37475a]'
                  : 'border-transparent hover:border-white text-[#eee]'
              }`}
            >
              {t("ফেসবুক পেজ", "Facebook Pages")}
            </button>

            <button
              onClick={() => {
                onSelectPlatform?.('tiktok');
                if (currentView !== 'home') onNavigate('home');
              }}
              className={`px-2 py-1 rounded-xs border transition cursor-pointer shrink-0 ${
                selectedPlatform === 'tiktok'
                  ? 'border-white font-bold bg-[#37475a]'
                  : 'border-transparent hover:border-white text-[#eee]'
              }`}
            >
              {t("টিকটক অ্যাকাউন্ট", "TikTok Accounts")}
            </button>

            <button
              onClick={() => {
                onSelectPlatform?.('telegram');
                if (currentView !== 'home') onNavigate('home');
              }}
              className={`px-2 py-1 rounded-xs border transition cursor-pointer shrink-0 ${
                selectedPlatform === 'telegram'
                  ? 'border-white font-bold bg-[#37475a]'
                  : 'border-transparent hover:border-white text-[#eee]'
              }`}
            >
              {t("টেলিগ্রাম চ্যানেল", "Telegram Channels")}
            </button>

            <button
              onClick={() => {
                onSelectPlatform?.('instagram');
                if (currentView !== 'home') onNavigate('home');
              }}
              className={`px-2 py-1 rounded-xs border transition cursor-pointer shrink-0 ${
                selectedPlatform === 'instagram'
                  ? 'border-white font-bold bg-[#37475a]'
                  : 'border-transparent hover:border-white text-[#eee]'
              }`}
            >
              {t("ইনস্টাগ্রাম পেজ", "Instagram Pages")}
            </button>

            <button
              onClick={() => {
                onNavigate('home');
                window.scrollTo({ top: 600, behavior: 'smooth' });
              }}
              className="px-2 py-1 rounded-xs border border-transparent hover:border-white text-[#eee] transition cursor-pointer shrink-0 flex items-center gap-1"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{t("আজকের অফার", "Today's Deals")}</span>
            </button>

            <button
              onClick={() => onNavigate('seller-dashboard')}
              className="px-2 py-1 rounded-xs border border-transparent hover:border-white text-[#eee] transition cursor-pointer shrink-0 font-medium text-amber-300"
            >
              {t("অ্যাকাউন্ট বিক্রি করুন", "Sell Account")}
            </button>

            <button
              onClick={() => onOpenLegal('safety')}
              className="px-2 py-1 rounded-xs border border-transparent hover:border-white text-[#eee] transition cursor-pointer shrink-0"
            >
              {t("কাস্টমার সার্ভিস", "Customer Service")}
            </button>

            <button
              onClick={() => {
                onNavigate('home');
                window.scrollTo({ top: 1200, behavior: 'smooth' });
              }}
              className="px-2 py-1 rounded-xs border border-transparent hover:border-white text-[#eee] transition cursor-pointer shrink-0 hidden md:inline-block"
            >
              {t("ভেরিফাইড রিভিউ", "Verified Reviews")}
            </button>

            <button
              onClick={() => onOpenLegal('refund')}
              className="px-2 py-1 rounded-xs border border-transparent hover:border-white text-[#eee] transition cursor-pointer shrink-0 hidden lg:inline-block"
            >
              {t("এস্ক্রো রেজিস্ট্রি", "Escrow Registry")}
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          AMAZON SIDE DRAWER ("☰ All")
         ========================================================= */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl z-50 flex flex-col text-slate-800 animate-slide-in-left overflow-y-auto">
            {/* Drawer Header */}
            <div className="bg-[#232f3e] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-800">
                  <UserIcon className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-base">
                  {t("হ্যালো, ", "Hello, ") + (user ? user.name : t("সাইন ইন করুন", "Sign in"))}
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-md text-white hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 space-y-6 text-sm">
              {/* Category Section 1: Digital Media Platforms */}
              <div className="space-y-2 border-b border-slate-200 pb-4">
                <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                  {t("ডিজিটাল মিডিয়া ও প্ল্যাটফর্ম", "Digital Media & Platforms")}
                </h4>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => {
                        onSelectPlatform?.('all');
                        setDrawerOpen(false);
                        onNavigate('home');
                      }}
                      className="w-full text-left py-2 px-2 rounded-md hover:bg-slate-100 font-semibold cursor-pointer flex items-center justify-between"
                    >
                      <span>{t("সকল একাউন্ট ব্রাউজ করুন", "Browse All Accounts")}</span>
                      <span className="text-xs text-slate-400">{t("সব", "All")}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        onSelectPlatform?.('youtube');
                        setDrawerOpen(false);
                        onNavigate('home');
                      }}
                      className="w-full text-left py-2 px-2 rounded-md hover:bg-slate-100 cursor-pointer flex items-center justify-between"
                    >
                      <span>{t("🔴 ইউটিউব চ্যানেল", "🔴 YouTube Channels")}</span>
                      <span className="text-xs text-slate-400">{t("মনিটাইজড", "Monetized")}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        onSelectPlatform?.('facebook');
                        setDrawerOpen(false);
                        onNavigate('home');
                      }}
                      className="w-full text-left py-2 px-2 rounded-md hover:bg-slate-100 cursor-pointer flex items-center justify-between"
                    >
                      <span>{t("🔵 ফেসবুক পেজ ও আইডি", "🔵 Facebook Pages")}</span>
                      <span className="text-xs text-slate-400">{t("ইনস্ট্রিম", "In-Stream")}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        onSelectPlatform?.('tiktok');
                        setDrawerOpen(false);
                        onNavigate('home');
                      }}
                      className="w-full text-left py-2 px-2 rounded-md hover:bg-slate-100 cursor-pointer flex items-center justify-between"
                    >
                      <span>{t("🎵 টিকটক ভাইরাল আইডি", "🎵 TikTok Viral IDs")}</span>
                      <span className="text-xs text-slate-400">{t("রিওয়ার্ডস", "Rewards")}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        onSelectPlatform?.('telegram');
                        setDrawerOpen(false);
                        onNavigate('home');
                      }}
                      className="w-full text-left py-2 px-2 rounded-md hover:bg-slate-100 cursor-pointer flex items-center justify-between"
                    >
                      <span>{t("✈️ টেলিগ্রাম চ্যানেল", "✈️ Telegram Channels")}</span>
                      <span className="text-xs text-slate-400">{t("সক্রিয়", "Active")}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        onSelectPlatform?.('instagram');
                        setDrawerOpen(false);
                        onNavigate('home');
                      }}
                      className="w-full text-left py-2 px-2 rounded-md hover:bg-slate-100 cursor-pointer flex items-center justify-between"
                    >
                      <span>{t("📸 ইনস্টাগ্রাম পেজ", "📸 Instagram Pages")}</span>
                      <span className="text-xs text-slate-400">{t("ইনফ্লুয়েন্সার", "Influencer")}</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Category Section 2: Programs & Features */}
              <div className="space-y-2 border-b border-slate-200 pb-4">
                <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                  {t("প্রোগ্রাম ও ফিচারসমূহ", "Programs & Features")}
                </h4>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        onNavigate('seller-dashboard');
                      }}
                      className="w-full text-left py-2 px-2 rounded-md hover:bg-slate-100 font-semibold text-amber-700 cursor-pointer flex items-center justify-between"
                    >
                      <span>{t("অ্যাকাউন্ট বিক্রির লিস্টিং", "Sell Social Media Account")}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                        {t("সেলার হাব", "Seller Hub")}
                      </span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        onNavigate('buyer-dashboard');
                      }}
                      className="w-full text-left py-2 px-2 rounded-md hover:bg-slate-100 font-semibold cursor-pointer"
                    >
                      {t("আমার অর্ডার ও কাস্টডি ড্যাশবোর্ড", "My Acquisitions & Custody Dashboard")}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        onOpenLegal('safety');
                      }}
                      className="w-full text-left py-2 px-2 rounded-md hover:bg-slate-100 cursor-pointer flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{t("১০০% নিরাপদ এস্ক্রো ট্রান্সফার প্রটোকল", "100% Safe Escrow Protocol")}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        onOpenLegal('refund');
                      }}
                      className="w-full text-left py-2 px-2 rounded-md hover:bg-slate-100 cursor-pointer"
                    >
                      {t("রিফান্ড ও বিরোধ নিষ্পত্তি পলিসি", "Refund & Dispute Policy")}
                    </button>
                  </li>
                </ul>
              </div>

              {/* Super Admin Section - ONLY visible for alifsheenshopping@gmail.com */}
              {user?.email?.toLowerCase() === 'alifsheenshopping@gmail.com' && (
                <div className="space-y-2 border-b border-rose-200 bg-rose-50/60 p-3 rounded-xl">
                  <h4 className="font-black text-xs text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                    {t("সুপার অ্যাডমিন নিয়ন্ত্রণ", "Super Admin Controls")}
                  </h4>
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      onNavigate('admin-dashboard');
                    }}
                    className="w-full text-left py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-between shadow-xs cursor-pointer transition"
                  >
                    <span>{t("অ্যাডমিন প্যানেল ড্যাশবোর্ড", "Admin Panel Dashboard")}</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded uppercase font-black">
                      Admin
                    </span>
                  </button>
                </div>
              )}

              {/* Category Section 3: Help & Settings */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                  {t("হেল্প ও সেটিংস", "Help & Settings")}
                </h4>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        setLocationModalOpen(true);
                      }}
                      className="w-full text-left py-2 px-2 rounded-md hover:bg-slate-100 cursor-pointer flex items-center gap-1.5 text-xs text-slate-600"
                    >
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t("লোকেশন: ", "Location: ") + userLocation + t(" (আপডেট করুন)", " (Change)")}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        onOpenLegal('tos');
                      }}
                      className="w-full text-left py-2 px-2 rounded-md hover:bg-slate-100 cursor-pointer"
                    >
                      {t("টার্মস অফ সার্ভিস", "Terms of Service")}
                    </button>
                  </li>
                  {user ? (
                    <li>
                      <button
                        onClick={() => {
                          setDrawerOpen(false);
                          logout();
                        }}
                        className="w-full text-left py-2 px-2 rounded-md hover:bg-red-50 text-red-600 font-bold cursor-pointer"
                      >
                        {t("সাইন আউট", "Sign Out")}
                      </button>
                    </li>
                  ) : (
                    <li>
                      <button
                        onClick={() => {
                          setDrawerOpen(false);
                          openAuthModal('login');
                        }}
                        className="w-full text-left py-2 px-2 rounded-md hover:bg-slate-100 text-blue-700 font-bold cursor-pointer"
                      >
                        {t("সাইন ইন / রেজিস্ট্রেশন", "Sign In / Register")}
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          LOCATION MODAL ("Choose your location" / Jamalpur 2012)
         ========================================================= */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setLocationModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 text-slate-800 z-50 animate-fade-in border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#ff9900]" />
                {t("আপনার বর্তমান লোকেশন নির্বাচন করুন", "Select Your Current Location")}
              </h3>
              <button
                onClick={() => setLocationModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              {t(
                "আপনি যেখান থেকে ওয়েবসাইটটি ব্রাউজ করছেন, স্বয়ংক্রিয়ভাবে সেই লোকেশন শনাক্ত করা হয়েছে। প্রয়োজনে আপনার জেলা বা শহর পরিবর্তন করতে পারেন।",
                "Your location was automatically detected based on where you are browsing from. You can customize your city or postal region below."
              )}
            </p>

              {/* Quick choices */}
              <div className="mt-4 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {t("জনপ্রিয় লোকেশন নির্বাচন করুন:", "Quick Regional Locations:")}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    'Jamalpur 2012',
                    'Dhaka 1205',
                    'Mymensingh 2200',
                    'Chittagong 4000',
                    'Sylhet 3100',
                    'Rajshahi 6000',
                    'Khulna 9000',
                    'Barishal 8200',
                    'Rangpur 5400',
                  ].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => handleSaveLocation(loc)}
                      className={`p-2 rounded-lg border text-left font-medium cursor-pointer transition ${
                        userLocation === loc
                          ? 'border-[#ff9900] bg-[#ff9900]/15 text-slate-900 font-bold shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-bold">{loc.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-500">{t("কোড: ", "ZIP: ")}{loc.split(' ')[1]}</div>
                    </button>
                  ))}
                </div>
              </div>

            {/* Custom Location Input */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("অথবা অন্য কোনো জেলা/পোস্টাল কোড লিখুন:", "Or enter a city or postal code:")}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customLocationInput}
                  onChange={(e) => setCustomLocationInput(e.target.value)}
                  placeholder={t("যেমন: Rajshahi 6000 অথবা Khulna...", "e.g. Rajshahi 6000 or New York...")}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-[#ff9900]"
                />
                <button
                  type="button"
                  onClick={() => handleSaveLocation(customLocationInput)}
                  className="px-4 py-2 bg-[#febd69] hover:bg-[#f3a847] text-slate-900 font-bold text-xs rounded-lg transition cursor-pointer"
                >
                  {t("সম্পন্ন", "Done")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          CURRENCY & LANGUAGE MODAL (For mobile/touch & quick switch)
         ========================================================= */}
      {currencyModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setCurrencyModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-800 z-[9999] animate-fade-in border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <span className="text-amber-500 font-extrabold text-lg">$ / ৳</span>
                  {t("কারেন্সি ও ভাষা সেটিংস", "Currency & Language Settings")}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t("আপনার পছন্দের মুদ্রা এবং ওয়েবসাইটের লেখার ভাষা নির্বাচন করুন", "Select your preferred currency and display language")}
                </p>
              </div>
              <button
                onClick={() => setCurrencyModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. CURRENCY CHOICE */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  {t("১. কারেন্সি নির্বাচন", "1. Select Currency")}
                </span>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  1 USD = ৳122
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* USD Button */}
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`p-3 rounded-xl border-2 text-left cursor-pointer transition flex flex-col justify-between ${
                    currency === 'USD'
                      ? 'border-amber-500 bg-amber-50/80 shadow-xs ring-2 ring-amber-400/40'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-emerald-600">$ USD</span>
                    {currency === 'USD' ? (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-300" />
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="font-extrabold text-slate-900 text-xs">{t("মার্কিন ডলার", "US Dollar")}</div>
                    <div className="text-[10px] text-slate-500">{t("আন্তর্জাতিক রেট ($)", "International Rate ($)")}</div>
                  </div>
                </button>

                {/* BDT Button */}
                <button
                  type="button"
                  onClick={() => setCurrency('BDT')}
                  className={`p-3 rounded-xl border-2 text-left cursor-pointer transition flex flex-col justify-between ${
                    currency === 'BDT'
                      ? 'border-amber-500 bg-amber-50/80 shadow-xs ring-2 ring-amber-400/40'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-rose-600">৳ BDT</span>
                    {currency === 'BDT' ? (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-300" />
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="font-extrabold text-slate-900 text-xs">{t("বাংলাদেশি টাকা", "Bangladeshi Taka")}</div>
                    <div className="text-[10px] text-slate-500">{t("বিকাশ / নগদ রেট (৳)", "bKash / Nagad Rate (৳)")}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. LANGUAGE CHOICE */}
            <div className="mt-5 pt-4 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  {t("২. প্রদর্শনের ভাষা নির্বাচন", "2. Choose Display Language")}
                </span>
                <span className="text-[11px] text-amber-600 font-bold">
                  {t("ভাষা", "Language")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* বাংলা (Bangla) Button */}
                <button
                  type="button"
                  onClick={() => setLanguage('BN')}
                  className={`p-3 rounded-xl border-2 text-left cursor-pointer transition flex items-center justify-between ${
                    language === 'BN'
                      ? 'border-amber-500 bg-amber-50/80 shadow-xs ring-2 ring-amber-400/40'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl leading-none">🇧🇩</span>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">বাংলা</div>
                      <div className="text-[10px] text-slate-500">{t("বাংলা লেখা দেখুন", "View in Bangla")}</div>
                    </div>
                  </div>
                  {language === 'BN' ? (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-slate-300" />
                  )}
                </button>

                {/* English (ইংরেজি) Button */}
                <button
                  type="button"
                  onClick={() => setLanguage('EN')}
                  className={`p-3 rounded-xl border-2 text-left cursor-pointer transition flex items-center justify-between ${
                    language === 'EN'
                      ? 'border-amber-500 bg-amber-50/80 shadow-xs ring-2 ring-amber-400/40'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl leading-none">🇺🇸</span>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">English</div>
                      <div className="text-[10px] text-slate-500">{t("ইংরেজিতে দেখুন", "View in English")}</div>
                    </div>
                  </div>
                  {language === 'EN' ? (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-slate-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Footer Summary & Done Button */}
            <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-600">
                {t("নির্বাচিত: ", "Selected: ")}<strong className="text-slate-950 font-black">{currency}</strong> • <strong className="text-slate-950 font-black">{language === 'BN' ? 'বাংলা' : 'English'}</strong>
              </div>
              <button
                type="button"
                onClick={() => setCurrencyModalOpen(false)}
                className="px-5 py-2 bg-[#febd69] hover:bg-[#f3a847] text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                {t("সম্পন্ন", "Done")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
