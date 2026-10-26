import { CustomCategory } from '../types';

export const DEFAULT_CUSTOM_CATEGORIES: CustomCategory[] = [
  {
    id: 'facebook_page',
    name: 'ফেসবুক পেজ ও গ্রুপ',
    nameEn: 'Facebook Pages & Groups',
    platform: 'facebook',
    icon: '📄',
    description: 'ইনস্ট্রিম বিজ্ঞাপন, পেজ কোয়ালিটি গ্রিন ও মনিটাইজড পেজ',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'tiktok_viral',
    name: 'টিকটক ভাইরাল অ্যাকাউন্ট',
    nameEn: 'TikTok Viral Accounts',
    platform: 'tiktok',
    icon: '⚡',
    description: 'ক্রিয়েটর রিওয়ার্ডস ও টিকটক শপ অ্যাফিলিয়েট অ্যাকাউন্ট',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'instagram_theme',
    name: 'ইনস্টাগ্রাম থিম পেজ',
    nameEn: 'Instagram Theme Pages',
    platform: 'instagram',
    icon: '🎨',
    description: 'অর্গানিক ইনফ্লুয়েন্সার ও থিম পেজ',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'cooking_lifestyle',
    name: 'রান্না ও ফুড রেসিপি',
    nameEn: 'Cooking & Lifestyle',
    platform: 'youtube',
    icon: '🍳',
    description: 'আন্টির রান্না, দেশি-বিদেশি খাবার ও লাইফস্টাইল রেসিপি চ্যানেল',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'faceless_cash_cow',
    name: 'ফেসলেস ক্যাশ কাউ',
    nameEn: 'Faceless Cash Cow',
    platform: 'youtube',
    icon: '🤖',
    description: 'অটোমেশন ও এআই জেনারেটেড হাই রেভিনিউ ক্যাশ কাউ চ্যানেল',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'shorts_creator',
    name: 'ভাইরাল শর্টস চ্যানেল',
    nameEn: 'Viral Shorts Creators',
    platform: 'youtube',
    icon: '⚡',
    description: 'মিলিয়ন ভিউজ সমৃদ্ধ ভাইরাল শর্টস ও রিলস চ্যানেল',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'gaming_stream',
    name: 'গেমিং ও টেক চ্যানেল',
    nameEn: 'Gaming & Tech Stream',
    platform: 'all',
    icon: '🎮',
    description: 'লাইভ স্ট্রিম, পিসি রিভিউ, মোবাইল ও কনসোল গেমিং',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'vintage_aged',
    name: 'পুরানো ভিন্টেজ অ্যাকাউন্ট',
    nameEn: 'Aged Vintage Accounts',
    platform: 'all',
    icon: '🏛️',
    description: '২০১২-২০১৮ সালের ওল্ড ট্রাস্টেড ভিন্টেজ অ্যাকাউন্ট',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'high_cpm_finance',
    name: 'উচ্চ আয় ফিন্যান্স ও বিজনেস',
    nameEn: 'High CPM Finance & Business',
    platform: 'all',
    icon: '💰',
    description: 'শেয়ার বাজার, ক্রিপ্টো, অনলাইন বিজনেস ও হাই CPM চ্যানেল',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'vlog_personal',
    name: 'পার্সোনাল ভ্লগ ও লাইফস্টাইল',
    nameEn: 'Personal Vlog & Lifestyle',
    platform: 'youtube',
    icon: '📹',
    description: 'দৈনন্দিন ভ্লগ, ট্রাভেল ও পার্সোনাল ব্র্যান্ড একাউন্ট',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'education_tech',
    name: 'এডুকেশন ও টেক টিউটোরিয়াল',
    nameEn: 'Education & Tech Tutorials',
    platform: 'all',
    icon: '📚',
    description: 'সফটওয়্যার, ফ্রিল্যান্সিং ও স্কিল ডেভেলপমেন্ট চ্যানেল',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'telegram_signal',
    name: 'টেলিগ্রাম সিগন্যাল ও চ্যানেল',
    nameEn: 'Telegram Signals & Community',
    platform: 'telegram',
    icon: '✈️',
    description: 'ট্রেডিং সিগন্যাল, ক্রিপ্টো কমিউনিটি ও মেম্বার চ্যানেল',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'twitter_crypto',
    name: 'এক্স / টুইটার ক্রিপ্টো ও নিউজ',
    nameEn: 'Twitter / X Crypto & News',
    platform: 'twitter',
    icon: '🐦',
    description: 'ব্লু ভেরিফাইড ও এড রেভিনিউ শেয়ারিং এক্স একাউন্ট',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'islamic_media',
    name: 'ইসলামিক আলোচনা ও ওয়াজ',
    nameEn: 'Islamic Media & Lectures',
    platform: 'all',
    icon: '🕌',
    description: 'কোরআন তেলাওয়াত, ওয়াজ মাহফিল ও ইসলামিক স্কলার বক্তব্য',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];
