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
  const { authModal, closeAuthModal, login, register, showToast } = useAuth();
  const { t } = useCurrency();
  const [isLogin, setIsLogin] = useState(authModal.mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLogin(authModal.mode === 'login');
    setError(null);
    setEmail('');
    setPassword('');
  }, [authModal.mode, authModal.isOpen]);

  if (!authModal.isOpen) return null;

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
