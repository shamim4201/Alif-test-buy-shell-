export type Language = 'BN' | 'EN';

export interface PlatformTranslation {
  id: string;
  name: string;
  desc: string;
  badge: string;
}

export interface AccountTypeTranslation {
  id: string;
  label: string;
}

export interface BudgetPresetTranslation {
  id: string;
  label: string;
  rangeHint: string;
}

export const PLATFORM_TRANSLATIONS: Record<string, { BN: PlatformTranslation; EN: PlatformTranslation }> = {
  all: {
    BN: { id: 'all', name: 'সকল অ্যাকাউন্ট (All Platforms)', desc: 'সব প্ল্যাটফর্মের ভেরিফাইড অ্যাকাউন্ট', badge: 'সব প্ল্যাটফর্ম' },
    EN: { id: 'all', name: 'All Accounts & Platforms', desc: 'Verified accounts across all platforms', badge: 'All Platforms' },
  },
  youtube: {
    BN: { id: 'youtube', name: '🔴 YouTube (ইউটিউব)', desc: 'মনিটাইজড ও ক্যাশ কাউ চ্যানেল', badge: 'মনিটাইজড' },
    EN: { id: 'youtube', name: '🔴 YouTube Channels', desc: 'Monetized & cash cow channels', badge: 'Monetized' },
  },
  facebook: {
    BN: { id: 'facebook', name: '🔵 Facebook (ফেসবুক)', desc: 'ইনস্ট্রিম অ্যাড ও গ্রিন পেজ', badge: 'গ্রিন কোয়ালিটি' },
    EN: { id: 'facebook', name: '🔵 Facebook Pages', desc: 'In-Stream Ads & Green quality pages', badge: 'Green Quality' },
  },
  tiktok: {
    BN: { id: 'tiktok', name: '🎵 TikTok (টিকটক)', desc: 'ক্রিয়েটর রিওয়ার্ডস ও শপ আইডি', badge: 'ক্রিয়েটর রিওয়ার্ডস' },
    EN: { id: 'tiktok', name: '🎵 TikTok Accounts', desc: 'Creator Rewards & TikTok Shop accounts', badge: 'Creator Rewards' },
  },
  instagram: {
    BN: { id: 'instagram', name: '📸 Instagram (ইনস্টাগ্রাম)', desc: 'থিম পেজ ও ইনফ্লুয়েন্সার অ্যাকাউন্ট', badge: 'ইনফ্লুয়েন্সার' },
    EN: { id: 'instagram', name: '📸 Instagram Pages', desc: 'Theme pages & influencer accounts', badge: 'Influencer' },
  },
  telegram: {
    BN: { id: 'telegram', name: '✈️ Telegram (টেলিগ্রাম)', desc: 'মেম্বার ও সিগন্যাল চ্যানেল', badge: 'সিগন্যাল চ্যানেল' },
    EN: { id: 'telegram', name: '✈️ Telegram Channels', desc: 'Active member & crypto signal channels', badge: 'Members' },
  },
  twitter: {
    BN: { id: 'twitter', name: '🐦 X / Twitter (টুইটার)', desc: 'ব্লু ব্যাজ ও এডস রেভিনিউ একাউন্ট', badge: 'ব্লু ব্যাজ' },
    EN: { id: 'twitter', name: '🐦 X / Twitter Handles', desc: 'Blue badge verified & ad revenue handles', badge: 'Verified' },
  },
};

export const ACCOUNT_TYPE_TRANSLATIONS: Record<string, { BN: string; EN: string }> = {
  all: { BN: 'সকল ক্যাটাগরি (All Types)', EN: 'All Categories' },
  facebook_page: { BN: 'ফেসবুক পেজ ও গ্রুপ (Facebook Page)', EN: 'Facebook Pages & Groups' },
  tiktok_viral: { BN: 'টিকটক ভাইরাল আইডি (TikTok Rewards)', EN: 'TikTok Viral Accounts (Rewards)' },
  instagram_theme: { BN: 'ইনস্টাগ্রাম থিম পেজ (Instagram)', EN: 'Instagram Theme Pages' },
  cooking_lifestyle: { BN: 'আন্টির রান্না ও কিচেন (Cooking & Food)', EN: 'Cooking & Lifestyle Channels' },
  faceless_cash_cow: { BN: 'ফেসলেস ক্যাশ কাউ (Cash Cow)', EN: 'Faceless Cash Cow Channels' },
  shorts_creator: { BN: 'ভাইরাল শর্টস চ্যানেল (Shorts)', EN: 'Viral Shorts / Reels Creators' },
  gaming_stream: { BN: 'গেমিং ও টেক চ্যানেল (Gaming)', EN: 'Gaming & Tech Stream Channels' },
  vintage_aged: { BN: 'ভিন্টেজ পুরানো একাউন্ট (Vintage 2012-2018)', EN: 'Aged / Vintage Accounts (2012-2018)' },
  high_cpm_finance: { BN: 'হাই CPM ফিন্যান্স ও বিজনেস', EN: 'High CPM Finance & Business' },
  vlog_personal: { BN: 'লাইফস্টাইল ভ্লগ ও ট্রাভেল', EN: 'Personal Lifestyle & Travel Vlogs' },
  education_tech: { BN: 'এডুকেশন ও টেক টিউটোরিয়াল', EN: 'Education & Tech Tutorials' },
  telegram_signal: { BN: 'টেলিগ্রাম সিগন্যাল চ্যানেল', EN: 'Telegram Signal & Community Channels' },
  twitter_crypto: { BN: 'টুইটার ক্রিপ্টো ও ওয়েব৩ আইডি', EN: 'X / Twitter Crypto & Web3 Accounts' },
  general: { BN: 'সাধারণ সোশ্যাল মিডিয়া একাউন্ট', EN: 'General Social Media Account' },
};

export const BUDGET_PRESET_TRANSLATIONS: Record<string, { BN: { label: string; bdt: string }; EN: { label: string; bdt: string } }> = {
  all: {
    BN: { label: 'সকল বাজেট', bdt: 'যেকোনো দাম' },
    EN: { label: 'All Budgets', bdt: 'Any price range' },
  },
  under_1k: {
    BN: { label: 'Under $1,000 (কম বাজেট)', bdt: '৳১,২২,০০০ এর নিচে' },
    EN: { label: 'Under $1,000 (Starter)', bdt: 'Under ৳122,000' },
  },
  '1k_3k': {
    BN: { label: '$1,000 – $3,000 (সাশ্রয়ী)', bdt: '৳১.২ লাখ – ৳৩.৬ লাখ' },
    EN: { label: '$1,000 – $3,000 (Budget)', bdt: '৳1.2L – ৳3.6L' },
  },
  '3k_8k': {
    BN: { label: '$3,000 – $8,000 (মিড রেঞ্জ)', bdt: '৳৩.৬ লাখ – ৳৯.৭ লাখ' },
    EN: { label: '$3,000 – $8,000 (Mid-Range)', bdt: '৳3.6L – ৳9.7L' },
  },
  '8k_15k': {
    BN: { label: '$8,000 – $15,000 (হাই রেভিনিউ)', bdt: '৳৯.৭ লাখ – ৳১৮ লাখ' },
    EN: { label: '$8,000 – $15,000 (High Revenue)', bdt: '৳9.7L – ৳18L' },
  },
  '15k_plus': {
    BN: { label: '$15,000+ (১০০K+ সিলভার)', bdt: '৳১৮ লাখের উপরে' },
    EN: { label: '$15,000+ (100K+ Silver Play Button)', bdt: 'Above ৳18 Lakh' },
  },
};

export const ORDER_STATUS_TRANSLATIONS: Record<string, { BN: string; EN: string }> = {
  pending: { BN: 'পেন্ডিং / অপেক্ষমাণ', EN: 'Pending Escrow Deposit' },
  payment_confirmed: { BN: 'পেমেন্ট নিশ্চিত (কাস্টডিতে সংরক্ষিত)', EN: 'Payment Secured in Custody' },
  transfer_in_progress: { BN: 'ওনারশিপ ট্রান্সফার চলমান', EN: 'Ownership Transfer in Progress' },
  completed: { BN: 'সফলভাবে সম্পন্ন', EN: 'Completed & Delivered' },
  cancelled: { BN: 'বাতিলকৃত', EN: 'Cancelled' },
  disputed: { BN: 'বিরোধ / ডিস্পিউট চলমান', EN: 'Under Dispute / Mediation' },
};

export const ROLE_TRANSLATIONS: Record<string, { BN: string; EN: string }> = {
  buyer: { BN: 'বায়ার (Buyer)', EN: 'Buyer' },
  seller: { BN: 'সেলার (Seller)', EN: 'Seller' },
  admin: { BN: 'অ্যাডমিন (Admin)', EN: 'Admin' },
};
