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
    BN: { id: 'all', name: 'সকল প্ল্যাটফর্ম', desc: 'সব প্ল্যাটফর্মের যাচাইকৃত অ্যাকাউন্ট', badge: 'সব প্ল্যাটফর্ম' },
    EN: { id: 'all', name: 'All Platforms', desc: 'Verified accounts across all platforms', badge: 'All Platforms' },
  },
  youtube: {
    BN: { id: 'youtube', name: 'ইউটিউব চ্যানেল', desc: 'মনিটাইজড ও ক্যাশ কাউ চ্যানেল', badge: 'মনিটাইজড' },
    EN: { id: 'youtube', name: 'YouTube Channels', desc: 'Monetized & cash cow channels', badge: 'Monetized' },
  },
  facebook: {
    BN: { id: 'facebook', name: 'ফেসবুক পেজ', desc: 'ইনস্ট্রিম বিজ্ঞাপন ও গ্রিন পেজ', badge: 'গ্রিন কোয়ালিটি' },
    EN: { id: 'facebook', name: 'Facebook Pages', desc: 'In-Stream Ads & Green quality pages', badge: 'Green Quality' },
  },
  tiktok: {
    BN: { id: 'tiktok', name: 'টিকটক অ্যাকাউন্ট', desc: 'ক্রিয়েটর রিওয়ার্ডস ও শপ আইডি', badge: 'ক্রিয়েটর রিওয়ার্ডস' },
    EN: { id: 'tiktok', name: 'TikTok Accounts', desc: 'Creator Rewards & TikTok Shop accounts', badge: 'Creator Rewards' },
  },
  instagram: {
    BN: { id: 'instagram', name: 'ইনস্টাগ্রাম পেজ', desc: 'থিম পেজ ও ইনফ্লুয়েন্সার অ্যাকাউন্ট', badge: 'ইনফ্লুয়েন্সার' },
    EN: { id: 'instagram', name: 'Instagram Pages', desc: 'Theme pages & influencer accounts', badge: 'Influencer' },
  },
  telegram: {
    BN: { id: 'telegram', name: 'টেলিগ্রাম চ্যানেল', desc: 'মেম্বার ও সিগন্যাল চ্যানেল', badge: 'সিগন্যাল চ্যানেল' },
    EN: { id: 'telegram', name: 'Telegram Channels', desc: 'Active member & signal channels', badge: 'Members' },
  },
  twitter: {
    BN: { id: 'twitter', name: 'এক্স / টুইটার হ্যান্ডেল', desc: 'ব্লু ব্যাজ ও বিজ্ঞাপন আয় অ্যাকাউন্ট', badge: 'ব্লু ব্যাজ' },
    EN: { id: 'twitter', name: 'X / Twitter Handles', desc: 'Blue badge verified & ad revenue handles', badge: 'Verified' },
  },
};

export const ACCOUNT_TYPE_TRANSLATIONS: Record<string, { BN: string; EN: string }> = {
  all: { BN: 'সকল ক্যাটাগরি', EN: 'All Categories' },
  facebook_page: { BN: 'ফেসবুক পেজ ও গ্রুপ', EN: 'Facebook Pages & Groups' },
  tiktok_viral: { BN: 'টিকটক ভাইরাল অ্যাকাউন্ট', EN: 'TikTok Viral Accounts' },
  instagram_theme: { BN: 'ইনস্টাগ্রাম থিম পেজ', EN: 'Instagram Theme Pages' },
  cooking_lifestyle: { BN: 'রান্না ও লাইফস্টাইল', EN: 'Cooking & Lifestyle' },
  faceless_cash_cow: { BN: 'ফেসলেস ক্যাশ কাউ', EN: 'Faceless Cash Cow' },
  shorts_creator: { BN: 'ভাইরাল শর্টস ক্রিয়েটর', EN: 'Viral Shorts Creators' },
  gaming_stream: { BN: 'গেমিং ও টেক স্ট্রিম', EN: 'Gaming & Tech Stream' },
  vintage_aged: { BN: 'পুরানো ভিন্টেজ অ্যাকাউন্ট', EN: 'Aged Vintage Accounts' },
  high_cpm_finance: { BN: 'উচ্চ সিপিএম ফিন্যান্স ও বিজনেস', EN: 'High CPM Finance & Business' },
  vlog_personal: { BN: 'ব্যক্তিগত ভ্লগ ও ট্রাভেল', EN: 'Personal Lifestyle & Travel Vlogs' },
  education_tech: { BN: 'শিক্ষা ও টেক টিউটোরিয়াল', EN: 'Education & Tech Tutorials' },
  telegram_signal: { BN: 'টেলিগ্রাম সিগন্যাল চ্যানেল', EN: 'Telegram Signal & Community Channels' },
  twitter_crypto: { BN: 'টুইটার ক্রিপ্টো ও ওয়েব৩', EN: 'X / Twitter Crypto & Web3 Accounts' },
  general: { BN: 'সাধারণ সোশ্যাল মিডিয়া একাউন্ট', EN: 'General Social Media Account' },
};

export const BUDGET_PRESET_TRANSLATIONS: Record<string, { BN: { label: string; bdt: string }; EN: { label: string; bdt: string } }> = {
  all: {
    BN: { label: 'সকল বাজেট', bdt: 'যেকোনো দাম' },
    EN: { label: 'All Budgets', bdt: 'Any price range' },
  },
  under_1k: {
    BN: { label: '১,০০০ ডলারের নিচে', bdt: '৳১,২২,০০০ এর নিচে' },
    EN: { label: 'Under $1,000', bdt: 'Under ৳122,000' },
  },
  '1k_3k': {
    BN: { label: '১,০০০ – ৩,০০০ ডলার', bdt: '৳১.২ লাখ – ৳৩.৬ লাখ' },
    EN: { label: '$1,000 – $3,000', bdt: '৳1.2L – ৳3.6L' },
  },
  '3k_8k': {
    BN: { label: '৩,০০০ – ৮,০০০ ডলার', bdt: '৳৩.৬ লাখ – ৳৯.৭ লাখ' },
    EN: { label: '$3,000 – $8,000', bdt: '৳3.6L – ৳9.7L' },
  },
  '8k_15k': {
    BN: { label: '৮,০০০ – ১৫,০০০ ডলার', bdt: '৳৯.৭ লাখ – ৳১৮ লাখ' },
    EN: { label: '$8,000 – $15,000', bdt: '৳9.7L – ৳18L' },
  },
  '15k_plus': {
    BN: { label: '১৫,০০০ ডলারের উপরে', bdt: '৳১৮ লাখের উপরে' },
    EN: { label: '$15,000+ (Silver Play Button)', bdt: 'Above ৳18 Lakh' },
  },
};

export const ORDER_STATUS_TRANSLATIONS: Record<string, { BN: string; EN: string }> = {
  pending: { BN: 'অপেক্ষমাণ কাস্টডি ডিপোজিট', EN: 'Pending Escrow Deposit' },
  payment_confirmed: { BN: 'পেমেন্ট কাস্টডিতে নিশ্চিত', EN: 'Payment Secured in Custody' },
  transfer_in_progress: { BN: 'ওনারশিপ হস্তান্তর চলমান', EN: 'Ownership Transfer in Progress' },
  completed: { BN: 'সফলভাবে সম্পন্ন', EN: 'Completed & Delivered' },
  cancelled: { BN: 'বাতিলকৃত', EN: 'Cancelled' },
  disputed: { BN: 'বিরোধ ও নিষ্পত্তি চলমান', EN: 'Under Dispute / Mediation' },
};

export const ROLE_TRANSLATIONS: Record<string, { BN: string; EN: string }> = {
  buyer: { BN: 'ক্রেতা', EN: 'Buyer' },
  seller: { BN: 'বিক্রেতা', EN: 'Seller' },
  admin: { BN: 'অ্যাডমিন', EN: 'Admin' },
};

export interface LocalizedChannelData {
  title: string;
  description: string;
  niche: string;
  primaryLanguage: string;
  sellerName?: string;
}

export const CHANNEL_DICTIONARY: Record<string, { BN: LocalizedChannelData; EN: LocalizedChannelData }> = {
  chn_apex_gaming: {
    BN: {
      title: 'অ্যাপেক্স ট্যাকটিক্যাল গেমিং ও টেক (মনিটাইজড ক্যাশ কাউ)',
      description: 'উচ্চ এনগেজমেন্টের গেমিং চ্যানেল, ট্যাকটিক্যাল শুটার ও টেক কন্টেন্ট। ক্লিন অ্যাডসেন্স ও কপিরাইট স্ট্রাইকমুক্ত একাউন্ট।',
      niche: 'গেমিং',
      primaryLanguage: 'ইংরেজি ও বাংলা সাবটাইটেল',
      sellerName: 'অ্যাপেক্স স্টুডিও ভেঞ্চারস'
    },
    EN: {
      title: 'Apex Tactical Gaming & Tech (Monetized Cash Cow)',
      description: 'High-engagement gaming channel featuring tactical gameplay and tech reviews. Clean AdSense history and active community.',
      niche: 'Gaming',
      primaryLanguage: 'English & Bengali Subtitles',
      sellerName: 'Apex Studio Ventures'
    }
  },
  chn_daily_mindset: {
    BN: {
      title: 'ডেইলি স্টোয়িক উইজডম ও মোটিভেশন (ফেসলেস ক্যাশ কাউ)',
      description: 'অটোমেটেড ফেসলেস ফিলোসফি ও মোটিভেশন চ্যানেল। ভাইরাল শর্টস ও লং-ফর্ম কন্টেন্ট থেকে নিয়মিত মাসিক আয়।',
      niche: 'শিক্ষা ও দর্শন',
      primaryLanguage: 'ইংরেজি',
      sellerName: 'এলেনা রস্তোভা'
    },
    EN: {
      title: 'Daily Stoic Wisdom & Focus (Faceless Cash Cow)',
      description: 'Automated faceless stoic philosophy channel with viral shorts and evergreen long-form videos generating steady revenue.',
      niche: 'Education & Philosophy',
      primaryLanguage: 'English',
      sellerName: 'Elena Rostova'
    }
  },
  chn_crypto_alpha: {
    BN: {
      title: 'ক্রিপ্টো আলফা রাডার (উচ্চ সিপিএম ফিন্যান্স)',
      description: 'প্রিমিয়াম ওয়েব৩ ও ক্রিপ্টোকারেন্সি অ্যানালাইসিস চ্যানেল। ইউএসএ, ইউকে ও জার্মানির উচ্চ সিপিএম দর্শক।',
      niche: 'ফিন্যান্স ও বিজনেস',
      primaryLanguage: 'ইংরেজি',
      sellerName: 'এলেনা রস্তোভা'
    },
    EN: {
      title: 'Crypto Alpha Radar (High CPM Finance)',
      description: 'Premium Web3, cryptocurrency, and macro finance channel. High CPM tier-1 audience located primarily in USA and UK.',
      niche: 'Finance & Business',
      primaryLanguage: 'English',
      sellerName: 'Elena Rostova'
    }
  },
  chn_gourmet_kitchen: {
    BN: {
      title: 'কুইকবাইট গুরমে কিচেন (রান্না ও সহজ রেসিপি)',
      description: 'সহজ রেসিপি ও কিচেন টিপসের চ্যানেল। গ্লোবাল অর্গানিক অডিয়েন্স ও স্পনসরশিপ প্রস্তুত।',
      niche: 'লাইফস্টাইল ও রান্না',
      primaryLanguage: 'ইংরেজি',
      sellerName: 'অ্যাপেক্স স্টুডিও ভেঞ্চারস'
    },
    EN: {
      title: 'QuickBite Gourmet Kitchen (Cooking & Recipes)',
      description: 'Rapid cooking recipes, culinary hacks, and kitchenware reviews. Highly engaged global foodie demographic.',
      niche: 'Lifestyle & Cooking',
      primaryLanguage: 'English',
      sellerName: 'Apex Studio Ventures'
    }
  },
  chn_lofi_cafe: {
    BN: {
      title: 'টোকিও রেইন লোফাই ক্যাফে (এভারগ্রিন মিউজিক স্ট্রিম)',
      description: 'চিল লোফাই বিটস ও অ্যাম্বিয়েন্ট স্টাডি মিউজিক স্ট্রিম। নিজস্ব রয়্যালটি-ফ্রি মিউজিক লাইব্রেরিসহ সম্পূর্ণ ওনারশিপ।',
      niche: 'মিউজিক ও লোফাই',
      primaryLanguage: 'ইন্সট্রুমেন্টাল মিউজিক',
      sellerName: 'অ্যাপেক্স স্টুডিও ভেঞ্চারস'
    },
    EN: {
      title: 'Tokyo Rain Lofi Cafe (Evergreen Music Stream)',
      description: 'Chill lofi beats, ambient rain visuals, and 24/7 study radio. 100% original royalty-free audio tracks included.',
      niche: 'Music & Lofi',
      primaryLanguage: 'Instrumental Music',
      sellerName: 'Apex Studio Ventures'
    }
  },
  chn_pending_fitness: {
    BN: {
      title: 'কোরফোর্জ এলিট ওয়ার্কআউট (ফিটনেস ও স্বাস্থ্য)',
      description: 'হোম ওয়ার্কআউট, স্ট্রেন্থ ট্রেনিং ও হেলথ টিপস চ্যানেল। ব্র্যান্ড স্পনসরশিপের জন্য দারুণ উপযোগী।',
      niche: 'ফিটনেস ও হেলথ',
      primaryLanguage: 'ইংরেজি',
      sellerName: 'এলেনা রস্তোভা'
    },
    EN: {
      title: 'CoreForge Elite Workouts (Fitness & Health)',
      description: 'Home fitness workout routines, bodyweight strength guides, and clean organic audience ideal for sponsorships.',
      niche: 'Fitness & Health',
      primaryLanguage: 'English',
      sellerName: 'Elena Rostova'
    }
  },
  chn_auntie_kitchen: {
    BN: {
      title: "আন্টি ফাতিমার ভিলেজ কিচেন (আন্টির ভিলেজ কিচেন ও রান্না রেসিপি)",
      description: 'জনপ্রিয় ফ্যামিলি ও ভিলেজ কুকিং চ্যানেল। ১০০% রিয়েল অর্গানিক অডিয়েন্স, ইউএসএ, ইউকে ও মধ্যপ্রাচ্যের দর্শক। সিলভার প্লে বাটনসহ সম্পূর্ণ ক্লিন স্ট্রাইক হিস্ট্রি ও অ্যাডসেন্স সক্রিয়।',
      niche: 'লাইফস্টাইল ও রান্না',
      primaryLanguage: 'বাংলা ও ইংরেজি সাবটাইটেল',
      sellerName: 'আন্টি ফাতিমা কিচেন'
    },
    EN: {
      title: "Auntie Fatima's Village Kitchen (Traditional Cooking Recipes)",
      description: 'Popular family & village cooking channel. 100% organic audience across USA, UK, Middle East, and South Asia. Clean strike history with Silver Creator Award and active AdSense.',
      niche: 'Lifestyle & Cooking',
      primaryLanguage: 'Bengali & English Subtitles',
      sellerName: 'Auntie Fatima Kitchen'
    }
  },
  chn_auntie_bakes: {
    BN: {
      title: "আন্টি রুবির সুইটস ও ঘরোয়া স্ন্যাক্স (আন্টির সহজ রেসিপি)",
      description: 'কম বাজেটের হোম বেকিং, মিষ্টি ও কিচেন স্নাক্স চ্যানেল। ১০০% মনিটাইজড, কোনো কপিরাইট নেই। নতুন বায়ারদের জন্য পারফেক্ট সাশ্রয়ী স্টার্টার অ্যাকাউন্ট।',
      niche: 'লাইফস্টাইল ও বেকিং',
      primaryLanguage: 'বাংলা ও ইংরেজি',
      sellerName: 'আন্টি রুবি স্ন্যাক্স'
    },
    EN: {
      title: "Auntie Ruby's Quick Sweets & Homemade Snacks",
      description: 'Budget-friendly home baking, traditional sweets, and quick snacks channel. 100% monetized with clean copyright history. Perfect affordable starter asset.',
      niche: 'Lifestyle & Baking',
      primaryLanguage: 'Bengali & English',
      sellerName: 'Auntie Ruby Snacks'
    }
  },
  chn_micro_diy: {
    BN: {
      title: 'ক্রাফটনেস্ট ডিআইওয়াই হ্যাকস ও সহজ টিপস (মাইক্রো-বাজেট স্টার্টার)',
      description: 'কম বাজেটের ক্রাফট ও ডেইলি লাইফ হ্যাকস চ্যানেল। নতুন ক্রিয়েটরদের জন্য সাশ্রয়ী শুরু ও অবিলম্বে ওনারশিপ হস্তান্তর।',
      niche: 'লাইফস্টাইল ও ডিআইওয়াই',
      primaryLanguage: 'ইংরেজি',
      sellerName: 'অ্যাপেক্স স্টুডিও ভেঞ্চারস'
    },
    EN: {
      title: 'CraftNest DIY Hacks & Quick Fixes (Micro-Budget Starter)',
      description: 'Low-cost starter DIY craft and everyday life hacks channel. Great for beginners seeking an instant monetized asset with immediate transfer.',
      niche: 'Lifestyle & DIY',
      primaryLanguage: 'English',
      sellerName: 'Apex Studio Ventures'
    }
  },
  chn_viral_shorts: {
    BN: {
      title: 'স্ন্যাপফ্যাক্টস ভাইরাল শর্টস (১৫M+ মাসিক ভিউ)',
      description: 'প্রতি মাসে ১৫ মিলিয়নের বেশি ভিউ পাওয়া ভাইরাল শর্টস চ্যানেল। সম্পূর্ণ অটোমেটেড কন্টেন্ট প্রোডাকশন সিস্টেমসহ হস্তান্তর।',
      niche: 'শিক্ষা ও শর্টস',
      primaryLanguage: 'ইংরেজি',
      sellerName: 'অ্যাপেক্স স্টুডিও ভেঞ্চারস'
    },
    EN: {
      title: 'SnapFacts Viral Shorts (15M+ Monthly Views)',
      description: 'Explosive viral shorts channel with over 15 million monthly views. Includes automated video generation workflow and clean AdSense.',
      niche: 'Education & Shorts',
      primaryLanguage: 'English',
      sellerName: 'Apex Studio Ventures'
    }
  },
  chn_vintage_2014: {
    BN: {
      title: 'টেকরেট্রো ভল্ট (২০১৪ ভিন্টেজ ইউটিউব চ্যানেল)',
      description: '২০১৪ সালের বিরল ভিন্টেজ অ্যাকাউন্ট। উচ্চ অ্যালগরিদম ট্রাস্ট স্কোর ও তাৎক্ষণিক ভিডিও র‍্যাংকিং সুবিধা।',
      niche: 'টেকনোলজি',
      primaryLanguage: 'ইংরেজি',
      sellerName: 'এলেনা রস্তোভা'
    },
    EN: {
      title: 'TechRetro Vault (2014 Aged YouTube Channel)',
      description: 'Rare aged 2014 YouTube channel with high authority trust score. Ideal for algorithmic ranking and instant niche authority.',
      niche: 'Technology',
      primaryLanguage: 'English',
      sellerName: 'Elena Rostova'
    }
  },
  acc_fb_viral_media: {
    BN: {
      title: 'বিডি ভাইরাল মিডিয়া অ্যান্ড এন্টারটেইনমেন্ট (ফেসবুক পেজ - ৪৫০K ফলোয়ার)',
      description: 'গ্রিন কোয়ালিটি সম্পন্ন ফেসবুক এন্টারটেইনমেন্ট পেজ। ইন-স্ট্রিম অ্যাডস ও রিলস মনিটাইজেশন সক্রিয় এবং সম্পূর্ণ ক্লিন পলিসি।',
      niche: 'এন্টারটেইনমেন্ট',
      primaryLanguage: 'বাংলা ও ইংরেজি',
      sellerName: 'ডিজিটাল মিডিয়া ল্যাব'
    },
    EN: {
      title: 'BD Viral Media & Entertainment (Facebook Page - 450K Followers)',
      description: 'High-reach entertainment Facebook page with Green Page Quality and active In-Stream ads monetization. Clean policy standing.',
      niche: 'Entertainment',
      primaryLanguage: 'Bengali & English',
      sellerName: 'Digital Media Lab'
    }
  },
  acc_fb_kitchen_page: {
    BN: {
      title: 'বাংলার কিচেন ও সহজ রেসিপি (ফেসবুক মনিটাইজড পেজ - ১২৫K ফলোয়ার)',
      description: 'মনিটাইজড রন্ধনশিল্প ফেসবুক পেজ। ১০০% অর্গানিক দর্শক ও সম্পূর্ণ পেআউট অ্যাকাউন্ট হস্তান্তরের সুযোগ।',
      niche: 'রান্না ও লাইফস্টাইল',
      primaryLanguage: 'বাংলা',
      sellerName: 'বাংলার কিচেন'
    },
    EN: {
      title: 'Banglar Kitchen & Easy Recipes (Facebook Monetized Page - 125K Followers)',
      description: 'Monetized culinary Facebook page with 100% organic regional audience. Ready for instant payout setup and clean ownership handover.',
      niche: 'Cooking & Lifestyle',
      primaryLanguage: 'Bengali',
      sellerName: 'Banglar Kitchen'
    }
  },
  acc_tt_viral_comedy: {
    BN: {
      title: 'ট্রেন্ডভাইব ভাইরাল কমেডি (টিকটক ৩২০K - ক্রিয়েটর রিওয়ার্ডস)',
      description: 'ক্রিয়েটর রিওয়ার্ডস প্রোগ্রামে অন্তর্ভুক্ত টিকটক অ্যাকাউন্ট। টায়ার-১ দেশের দর্শকদের সাথে উচ্চ এনগেজমেন্ট ও সক্রিয় পেআউট।',
      niche: 'কমেডি ও এন্টারটেইনমেন্ট',
      primaryLanguage: 'ইংরেজি',
      sellerName: 'ভাইরাল ক্রিয়েটর নেটওয়ার্ক'
    },
    EN: {
      title: 'TrendVibe Viral POV & Comedy (TikTok 320K - Creator Rewards)',
      description: 'Top-tier TikTok account enrolled in Creator Rewards program. High RPM tier-1 demographic engagement and active payouts.',
      niche: 'Comedy & Entertainment',
      primaryLanguage: 'English',
      sellerName: 'Viral Creator Network'
    }
  },
  acc_tt_smart_gadgets: {
    BN: {
      title: 'স্মার্টগ্যাজেট ডিলস ও শর্টস (টিকটক ৮৫K - শপ অ্যাফিলিয়েট)',
      description: 'টিকটক শপ অ্যাফিলিয়েট অ্যাকাউন্ট। গ্যাজেট ও টেক এক্সেসরিজ প্রমোশন থেকে নিয়মিত কমিশন আয় এবং সম্পূর্ণ ভেরিফাইড।',
      niche: 'টেক ও গ্যাজেট',
      primaryLanguage: 'ইংরেজি',
      sellerName: 'স্মার্ট গ্যাজেটস'
    },
    EN: {
      title: 'SmartGadget Deals & Shorts (TikTok 85K - Shop Affiliate)',
      description: 'Fast-growing TikTok Shop affiliate account generating steady commissions from tech accessories and gadgets.',
      niche: 'Tech & Gadgets',
      primaryLanguage: 'English',
      sellerName: 'Smart Gadgets'
    }
  },
  acc_ig_billionaire_drive: {
    BN: {
      title: 'দ্য বিলিয়নেয়ার ড্রাইভ (ইনস্টাগ্রাম ১৯৫K লাক্সারি থিম পেজ)',
      description: 'লাক্সারি লাইফস্টাইল ও সুপারকার নান্দনিক থিম পেজ। ব্যাপক অর্গানিক রিচ ও পেইড প্রমোশন পার্টনারশিপ সুবিধা।',
      niche: 'লাক্সারি ও লাইফস্টাইল',
      primaryLanguage: 'ইংরেজি',
      sellerName: 'লাক্সারি মিডিয়া গ্রুপ'
    },
    EN: {
      title: 'The Billionaire Drive (Instagram 195K Luxury Theme Page)',
      description: 'Elite luxury and supercar aesthetic Instagram theme page with massive organic engagement and brand sponsor requests.',
      niche: 'Luxury & Lifestyle',
      primaryLanguage: 'English',
      sellerName: 'Luxury Media Group'
    }
  },
  acc_ig_chic_style: {
    BN: {
      title: 'চিকস্টাইল ডেইলি ইনস্পো (ইনস্টাগ্রাম ৬৮K ফ্যাশন পেজ)',
      description: 'মহিলাদের ফ্যাশন ও লাইফস্টাইল কিউরেশন পেজ। সম্পূর্ণ অর্গানিক ফলোয়ার ও অ্যাক্টিভ কোলাবোরেশন।',
      niche: 'ফ্যাশন ও বিউটি',
      primaryLanguage: 'ইংরেজি',
      sellerName: 'চিকস্টাইল স্টুডিও'
    },
    EN: {
      title: 'ChicStyle Daily Inspo (Instagram 68K Fashion Page)',
      description: 'Aesthetic female fashion and lifestyle curation page with clean audit score and active brand collaboration inquiries.',
      niche: 'Fashion & Beauty',
      primaryLanguage: 'English',
      sellerName: 'ChicStyle Studio'
    }
  },
  acc_tg_crypto_alpha: {
    BN: {
      title: 'ক্রিপ্টো হোয়েল আলফা সিগন্যালস (টেলিগ্রাম ৪৮K মেম্বার চ্যানেল)',
      description: 'অ্যাক্টিভ ক্রিপ্টো ট্রেডিং ও সিগন্যাল টেলিগ্রাম চ্যানেল। প্রাইমারি ওনারশিপ সরাসরি হস্তান্তরযোগ্য এবং কোনো বট নেই।',
      niche: 'ক্রিপ্টো ও ট্রেডিং',
      primaryLanguage: 'ইংরেজি',
      sellerName: 'আলফা সিগন্যালস'
    },
    EN: {
      title: 'Crypto Whale Alpha Signals (Telegram 48K Members Channel)',
      description: 'Highly active cryptocurrency signal and trading channel with verified ownership transfer and zero bots.',
      niche: 'Crypto & Trading',
      primaryLanguage: 'English',
      sellerName: 'Alpha Signals'
    }
  },
  acc_x_ai_radar: {
    BN: {
      title: 'এআই ডেইলি ও ওয়েব৩ রাডার (এক্স / টুইটার ৭৫K ফলোয়ার - ব্লু ভেরিফাইড)',
      description: 'ব্লু ব্যাজ ভেরিফাইড এক্স/টুইটার অ্যাকাউন্ট। টেক ও এআই নিউজ কভারেজসহ অ্যাড রেভিনিউ শেয়ারিং সক্রিয়।',
      niche: 'এআই ও টেকনোলজি',
      primaryLanguage: 'ইংরেজি',
      sellerName: 'এআই রাডার'
    },
    EN: {
      title: 'AI Daily & Web3 Radar (X / Twitter 75K Followers - Blue Verified)',
      description: 'Official Blue Verified X / Twitter account covering tech breakthroughs and developer news with Ad Revenue Sharing.',
      niche: 'AI & Technology',
      primaryLanguage: 'English',
      sellerName: 'AI Radar'
    }
  }
};

export const REVIEW_DICTIONARY: Record<string, { BN: { comment: string; buyerName: string; channelTitle: string }; EN: { comment: string; buyerName: string; channelTitle: string } }> = {
  rev_101: {
    BN: {
      comment: 'অসাধারণ ও নিরাপদ হস্তান্তর প্রক্রিয়া! সেলার আমাকে ধাপে ধাপে ৭ দিনের গুগল ব্র্যান্ড অ্যাকাউন্ট হ্যান্ডওভার সম্পন্ন করে দিয়েছেন। স্টুডিওর সমস্ত অ্যানালিটিক্স ১০০% মিলে গেছে।',
      buyerName: 'মার্ক স্টার্লিং (স্টার্লিং ক্যাপিটাল)',
      channelTitle: 'ডেইলি স্টোয়িক উইজডম ও মোটিভেশন'
    },
    EN: {
      comment: 'Flawless acquisition process! The seller walked me through the 7-day Google Brand Account manager handover step-by-step. All analytics matched 100%. Highly recommended seller!',
      buyerName: 'Mark Sterling (Sterling Capital)',
      channelTitle: 'Daily Stoic Wisdom & Focus'
    }
  },
  rev_102: {
    BN: {
      comment: 'অসাধারণ চ্যানেল! অর্গানিক ভিউয়ার্স এবং ভিডিও আপলোড করার পর দিন থেকেই ভালো ভিউ পাচ্ছি। সেলার পুরো প্রাইমারি ওনারশিপ বুঝিয়ে দিয়েছেন এবং ৭ দিন পর সফলভাবে হ্যান্ডওভার সম্পন্ন হয়েছে।',
      buyerName: 'তানভীর আহমেদ (কনটেন্ট ক্রিয়েটর)',
      channelTitle: "আন্টি ফাতিমার ভিলেজ কিচেন"
    },
    EN: {
      comment: 'Outstanding channel! Organic viewers and great engagement right after uploading new videos. The seller completed the primary ownership transfer flawlessly after 7 days.',
      buyerName: 'Tanvir Ahmed (Content Creator)',
      channelTitle: "Auntie Fatima's Village Kitchen"
    }
  },
  rev_103: {
    BN: {
      comment: 'অ্যাডসেন্স সম্পূর্ণ ভেরিফাইড ছিল এবং পিন ভেরিফিকেশন ঠিকঠাক। ১০০% বিশ্বস্ত ও নিরাপদ লেনদেন হয়েছে।',
      buyerName: 'রাকিবুল হাসান (ফুডি হাব)',
      channelTitle: "আন্টি ফাতিমার ভিলেজ কিচেন"
    },
    EN: {
      comment: 'AdSense was completely verified and PIN verification was intact. 100% trustworthy and safe transaction.',
      buyerName: 'Rakibul Hasan (Foodie Hub)',
      channelTitle: "Auntie Fatima's Village Kitchen"
    }
  },
  rev_104: {
    BN: {
      comment: 'চমৎকার অভিজ্ঞতা! সিলভার প্লে বাটনটি আসল এবং স্টুডিও অ্যানালিটিক্স স্ক্রিনশট ১০০% সঠিক ছিল। ৫-স্টার রেটিংয়ের সম্পূর্ণ দাবিদার!',
      buyerName: 'শাকিল রহমান (ক্রিয়েটর হাব)',
      channelTitle: "আন্টি ফাতিমার ভিলেজ কিচেন"
    },
    EN: {
      comment: 'Amazing experience. Silver play button is genuine and analytics screenshots were 100% accurate. 5-star rating deserved!',
      buyerName: 'Shakil Rahman (Creator Hub)',
      channelTitle: "Auntie Fatima's Village Kitchen"
    }
  },
  rev_105: {
    BN: {
      comment: 'একাউন্টের বয়স এবং মনিটাইজেশন ক্লিন স্ট্রাইক। রেসিপি চ্যানেলটি কিনে আমি অত্যন্ত সন্তুষ্ট। পুরো সাপোর্ট দেওয়ার জন্য ধন্যবাদ।',
      buyerName: 'সাদিয়া ইসলাম',
      channelTitle: "আন্টি রুবির সহজ সুইটস রেসিপি"
    },
    EN: {
      comment: 'Account age and clean monetization strikes were confirmed. Very happy with the recipe channel acquisition. Thank you for the full guidance.',
      buyerName: 'Sadia Islam',
      channelTitle: "Auntie Ruby's Quick Sweets & Snacks"
    }
  },
  rev_106: {
    BN: {
      comment: 'ব্র্যান্ড অ্যাকাউন্টের মাধ্যমে মসৃণ হস্তান্তর। চমৎকার এস্ক্রো নিরাপত্তা ব্যবস্থা ও দ্রুত যোগাযোগ।',
      buyerName: 'ডেভিড মিলার',
      channelTitle: 'পিক্সেল ওডিসি রেট্রো গেমিং'
    },
    EN: {
      comment: 'Seamless transfer via Brand Account. Highly trustworthy escrow system with prompt communication.',
      buyerName: 'David Miller',
      channelTitle: 'Pixel Odyssey Retro Gaming'
    }
  },
  rev_107: {
    BN: {
      comment: 'স্টুডিওতে উচ্চ আরপিএম প্রমাণিত। সেলার দ্রুত উত্তর দিয়েছেন এবং ৭ দিনের নিয়মে পূর্ণ সহায়তা করেছেন।',
      buyerName: 'নাফিস চৌধুরী',
      channelTitle: 'ক্রিপ্টো আলফা রাডার'
    },
    EN: {
      comment: 'High RPM verified on Studio. Elena provided swift response and complete cooperation throughout the 7-day protocol.',
      buyerName: 'Nafis Chowdhury',
      channelTitle: 'Crypto Alpha Radar'
    }
  },
  rev_108: {
    BN: {
      comment: 'অনলাইনে চ্যানেল কেনা নিয়ে অনেক ভয় ছিল, কিন্তু আলিফ ট্রাস্টের এস্ক্রো সিস্টেম আমাকে ১০০% নিশ্চিন্ত করেছে। যতক্ষণ না আমি নিজে গুগল ব্র্যান্ড একাউন্টের প্রাইমারি ওনার হলাম, ততক্ষণ সেলার কোনো টাকা পায়নি। কোনো প্রতারণার সুযোগ নেই, সবচেয়ে বিশ্বস্ত প্ল্যাটফর্ম!',
      buyerName: 'ফারহান মাহমুদ (ডিজিটাল মিডিয়া)',
      channelTitle: "আন্টি ফাতিমার ভিলেজ কিচেন"
    },
    EN: {
      comment: 'I was worried about buying channels online, but Alif Trust escrow custody gave me 100% peace of mind. Until I became primary owner, funds remained locked. No chance of fraud, most trusted marketplace!',
      buyerName: 'Farhan Mahmud (Digital Media)',
      channelTitle: "Auntie Fatima's Village Kitchen"
    }
  },
  rev_109: {
    BN: {
      comment: 'এখানে কোনো পাসওয়ার্ড চাওয়া হয় না, যা সবচেয়ে বড় সিকিউরিটি! অফিশিয়াল ইউটিউব স্টুডিও ওনারশিপ ট্রান্সফারের নিয়মে সব সুন্দরভাবে সম্পন্ন হয়েছে। সাপোর্ট টিম প্রতি মুহূর্তে সহায়তা করেছে। ১০০% বিশ্বস্ত!',
      buyerName: 'মাহিনুর রহমান (টেক ক্রিয়েটর)',
      channelTitle: 'ডেইলি স্টোয়িক উইজডম ও মোটিভেশন'
    },
    EN: {
      comment: 'No passwords requested, which is the ultimate security! Handled strictly through official YouTube Studio transfer protocol with helpful support team. 100% trusted!',
      buyerName: 'Mahinur Rahman (Tech Creator)',
      channelTitle: 'Daily Stoic Wisdom & Focus'
    }
  },
  rev_110: {
    BN: {
      comment: 'চ্যানেলের লাইভ অ্যানালিটিক্স, অর্গানিক অডিয়েন্স এবং মনিটাইজেশন ক্লিন স্ট্রাইক প্রমাণ ১০০% মিলে গেছে। ৭ দিনের কুলডাউন পিরিয়ডে সেলার ও প্ল্যাটফর্মের দায়িত্বশীলতা ছিল অসাধারণ। চোখ বন্ধ করে বিশ্বাস করা যায়।',
      buyerName: 'ইমরান হোসাইন (ডিজিটাল ভেঞ্চার)',
      channelTitle: "আন্টি রুবির সহজ সুইটস রেসিপি"
    },
    EN: {
      comment: 'Live analytics, organic audience, and clean monetization proved 100% authentic. The seller and platform responsibility during the 7-day cooldown was exemplary. Highly recommended.',
      buyerName: 'Imran Hossain (Digital Venture)',
      channelTitle: "Auntie Ruby's Quick Sweets & Snacks"
    }
  }
};

/**
 * Strips Bengali text from strings when viewing in English mode
 */
export function sanitizeForEnglish(str: string): string {
  if (!str) return '';
  // Remove parentheticals containing Bengali characters
  let cleaned = str.replace(/\s*\([\u0980-\u09FF\s\dK+&/—\-:,\.]+\)/g, '');
  // Remove standalone Bengali words
  cleaned = cleaned.replace(/[\u0980-\u09FF]+/g, '').trim();
  // Remove multiple spaces or dangling dashes/colons
  cleaned = cleaned.replace(/\s{2,}/g, ' ').replace(/^[\s\-–—:,]+|[\s\-–—:,]+$/g, '').trim();
  return cleaned || str;
}

/**
 * Returns localized title for a channel
 */
export function getLocalizedChannelTitle(
  channel: { id?: string; title: string },
  language: Language
): string {
  if (!channel) return '';
  if (channel.id && CHANNEL_DICTIONARY[channel.id]) {
    return CHANNEL_DICTIONARY[channel.id][language].title;
  }
  if (language === 'EN') {
    return sanitizeForEnglish(channel.title);
  }
  return channel.title;
}

/**
 * Returns localized description for a channel
 */
export function getLocalizedChannelDescription(
  channel: { id?: string; description?: string },
  language: Language
): string {
  if (!channel) return '';
  if (channel.id && CHANNEL_DICTIONARY[channel.id]) {
    return CHANNEL_DICTIONARY[channel.id][language].description;
  }
  if (language === 'EN') {
    return sanitizeForEnglish(channel.description || '');
  }
  return channel.description || '';
}

/**
 * Returns localized niche
 */
export function getLocalizedChannelNiche(
  niche: string | undefined,
  language: Language
): string {
  if (!niche) return '';
  const map: Record<string, { BN: string; EN: string }> = {
    Gaming: { BN: 'গেমিং ও টেক', EN: 'Gaming & Tech' },
    Lifestyle: { BN: 'লাইফস্টাইল ও ভ্লগ', EN: 'Lifestyle & Vlogs' },
    Finance: { BN: 'ফিন্যান্স ও বিজনেস', EN: 'Finance & Business' },
    Education: { BN: 'শিক্ষা ও টেক টিউটোরিয়াল', EN: 'Education & Tech' },
    Music: { BN: 'মিউজিক ও লোফাই', EN: 'Music & Lofi' },
    Entertainment: { BN: 'বিনোদন ও মিডিয়া', EN: 'Entertainment & Media' },
    Technology: { BN: 'প্রযুক্তি ও গ্যাজেট', EN: 'Technology & Gadgets' },
    Fitness: { BN: 'ফিটনেস ও হেলথ', EN: 'Fitness & Health' },
  };
  if (map[niche]) {
    return map[niche][language];
  }
  return niche;
}

/**
 * Returns localized platform language string
 */
export function getLocalizedChannelLanguage(
  langStr: string | undefined,
  language: Language
): string {
  if (!langStr) return '';
  if (language === 'BN') {
    if (langStr.toLowerCase().includes('bengali') && langStr.toLowerCase().includes('english')) {
      return 'বাংলা ও ইংরেজি';
    }
    if (langStr.toLowerCase().includes('bengali') || langStr.toLowerCase().includes('bangla')) {
      return 'বাংলা';
    }
    if (langStr.toLowerCase().includes('english')) {
      return 'ইংরেজি';
    }
    return langStr;
  } else {
    if (langStr.includes('বাংলা') || langStr.includes('রেসিপি')) {
      return 'Bengali & English Subtitles';
    }
    return sanitizeForEnglish(langStr);
  }
}

/**
 * Returns localized review information
 */
export function getLocalizedReview(
  review: { id?: string; comment: string; buyerName?: string; channelTitle?: string },
  language: Language
): { comment: string; buyerName: string; channelTitle: string } {
  if (review.id && REVIEW_DICTIONARY[review.id]) {
    return REVIEW_DICTIONARY[review.id][language];
  }
  if (language === 'EN') {
    return {
      comment: sanitizeForEnglish(review.comment),
      buyerName: sanitizeForEnglish(review.buyerName || 'Verified Buyer'),
      channelTitle: sanitizeForEnglish(review.channelTitle || 'Verified Channel'),
    };
  }
  return {
    comment: review.comment,
    buyerName: review.buyerName || 'যাচাইকৃত ক্রেতা',
    channelTitle: review.channelTitle || 'যাচাইকৃত চ্যানেল',
  };
}

/**
 * Returns localized order timeline step info
 */
export function getLocalizedOrderStep(
  step: { step: number; title: string; description: string },
  language: Language
): { title: string; description: string } {
  const steps: Record<number, { BN: { title: string; desc: string }; EN: { title: string; desc: string } }> = {
    1: {
      BN: {
        title: 'পেমেন্ট প্ল্যাটফর্মে সংরক্ষিত (এস্ক্রো কাস্টডি)',
        desc: 'বায়ারের পেমেন্ট আলিফ ট্রাস্ট এস্ক্রো অ্যাকাউন্টে সুরক্ষিত রয়েছে। সেলার ওনারশিপ হস্তান্তর না করা পর্যন্ত টাকা ছাড় করা হবে না।'
      },
      EN: {
        title: 'Payment Secured in Custody (Escrow Safe)',
        desc: 'Buyer funds are secured in Alif Trust escrow custody. Payout will not be released until primary ownership is confirmed.'
      }
    },
    2: {
      BN: {
        title: 'অফিসিয়াল ম্যানেজার রোল আমন্ত্রণ পাঠানো',
        desc: 'সেলার বায়ারের ইমেইলে অফিসিয়াল ব্র্যান্ড একাউন্ট ম্যানেজার হিসেবে আমন্ত্রণ পাঠিয়েছেন।'
      },
      EN: {
        title: 'Official Manager Role Invitation Sent',
        desc: 'Seller sent an official Google/Brand Account Manager invitation to buyer email address.'
      }
    },
    3: {
      BN: {
        title: '৭ দিনের সিকিউরিটি কুলডাউন পিরিয়ড',
        desc: 'অফিসিয়াল নীতি অনুযায়ী নতুন ব্যবহারকারীকে প্রাইমারি ওনার করার আগে বাধ্যতামূলক ৭ দিন অপেক্ষা করতে হবে।'
      },
      EN: {
        title: '7-Day Security Cooldown Period',
        desc: 'Official platform protocol requires a mandatory 7-day maturation period before elevation to Primary Owner.'
      }
    },
    4: {
      BN: {
        title: 'প্রাইমারি ওনারশিপ হস্তান্তর সম্পন্ন',
        desc: 'সেলার বায়ারকে একমাত্র প্রাইমারি ওনার হিসেবে উন্নীত করেছেন এবং নিজের অ্যাক্সেস সম্পূর্ণ প্রত্যাহার করেছেন।'
      },
      EN: {
        title: 'Primary Ownership Transfer Elevated',
        desc: 'Seller elevated the buyer to sole Primary Owner and revoked their own administrative permissions.'
      }
    },
    5: {
      BN: {
        title: 'অডিট সন্তুষ্টি ও সেলার ফান্ড রিলিজ',
        desc: 'বায়ার পূর্ণ নিয়ন্ত্রণ ও অ্যাডসেন্স যাচাই করে সন্তুষ্টি নিশ্চিত করেছেন এবং সেলারের ফান্ড ছাড় করা হয়েছে।'
      },
      EN: {
        title: 'Audit Satisfaction & Seller Fund Release',
        desc: 'Buyer confirmed complete administrative control and authorized platform custody payout to seller.'
      }
    }
  };

  if (steps[step.step]) {
    return {
      title: steps[step.step][language].title,
      description: steps[step.step][language].desc,
    };
  }

  return {
    title: language === 'EN' ? sanitizeForEnglish(step.title) : step.title,
    description: language === 'EN' ? sanitizeForEnglish(step.description) : step.description,
  };
}
