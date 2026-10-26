import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { BrandLogo } from './BrandLogo';
import { X, Mail, Lock, User as UserIcon, Check, LogIn } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  onLoginSuccess?: (targetView: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess }) => {
  const { authModal, closeAuthModal, login, register, loginWithGoogle, showToast } = useAuth();
  const { t } = useCurrency();
  const [isLogin, setIsLogin] = useState(authModal.mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Sign-In States
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [googleSigningIn, setGoogleSigningIn] = useState(false);
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  useEffect(() => {
    setIsLogin(authModal.mode === 'login');
    setError(null);
    setEmail('');
    setPassword('');
    setShowGoogleModal(false);
    setShowCustomGoogleInput(false);
  }, [authModal.mode, authModal.isOpen]);

  if (!authModal.isOpen) return null;

  const handleDirectGoogleSignIn = async (account: { email: string; name: string; avatar?: string }) => {
    setError(null);
    setGoogleSigningIn(true);
    try {
      const loggedInUser = await loginWithGoogle(account);
      setShowGoogleModal(false);
      if (loggedInUser.email.toLowerCase() === 'alifsheenshopping@gmail.com') {
        showToast(t('সুপার অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...', 'Redirecting to Super Admin Dashboard...'), 'success');
        onLoginSuccess?.('admin-dashboard');
      } else if (loggedInUser.role === 'seller') {
        showToast(t('সেলার ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...', 'Redirecting to Seller Dashboard...'), 'success');
        onLoginSuccess?.('seller-dashboard');
      } else {
        showToast(t('বায়ার ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...', 'Redirecting to Buyer Dashboard...'), 'success');
        onLoginSuccess?.('buyer-dashboard');
      }
    } catch (err: any) {
      setError(err.message || t('Google সাইন ইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।', 'Google sign-in failed. Please try again.'));
    } finally {
      setGoogleSigningIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    try {
      let loggedInUser: User;
      if (isLogin) {
        loggedInUser = await login(cleanEmail, cleanPass);
      } else {
        loggedInUser = await register({ name: name.trim(), email: cleanEmail, password: cleanPass, role, bio });
      }

      // Automatically redirect based on user role
      if (loggedInUser.email.toLowerCase() === 'alifsheenshopping@gmail.com') {
        showToast(t('সুপার অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...', 'Redirecting to Super Admin Dashboard...'), 'success');
        onLoginSuccess?.('admin-dashboard');
      } else if (loggedInUser.role === 'seller') {
        showToast(t('সেলার ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...', 'Redirecting to Seller Dashboard...'), 'success');
        onLoginSuccess?.('seller-dashboard');
      } else {
        showToast(t('বায়ার ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...', 'Redirecting to Buyer Dashboard...'), 'success');
        onLoginSuccess?.('buyer-dashboard');
      }
    } catch (err: any) {
      setError(err.message || t('লগইন ব্যর্থ হয়েছে। সঠিক ইমেইল ও পাসওয়ার্ড দিয়ে আবার চেষ্টা করুন।', 'Authentication failed. Please verify credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in text-slate-900 my-8">
        <button
          onClick={closeAuthModal}
          className="absolute right-5 top-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="mb-2.5">
            <BrandLogo theme="light" size="lg" showSubtitle={true} />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {isLogin ? t('মাই একাউন্টে সাইন ইন করুন', 'Sign In to My Account') : t('নতুন অ্যাকাউন্ট রেজিস্ট্রেশন', 'Create an Account')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isLogin
              ? t('আপনার ইমেইল ও পাসওয়ার্ড টাইপ করে লগইন করুন', 'Type your registered email and password to log in')
              : t('সোশ্যাল মিডিয়া অ্যাকাউন্ট মার্কেটপ্লেসে যুক্ত হোন', 'Join the premier verified social asset marketplace')}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 font-bold text-xs">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={`py-2 rounded-lg transition cursor-pointer text-center ${
              isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('সাইন ইন (লগইন)', 'Sign In')}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`py-2 rounded-lg transition cursor-pointer text-center ${
              !isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('নতুন রেজিস্ট্রেশন', 'Register')}
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold leading-relaxed">
            {error}
          </div>
        )}

        {/* Clean Credentials Typing Form - NO role selection on login! */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('পুরো নাম বা ব্র্যান্ড নাম', 'Full Name or Brand Name')}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('যেমন: আলিম হাসান', 'e.g. Alim Hasan')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('অ্যাকাউন্টের ধরন নির্বাচন করুন', 'Select Account Type')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      role === 'buyer'
                        ? 'bg-red-50 border-red-500 text-red-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {role === 'buyer' && <Check className="w-4 h-4 text-red-600" />}
                    {t('আমি বায়ার (কিনতে চাই)', 'Buyer (Buy Accounts)')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('seller')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      role === 'seller'
                        ? 'bg-red-50 border-red-500 text-red-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {role === 'seller' && <Check className="w-4 h-4 text-red-600" />}
                    {t('আমি সেলার (বিক্রি করব)', 'Seller (Sell Accounts)')}
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('ইমেইল অ্যাড্রেস', 'Email Address')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('আপনার ইমেইল লিখুন (e.g. name@gmail.com)', 'Enter your email')}
                autoComplete="email"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('পাসওয়ার্ড', 'Password')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('সংক্ষিপ্ত বায়ো (ঐচ্ছিক)', 'Short Bio (Optional)')}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder={t('আপনার ট্রেডিং অভিজ্ঞতা বা উদ্দেশ্য লিখুন...', 'Tell buyers or sellers about your background...')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-red-500 transition"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:via-rose-500 hover:to-amber-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-rose-600/30 hover:shadow-xl hover:shadow-rose-600/40 border border-white/20 transition-all duration-200 disabled:opacity-50 cursor-pointer active:scale-[0.98] mt-3 flex items-center justify-center gap-2.5 group"
          >
            <LogIn className="w-4 h-4 text-white transition-transform group-hover:translate-x-0.5" />
            <span>
              {loading
                ? t('যাচাই করা হচ্ছে...', 'Verifying...')
                : isLogin
                ? t('সাইন ইন করুন', 'Sign In')
                : t('অ্যাকাউন্ট তৈরি সম্পন্ন করুন', 'Complete Registration')}
            </span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400 font-semibold">
              {t('অথবা', 'or')}
            </span>
          </div>
        </div>

        {/* Official Sign in with Google Button matching user screenshot */}
        <button
          type="button"
          disabled={loading || googleSigningIn}
          onClick={() => setShowGoogleModal(true)}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs sm:text-sm shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 active:scale-[0.99] group"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="text-slate-700 group-hover:text-slate-900">
            {googleSigningIn
              ? t('Google দিয়ে যাচাই করা হচ্ছে...', 'Signing in with Google...')
              : t('Sign in with Google', 'Sign in with Google')}
          </span>
        </button>

        {/* Google Account Selector Dialog */}
        {showGoogleModal && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 animate-fade-in text-slate-900 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {t('Google দিয়ে সাইন ইন করুন', 'Sign in with Google')}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {t('একটি অ্যাকাউন্ট নির্বাচন করুন', 'Choose an account')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Google Account Options */}
              <div className="space-y-2">
                {/* 1. Super Admin: alifsheenshopping@gmail.com */}
                <button
                  type="button"
                  onClick={() =>
                    handleDirectGoogleSignIn({
                      email: 'alifsheenshopping@gmail.com',
                      name: 'Alif Sheen',
                      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AlifSheen'
                    })
                  }
                  className="w-full p-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-left transition flex items-center justify-between group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                      AS
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">Alif Sheen</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-600 text-white uppercase">
                          Admin
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 truncate block font-mono">
                        alifsheenshopping@gmail.com
                      </span>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 opacity-0 group-hover:opacity-100 transition" />
                </button>

                {/* 2. Verified Seller: apex.creators@gmail.com */}
                <button
                  type="button"
                  onClick={() =>
                    handleDirectGoogleSignIn({
                      email: 'apex.creators@gmail.com',
                      name: 'Apex Media Ventures',
                      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ApexMedia'
                    })
                  }
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      AM
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">Apex Media</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 uppercase">
                          Seller
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 truncate block font-mono">
                        apex.creators@gmail.com
                      </span>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-amber-600 shrink-0 opacity-0 group-hover:opacity-100 transition" />
                </button>

                {/* 3. Verified Buyer: investor.mark@gmail.com */}
                <button
                  type="button"
                  onClick={() =>
                    handleDirectGoogleSignIn({
                      email: 'investor.mark@gmail.com',
                      name: 'Mark Vance',
                      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MarkVance'
                    })
                  }
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      MV
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">Mark Vance</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800 uppercase">
                          Buyer
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 truncate block font-mono">
                        investor.mark@gmail.com
                      </span>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-blue-600 shrink-0 opacity-0 group-hover:opacity-100 transition" />
                </button>
              </div>

              {/* 4. Or custom Google Email Input */}
              <div className="pt-2 border-t border-slate-200">
                {!showCustomGoogleInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomGoogleInput(true)}
                    className="w-full py-2 px-3 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <span>+ {t('অন্য কোনো গুগল একাউন্ট লিখুন', 'Use another Google account')}</span>
                  </button>
                ) : (
                  <div className="space-y-2 pt-1 animate-fade-in">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {t('আপনার গুগল / জিমেইল অ্যাড্রেস লিখুন', 'Your Google Email')}
                      </label>
                      <input
                        type="email"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:border-red-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={customGoogleName}
                        onChange={(e) => setCustomGoogleName(e.target.value)}
                        placeholder={t('আপনার নাম (ঐচ্ছিক)', 'Your Name (Optional)')}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-red-500 focus:outline-hidden"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={!customGoogleEmail.trim() || googleSigningIn}
                      onClick={() =>
                        handleDirectGoogleSignIn({
                          email: customGoogleEmail.trim(),
                          name: customGoogleName.trim() || customGoogleEmail.split('@')[0]
                        })
                      }
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      {googleSigningIn ? t('যাচাই করা হচ্ছে...', 'Signing in...') : t('লগইন সম্পন্ন করুন', 'Continue with Google')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toggle Mode Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          {isLogin ? t('এখনো কোনো অ্যাকাউন্ট নেই?', "Don't have an account yet?") : t('ইতিমধ্যে অ্যাকাউন্ট আছে?', 'Already have an account?')}
          {' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-red-600 hover:underline font-bold cursor-pointer ml-1"
          >
            {isLogin ? t('নতুন অ্যাকাউন্ট রেজিস্ট্রেশন করুন', 'Register New Account') : t('এখানে সাইন ইন করুন', 'Sign In Here')}
          </button>
        </div>
      </div>
    </div>
  );
};
