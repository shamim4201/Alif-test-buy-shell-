import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Youtube,
  PlusCircle,
  LayoutDashboard,
  ShieldAlert,
  UserCheck,
  LogOut,
  Menu,
  X,
  Compass,
  FileText,
  BadgeCheck,
  Search
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenLegal: (tab: 'tos' | 'privacy' | 'refund' | 'safety') => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenLegal,
  searchTerm = '',
  onSearchChange
}) => {
  const { user, logout, openAuthModal, quickSwitch } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [searchBoxOpen, setSearchBoxOpen] = useState(Boolean(searchTerm));
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSearch(searchTerm);
    if (searchTerm) {
      setSearchBoxOpen(true);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (searchBoxOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [searchBoxOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange?.(localSearch);
    if (currentView !== 'home') {
      onNavigate('home');
    }
  };

  const handleSearchInputChange = (val: string) => {
    setLocalSearch(val);
    onSearchChange?.(val);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800 text-slate-100">
      {/* Top Protocol Security Bar */}
      <div className="bg-gradient-to-r from-red-950/70 via-slate-900 to-indigo-950/60 border-b border-slate-800/80 px-4 py-1 text-xs text-slate-300 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-emerald-400">Strict Safety Protocol:</span>
            <span className="hidden sm:inline text-slate-300">
              Never share Google passwords. Transfers occur securely via YouTube Studio Brand Account Manager reassignment.
            </span>
          </div>

          {/* Quick Persona Switcher for easy testing of buyer, seller, admin */}
          <div className="relative">
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-full px-2 py-0.5 text-[11px]">
              <span className="text-slate-400 hidden md:inline">Test Role:</span>
              <button
                onClick={() => quickSwitch('buyer')}
                className={`px-2 py-0.5 rounded-full font-medium transition ${
                  user?.role === 'buyer'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Switch to Buyer Persona"
              >
                Buyer
              </button>
              <button
                onClick={() => quickSwitch('seller')}
                className={`px-2 py-0.5 rounded-full font-medium transition ${
                  user?.role === 'seller'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Switch to Seller Persona"
              >
                Seller
              </button>
              <button
                onClick={() => quickSwitch('admin')}
                className={`px-2 py-0.5 rounded-full font-medium transition ${
                  user?.role === 'admin'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Switch to Admin Persona"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo (Left side) */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-left group focus:outline-hidden shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/20 group-hover:scale-105 transition">
              <Youtube className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-white">Channel</span>
                <span className="font-extrabold text-base sm:text-xl tracking-tight bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">
                  Trust
                </span>
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 hidden xs:inline" />
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-400 -mt-0.5 sm:-mt-1 tracking-wider uppercase font-semibold hidden sm:block">
                Verified YouTube Marketplace
              </p>
            </div>
          </button>

          {/* Desktop Navigation (Center/Left) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-medium transition flex items-center gap-1.5 ${
                currentView === 'home' ? 'text-red-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              Browse Channels
            </button>
            <button
              onClick={() => onNavigate('seller-dashboard', { tab: 'create' })}
              className={`text-sm font-medium transition flex items-center gap-1.5 ${
                currentView === 'seller-dashboard' ? 'text-red-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              List Channel For Sale
            </button>
            <button
              onClick={() => onOpenLegal('safety')}
              className="text-sm font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Safety & Protocol
            </button>
          </nav>

          {/* Right Side: Search Icon Trigger (এক সাইটে স্পষ্টভাবে দৃশ্যমান) + User Controls + Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Icon & Box on the Right Side */}
            <div className="relative">
              {!searchBoxOpen ? (
                <button
                  type="button"
                  onClick={() => setSearchBoxOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-red-600/30 ring-1 ring-red-400/50 transition cursor-pointer shrink-0"
                  title="সার্চ আইকনে ক্লিক করে লিখুন (Search)"
                >
                  <Search className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  <span className="font-bold tracking-wide">
                    {localSearch ? (
                      <span className="max-w-[90px] sm:max-w-[120px] truncate block text-amber-200">
                        "{localSearch}"
                      </span>
                    ) : (
                      <span>সার্চ</span>
                    )}
                  </span>
                </button>
              ) : (
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center w-48 xs:w-60 sm:w-72 md:w-80 transition-all duration-200"
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={localSearch}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    placeholder="সার্চ: আন্টির রান্না, Cash cow..."
                    className="w-full bg-slate-900 border-2 border-red-500 rounded-full pl-3.5 pr-20 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-hidden transition shadow-xl shadow-red-950/60"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {localSearch && (
                      <button
                        type="button"
                        onClick={() => handleSearchInputChange('')}
                        className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
                        title="মুছুন"
                      >
                        ✕
                      </button>
                    )}
                    <button
                      type="submit"
                      className="w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition shrink-0 cursor-pointer"
                      title="সার্চ"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!localSearch) {
                          setSearchBoxOpen(false);
                        } else {
                          handleSearchInputChange('');
                          setSearchBoxOpen(false);
                        }
                      }}
                      className="w-5 h-5 rounded-full text-slate-400 hover:text-white flex items-center justify-center text-xs ml-0.5 cursor-pointer"
                      title="বন্ধ করুন"
                    >
                      ✕
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Desktop User Controls */}
            <div className="hidden md:flex items-center gap-2.5">
              {user ? (
                <div className="flex items-center gap-2.5">
                  {/* Dashboard links */}
                  <button
                    onClick={() => onNavigate('buyer-dashboard')}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition ${
                      currentView === 'buyer-dashboard'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Buyer
                  </button>
                  <button
                    onClick={() => onNavigate('seller-dashboard')}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition ${
                      currentView === 'seller-dashboard'
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Seller
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => onNavigate('admin-dashboard')}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition flex items-center gap-1 ${
                        currentView === 'admin-dashboard'
                          ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                          : 'bg-rose-950/40 border-rose-800 text-rose-300 hover:bg-rose-900/50'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Admin
                    </button>
                  )}

                  {/* Profile Pill */}
                  <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-7 h-7 rounded-full border border-slate-700 object-cover"
                    />
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-semibold text-white leading-tight max-w-[100px] truncate">
                        {user.name}
                      </p>
                      <span className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                        {user.role}
                        {user.isVerifiedSeller && (
                          <span className="text-emerald-400 font-bold" title="Verified Seller">✓</span>
                        )}
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      title="Sign Out"
                      className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-600/30 transition"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-hidden"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3">
          {/* Mobile Search Bar */}
          <form onSubmit={(e) => { handleSearchSubmit(e); setMobileMenuOpen(false); }} className="relative flex items-center">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              placeholder="সার্চ করুন: আন্টির রান্না, Cash cow, Gaming..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-3.5 pr-10 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 p-1.5 bg-red-600 rounded-lg text-white"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="space-y-1">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Browse Channels
            </button>
            <button
              onClick={() => {
                onNavigate('seller-dashboard', { tab: 'create' });
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 hover:bg-slate-800 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              List Channel For Sale
            </button>
            <button
              onClick={() => {
                onNavigate('buyer-dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-blue-400 hover:bg-slate-800"
            >
              Buyer Dashboard & Orders
            </button>
            <button
              onClick={() => {
                onNavigate('seller-dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-amber-400 hover:bg-slate-800"
            >
              Seller Dashboard & Listings
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  onNavigate('admin-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-slate-800 flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                Admin Moderation Hub
              </button>
            )}
            <button
              onClick={() => {
                onOpenLegal('safety');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800"
            >
              Trust & Safe Transfer Guidelines
            </button>
          </div>

          {user ? (
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="text-xs font-semibold text-white">{user.name}</p>
                  <p className="text-[10px] text-slate-400">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-400 font-semibold px-2 py-1"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => {
                  openAuthModal('login');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center text-xs font-semibold bg-slate-800 rounded-lg text-white"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  openAuthModal('register');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center text-xs font-semibold bg-red-600 rounded-lg text-white"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
