import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

interface BrandLogoProps {
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  theme = 'dark',
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const { language, t } = useCurrency();
  const isDark = theme === 'dark';

  // Responsive Sizing definitions for mobile and desktop
  const iconSize = size === 'lg' ? 'w-9 h-9 sm:w-11 sm:h-11' : size === 'sm' ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-7 h-7 sm:w-9 sm:h-9';
  const titleSize = size === 'lg' ? 'text-lg sm:text-2xl md:text-3xl' : size === 'sm' ? 'text-xs sm:text-base' : 'text-sm sm:text-lg md:text-2xl';
  const subtitleSize = size === 'lg' ? 'text-[8.5px] sm:text-[11px]' : size === 'sm' ? 'text-[6.5px] sm:text-[8px]' : 'text-[7px] sm:text-[9px] md:text-[10.5px]';
  const badgeSize = size === 'sm' ? 'text-[7px] px-1 py-0.2' : 'text-[7.5px] sm:text-[9px] md:text-[10px] px-1 sm:px-1.5 py-0.5';

  const brandFirst = t('আলিফ', 'Alif');
  const brandSecond = t('ট্রাস্ট', 'Trust');
  const badgeText = t('বাই অ্যান্ড সেল', 'Buy & Sell');
  const subtitleText = t('আলিফ শীন গ্রুপ', 'alif sheen group');

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2.5 select-none ${className}`}>
      {/* Stylized Brand Emblem Icon */}
      <div
        className={`${iconSize} rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-400 via-red-600 to-rose-700 p-0.5 shadow-md shadow-red-900/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
      >
        <div className="w-full h-full rounded-[6px] sm:rounded-[10px] bg-[#131921] flex items-center justify-center relative overflow-hidden">
          {/* Subtle gold glow behind A */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-red-500/20" />
          
          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-400 relative z-10"
          >
            {/* Shield / Crown Silhouette */}
            <path
              d="M18 3L6 8V16C6 23.5 11.2 30.5 18 33C24.8 30.5 30 23.5 30 16V8L18 3Z"
              fill="url(#alifGrad)"
              opacity="0.25"
            />
            {/* Bold Stylized 'A' + Trust Arrow */}
            <path
              d="M18 7L10 24H14.5L16.2 20H19.8L21.5 24H26L18 7ZM18 13.2L19.1 17H16.9L18 13.2Z"
              fill="#FFFFFF"
            />
            {/* Trust Swoosh / Buy & Sell curve */}
            <path
              d="M11 25.5C14.5 28 21.5 28 25 25.5"
              stroke="#FBBF24"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Arrowhead on swoosh */}
            <path
              d="M23 24.5L25.8 25.4L24.5 28"
              stroke="#FBBF24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="alifGrad" x1="6" y1="3" x2="30" y2="33" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F59E0B" />
                <stop offset="1" stopColor="#DC2626" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Typography: Title + Subtitle */}
      <div className="flex flex-col leading-none">
        {/* Main Brand Title + Buy&Sell badge */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
          <span className={`font-black tracking-tight whitespace-nowrap ${titleSize} ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {brandFirst}<span className="text-[#febd69] font-black ml-0.5">{brandSecond}</span>
          </span>

          {/* Buy & Sell Designer Badge */}
          <span
            className={`${badgeSize} font-extrabold uppercase rounded-sm sm:rounded-md bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white tracking-wider shadow-xs border border-white/10 shrink-0 whitespace-nowrap`}
            title={t("যাচাইকৃত অ্যাকাউন্ট কেনাবেচা", "Buy & Sell Verified Assets")}
          >
            {badgeText}
          </span>
        </div>

        {/* Subtitle: alif sheen group */}
        {showSubtitle && (
          <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-400 shrink-0 opacity-80" />
            <span
              className={`${subtitleSize} font-bold tracking-[0.14em] sm:tracking-[0.22em] uppercase whitespace-nowrap ${
                isDark ? 'text-amber-300/90' : 'text-amber-700'
              }`}
            >
              {subtitleText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
