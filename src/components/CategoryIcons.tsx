import React from 'react';
import {
  Sparkles,
  ChefHat,
  Bot,
  Zap,
  Gamepad2,
  Landmark,
  TrendingUp,
  GraduationCap,
  Video,
  LayoutGrid
} from 'lucide-react';

interface IconProps {
  className?: string;
  size?: number | string;
}

/** Official Facebook SVG Logo */
export const FacebookLogo: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      fill="#1877F2"
    />
    <path
      d="M16.671 15.469l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.513V4.922s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v1.974H7.078v3.47h3.047v8.385a12.09 12.09 0 003.875 0v-8.385h2.671z"
      fill="#FFFFFF"
    />
  </svg>
);

/** Official YouTube SVG Logo */
export const YouTubeLogo: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      fill="#FF0000"
    />
    <polygon points="9.545,15.568 15.818,12 9.545,8.432" fill="#FFFFFF" />
  </svg>
);

/** Official TikTok SVG Logo */
export const TikTokLogo: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <rect width="24" height="24" rx="6" fill="#010101" />
    <path
      d="M16.6 8.2c-.8-.5-1.4-1.2-1.7-2.1h-2.3v10.5c0 1.2-1 2.2-2.2 2.2-1.2 0-2.2-1-2.2-2.2 0-1.2 1-2.2 2.2-2.2.3 0 .5 0 .8.1V12c-.3 0-.5-.1-.8-.1-2.6 0-4.6 2.1-4.6 4.6 0 2.6 2.1 4.6 4.6 4.6 2.6 0 4.6-2.1 4.6-4.6V9.9c1 .7 2.1 1.1 3.3 1.1v-2.4c-.6 0-1.2-.1-1.7-.4z"
      fill="#25F4EE"
      transform="translate(-0.6, -0.6)"
    />
    <path
      d="M16.6 8.2c-.8-.5-1.4-1.2-1.7-2.1h-2.3v10.5c0 1.2-1 2.2-2.2 2.2-1.2 0-2.2-1-2.2-2.2 0-1.2 1-2.2 2.2-2.2.3 0 .5 0 .8.1V12c-.3 0-.5-.1-.8-.1-2.6 0-4.6 2.1-4.6 4.6 0 2.6 2.1 4.6 4.6 4.6 2.6 0 4.6-2.1 4.6-4.6V9.9c1 .7 2.1 1.1 3.3 1.1v-2.4c-.6 0-1.2-.1-1.7-.4z"
      fill="#FE2C55"
      transform="translate(0.6, 0.6)"
    />
    <path
      d="M16.6 8.2c-.8-.5-1.4-1.2-1.7-2.1h-2.3v10.5c0 1.2-1 2.2-2.2 2.2-1.2 0-2.2-1-2.2-2.2 0-1.2 1-2.2 2.2-2.2.3 0 .5 0 .8.1V12c-.3 0-.5-.1-.8-.1-2.6 0-4.6 2.1-4.6 4.6 0 2.6 2.1 4.6 4.6 4.6 2.6 0 4.6-2.1 4.6-4.6V9.9c1 .7 2.1 1.1 3.3 1.1v-2.4c-.6 0-1.2-.1-1.7-.4z"
      fill="#FFFFFF"
    />
  </svg>
);

/** Official Instagram SVG Logo */
export const InstagramLogo: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="ig-grad-cat" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#ig-grad-cat)" />
    <rect x="5.5" y="5.5" width="13" height="13" rx="3.5" stroke="#FFFFFF" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="3.2" stroke="#FFFFFF" strokeWidth="1.8" />
    <circle cx="15.8" cy="8.2" r="0.9" fill="#FFFFFF" />
  </svg>
);

/** Official Telegram SVG Logo */
export const TelegramLogo: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path
      d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z"
      fill="#229ED9"
    />
    <path
      d="M5.4 11.9l12.4-4.8c.6-.2 1.1.1 1 .8l-2.1 10c-.2.7-.6.9-1.2.5l-3.3-2.4-1.6 1.5c-.2.2-.3.3-.6.3l.2-3.4 6.2-5.6c.3-.2-.1-.4-.4-.2l-7.7 4.9-3.3-1c-.7-.2-.7-.7.4-1.1z"
      fill="#FFFFFF"
    />
  </svg>
);

/** Official X / Twitter SVG Logo */
export const XLogo: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <rect width="24" height="24" rx="6" fill="#000000" />
    <path
      d="M17.4 4.5h2.1l-4.6 5.3 5.4 7.2h-4.3l-3.3-4.4-3.8 4.4H6.8l4.9-5.7L6.5 4.5h4.4l3 4 3.5-4zM16.7 15.7h1.2L9.8 5.7H8.6l8.1 10z"
      fill="#FFFFFF"
    />
  </svg>
);

/** All Platforms Hub Icon */
export const AllPlatformsLogo: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <div className={`rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-xs ${className}`}>
    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
  </div>
);

/** Universal Platform Logo Selector */
export const PlatformLogo: React.FC<{
  platform: string;
  className?: string;
  variant?: 'circle' | 'square' | 'clean';
}> = ({ platform, className = 'w-5 h-5' }) => {
  const p = (platform || '').toLowerCase();
  switch (p) {
    case 'youtube':
      return <YouTubeLogo className={className} />;
    case 'facebook':
      return <FacebookLogo className={className} />;
    case 'tiktok':
      return <TikTokLogo className={className} />;
    case 'instagram':
      return <InstagramLogo className={className} />;
    case 'telegram':
      return <TelegramLogo className={className} />;
    case 'twitter':
    case 'x':
      return <XLogo className={className} />;
    case 'all':
    default:
      return <AllPlatformsLogo className={className} />;
  }
};

/** Universal Category / Niche Logo Selector */
export const CategoryLogo: React.FC<{
  categoryId: string;
  className?: string;
}> = ({ categoryId, className = 'w-4 h-4' }) => {
  const id = (categoryId || '').toLowerCase();
  switch (id) {
    case 'facebook_page':
    case 'facebook':
      return <FacebookLogo className={className} />;
    case 'tiktok_viral':
    case 'tiktok':
      return <TikTokLogo className={className} />;
    case 'instagram_theme':
    case 'instagram':
      return <InstagramLogo className={className} />;
    case 'telegram_signal':
    case 'telegram':
      return <TelegramLogo className={className} />;
    case 'twitter_crypto':
    case 'twitter':
    case 'x':
      return <XLogo className={className} />;
    case 'youtube':
      return <YouTubeLogo className={className} />;
    case 'cooking_lifestyle':
      return (
        <span className={`inline-flex items-center justify-center rounded-md bg-amber-500 text-white shrink-0 shadow-2xs ${className}`}>
          <ChefHat className="w-[75%] h-[75%] stroke-[2.2]" />
        </span>
      );
    case 'faceless_cash_cow':
      return (
        <span className={`inline-flex items-center justify-center rounded-md bg-purple-600 text-white shrink-0 shadow-2xs ${className}`}>
          <Bot className="w-[75%] h-[75%] stroke-[2.2]" />
        </span>
      );
    case 'shorts_creator':
      return (
        <span className={`inline-flex items-center justify-center rounded-md bg-rose-600 text-white shrink-0 shadow-2xs ${className}`}>
          <Zap className="w-[75%] h-[75%] fill-white stroke-[1.8]" />
        </span>
      );
    case 'gaming_stream':
      return (
        <span className={`inline-flex items-center justify-center rounded-md bg-indigo-600 text-white shrink-0 shadow-2xs ${className}`}>
          <Gamepad2 className="w-[75%] h-[75%] stroke-[2.2]" />
        </span>
      );
    case 'vintage_aged':
      return (
        <span className={`inline-flex items-center justify-center rounded-md bg-amber-700 text-white shrink-0 shadow-2xs ${className}`}>
          <Landmark className="w-[75%] h-[75%] stroke-[2.2]" />
        </span>
      );
    case 'high_cpm_finance':
      return (
        <span className={`inline-flex items-center justify-center rounded-md bg-emerald-600 text-white shrink-0 shadow-2xs ${className}`}>
          <TrendingUp className="w-[75%] h-[75%] stroke-[2.2]" />
        </span>
      );
    case 'education_tech':
      return (
        <span className={`inline-flex items-center justify-center rounded-md bg-cyan-600 text-white shrink-0 shadow-2xs ${className}`}>
          <GraduationCap className="w-[75%] h-[75%] stroke-[2.2]" />
        </span>
      );
    case 'vlog_personal':
      return (
        <span className={`inline-flex items-center justify-center rounded-md bg-pink-600 text-white shrink-0 shadow-2xs ${className}`}>
          <Video className="w-[75%] h-[75%] stroke-[2.2]" />
        </span>
      );
    case 'all':
    default:
      return (
        <span className={`inline-flex items-center justify-center rounded-md bg-slate-800 text-white shrink-0 shadow-2xs ${className}`}>
          <LayoutGrid className="w-[75%] h-[75%] stroke-[2.2]" />
        </span>
      );
  }
};
