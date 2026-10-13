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
  Globe
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

const PLATFORM_DROPDOWN_OPTIONS = [
  { id: 'all', label: 'All Accounts / সকল একাউন্ট' },
  { id: 'youtube', label: 'YouTube (ইউটিউব)' },
  { id: 'facebook', label: 'Facebook (ফেসবুক)' },
  { id: 'tiktok', label: 'TikTok (টিকটক)' },
  { id: 'telegram', label: 'Telegram (টেলিগ্রাম)' },
  { id: 'instagram', label: 'Instagram (ইনস্টাগ্রাম)' },
  { id: 'twitter', label: 'X / Twitter (টুইটার)' }
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
  const { currency, setCurrency, language, setLanguage, t } = useCurrency();
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [activeCategory, setActiveCategory] = useState(selectedPlatform || 'all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
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

  const currentCategoryLabel =
    PLATFORM_DROPDOWN_OPTIONS.find((c) => c.id === activeCategory)?.label || 'All';

  return (
    <>
      {/* =========================================================
          TIER 1: AMAZON TOP MAIN HEADER (#131921)
         ========================================================= */}
      <header className="sticky top-0 z-40 bg-[#131921] text-white select-none">
        <div className="max-w-[1550px] mx-auto px-2 sm:px-4 py-1.5 flex items-center justify-between gap-1 sm:gap-2">
          {/* 1. BRAND LOGO: Alif Trust buy&shell (alif sheen group) */}
          <div
            onClick={() => {
              onNavigate('home');
              onSelectPlatform?.('all');
            }}
            className="flex items-center px-1.5 py-1 rounded-xs border border-transparent hover:border-white cursor-pointer transition shrink-0 group select-none"
            title="Alif Trust Buy & Sell - alif sheen group"
          >
            <BrandLogo theme="dark" size="md" showSubtitle={true} />
          </div>

          {/* 2. USER LOCATION PIN (Shows viewer's actual location, not delivery) */}
          <button
            onClick={() => setLocationModalOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-xs border border-transparent hover:border-white cursor-pointer transition text-left shrink-0"
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

          {/* 3. CURRENCY & LANGUAGE SELECTOR ($ USD / ৳ BDT & বাংলা / EN) */}
          <div className="relative shrink-0 mx-1 sm:mx-3 z-30" ref={currencyDropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrencyDropdownOpen((prev) => !prev);
              }}
              className="h-9 sm:h-10 bg-[#e6e6e6] hover:bg-[#dadada] text-slate-900 text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 rounded-md border border-[#cdcdcd] transition cursor-pointer select-none whitespace-nowrap active:bg-[#ccc] shadow-xs"
              title={t("ওয়েবসাইটের কারেন্সি ও ভাষা পরিবর্তন করুন", "Change website currency & language")}
            >
              <span className="text-sm font-black text-amber-700">
                {currency === 'USD' ? '$' : '৳'}
              </span>
              <span className="font-black text-slate-900 tracking-tight">
                {currency}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 hidden sm:inline">
                • {language === 'BN' ? 'বাংলা' : 'EN'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-600 shrink-0 transition-transform ${currencyDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* CURRENCY & LANGUAGE DROPDOWN POPUP */}
            {currencyDropdownOpen && (
              <div
                className="absolute left-0 top-[43px] w-[305px] sm:w-[335px] max-w-[92vw] bg-white border border-slate-300 rounded-xl shadow-2xl p-3.5 text-xs text-slate-800 z-50 animate-fade-in divide-y divide-slate-100"
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

          {/* 5. HELLO, USER / ACCOUNT & LISTS (Exactly like screenshot) */}
          <div className="relative shrink-0" ref={accountDropdownRef}>
            <button
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              className="flex flex-col text-left px-2 py-1.5 rounded-xs border border-transparent hover:border-white cursor-pointer transition"
            >
              <span className="text-[11px] text-[#ccc] leading-none truncate max-w-[110px]">
                {t("হ্যালো, ", "Hello, ") + displayName}
              </span>
              <span className="text-[13px] font-bold text-white flex items-center gap-0.5 leading-tight">
                {t("অ্যাকাউন্ট ও তালিকা", "Account & Lists")}
                <ChevronDown className="w-3 h-3 text-[#aaa] shrink-0" />
              </span>
            </button>

            {accountDropdownOpen && (
              <div className="absolute right-0 top-12 w-72 bg-white border border-slate-300 rounded-lg shadow-2xl p-4 text-xs text-slate-800 z-50 animate-fade-in">
                {/* User Status / Sign In Button */}
                {!user ? (
                  <div className="text-center pb-3 border-b border-slate-200">
                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        openAuthModal('login');
                      }}
                      className="w-full py-2 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] hover:from-[#f5d78e] hover:to-[#eeb933] border border-[#a88734] rounded-md text-xs font-bold text-slate-900 shadow-xs cursor-pointer"
                    >
                      {t("সাইন ইন", "Sign In")}
                    </button>
                    <p className="text-[11px] text-slate-500 mt-2">
                      {t("নতুন বায়ার বা সেলার?", "New customer?")}{' '}
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          openAuthModal('register');
                        }}
                        className="text-blue-700 hover:underline font-semibold cursor-pointer"
                      >
                        {t("এখান থেকে শুরু করুন।", "Start here.")}
                      </button>
                    </p>
                  </div>
                ) : (
                  <div className="pb-3 border-b border-slate-200">
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[10px] font-bold uppercase">
                      {t("রোল: ", "Role: ")}{user.role}
                    </span>
                  </div>
                )}

                {/* Instant Role Switcher for seamless demo testing */}
                <div className="py-2.5 border-b border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {t("রোল দ্রুত পরিবর্তন করুন (Instant Switch)", "Quick Role Switch (Demo)")}
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => {
                        quickSwitch('buyer');
                        setAccountDropdownOpen(false);
                      }}
                      className={`py-1 text-center rounded border text-[11px] font-semibold cursor-pointer transition ${
                        user?.role === 'buyer'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t("বায়ার", "Buyer")}
                    </button>
                    <button
                      onClick={() => {
                        quickSwitch('seller');
                        setAccountDropdownOpen(false);
                      }}
                      className={`py-1 text-center rounded border text-[11px] font-semibold cursor-pointer transition ${
                        user?.role === 'seller'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t("সেলার", "Seller")}
                    </button>
                    <button
                      onClick={() => {
                        quickSwitch('admin');
                        setAccountDropdownOpen(false);
                      }}
                      className={`py-1 text-center rounded border text-[11px] font-semibold cursor-pointer transition ${
                        user?.role === 'admin'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t("অ্যাডমিন", "Admin")}
                    </button>
                  </div>
                </div>

                {/* Your Lists & Links */}
                <div className="pt-2.5 space-y-2">
                  <button
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      onNavigate('buyer-dashboard');
                    }}
                    className="w-full text-left py-1 hover:text-[#ff9900] flex items-center justify-between cursor-pointer"
                  >
                    <span>{t("আপনার অর্ডারসমূহ", "Your Orders")}</span>
                    <span className="text-[10px] text-slate-400">{t("এস্ক্রো", "Escrow")}</span>
                  </button>
                  <button
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      onNavigate('seller-dashboard');
                    }}
                    className="w-full text-left py-1 hover:text-[#ff9900] flex items-center justify-between cursor-pointer"
                  >
                    <span>{t("সেলার ড্যাশবোর্ড", "Seller Dashboard")}</span>
                    <span className="text-[10px] text-amber-600 font-bold">{t("বিক্রি করুন", "Sell")}</span>
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        onNavigate('admin-dashboard');
                      }}
                      className="w-full text-left py-1 hover:text-[#ff9900] flex items-center justify-between cursor-pointer font-bold text-rose-600"
                    >
                      <span>{t("অ্যাডমিন কন্ট্রোল সেন্টার", "Admin Control Center")}</span>
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-1 rounded">Admin</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      onOpenLegal('safety');
                    }}
                    className="w-full text-left py-1 hover:text-[#ff9900] cursor-pointer"
                  >
                    {t("নিরাপদ ওনারশিপ প্রটোকল", "Safe Ownership Protocol")}
                  </button>
                  {user && (
                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left py-1 text-red-600 hover:underline pt-2 border-t border-slate-100 flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {t("সাইন আউট", "Sign Out")}
                    </button>
                  )}
                </div>
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
            className="flex items-center gap-1 px-2 py-1.5 rounded-xs border border-transparent hover:border-white cursor-pointer transition shrink-0"
            title={t("শপিং কার্ট ও এস্ক্রো অর্ডার", "Shopping Cart & Escrow Orders")}
          >
            <div className="relative">
              <ShoppingCart className="w-8 h-8 text-white" />
              <span className="absolute top-0 right-1 text-xs font-black text-[#febd69] bg-[#131921] px-1 rounded-full leading-none">
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
              <span>{t("সব ক্যাটাগরি", "All")}</span>
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
              <span className="italic font-black text-amber-600 tracking-tight">TrustPay</span>
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
              Telegram
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
              Instagram
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

        {/* TIER 3: MOBILE QUICK LOCATION & CURRENCY BAR (Visible on smaller screens) */}
        <div className="md:hidden bg-[#37475a] text-white px-3 py-1.5 flex items-center justify-between text-xs border-t border-[#485769]">
          <button
            onClick={() => setLocationModalOpen(true)}
            className="flex items-center gap-1.5 text-left cursor-pointer hover:underline"
          >
            <MapPin className="w-3.5 h-3.5 text-[#febd69] shrink-0" />
            <span className="text-slate-200">
              {t("আপনার লোকেশন:", "Your Location:")} <strong className="text-white font-bold">{userLocation}</strong>
            </span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrencyModalOpen(true)}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[#febd69] font-black text-[11px] border border-amber-400/40 cursor-pointer flex items-center gap-1"
              title={t("কারেন্সি ও ভাষা পরিবর্তন করুন", "Change Currency & Language")}
            >
              <span>{currency === 'USD' ? '$ USD' : '৳ BDT'}</span>
              <span className="text-white font-normal text-[10px]">({language === 'BN' ? 'বাংলা' : 'EN'})</span>
            </button>
            <button
              onClick={() => setLocationModalOpen(true)}
              className="text-[11px] font-semibold text-slate-300 hover:text-white underline cursor-pointer"
            >
              {t("পরিবর্তন", "Change")}
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
                      <span className="text-xs text-slate-400">All</span>
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
                      <span>{t("🔴 YouTube (ইউটিউব চ্যানেল)", "🔴 YouTube Channels")}</span>
                      <span className="text-xs text-slate-400">Monetized</span>
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
                      <span>{t("🔵 Facebook (ফেসবুক পেজ ও আইডি)", "🔵 Facebook Pages")}</span>
                      <span className="text-xs text-slate-400">In-Stream</span>
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
                      <span>{t("🎵 TikTok (টিকটক ভাইরাল আইডি)", "🎵 TikTok Viral IDs")}</span>
                      <span className="text-xs text-slate-400">Rewards</span>
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
                      <span>{t("✈️ Telegram (টেলিগ্রাম চ্যানেল)", "✈️ Telegram Channels")}</span>
                      <span className="text-xs text-slate-400">Active</span>
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
                      <span>{t("📸 Instagram (ইনস্টাগ্রাম পেজ)", "📸 Instagram Pages")}</span>
                      <span className="text-xs text-slate-400">Influencer</span>
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
                      <span>{t("অ্যাকাউন্ট বিক্রির লিস্টিং (Sell)", "Sell Social Media Account")}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                        Seller Hub
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setCurrencyModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-800 z-50 animate-fade-in border border-slate-200">
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
                  {t("১. কারেন্সি নির্বাচন (Select Currency)", "1. Select Currency")}
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
                  {t("২. আপনি কি লেখা দেখতে চান? (Website Language)", "2. Choose Display Language")}
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
