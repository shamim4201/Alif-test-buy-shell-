import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

interface BrandLogoProps {
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  variant?: 'full' | 'icon-only';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  theme = 'dark',
  size = 'md',
  showSubtitle = true,
  className = '',
  variant = 'full'
}) => {
  const { language, t } = useCurrency();
  const isDark = theme === 'dark';

  // Responsive Sizing definitions for mobile and desktop
  const iconDimensions =
    size === 'xl'
      ? 'w-12 h-12 sm:w-14 sm:h-14'
      : size === 'lg'
      ? 'w-10 h-10 sm:w-12 sm:h-12'
      : size === 'sm'
      ? 'w-7 h-7 sm:w-8 sm:h-8'
      : 'w-8 h-8 sm:w-10 sm:h-10';

  const titleSize =
    size === 'xl'
      ? 'text-2xl sm:text-3xl md:text-4xl'
      : size === 'lg'
      ? 'text-lg sm:text-2xl md:text-3xl'
      : size === 'sm'
      ? 'text-xs sm:text-base'
      : 'text-sm sm:text-lg md:text-2xl';

  const badgeSize =
    size === 'xl'
      ? 'text-[10px] sm:text-xs px-2 py-0.5'
      : size === 'lg'
      ? 'text-[8.5px] sm:text-[10.5px] px-1.5 py-0.5'
      : size === 'sm'
      ? 'text-[7px] px-1 py-0.2'
      : 'text-[7.5px] sm:text-[9px] md:text-[10px] px-1 sm:px-1.5 py-0.5';

  const subtitleSize =
    size === 'xl'
      ? 'text-[9.5px] sm:text-[12px]'
      : size === 'lg'
      ? 'text-[8.5px] sm:text-[11px]'
      : size === 'sm'
      ? 'text-[6.5px] sm:text-[8px]'
      : 'text-[7px] sm:text-[9px] md:text-[10.5px]';

  const brandFirst = t('আলিফ', 'Alif');
  const brandSecond = t('ট্রাস্ট', 'Trust');
  const badgeText = t('বাই অ্যান্ড সেল', 'BUY & SELL');
  const subtitleText = t('আলিফ শীন গ্রুপ', 'alif sheen group');

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2.5 select-none ${className}`}>
      {/* ============================================================== */}
      {/* 1. CIRCULAR OFFICIAL APP EMBLEM (Requested Logo Icon from Image) */}
      {/* ============================================================== */}
      <div
        className={`${iconDimensions} rounded-full shrink-0 group-hover:scale-105 transition-transform duration-200 relative shadow-md shadow-blue-950/20`}
        title="Alif Trust Buy & Sell"
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          <defs>
            <linearGradient id="alifBlueEmblem" x1="15%" y1="10%" x2="85%" y2="90%">
              <stop offset="0%" stopColor="#1268f3" />
              <stop offset="50%" stopColor="#0a4dbd" />
              <stop offset="100%" stopColor="#06358c" />
            </linearGradient>
            <filter id="bagGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#021a44" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Outer Royal Blue Circle with Subtle Border */}
          <circle cx="60" cy="60" r="58" fill="url(#alifBlueEmblem)" />
          <circle cx="60" cy="60" r="56.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.8" />

          {/* White Shopping Bag Handles */}
          <path
            d="M45 37 C45 25, 63 25, 63 37"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* White Shopping Bag Body */}
          <path
            d="M34 37 L74 37 L78.5 71.5 C78.5 75.5 75 78 71 78 L37 78 C33 78 29.5 75.5 29.5 71.5 Z"
            fill="#FFFFFF"
            filter="url(#bagGlow)"
          />

          {/* Bold Blue 'A' Inside Shopping Bag */}
          <path
            d="M54 44.5 L45 68 H50.8 L52.6 63 H55.4 L57.2 68 H63 L54 44.5 Z M54 51 L55.2 58.5 H52.8 Z"
            fill="#0A4DBD"
          />

          {/* Curved Orange/Yellow Joyful Swoop Across 'A' */}
          <path
            d="M40.5 62 C47.5 64, 57 59.5, 68 53"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <path
            d="M40.5 62 C47.5 64, 57 59.5, 68 53"
            fill="none"
            stroke="#FBBF24"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* 3 Yellow Speed / Motion Lines Radiating on the Right */}
          <line x1="77" y1="44" x2="88" y2="44" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
          <line x1="79" y1="50.5" x2="92" y2="50.5" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
          <line x1="80.5" y1="57" x2="89.5" y2="57" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />

          {/* "Alif" Bold White Typography below bag */}
          <text
            x="54"
            y="93"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="16"
            letterSpacing="0.5"
          >
            Alif
          </text>

          {/* "trust buysell" Bright Yellow Script underneath */}
          <text
            x="54"
            y="105"
            textAnchor="middle"
            fill="#FACC15"
            fontFamily="'Brush Script MT', 'Segoe Script', cursive, sans-serif"
            fontWeight="bold"
            fontSize="9.5"
            fontStyle="italic"
            letterSpacing="0.2"
          >
            trust buysell
          </text>
        </svg>
      </div>

      {/* ============================================================== */}
      {/* 2. ORIGINAL BELOVED TYPOGRAPHY: AlifTrust + BUY & SELL Badge */}
      {/* ============================================================== */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col leading-none">
          {/* Main Brand Title + Buy&Sell badge */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
            <span
              className={`font-black tracking-tight whitespace-nowrap ${titleSize} ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {brandFirst}
              <span className="text-[#febd69] font-black ml-0.5">{brandSecond}</span>
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
      )}
    </div>
  );
};
