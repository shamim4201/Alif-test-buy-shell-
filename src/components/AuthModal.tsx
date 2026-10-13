import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { BrandLogo } from './BrandLogo';
import { X, Youtube, Mail, Lock, User as UserIcon, Check } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModal, closeAuthModal, login, register, quickSwitch } = useAuth();
  const { t } = useCurrency();
  const [isLogin, setIsLogin] = useState(authModal.mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authModal.isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ name, email, password, role, bio });
      }
    } catch (err: any) {
      setError(err.message || t('লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।', 'Authentication failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in text-slate-900">
        <button
          onClick={closeAuthModal}
          className="absolute right-5 top-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="mb-3">
            <BrandLogo theme="light" size="lg" showSubtitle={true} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {isLogin ? t('Alif Trust-এ সাইন ইন করুন', 'Sign In to Alif Trust') : t('নতুন অ্যাকাউন্ট তৈরি করুন', 'Create Your Account')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isLogin
              ? t('আপনার বায়ার বা সেলার ড্যাশবোর্ডে নিরাপদে প্রবেশ করুন', 'Access your buyer & seller dashboards securely')
              : t('সোশ্যাল মিডিয়া অ্যাকাউন্ট মার্কেটপ্লেসে যুক্ত হোন', 'Join the premier verified social asset marketplace')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Quick Demo Personas */}
        <div className="mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">
            {t('দ্রুত ডেমো সাইন-ইন (Instant Demo)', 'Instant Demo Sign-In')}
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                quickSwitch('buyer');
                closeAuthModal();
              }}
              className="px-2 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold transition text-center cursor-pointer"
            >
              {t('বায়ার (Buyer)', 'Buyer')}
            </button>
            <button
              type="button"
              onClick={() => {
                quickSwitch('seller');
                closeAuthModal();
              }}
              className="px-2 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold transition text-center cursor-pointer"
            >
              {t('টপ সেলার', 'Top Seller')}
            </button>
            <button
              type="button"
              onClick={() => {
                quickSwitch('admin');
                closeAuthModal();
              }}
              className="px-2 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition text-center cursor-pointer"
            >
              {t('অ্যাডমিন', 'Admin')}
            </button>
          </div>
        </div>

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('পুরো নাম বা কোম্পানির নাম', 'Full Name or Company')}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('যেমন: মিডিয়া ভেনচার্স', 'e.g. Media Ventures LLC')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('আপনার মূল উদ্দেশ্য (Primary Intent)', 'Primary Intent')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      role === 'buyer'
                        ? 'bg-red-50 border-red-500 text-red-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {role === 'buyer' && <Check className="w-3.5 h-3.5 text-red-600" />}
                    {t('আমি কিনতে চাই', 'I want to Buy')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('seller')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      role === 'seller'
                        ? 'bg-red-50 border-red-500 text-red-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {role === 'seller' && <Check className="w-3.5 h-3.5 text-red-600" />}
                    {t('আমি বিক্রি করতে চাই', 'I want to Sell')}
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('ইমেইল অ্যাড্রেস', 'Email Address')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-red-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-red-500 transition"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('সংক্ষিপ্ত বায়ো / অভিজ্ঞতা (ঐচ্ছিক)', 'Short Bio / Background (Optional)')}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder={t('আপনার কাজের অভিজ্ঞতা সম্পর্কে লিখুন...', 'Tell buyers or sellers about your media experience...')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-red-500 transition"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? t('প্রক্রিয়াধীন...', 'Processing...') : isLogin ? t('সাইন ইন করুন', 'Sign In') : t('ফ্রি অ্যাকাউন্ট তৈরি করুন', 'Create Free Account')}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-5 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          {isLogin ? t('এখনো কোনো অ্যাকাউন্ট নেই?', "Don't have an account yet?") : t('ইতিমধ্যে অ্যাকাউন্ট আছে?', 'Already have an account?')}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="ml-1.5 font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
          >
            {isLogin ? t('রেজিস্ট্রেশন করুন', 'Register now') : t('সাইন ইন', 'Sign In')}
          </button>
        </div>
      </div>
    </div>
  );
};
