import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  ChannelListing,
  Order,
  Message,
  Review,
  UserRole,
  ChannelVerificationStatus,
  OrderStatus,
  AdminAuditLog,
  SupportTicket,
  SupportTicketMessage,
  Coupon,
  Transaction,
  FraudAlert,
  WebsiteSettings,
  NotificationItem
} from './types';

interface DatabaseSchema {
  users: User[];
  channels: ChannelListing[];
  orders: Order[];
  messages: Message[];
  reviews: Review[];
  tickets?: SupportTicket[];
  coupons?: Coupon[];
  transactions?: Transaction[];
  fraudAlerts?: FraudAlert[];
  settings?: WebsiteSettings;
  notifications?: NotificationItem[];
  auditLogs?: AdminAuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export function hashPassword(password: string): string {
  const salt = 'ct_salt_2026';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export function generateToken(user: User): string {
  const payload = { id: user.id, email: user.email, role: user.role, timestamp: Date.now() };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function verifyToken(token: string): { id: string; email: string; role: UserRole } | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const data = JSON.parse(raw);
    if (!data.id || !data.email) return null;
    return data;
  } catch {
    return null;
  }
}

class Database {
  private data: DatabaseSchema = {
    users: [],
    channels: [],
    orders: [],
    messages: [],
    reviews: []
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        this.ensureEnrichedChannels();
        this.ensureEnrichedAdminData();
        return;
      } catch (e) {
        console.error('Failed to parse database.json, re-initializing seed data', e);
      }
    }

    this.seed();
    this.ensureEnrichedChannels();
    this.ensureEnrichedAdminData();
    this.save();
  }

  private ensureEnrichedChannels() {
    // Add accountTypes to existing channels if missing
    this.data.channels.forEach(c => {
      if (!c.accountType) {
        if (c.niche === 'Gaming') c.accountType = 'gaming_stream';
        else if (c.niche === 'Education' || c.niche === 'Music') c.accountType = 'faceless_cash_cow';
        else if (c.niche === 'Finance') c.accountType = 'high_cpm_finance';
        else if (c.niche === 'Lifestyle') c.accountType = 'cooking_lifestyle';
        else c.accountType = 'general';
      }
      if (!c.tags) {
        c.tags = [c.niche.toLowerCase(), 'youtube', 'monetized'];
      }
    });

    const hasAuntie = this.data.channels.some(c => c.id === 'chn_auntie_kitchen');
    if (!hasAuntie) {
      const seller1 = this.data.users.find(u => u.id === 'usr_seller_1') || this.data.users[1];
      const seller2 = this.data.users.find(u => u.id === 'usr_seller_2') || this.data.users[2];

      const extraChannels: ChannelListing[] = [
        {
          id: 'chn_auntie_kitchen',
          sellerId: seller2.id,
          sellerName: 'Elena Rostova & Auntie Fatima Kitchen',
          sellerEmail: seller2.email,
          sellerRating: 4.95,
          sellerDealsCount: 8,
          title: "Auntie Fatima's Village Kitchen (আন্টির ভিলেজ কিচেন ও রান্না রেসিপি)",
          handle: '@AuntieFatimaKitchen',
          channelUrl: 'https://youtube.com/@AuntieFatimaKitchen',
          niche: 'Lifestyle',
          accountType: 'cooking_lifestyle',
          primaryLanguage: 'Bengali / Bangla & English Subtitles',
          tags: ['auntie', 'cooking', 'village kitchen', 'recipes', 'আন্টি', 'রান্না', 'food', 'lifestyle', 'silver button'],
          subscribers: 248000,
          lifetimeViews: 38500000,
          monthlyViews: 1120000,
          monthlyRevenue: 1950,
          monetizationStatus: 'monetized',
          strikeStatus: 'clean',
          hasSilverButton: true,
          askingPrice: 9800,
          minOfferPrice: 8500,
          description: 'জনপ্রিয় ফ্যামিলি ও ভিলেজ কুকিং চ্যানেল (Auntie Cooking & Traditional Recipes)। ১০০% রিয়েল অর্গানিক অডিয়েন্স, ইউএসএ, ইউকে, মধ্যপ্রাচ্য ও সাউথ এশিয়ান দর্শক। সম্পূর্ণ ক্লিন স্ট্রাইক হিস্ট্রি, অ্যাডসেন্স ও স্পনসরশিপ একটিভ। নিরাপদ ব্র্যান্ড একাউন্ট ট্রান্সফার।',
          creationYear: 2021,
          videoCount: 290,
          analyticsScreenshots: [
            'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=900&auto=format&fit=crop&q=80'
          ],
          verificationStatus: 'approved',
          isFeatured: true,
          status: 'active',
          audience: {
            topCountries: [
              { country: 'Bangladesh', percentage: 42 },
              { country: 'India', percentage: 24 },
              { country: 'United States', percentage: 18 },
              { country: 'United Kingdom', percentage: 9 }
            ],
            ageDistribution: [
              { range: '18-24', percentage: 28 },
              { range: '25-34', percentage: 46 },
              { range: '35-44', percentage: 26 }
            ],
            genderSplit: { male: 30, female: 70 }
          },
          createdAt: '2026-09-28T10:00:00.000Z',
          updatedAt: '2026-09-28T10:00:00.000Z'
        },
        {
          id: 'chn_auntie_bakes',
          sellerId: seller2.id,
          sellerName: seller2.name,
          sellerEmail: seller2.email,
          sellerRating: 4.88,
          sellerDealsCount: 6,
          title: "Auntie Ruby's Quick Sweets & Homemade Snacks (আন্টির সহজ রেসিপি)",
          handle: '@AuntieRubySnacks',
          channelUrl: 'https://youtube.com/@AuntieRubySnacks',
          niche: 'Lifestyle',
          accountType: 'cooking_lifestyle',
          primaryLanguage: 'Bengali & English',
          tags: ['auntie', 'cooking', 'recipes', 'baking', 'snacks', 'আন্টি', 'রান্না', 'budget under 2000'],
          subscribers: 42500,
          lifetimeViews: 6800000,
          monthlyViews: 280000,
          monthlyRevenue: 520,
          monetizationStatus: 'monetized',
          strikeStatus: 'clean',
          hasSilverButton: false,
          askingPrice: 1850,
          minOfferPrice: 1600,
          description: 'কম বাজেটের হোম বেকিং, মিষ্টি ও কিচেন স্নাক্স চ্যানেল। ১০০% মনিটাইজড, কোনো কপিরাইট নেই। নতুন বায়ারদের জন্য পারফেক্ট সাশ্রয়ী স্টার্টার অ্যাকাউন্ট।',
          creationYear: 2023,
          videoCount: 110,
          analyticsScreenshots: [
            'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&auto=format&fit=crop&q=80'
          ],
          verificationStatus: 'approved',
          isFeatured: false,
          status: 'active',
          audience: {
            topCountries: [
              { country: 'United States', percentage: 38 },
              { country: 'Canada', percentage: 22 },
              { country: 'Bangladesh', percentage: 20 }
            ],
            ageDistribution: [
              { range: '18-24', percentage: 32 },
              { range: '25-34', percentage: 48 },
              { range: '35-44', percentage: 20 }
            ],
            genderSplit: { male: 25, female: 75 }
          },
          createdAt: '2026-10-02T12:00:00.000Z',
          updatedAt: '2026-10-02T12:00:00.000Z'
        },
        {
          id: 'chn_micro_diy',
          sellerId: seller1.id,
          sellerName: seller1.name,
          sellerEmail: seller1.email,
          sellerRating: 4.95,
          sellerDealsCount: 14,
          title: 'CraftNest DIY Hacks & Quick Fixes (Micro-Budget Starter)',
          handle: '@CraftNestHacks',
          channelUrl: 'https://youtube.com/@CraftNestHacks',
          niche: 'Lifestyle',
          accountType: 'vlog_personal',
          primaryLanguage: 'English',
          tags: ['budget', 'cheap', 'under 1000', 'starter', 'diy', 'কম বাজেট'],
          subscribers: 14800,
          lifetimeViews: 2100000,
          monthlyViews: 85000,
          monthlyRevenue: 170,
          monetizationStatus: 'monetized',
          strikeStatus: 'clean',
          hasSilverButton: false,
          askingPrice: 750, // Under $1,000!
          minOfferPrice: 650,
          description: '১০০০ ডলারের নিচে সাশ্রয়ী স্টার্টার মনিটাইজড চ্যানেল। লাইফ হ্যাকস ও ক্রাফটিং ভিডিও। খুব কম খরচে মনিটাইজড চ্যানেল নিয়ে কাজ শুরু করতে চাওয়া ক্রিয়েটরদের জন্য আদর্শ।',
          creationYear: 2024,
          videoCount: 65,
          analyticsScreenshots: [
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80'
          ],
          verificationStatus: 'approved',
          isFeatured: false,
          status: 'active',
          createdAt: '2026-10-04T15:00:00.000Z',
          updatedAt: '2026-10-04T15:00:00.000Z'
        },
        {
          id: 'chn_viral_shorts',
          sellerId: seller1.id,
          sellerName: seller1.name,
          sellerEmail: seller1.email,
          sellerRating: 4.95,
          sellerDealsCount: 14,
          title: 'SnapFacts Viral Shorts (15M+ Monthly Views)',
          handle: '@SnapFactsViral',
          channelUrl: 'https://youtube.com/@SnapFactsViral',
          niche: 'Education',
          accountType: 'shorts_creator',
          primaryLanguage: 'English',
          tags: ['shorts', 'viral', 'facts', 'short videos', 'cash cow'],
          subscribers: 580000,
          lifetimeViews: 92000000,
          monthlyViews: 16500000,
          monthlyRevenue: 3100,
          monetizationStatus: 'monetized',
          strikeStatus: 'clean',
          hasSilverButton: true,
          askingPrice: 13500,
          minOfferPrice: 12000,
          description: 'টপ-লেভেল ভাইরাল ইউটিউব শর্টস চ্যানেল। প্রতি মাসে ১৫ মিলিয়নের বেশি ভিউ। অটোমেশন স্ক্রিপ্ট ও ভিডিও মেকিং এসওপি সহ বিক্রি হচ্ছে।',
          creationYear: 2023,
          videoCount: 420,
          analyticsScreenshots: [
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80'
          ],
          verificationStatus: 'approved',
          isFeatured: true,
          status: 'active',
          createdAt: '2026-10-05T08:00:00.000Z',
          updatedAt: '2026-10-05T08:00:00.000Z'
        },
        {
          id: 'chn_vintage_2014',
          sellerId: seller1.id,
          sellerName: seller1.name,
          sellerEmail: seller1.email,
          sellerRating: 4.95,
          sellerDealsCount: 14,
          title: 'TechRetro Vault (2014 Aged YouTube Channel)',
          handle: '@TechRetroVault',
          channelUrl: 'https://youtube.com/@TechRetroVault',
          niche: 'Tech',
          accountType: 'vintage_aged',
          primaryLanguage: 'English',
          tags: ['aged', 'vintage', '2014', 'old channel', 'trusted'],
          subscribers: 34500,
          lifetimeViews: 4500000,
          monthlyViews: 120000,
          monthlyRevenue: 380,
          monetizationStatus: 'monetized',
          strikeStatus: 'clean',
          hasSilverButton: false,
          askingPrice: 1550,
          minOfferPrice: 1400,
          description: '২০১৪ সালে তৈরি ১০+ বছরের পুরানো ভিন্টেজ ইউটিউব একাউন্ট। হাই অ্যালগরিদম ট্রাস্ট স্কোর এবং ১০০% ক্লিন হিস্ট্রি।',
          creationYear: 2014,
          videoCount: 88,
          analyticsScreenshots: [
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80'
          ],
          verificationStatus: 'approved',
          isFeatured: false,
          status: 'active',
          createdAt: '2026-10-06T14:00:00.000Z',
          updatedAt: '2026-10-06T14:00:00.000Z'
        }
      ];

      this.data.channels.push(...extraChannels);
      this.save();
    }

    // Ensure all existing channels have platform set to 'youtube' if missing
    this.data.channels.forEach(c => {
      if (!c.platform) {
        c.platform = 'youtube';
      }
    });

    // Check if multi-platform accounts (Facebook, TikTok, Instagram, Telegram, Twitter) exist
    const hasSocialAccounts = this.data.channels.some(c => c.platform === 'facebook' || c.platform === 'tiktok');
    if (!hasSocialAccounts) {
      const seller1 = this.data.users.find(u => u.id === 'usr_seller_1') || this.data.users[1];
      const seller2 = this.data.users.find(u => u.id === 'usr_seller_2') || this.data.users[2];

      const socialAccounts: ChannelListing[] = [
        // 1. Facebook Page (450K followers, In-stream ads)
        {
          id: 'acc_fb_viral_media',
          sellerId: seller1.id,
          sellerName: seller1.name,
          sellerEmail: seller1.email,
          sellerRating: 4.95,
          sellerDealsCount: 14,
          platform: 'facebook',
          title: 'BD Viral Media & Entertainment (ফেসবুক পেজ - ৪৫০K ফলোয়ার)',
          handle: '@BDViralMediaOfficial',
          channelUrl: 'https://facebook.com/BDViralMediaOfficial',
          niche: 'Entertainment',
          accountType: 'facebook_page',
          primaryLanguage: 'Bengali / Bangla',
          tags: ['facebook', 'page', 'in-stream ads', 'মনিটাইজড পেজ', 'ফেসবুক', 'viral', 'bd entertainment'],
          subscribers: 452000, // Followers
          lifetimeViews: 75000000,
          monthlyViews: 6800000,
          monthlyRevenue: 1450,
          monetizationStatus: 'monetized',
          strikeStatus: 'clean',
          pageQuality: 'green',
          isVerifiedBadge: false,
          monetizationTool: 'In-Stream Ads + Stars',
          askingPrice: 4200,
          minOfferPrice: 3800,
          description: '১০০% গ্রিন পেজ কোয়ালিটি সহ ইনস্ট্রিম অ্যাডস ও স্টার মনিটাইজড ফেসবুক পেজ। ৪ লাখ ৫২ হাজার রিয়েল অর্গানিক ফলোয়ার। কোনো ভায়োলেশন বা পলিসি ইস্যু নেই। ফুল অ্যাডমিন হ্যান্ডওভার ও ব্যাংক সেটআপ পরিবর্তনযোগ্য।',
          creationYear: 2021,
          videoCount: 380,
          analyticsScreenshots: [
            'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=900&auto=format&fit=crop&q=80'
          ],
          verificationStatus: 'approved',
          isFeatured: true,
          status: 'active',
          audience: {
            topCountries: [
              { country: 'Bangladesh', percentage: 65 },
              { country: 'India', percentage: 18 },
              { country: 'Saudi Arabia', percentage: 9 },
              { country: 'UAE', percentage: 5 }
            ],
            ageDistribution: [
              { range: '18-24', percentage: 42 },
              { range: '25-34', percentage: 44 },
              { range: '35-44', percentage: 14 }
            ],
            genderSplit: { male: 68, female: 32 }
          },
          createdAt: '2026-10-10T10:00:00.000Z',
          updatedAt: '2026-10-10T10:00:00.000Z'
        },
        // 2. Facebook Kitchen Page (125K followers)
        {
          id: 'acc_fb_kitchen_page',
          sellerId: seller2.id,
          sellerName: 'Elena Rostova & Auntie Fatima Kitchen',
          sellerEmail: seller2.email,
          sellerRating: 4.95,
          sellerDealsCount: 8,
          platform: 'facebook',
          title: 'Banglar Kitchen & Easy Recipes (ফেসবুক মনিটাইজড পেজ - ১২৫K ফলোয়ার)',
          handle: '@BanglarKitchenRecipes',
          channelUrl: 'https://facebook.com/BanglarKitchenRecipes',
          niche: 'Lifestyle',
          accountType: 'cooking_lifestyle',
          primaryLanguage: 'Bengali / Bangla',
          tags: ['facebook', 'রান্না', 'page', 'in-stream ads', 'রেসিপি', 'auntie', 'cooking'],
          subscribers: 125000,
          lifetimeViews: 18500000,
          monthlyViews: 1400000,
          monthlyRevenue: 620,
          monetizationStatus: 'monetized',
          strikeStatus: 'clean',
          pageQuality: 'green',
          isVerifiedBadge: false,
          monetizationTool: 'In-Stream Ads',
          askingPrice: 1650,
          minOfferPrice: 1500,
          description: 'রান্না ও কিচেন লাইফস্টাইলের জনপ্রিয় ফেসবুক পেজ। ১ লাখ ২৫ হাজার অর্গানিক ফিমেল অডিয়েন্স। ইনস্ট্রিম অ্যাড মনিটাইজড, কোনো কপিরাইট স্ট্রাইক বা রেস্ট্রিকশন নেই।',
          creationYear: 2022,
          videoCount: 195,
          analyticsScreenshots: [
            'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&auto=format&fit=crop&q=80'
          ],
          verificationStatus: 'approved',
          isFeatured: false,
          status: 'active',
          audience: {
            topCountries: [
              { country: 'Bangladesh', percentage: 55 },
              { country: 'United States', percentage: 22 },
              { country: 'United Kingdom', percentage: 12 }
            ],
            ageDistribution: [
              { range: '18-24', percentage: 25 },
              { range: '25-34', percentage: 50 },
              { range: '35-44', percentage: 25 }
            ],
            genderSplit: { male: 22, female: 78 }
          },
          createdAt: '2026-10-10T12:00:00.000Z',
          updatedAt: '2026-10-10T12:00:00.000Z'
        },
        // 3. TikTok Viral Comedy Account (320K followers, Creator Rewards)
        {
          id: 'acc_tt_viral_comedy',
          sellerId: seller1.id,
          sellerName: seller1.name,
          sellerEmail: seller1.email,
          sellerRating: 4.95,
          sellerDealsCount: 14,
          platform: 'tiktok',
          title: 'TrendVibe Viral POV & Comedy (টিকটক ৩২০K ফলোয়ার - ক্রিয়েটর রিওয়ার্ডস)',
          handle: '@TrendVibePOV',
          channelUrl: 'https://tiktok.com/@TrendVibePOV',
          niche: 'Entertainment',
          accountType: 'tiktok_viral',
          primaryLanguage: 'English / International',
          tags: ['tiktok', 'টিকটক', 'creator rewards', 'viral tiktok', 'pov', 'usa account'],
          subscribers: 320000, // Followers
          lifetimeViews: 58000000,
          monthlyViews: 12000000,
          monthlyRevenue: 1850,
          monetizationStatus: 'monetized',
          strikeStatus: 'clean',
          monetizationTool: 'TikTok Creator Rewards + TikTok Shop',
          askingPrice: 3100,
          minOfferPrice: 2800,
          description: 'USA রিজিয়ন ক্রিয়েটর রিওয়ার্ডস প্রোগ্রাম (TikTok Creator Rewards Beta) সক্রিয়। প্রতি মাসে ১৮০০+ ডলার ইনকাম। লাইভ স্ট্রিম, ব্যাটল ও টিকটক শপ অ্যাফিলিয়েট অপশন উন্মুক্ত। ১০০% ক্লিন মূল ইমেইল সহ হস্তান্তর।',
          creationYear: 2023,
          videoCount: 240,
          analyticsScreenshots: [
            'https://images.unsplash.com/photo-1611162616091-2dc0609f06df?w=900&auto=format&fit=crop&q=80'
          ],
          verificationStatus: 'approved',
          isFeatured: true,
          status: 'active',
          audience: {
            topCountries: [
              { country: 'United States', percentage: 48 },
              { country: 'United Kingdom', percentage: 22 },
              { country: 'Canada', percentage: 14 }
            ],
            ageDistribution: [
              { range: '18-24', percentage: 55 },
              { range: '25-34', percentage: 35 },
              { range: '35-44', percentage: 10 }
            ],
            genderSplit: { male: 54, female: 46 }
          },
          createdAt: '2026-10-11T09:00:00.000Z',
          updatedAt: '2026-10-11T09:00:00.000Z'
        },
        // 4. TikTok Tech & Gadgets (85K followers, TikTok Shop Affiliate)
        {
          id: 'acc_tt_smart_gadgets',
          sellerId: seller2.id,
          sellerName: seller2.name,
          sellerEmail: seller2.email,
          sellerRating: 4.88,
          sellerDealsCount: 6,
          platform: 'tiktok',
          title: 'SmartGadget Deals & Shorts (টিকটক ৮৫K ফলোয়ার - শপ অ্যাফিলিয়েট)',
          handle: '@SmartGadgetDeals',
          channelUrl: 'https://tiktok.com/@SmartGadgetDeals',
          niche: 'Tech',
          accountType: 'tiktok_viral',
          primaryLanguage: 'English',
          tags: ['tiktok', 'টিকটক', 'gadgets', 'tech', 'affiliate', 'under 1000', 'কম বাজেট'],
          subscribers: 85000,
          lifetimeViews: 14200000,
          monthlyViews: 2200000,
          monthlyRevenue: 490,
          monetizationStatus: 'monetized',
          strikeStatus: 'clean',
          monetizationTool: 'TikTok Shop Showcase & Live',
          askingPrice: 950, // Under $1,000!
          minOfferPrice: 850,
          description: 'সাশ্রয়ী বাজেটের টিকটক টেক ও গ্যাজেট রিভিউ একাউন্ট। ৮৫ হাজার এক্টিভ ফলোয়ার। টিকটক শপ শোকেস ও লাইভ স্টুডিও পারমিশন সক্রিয়। নতুন উদ্যোক্তা ও অ্যাফিলিয়েট মার্কেটারদের জন্য বেস্ট স্টার্টার।',
          creationYear: 2024,
          videoCount: 110,
          analyticsScreenshots: [
            'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=80'
          ],
          verificationStatus: 'approved',
          isFeatured: false,
          status: 'active',
          audience: {
            topCountries: [
              { country: 'United States', percentage: 40 },
              { country: 'Canada', percentage: 25 },
              { country: 'Bangladesh', percentage: 15 }
            ],
            ageDistribution: [
              { range: '18-24', percentage: 45 },
              { range: '25-34', percentage: 40 },
              { range: '35-44', percentage: 15 }
            ],
            genderSplit: { male: 65, female: 35 }
          },
          createdAt: '2026-10-11T11:00:00.000Z',
          updatedAt: '2026-10-11T11:00:00.000Z'
        },
        // 5. Instagram Luxury & Motivation Page (195K followers)
        {
          id: 'acc_ig_billionaire_drive',
          sellerId: seller1.id,
          sellerName: seller1.name,
          sellerEmail: seller1.email,
          sellerRating: 4.95,
          sellerDealsCount: 14,
          platform: 'instagram',
          title: 'The Billionaire Drive (ইনস্টাগ্রাম ১৯৫K লাক্সারি থিম পেজ)',
          handle: '@TheBillionaireDrive',
          channelUrl: 'https://instagram.com/TheBillionaireDrive',
          niche: 'Finance',
          accountType: 'instagram_theme',
          primaryLanguage: 'English',
          tags: ['instagram', 'ইনস্টাগ্রাম', 'theme page', 'luxury', 'motivation', 'shoutout'],
          subscribers: 195000,
          lifetimeViews: 42000000,
          monthlyViews: 4500000,
          monthlyRevenue: 1300,
          monetizationStatus: 'monetized',
          strikeStatus: 'clean',
          monetizationTool: 'Brand Deals & Shoutouts',
          askingPrice: 2800,
          minOfferPrice: 2500,
          description: 'হাই-কনভার্টিং লাক্সারি ও মোটিভেশন ইনস্টাগ্রাম থিম পেজ। Tier-1 কান্ট্রি (USA, UK, Australia) ৫২%+ অডিয়েন্স। নিয়মিত ব্র্যান্ড স্পনসরশিপ ও স্টোরি শাউটআউট আসে। অরিজিনাল ওজি ইমেইল সহ হস্তান্তর।',
          creationYear: 2022,
          videoCount: 480,
          analyticsScreenshots: [
            'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900&auto=format&fit=crop&q=80'
          ],
          verificationStatus: 'approved',
          isFeatured: true,
          status: 'active',
          audience: {
            topCountries: [
              { country: 'United States', percentage: 44 },
              { country: 'United Kingdom', percentage: 20 },
              { country: 'Germany', percentage: 12 }
            ],
            ageDistribution: [
              { range: '18-24', percentage: 38 },
              { range: '25-34', percentage: 48 },
              { range: '35-44', percentage: 14 }
            ],
            genderSplit: { male: 72, female: 28 }
          },
          createdAt: '2026-10-11T14:00:00.000Z',
          updatedAt: '2026-10-11T14:00:00.000Z'
        },
        // 6. Instagram Fashion & Chic Style (68K followers)
        {
          id: 'acc_ig_chic_style',
          sellerId: seller2.id,
          sellerName: seller2.name,
          sellerEmail: seller2.email,
          sellerRating: 4.88,
          sellerDealsCount: 6,
          platform: 'instagram',
          title: 'ChicStyle Daily Inspo (ইনস্টাগ্রাম ৬৮K ফ্যাশন পেজ)',
          handle: '@ChicStyleDaily',
          channelUrl: 'https://instagram.com/ChicStyleDaily',
          niche: 'Lifestyle',
          accountType: 'instagram_theme',
          primaryLanguage: 'English',
          tags: ['instagram', 'ইনস্টাগ্রাম', 'fashion', 'outfits', 'women', 'under 1000'],
          subscribers: 68000,
          lifetimeViews: 8500000,
          monthlyViews: 950000,
          monthlyRevenue: 380,
          monetizationStatus: 'monetized',
          strikeStatus: 'clean',
          monetizationTool: 'Fashion Brand Affiliate & Shoutouts',
          askingPrice: 890, // Under $1,000!
          minOfferPrice: 790,
          description: 'মহিলাদের ফ্যাশন ও আউটফিট কিউরেশন পেজ। ১০০% অর্গানিক রিচ, অরিজিনাল ওজিইমেইল (OG Email) সহ ট্রান্সফার। পোশাক ও কসমেটিকস ব্র্যান্ড স্পনসরশিপের জন্য পারফেক্ট।',
          creationYear: 2023,
          videoCount: 220,
          analyticsScreenshots: [
            'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop&q=80'
          ],
          verificationStatus: 'approved',
          isFeatured: false,
          status: 'active',
          audience: {
            topCountries: [
              { country: 'United States', percentage: 42 },
              { country: 'Canada', percentage: 22 },
              { country: 'United Kingdom', percentage: 18 }
            ],
            ageDistribution: [
              { range: '18-24', percentage: 48 },
              { range: '25-34', percentage: 42 },
              { range: '35-44', percentage: 10 }
            ],
            genderSplit: { male: 15, female: 85 }
          },
          createdAt: '2026-10-12T08:00:00.000Z',
          updatedAt: '2026-10-12T08:00:00.000Z'
        },
        // 7. Telegram Crypto & Alpha Signals (48.5K members)
        {
          id: 'acc_tg_crypto_alpha',
          sellerId: seller1.id,
          sellerName: seller1.name,
          sellerEmail: seller1.email,
          sellerRating: 4.95,
          sellerDealsCount: 14,
          platform: 'telegram',
          title: 'Crypto Whale Alpha Signals (টেলিগ্রাম ৪৮K মেম্বার চ্যানেল)',
          handle: '@CryptoWhaleAlpha',
          channelUrl: 'https://t.me/CryptoWhaleAlpha',
          niche: 'Finance',
          accountType: 'telegram_signal',
          primaryLanguage: 'English',
          tags: ['telegram', 'টেলিগ্রাম', 'crypto', 'signals', 'trading', 'vip'],
          subscribers: 48500, // Members
          lifetimeViews: 9200000,
          monthlyViews: 1200000,
          monthlyRevenue: 2400,
          monetizationStatus: 'monetized',
          strikeStatus: 'clean',
          monetizationTool: 'VIP Subscription + Paid Pin Ads',
          askingPrice: 3600,
          minOfferPrice: 3200,
          description: 'প্রিমিয়াম ক্রিপ্টো সিগন্যাল ও ট্রেডিং ডিসকাশন টেলিগ্রাম চ্যানেল। উচ্চ ভিআইপি সাবস্ক্রিপশন কনভার্সন রেট (প্রতি মাসে $২০০০+ মেম্বারশিপ ফি)। ওনারশিপ রাইটস ইনস্ট্যান্ট ও নিরাপদ ট্রান্সফার।',
          creationYear: 2022,
          videoCount: 650,
          analyticsScreenshots: [
            'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=900&auto=format&fit=crop&q=80'
          ],
          verificationStatus: 'approved',
          isFeatured: true,
          status: 'active',
          audience: {
            topCountries: [
              { country: 'United States', percentage: 36 },
              { country: 'Germany', percentage: 18 },
              { country: 'UAE', percentage: 16 }
            ],
            ageDistribution: [
              { range: '18-24', percentage: 25 },
              { range: '25-34', percentage: 55 },
              { range: '35-44', percentage: 20 }
            ],
            genderSplit: { male: 88, female: 12 }
          },
          createdAt: '2026-10-12T09:30:00.000Z',
          updatedAt: '2026-10-12T09:30:00.000Z'
        },
        // 8. Twitter / X Blue Verified (75K followers)
        {
          id: 'acc_x_ai_radar',
          sellerId: seller1.id,
          sellerName: seller1.name,
          sellerEmail: seller1.email,
          sellerRating: 4.95,
          sellerDealsCount: 14,
          platform: 'twitter',
          title: 'AI Daily & Web3 Radar (এক্স/টুইটার ৭৫K ফলোয়ার - ব্লু ভেরিফাইড)',
          handle: '@AIDailyRadar',
          channelUrl: 'https://x.com/AIDailyRadar',
          niche: 'Tech',
          accountType: 'twitter_crypto',
          primaryLanguage: 'English',
          tags: ['twitter', 'টুইটার', 'x', 'blue verified', 'ai', 'tech', 'revenue share'],
          subscribers: 75200,
          lifetimeViews: 19000000,
          monthlyViews: 2800000,
          monthlyRevenue: 980,
          monetizationStatus: 'monetized',
          strikeStatus: 'clean',
          isVerifiedBadge: true,
          monetizationTool: 'X Ads Revenue Sharing',
          askingPrice: 2200,
          minOfferPrice: 1950,
          description: 'এক্স (Twitter) ব্লু ভেরিফাইড একাউন্ট। এডস রেভিনিউ শেয়ারিং (X Ads Revenue Sharing) সক্রিয়। টেক, এআই ও ওয়েব৩ নিশ। হাই এনগেজমেন্ট ও অর্গানিক ইম্প্রেশন।',
          creationYear: 2021,
          videoCount: 1200,
          analyticsScreenshots: [
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&auto=format&fit=crop&q=80'
          ],
          verificationStatus: 'approved',
          isFeatured: false,
          status: 'active',
          audience: {
            topCountries: [
              { country: 'United States', percentage: 50 },
              { country: 'United Kingdom', percentage: 18 },
              { country: 'India', percentage: 12 }
            ],
            ageDistribution: [
              { range: '18-24', percentage: 30 },
              { range: '25-34', percentage: 52 },
              { range: '35-44', percentage: 18 }
            ],
            genderSplit: { male: 78, female: 22 }
          },
          createdAt: '2026-10-12T10:00:00.000Z',
          updatedAt: '2026-10-12T10:00:00.000Z'
        }
      ];

      this.data.channels.push(...socialAccounts);
      this.save();
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  private seed() {
    const adminUser: User = {
      id: 'usr_admin_alif',
      name: 'Alif Sheen Admin',
      email: 'alifsheenshopping@gmail.com',
      passwordHash: hashPassword('019Alif11#'),
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-01T00:00:00.000Z',
      isVerifiedSeller: true,
      bio: 'Alif Sheen Group & Alif Trust Super Administrator'
    };

    const seller1: User = {
      id: 'usr_seller_1',
      name: 'Apex Studio Ventures',
      email: 'apex.creators@gmail.com',
      passwordHash: hashPassword('seller1234'),
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-02-10T12:00:00.000Z',
      isVerifiedSeller: true,
      rating: 4.95,
      dealsCount: 14,
      bio: 'Full-time digital media incubator. Building and flipping high-retention monetized YouTube brands with 100% clean strike history.'
    };

    const seller2: User = {
      id: 'usr_seller_2',
      name: 'Elena Rostova',
      email: 'viralmedia@gmail.com',
      passwordHash: hashPassword('seller1234'),
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-03-01T15:00:00.000Z',
      isVerifiedSeller: true,
      rating: 4.88,
      dealsCount: 6,
      bio: 'Video producer and niche strategist specializing in lifestyle, cooking, and educational YouTube properties.'
    };

    const buyer1: User = {
      id: 'usr_buyer_1',
      name: 'Mark Sterling (Sterling Capital)',
      email: 'investor.mark@gmail.com',
      passwordHash: hashPassword('buyer1234'),
      role: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-03-15T09:30:00.000Z',
      bio: 'Acquiring high-margin digital media assets and cash-flowing cash cow YouTube channels.'
    };

    this.data.users = [adminUser, seller1, seller2, buyer1];

    const initialChannels: ChannelListing[] = [
      {
        id: 'chn_apex_gaming',
        sellerId: seller1.id,
        sellerName: seller1.name,
        sellerEmail: seller1.email,
        sellerRating: 4.95,
        sellerDealsCount: 14,
        title: 'Apex Tactical Gaming & Tech',
        handle: '@ApexTacticalGaming',
        channelUrl: 'https://youtube.com/@ApexTacticalGaming',
        niche: 'Gaming',
        subscribers: 148500,
        lifetimeViews: 24500000,
        monthlyViews: 890000,
        monthlyRevenue: 2450,
        monetizationStatus: 'monetized',
        strikeStatus: 'clean',
        hasSilverButton: true,
        askingPrice: 14900,
        minOfferPrice: 13500,
        description: 'Established 4-year-old gaming & PC setup review channel with evergreen search traffic. Audience is primarily US, UK, and Canada gamers with high purchasing power. Ready for direct Brand Deals and AdSense income.',
        creationYear: 2022,
        videoCount: 215,
        analyticsScreenshots: [
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80'
        ],
        verificationStatus: 'approved',
        isFeatured: true,
        status: 'active',
        audience: {
          topCountries: [
            { country: 'United States', percentage: 46 },
            { country: 'United Kingdom', percentage: 18 },
            { country: 'Canada', percentage: 12 },
            { country: 'Australia', percentage: 8 }
          ],
          ageDistribution: [
            { range: '18-24', percentage: 38 },
            { range: '25-34', percentage: 44 },
            { range: '35-44', percentage: 14 }
          ],
          genderSplit: { male: 82, female: 18 }
        },
        createdAt: '2026-09-01T10:00:00.000Z',
        updatedAt: '2026-09-01T10:00:00.000Z'
      },
      {
        id: 'chn_daily_mindset',
        sellerId: seller1.id,
        sellerName: seller1.name,
        sellerEmail: seller1.email,
        sellerRating: 4.95,
        sellerDealsCount: 14,
        title: 'Daily Stoic Wisdom & Focus',
        handle: '@DailyStoicWisdom',
        channelUrl: 'https://youtube.com/@DailyStoicWisdom',
        niche: 'Education',
        subscribers: 324000,
        lifetimeViews: 48900000,
        monthlyViews: 1420000,
        monthlyRevenue: 4200,
        monetizationStatus: 'monetized',
        strikeStatus: 'clean',
        hasSilverButton: true,
        askingPrice: 28500,
        minOfferPrice: 26000,
        description: 'Top-tier faceless educational channel focused on Stoicism, philosophy, and productivity. Ultra-loyal subscriber base. Scriptwriting and voiceover production SOPs included in sale. Monetized with YouTube Partner Program since 2021.',
        creationYear: 2021,
        videoCount: 340,
        analyticsScreenshots: [
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80'
        ],
        verificationStatus: 'approved',
        isFeatured: true,
        status: 'active',
        audience: {
          topCountries: [
            { country: 'United States', percentage: 52 },
            { country: 'United Kingdom', percentage: 15 },
            { country: 'Germany', percentage: 9 }
          ],
          ageDistribution: [
            { range: '25-34', percentage: 48 },
            { range: '35-44', percentage: 32 }
          ],
          genderSplit: { male: 68, female: 32 }
        },
        createdAt: '2026-09-10T11:00:00.000Z',
        updatedAt: '2026-09-10T11:00:00.000Z'
      },
      {
        id: 'chn_crypto_alpha',
        sellerId: seller2.id,
        sellerName: seller2.name,
        sellerEmail: seller2.email,
        sellerRating: 4.88,
        sellerDealsCount: 6,
        title: 'Crypto Alpha Radar',
        handle: '@CryptoAlphaRadar',
        channelUrl: 'https://youtube.com/@CryptoAlphaRadar',
        niche: 'Finance',
        subscribers: 89400,
        lifetimeViews: 11200000,
        monthlyViews: 410000,
        monthlyRevenue: 3850,
        monetizationStatus: 'monetized',
        strikeStatus: 'clean',
        hasSilverButton: false,
        askingPrice: 22500,
        minOfferPrice: 20000,
        description: 'High-CPM finance & web3 research channel. Average RPM sits at $9.40. Excellent viewer retention on 10-15 min macro analyses. Clean history with zero community guideline strikes.',
        creationYear: 2023,
        videoCount: 142,
        analyticsScreenshots: [
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80'
        ],
        verificationStatus: 'approved',
        isFeatured: true,
        status: 'active',
        audience: {
          topCountries: [
            { country: 'United States', percentage: 40 },
            { country: 'United Kingdom', percentage: 16 },
            { country: 'Singapore', percentage: 11 }
          ],
          ageDistribution: [
            { range: '25-34', percentage: 55 },
            { range: '35-44', percentage: 30 }
          ],
          genderSplit: { male: 85, female: 15 }
        },
        createdAt: '2026-09-15T14:00:00.000Z',
        updatedAt: '2026-09-15T14:00:00.000Z'
      },
      {
        id: 'chn_gourmet_kitchen',
        sellerId: seller2.id,
        sellerName: seller2.name,
        sellerEmail: seller2.email,
        sellerRating: 4.88,
        sellerDealsCount: 6,
        title: 'QuickBite Gourmet Kitchen',
        handle: '@QuickBiteGourmet',
        channelUrl: 'https://youtube.com/@QuickBiteGourmet',
        niche: 'Lifestyle',
        subscribers: 58200,
        lifetimeViews: 8700000,
        monthlyViews: 320000,
        monthlyRevenue: 1150,
        monetizationStatus: 'monetized',
        strikeStatus: 'clean',
        hasSilverButton: false,
        askingPrice: 7900,
        minOfferPrice: 7000,
        description: 'Short and long-form recipe creation channel with strong Pinterest and search discovery. Steady passive revenue stream with organic brand sponsorship inquiries.',
        creationYear: 2023,
        videoCount: 180,
        analyticsScreenshots: [
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80'
        ],
        verificationStatus: 'approved',
        isFeatured: false,
        status: 'active',
        audience: {
          topCountries: [
            { country: 'United States', percentage: 48 },
            { country: 'Canada', percentage: 14 }
          ],
          ageDistribution: [
            { range: '25-34', percentage: 41 },
            { range: '35-44', percentage: 35 }
          ],
          genderSplit: { male: 35, female: 65 }
        },
        createdAt: '2026-09-20T08:00:00.000Z',
        updatedAt: '2026-09-20T08:00:00.000Z'
      },
      {
        id: 'chn_lofi_cafe',
        sellerId: seller1.id,
        sellerName: seller1.name,
        sellerEmail: seller1.email,
        sellerRating: 4.95,
        sellerDealsCount: 14,
        title: 'Tokyo Rain Lofi Cafe',
        handle: '@TokyoRainLofi',
        channelUrl: 'https://youtube.com/@TokyoRainLofi',
        niche: 'Music',
        subscribers: 218000,
        lifetimeViews: 39000000,
        monthlyViews: 1100000,
        monthlyRevenue: 2600,
        monetizationStatus: 'monetized',
        strikeStatus: 'clean',
        hasSilverButton: true,
        askingPrice: 16800,
        minOfferPrice: 15000,
        description: 'High watch-time 24/7 lofi chill music livestreams and thematic study mixes. Fully licensed catalog rights included with sale. Massive passive recurring traffic.',
        creationYear: 2022,
        videoCount: 95,
        analyticsScreenshots: [
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80'
        ],
        verificationStatus: 'approved',
        isFeatured: true,
        status: 'active',
        audience: {
          topCountries: [
            { country: 'United States', percentage: 34 },
            { country: 'Japan', percentage: 22 },
            { country: 'United Kingdom', percentage: 14 }
          ],
          ageDistribution: [
            { range: '18-24', percentage: 50 },
            { range: '25-34', percentage: 38 }
          ],
          genderSplit: { male: 54, female: 46 }
        },
        createdAt: '2026-09-25T16:00:00.000Z',
        updatedAt: '2026-09-25T16:00:00.000Z'
      },
      {
        id: 'chn_pending_fitness',
        sellerId: seller2.id,
        sellerName: seller2.name,
        sellerEmail: seller2.email,
        sellerRating: 4.88,
        sellerDealsCount: 6,
        title: 'CoreForge Elite Workouts',
        handle: '@CoreForgeElite',
        channelUrl: 'https://youtube.com/@CoreForgeElite',
        niche: 'Health & Fitness',
        subscribers: 104000,
        lifetimeViews: 14000000,
        monthlyViews: 520000,
        monthlyRevenue: 1750,
        monetizationStatus: 'monetized',
        strikeStatus: 'clean',
        hasSilverButton: true,
        askingPrice: 11900,
        description: 'Full workout guide channel with high subscriber engagement and affiliate revenue potential. Submitted for verification.',
        creationYear: 2023,
        videoCount: 160,
        analyticsScreenshots: [
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80'
        ],
        verificationStatus: 'pending',
        isFeatured: false,
        status: 'pending',
        createdAt: '2026-10-01T09:00:00.000Z',
        updatedAt: '2026-10-01T09:00:00.000Z'
      }
    ];

    this.data.channels = initialChannels;

    // Seed Sample Completed Order
    const sampleCompletedOrder: Order = {
      id: 'ord_ct_88921',
      channelId: 'chn_daily_mindset',
      channelTitle: 'Daily Stoic Wisdom & Focus',
      channelHandle: '@DailyStoicWisdom',
      channelUrl: 'https://youtube.com/@DailyStoicWisdom',
      buyerId: buyer1.id,
      buyerName: buyer1.name,
      buyerEmail: buyer1.email,
      sellerId: seller1.id,
      sellerName: seller1.name,
      sellerEmail: seller1.email,
      amount: 28500,
      platformFee: 1425,
      totalAmount: 29925,
      status: 'completed',
      buyerGoogleEmail: 'buyer.google.brand@gmail.com',
      paymentDetails: {
        method: 'Marketplace Verified Wire / Vault Escrow',
        transactionRef: 'TXN-VAULT-2026-9021',
        confirmedAt: '2026-09-12T10:00:00.000Z',
        verifiedByServer: true
      },
      transferSteps: [
        { step: 1, title: 'Payment Confirmed by Platform', description: 'Buyer funds secured in server-verified holding deposit.', completed: true, completedAt: '2026-09-12T10:00:00.000Z' },
        { step: 2, title: 'Google Brand Account Manager Invite', description: 'Seller added buyer email as Manager on YouTube Studio.', completed: true, completedAt: '2026-09-12T14:30:00.000Z' },
        { step: 3, title: '7-Day Waiting Period Mandated by Google', description: 'Google security policy cooldown observed safely.', completed: true, completedAt: '2026-09-19T14:30:00.000Z' },
        { step: 4, title: 'Primary Ownership Transferred', description: 'Seller made buyer the Primary Owner and stepped down.', completed: true, completedAt: '2026-09-19T16:00:00.000Z' },
        { step: 5, title: 'Inspection & Funds Payout Release', description: 'Buyer confirmed full ownership; seller payout released.', completed: true, completedAt: '2026-09-20T11:00:00.000Z' }
      ],
      createdAt: '2026-09-12T09:00:00.000Z',
      updatedAt: '2026-09-20T11:00:00.000Z'
    };

    this.data.orders = [sampleCompletedOrder];

    // Seed Sample Reviews (বিভিন্ন চ্যানেল ও সেলারের জন্য রিভিউ)
    const seedReviews: Review[] = [
      {
        id: 'rev_101',
        orderId: sampleCompletedOrder.id,
        channelId: 'chn_daily_mindset',
        channelTitle: 'Daily Stoic Wisdom & Focus',
        buyerId: buyer1.id,
        buyerName: 'Mark Sterling (Sterling Capital)',
        sellerId: seller1.id,
        rating: 5,
        comment: 'Flawless acquisition process! Apex Studio Ventures walked me through the 7-day Google Brand Account manager handover step-by-step. All analytics matched 100%. Highly recommended seller!',
        communicationRating: 5,
        transferSpeedRating: 5,
        createdAt: '2026-09-20T12:00:00.000Z'
      },
      {
        id: 'rev_102',
        orderId: 'ord_ct_99011',
        channelId: 'chn_auntie_kitchen',
        channelTitle: "Auntie's Village Kitchen (আন্টির রান্নাঘর ও গ্রামীণ রেসিপি)",
        buyerId: 'usr_buyer_2',
        buyerName: 'তানভীর আহমেদ (Tanvir Content House)',
        sellerId: seller1.id,
        rating: 5,
        comment: 'অসাধারণ চ্যানেল! অর্গানিক ভিউয়ার্স এবং ভিডিও আপলোড করার পর দিন থেকেই ভালো ভিউ পাচ্ছি। সেলার পুরো প্রাইমারি ওনারশিপ বুঝিয়ে দিয়েছেন এবং ৭ দিন পর সফলভাবে হ্যান্ডওভার সম্পন্ন হয়েছে।',
        communicationRating: 5,
        transferSpeedRating: 5,
        createdAt: '2026-09-24T15:30:00.000Z'
      },
      {
        id: 'rev_103',
        channelId: 'chn_auntie_kitchen',
        channelTitle: "Auntie's Village Kitchen (আন্টির রান্নাঘর ও গ্রামীণ রেসিপি)",
        buyerId: 'usr_buyer_3',
        buyerName: 'রাকিবুল হাসান (Foodie BD)',
        sellerId: seller1.id,
        rating: 5,
        comment: 'অ্যাডসেন্স সম্পূর্ণ ভেরিফাইড ছিল এবং পিন ভেরিফিকেশন ঠিকঠাক। ১০০% বিশ্বস্ত ও সেফ ট্রানজেকশন হয়েছে।',
        communicationRating: 5,
        transferSpeedRating: 5,
        createdAt: '2026-10-02T11:20:00.000Z'
      },
      {
        id: 'rev_104',
        channelId: 'chn_auntie_kitchen',
        channelTitle: "Auntie's Village Kitchen (আন্টির রান্নাঘর ও গ্রামীণ রেসিপি)",
        buyerId: 'usr_buyer_4',
        buyerName: 'Shakil Rahman (Creator Hub)',
        sellerId: seller1.id,
        rating: 5,
        comment: 'Amazing experience. Silver play button is genuine and analytics screenshots were 100% accurate. 5-star rating deserved!',
        communicationRating: 5,
        transferSpeedRating: 5,
        createdAt: '2026-10-06T18:45:00.000Z'
      },
      {
        id: 'rev_105',
        orderId: 'ord_ct_77182',
        channelId: 'chn_auntie_bakes',
        channelTitle: "Auntie Ruby's Quick Sweets & Homemade Snacks (আন্টির সহজ রেসিপি)",
        buyerId: 'usr_buyer_1',
        buyerName: 'সাদিয়া ইসলাম',
        sellerId: seller2.id,
        rating: 5,
        comment: 'একাউন্টের বয়স এবং মনিটাইজেশন ক্লিন স্ট্রাইক। রেসিপি চ্যানেলটি কিনে আমি অত্যন্ত সন্তুষ্ট। পুরো সাপোর্ট দেওয়ার জন্য ধন্যবাদ।',
        communicationRating: 5,
        transferSpeedRating: 5,
        createdAt: '2026-09-29T14:10:00.000Z'
      },
      {
        id: 'rev_106',
        channelId: 'chn_pixel_odyssey',
        channelTitle: 'Pixel Odyssey Retro Gaming',
        buyerId: 'usr_buyer_2',
        buyerName: 'David Miller',
        sellerId: seller1.id,
        rating: 5,
        comment: 'Seamless transfer via Brand Account. Highly trustworthy escrow system with prompt communication.',
        communicationRating: 5,
        transferSpeedRating: 5,
        createdAt: '2026-10-04T09:15:00.000Z'
      },
      {
        id: 'rev_107',
        channelId: 'chn_crypto_alpha',
        channelTitle: 'Crypto Alpha Radar',
        buyerId: 'usr_buyer_1',
        buyerName: 'Nafis Chowdhury',
        sellerId: seller2.id,
        rating: 5,
        comment: 'High RPM verified on Studio. Elena provided swift response and complete cooperation throughout the 7-day protocol.',
        communicationRating: 5,
        transferSpeedRating: 5,
        createdAt: '2026-10-07T16:00:00.000Z'
      },
      {
        id: 'rev_108',
        channelId: 'chn_auntie_kitchen',
        channelTitle: "Auntie's Village Kitchen (আন্টির রান্নাঘর ও গ্রামীণ রেসিপি)",
        buyerId: 'usr_buyer_2',
        buyerName: 'ফারহান মাহমুদ (Dhaka Media)',
        sellerId: seller1.id,
        rating: 5,
        comment: 'অনলাইনে চ্যানেল কেনা নিয়ে অনেক ভয় ছিল, কিন্তু ChannelTrust-এর এসক্রো সিস্টেম আমাকে ১০০% নিশ্চিন্ত করেছে। যতক্ষণ না আমি নিজে গুগল ব্র্যান্ড একাউন্টের প্রাইমারি ওনার হলাম, ততক্ষণ সেলার কোনো টাকা পায়নি। কোনো প্রতারণার সুযোগ নেই, সবচেয়ে বিশ্বস্ত প্ল্যাটফর্ম!',
        communicationRating: 5,
        transferSpeedRating: 5,
        createdAt: '2026-10-09T10:15:00.000Z'
      },
      {
        id: 'rev_109',
        channelId: 'chn_daily_mindset',
        channelTitle: 'Daily Stoic Wisdom & Focus',
        buyerId: 'usr_buyer_3',
        buyerName: 'মাহিনুর রহমান (TechBangla Creator)',
        sellerId: seller1.id,
        rating: 5,
        comment: 'এখানে কোনো জিমেইল পাসওয়ার্ড চাওয়া হয় না, যা সবচেয়ে বড় সিকিউরিটি! অফিশিয়াল ইউটিউব স্টুডিও ওনারশিপ ট্রান্সফারের নিয়মে সব সুন্দরভাবে সম্পন্ন হয়েছে। সাপোর্ট টিম প্রতি মুহূর্তে সহায়তা করেছে। ১০০% ট্রাস্টেড!',
        communicationRating: 5,
        transferSpeedRating: 5,
        createdAt: '2026-10-10T14:20:00.000Z'
      },
      {
        id: 'rev_110',
        channelId: 'chn_auntie_bakes',
        channelTitle: "Auntie Ruby's Quick Sweets & Homemade Snacks (আন্টির সহজ রেসিপি)",
        buyerId: 'usr_buyer_4',
        buyerName: 'ইমরান হোসাইন (Digital Venture)',
        sellerId: seller2.id,
        rating: 5,
        comment: 'চ্যানেলের লাইভ অ্যানালিটিক্স, অর্গানিক অডিয়েন্স এবং মনিটাইজেশন ক্লিন স্ট্রাইক প্রমাণ ১০০% মিলে গেছে। ৭ দিনের কুলডাউন পিরিয়ডে সেলার ও প্ল্যাটফর্মের দায়িত্বশীলতা ছিল অসাধারণ। চোখ বন্ধ করে বিশ্বাস করা যায়।',
        communicationRating: 5,
        transferSpeedRating: 5,
        createdAt: '2026-10-11T16:40:00.000Z'
      }
    ];

    this.data.reviews = seedReviews;

    // Seed messages
    this.data.messages = [
      {
        id: 'msg_1',
        orderId: sampleCompletedOrder.id,
        senderId: buyer1.id,
        senderName: buyer1.name,
        senderRole: 'buyer',
        recipientId: seller1.id,
        text: 'Hi Apex, thrilled to proceed with the acquisition. My verified Google email for the Brand Account manager invitation is buyer.google.brand@gmail.com.',
        createdAt: '2026-09-12T11:00:00.000Z'
      },
      {
        id: 'msg_2',
        orderId: sampleCompletedOrder.id,
        senderId: seller1.id,
        senderName: seller1.name,
        senderRole: 'seller',
        recipientId: buyer1.id,
        text: 'Welcome Mark! I have sent the YouTube Studio Manager invite to buyer.google.brand@gmail.com. Please accept the email invite from Google so the 7-day clock starts.',
        createdAt: '2026-09-12T14:35:00.000Z'
      }
    ];
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // --- Channels ---
  public getChannels(): ChannelListing[] {
    return this.data.channels;
  }

  public getChannelById(id: string): ChannelListing | undefined {
    return this.data.channels.find(c => c.id === id);
  }

  public createChannel(channel: ChannelListing): ChannelListing {
    this.data.channels.unshift(channel);
    this.save();
    return channel;
  }

  public updateChannel(id: string, updates: Partial<ChannelListing>): ChannelListing | null {
    const idx = this.data.channels.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.channels[idx] = { ...this.data.channels[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.channels[idx];
  }

  public deleteChannel(id: string): boolean {
    const initialLen = this.data.channels.length;
    this.data.channels = this.data.channels.filter(c => c.id !== id);
    if (this.data.channels.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  public createOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.save();
    return order;
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | null {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    this.data.orders[idx] = { ...this.data.orders[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.orders[idx];
  }

  // --- Messages ---
  public getMessages(orderId?: string, channelId?: string, userId?: string): Message[] {
    return this.data.messages.filter(m => {
      if (orderId && m.orderId !== orderId) return false;
      if (channelId && m.channelId !== channelId) return false;
      if (userId && m.senderId !== userId && m.recipientId !== userId) return false;
      return true;
    });
  }

  public createMessage(msg: Message): Message {
    this.data.messages.push(msg);
    this.save();
    return msg;
  }

  // --- Reviews ---
  public getReviews(sellerId?: string, channelId?: string): Review[] {
    return this.data.reviews.filter(r => {
      if (sellerId && r.sellerId !== sellerId) return false;
      if (channelId && r.channelId !== channelId) return false;
      return true;
    });
  }

  public createReview(review: Review): Review {
    this.data.reviews.unshift(review);
    
    // Update seller rating and deals count
    const sellerReviews = this.data.reviews.filter(r => r.sellerId === review.sellerId);
    const avgRating = Number((sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length).toFixed(2));
    this.updateUser(review.sellerId, { rating: avgRating });

    this.save();
    return review;
  }

  // --- Admin Settings ---
  public getSettings(): WebsiteSettings {
    if (!this.data.settings) this.ensureEnrichedAdminData();
    return this.data.settings!;
  }

  public updateSettings(updates: Partial<WebsiteSettings>): WebsiteSettings {
    if (!this.data.settings) this.ensureEnrichedAdminData();
    this.data.settings = { ...this.data.settings!, ...updates };
    this.save();
    return this.data.settings;
  }

  // --- Admin Audit Logs ---
  public getAuditLogs(): AdminAuditLog[] {
    if (!this.data.auditLogs) this.ensureEnrichedAdminData();
    return this.data.auditLogs || [];
  }

  public createAuditLog(log: Omit<AdminAuditLog, 'id' | 'createdAt'>): AdminAuditLog {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    const item: AdminAuditLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.data.auditLogs.unshift(item);
    this.save();
    return item;
  }

  // --- Transactions ---
  public getTransactions(): Transaction[] {
    if (!this.data.transactions) this.ensureEnrichedAdminData();
    return this.data.transactions || [];
  }

  public createTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    if (!this.data.transactions) this.data.transactions = [];
    const item: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.data.transactions.unshift(item);
    this.save();
    return item;
  }

  // --- Support Tickets ---
  public getTickets(): SupportTicket[] {
    if (!this.data.tickets) this.ensureEnrichedAdminData();
    return this.data.tickets || [];
  }

  public getTicketById(id: string): SupportTicket | undefined {
    if (!this.data.tickets) this.ensureEnrichedAdminData();
    return this.data.tickets?.find(t => t.id === id);
  }

  public createTicketMessage(ticketId: string, msg: Omit<SupportTicketMessage, 'id' | 'createdAt'>): SupportTicket | null {
    if (!this.data.tickets) this.ensureEnrichedAdminData();
    const ticket = this.data.tickets?.find(t => t.id === ticketId);
    if (!ticket) return null;

    const newMsg: SupportTicketMessage = {
      ...msg,
      id: `tmsg_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    ticket.messages.push(newMsg);
    ticket.updatedAt = new Date().toISOString();
    this.save();
    return ticket;
  }

  public updateTicketStatus(ticketId: string, status: SupportTicket['status']): SupportTicket | null {
    if (!this.data.tickets) this.ensureEnrichedAdminData();
    const ticket = this.data.tickets?.find(t => t.id === ticketId);
    if (!ticket) return null;
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    this.save();
    return ticket;
  }

  // --- Coupons ---
  public getCoupons(): Coupon[] {
    if (!this.data.coupons) this.ensureEnrichedAdminData();
    return this.data.coupons || [];
  }

  public createCoupon(coupon: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>): Coupon {
    if (!this.data.coupons) this.data.coupons = [];
    const item: Coupon = {
      ...coupon,
      id: `cpn_${Date.now()}`,
      usageCount: 0,
      createdAt: new Date().toISOString()
    };
    this.data.coupons.unshift(item);
    this.save();
    return item;
  }

  public deleteCoupon(id: string): boolean {
    if (!this.data.coupons) return false;
    const initialLen = this.data.coupons.length;
    this.data.coupons = this.data.coupons.filter(c => c.id !== id);
    if (this.data.coupons.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Fraud Alerts ---
  public getFraudAlerts(): FraudAlert[] {
    if (!this.data.fraudAlerts) this.ensureEnrichedAdminData();
    return this.data.fraudAlerts || [];
  }

  public resolveFraudAlert(id: string, adminName: string): FraudAlert | null {
    if (!this.data.fraudAlerts) this.ensureEnrichedAdminData();
    const alert = this.data.fraudAlerts?.find(a => a.id === id);
    if (!alert) return null;
    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = adminName;
    this.save();
    return alert;
  }

  // --- Notifications ---
  public getNotifications(): NotificationItem[] {
    if (!this.data.notifications) this.ensureEnrichedAdminData();
    return this.data.notifications || [];
  }

  public createNotification(item: Omit<NotificationItem, 'id' | 'createdAt'>): NotificationItem {
    if (!this.data.notifications) this.data.notifications = [];
    const notif: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  public deleteNotification(id: string): boolean {
    if (!this.data.notifications) return false;
    const initialLen = this.data.notifications.length;
    this.data.notifications = this.data.notifications.filter(n => n.id !== id);
    if (this.data.notifications.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }


  public exportBackup(): any {
    return JSON.parse(JSON.stringify(this.data));
  }

  public restoreBackup(payload: any): boolean {
    if (payload && Array.isArray(payload.users) && Array.isArray(payload.channels)) {
      this.data = payload;
      this.save();
      return true;
    }
    return false;
  }

  private ensureEnrichedAdminData() {
    const defaultGateways: any[] = [
      {
        id: 'gw_bkash_merchant',
        name: 'বিকাশ মার্চেন্ট (bKash Merchant)',
        type: 'bdt',
        category: 'mobile_banking',
        accountNumber: '01712345678',
        accountHolderName: 'Alif Trust Media Escrow',
        instructions: "বিকাশ অ্যাপে 'Payment' অপশনে গিয়ে মার্চেন্ট নম্বরে টাকা পাঠান। রেফারেন্সে Order ID লিখুন।",
        isActive: true
      },
      {
        id: 'gw_nagad_merchant',
        name: 'নগদ অনলাইন (Nagad Escrow)',
        type: 'bdt',
        category: 'mobile_banking',
        accountNumber: '01812345678',
        accountHolderName: 'Alif Trust Media Escrow',
        instructions: "নগদ অ্যাপ থেকে Send Money বা Merchant Pay সম্পন্ন করে ট্রানজেকশন আইডি দিন।",
        isActive: true
      },
      {
        id: 'gw_city_bank',
        name: 'সিটি ব্যাংক (City Bank PLC)',
        type: 'bdt',
        category: 'bank',
        bankName: 'City Bank PLC',
        accountHolderName: 'Alif Sheen Media Group Ltd',
        accountNumber: '120349817201',
        branchName: 'Gulshan-2 Branch, Dhaka',
        routingNumber: '225261839',
        swiftCode: 'CIBLBDDH',
        instructions: "অনলাইন ব্যাংকিং (NPSB / BEFTN) বা যেকোনো ব্রাঞ্চ থেকে ডিপোজিট করে ডিপোজিট স্লিপের ছবি ও রেফারেন্স দিন।",
        isActive: true
      },
      {
        id: 'gw_islami_bank',
        name: 'ইসলামী ব্যাংক বাংলাদেশ (Islami Bank)',
        type: 'bdt',
        category: 'bank',
        bankName: 'Islami Bank Bangladesh PLC',
        accountHolderName: 'Alif Trust Tech Escrow',
        accountNumber: '2050145020199201',
        branchName: 'Motijheel Corporate Branch',
        routingNumber: '125273199',
        instructions: "Cellfin, i-Banking অথবা ব্রাঞ্চ ডিপোজিট করে ট্রানজেকশন স্লিপের স্ক্রিনশট আপলোড করুন।",
        isActive: true
      },
      {
        id: 'gw_usdt_trc20',
        name: 'USDT - Tron Network (TRC-20)',
        type: 'usdt',
        category: 'crypto',
        accountNumber: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        accountHolderName: 'Official Escrow Vault (Tron)',
        instructions: "শুধুমাত্র Tron (TRC-20) নেটওয়ার্কে USDT ট্রান্সফার করুন। পাঠানোর পর ব্লকচেইন TxID দিন।",
        isActive: true
      },
      {
        id: 'gw_usdt_bep20',
        name: 'USDT - BNB Smart Chain (BEP-20)',
        type: 'usdt',
        category: 'crypto',
        accountNumber: '0x55d398326f99059fF775485246999027B3197955',
        accountHolderName: 'Official BSC Vault',
        instructions: "শুধুমাত্র BNB Smart Chain (BEP-20) নেটওয়ার্কে পাঠান।",
        isActive: true
      }
    ];

    if (!this.data.settings) {
      this.data.settings = {
        siteName: 'Alif Trust Escrow & Marketplace',
        siteTagline: 'নিরাপদ ইউটিউব ও সোশ্যাল মিডিয়া চ্যানেল কেনাবেচার বিশ্বস্ত মাধ্যম',
        logoUrl: '',
        primaryColor: '#e11d48',
        commissionRate: 5,
        minimumListingPrice: 50,
        featuredListingFee: 25,
        maintenanceMode: false,
        contactEmail: 'support@aliftrust.com',
        contactPhone: '+8801700000000',
        whatsappSupport: '+8801700000000',
        bkashMerchantNumber: '01712345678',
        nagadMerchantNumber: '01812345678',
        bankDetails: 'City Bank Ltd, Account: 120349817201, Branch: Gulshan 2, Dhaka',
        usdtTrc20Address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        usdtBep20Address: '0x55d398326f99059fF775485246999027B3197955',
        bdtConversionRate: 122,
        customGateways: defaultGateways,
        enable2FA: true,
        termsOfService: 'আলিফ ট্রাস্ট এসক্রো প্ল্যাটফর্মে সকল লেনদেন ডিজিটাল এসক্রো চুক্তির অধীন। বায়ার কর্তৃক পুরো পেমেন্ট জমার পর সেলার ৭ দিনের মধ্যে প্রাইমারি ওনারশিপ হস্তান্তর করবে।',
        privacyPolicy: 'ব্যবহারকারীদের সমস্ত ব্যক্তিগত তথ্য, এনআইডি ও পেমেন্ট ক্রেডেনশিয়াল কঠোর এনক্রিপশনে সংরক্ষিত থাকে।',
        refundPolicy: 'সেলার ব্যর্থ হলে বা চ্যানেলে ভুল তথ্য থাকলে বায়ার শতভাগ মানিব্যাক রিফান্ড পাবে।',
        safetyProtocol: '১. ৭ দিনের ওনারশিপ ট্রায়াল ২. টু-ফ্যাক্টর অথেনটিকেশন ৩. এসক্রো ভল্ট ডিপোজিট।'
      };
    } else {
      if (!this.data.settings.customGateways || this.data.settings.customGateways.length === 0) {
        this.data.settings.customGateways = defaultGateways;
      }
      if (!this.data.settings.bdtConversionRate) {
        this.data.settings.bdtConversionRate = 122;
      }
      if (!this.data.settings.usdtTrc20Address) {
        this.data.settings.usdtTrc20Address = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
      }
    }

    if (!this.data.coupons || this.data.coupons.length === 0) {
      this.data.coupons = [
        {
          id: 'cpn_alif2026',
          code: 'ALIF2026',
          discountType: 'percentage',
          discountValue: 10,
          minOrderAmount: 500,
          maxDiscount: 50,
          validUntil: '2026-12-31T23:59:59.000Z',
          usageCount: 14,
          usageLimit: 100,
          isActive: true,
          createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
          id: 'cpn_eid50',
          code: 'EIDBONUS',
          discountType: 'fixed',
          discountValue: 25,
          minOrderAmount: 300,
          validUntil: '2026-11-30T23:59:59.000Z',
          usageCount: 28,
          usageLimit: 50,
          isActive: true,
          createdAt: '2026-02-01T00:00:00.000Z'
        },
        {
          id: 'cpn_vipbuyer',
          code: 'VIPBUYER',
          discountType: 'percentage',
          discountValue: 15,
          minOrderAmount: 2000,
          maxDiscount: 150,
          validUntil: '2026-12-31T23:59:59.000Z',
          usageCount: 6,
          usageLimit: 20,
          isActive: true,
          createdAt: '2026-03-01T00:00:00.000Z'
        }
      ];
    }

    if (!this.data.transactions || this.data.transactions.length === 0) {
      this.data.transactions = [
        {
          id: 'tx_escrow_101',
          orderId: 'ord_1',
          userId: 'usr_buyer_1',
          userName: 'Alex Chen',
          userRole: 'buyer',
          type: 'escrow_lock',
          amount: 2500,
          currency: 'USD',
          fee: 125,
          paymentMethod: 'bkash',
          paymentProvider: 'bKash Merchant Pay',
          transactionRef: 'BKS-992148201',
          status: 'success',
          notes: 'Order #ord_1 full escrow lock confirmed',
          createdAt: '2026-10-10T14:32:00.000Z'
        },
        {
          id: 'tx_escrow_102',
          orderId: 'ord_1',
          userId: 'usr_seller_1',
          userName: 'Marcus Vance',
          userRole: 'seller',
          type: 'payout',
          amount: 2375,
          currency: 'USD',
          fee: 0,
          paymentMethod: 'bank_transfer',
          paymentProvider: 'City Bank Bangladesh',
          transactionRef: 'CB-8831920',
          status: 'success',
          notes: 'Net seller payout released after primary ownership confirmed',
          createdAt: '2026-10-14T09:15:00.000Z'
        },
        {
          id: 'tx_escrow_103',
          orderId: 'ord_2',
          userId: 'usr_buyer_2',
          userName: 'Sarah Jenkins',
          userRole: 'buyer',
          type: 'deposit',
          amount: 14500,
          currency: 'USD',
          fee: 725,
          paymentMethod: 'crypto',
          paymentProvider: 'Binance USDT (TRC20)',
          transactionRef: 'TX-USDT-9941031',
          status: 'success',
          notes: 'High-value channel escrow deposit in safe vault',
          createdAt: '2026-10-12T16:20:00.000Z'
        },
        {
          id: 'tx_escrow_104',
          orderId: 'ord_3',
          userId: 'usr_buyer_1',
          userName: 'Alex Chen',
          userRole: 'buyer',
          type: 'escrow_lock',
          amount: 3200,
          currency: 'USD',
          fee: 160,
          paymentMethod: 'nagad',
          paymentProvider: 'Nagad Online Merchant',
          transactionRef: 'NGD-5501829',
          status: 'pending',
          notes: 'Disputed escrow held awaiting ownership resolution',
          createdAt: '2026-10-13T11:45:00.000Z'
        }
      ];
    }

    if (!this.data.fraudAlerts || this.data.fraudAlerts.length === 0) {
      this.data.fraudAlerts = [
        {
          id: 'frd_101',
          userId: 'usr_seller_2',
          userName: 'Elena Rostova',
          userEmail: 'elena@rostovamedia.com',
          riskScore: 82,
          riskLevel: 'high',
          triggerReason: 'Duplicate Channel Listing Attempt',
          details: 'User tried to list @SnapFactsViral which is already owned by verified seller usr_seller_1.',
          targetId: 'chn_viral_shorts',
          targetType: 'channel',
          resolved: false,
          createdAt: '2026-10-14T10:15:00.000Z'
        },
        {
          id: 'frd_102',
          userId: 'usr_buyer_1',
          userName: 'Alex Chen',
          userEmail: 'buyer@channeltrust.com',
          riskScore: 45,
          riskLevel: 'medium',
          triggerReason: 'Multiple VPN logins within 15 minutes',
          details: 'IP switched from Dhaka, Bangladesh (AS45888) to Frankfurt, Germany in 12 minutes.',
          targetId: 'usr_buyer_1',
          targetType: 'login',
          resolved: true,
          resolvedAt: '2026-10-14T12:00:00.000Z',
          resolvedBy: 'System Admin',
          createdAt: '2026-10-14T11:20:00.000Z'
        },
        {
          id: 'frd_103',
          userId: 'usr_seller_1',
          userName: 'Marcus Vance',
          userEmail: 'seller@channeltrust.com',
          riskScore: 35,
          riskLevel: 'low',
          triggerReason: 'Rapid asking price adjustment (+40%)',
          details: 'Channel price modified from $2,500 to $3,500 within 2 hours of listing approval.',
          targetId: 'chn_tech_central',
          targetType: 'channel',
          resolved: true,
          resolvedAt: '2026-10-13T16:00:00.000Z',
          resolvedBy: 'System Admin',
          createdAt: '2026-10-13T15:00:00.000Z'
        }
      ];
    }

    if (!this.data.tickets || this.data.tickets.length === 0) {
      this.data.tickets = [
        {
          id: 'tkt_101',
          ticketNumber: 'TK-9021',
          userId: 'usr_buyer_1',
          userName: 'Alex Chen',
          userEmail: 'buyer@channeltrust.com',
          subject: 'ইউটিউব ব্র্যান্ড একাউন্ট প্রাইমারি ওনার ইনভাইটেশন সম্পর্কিত সহায়তা',
          category: 'transfer',
          priority: 'urgent',
          status: 'in_progress',
          messages: [
            {
              id: 'tmsg_1',
              senderId: 'usr_buyer_1',
              senderName: 'Alex Chen',
              senderRole: 'buyer',
              text: 'সেলার ইনভাইটেশন পাঠিয়েছেন, কিন্তু ৭ দিন পর প্রাইমারি ওনার ট্রান্সফার বাটন ক্লিক করার নিয়মটি বুঝতে পারছি না। দয়া করে এসক্রো টিম কনফার্ম করবেন?',
              createdAt: '2026-10-14T12:00:00.000Z'
            },
            {
              id: 'tmsg_2',
              senderId: 'usr_admin_1',
              senderName: 'System Admin',
              senderRole: 'admin',
              text: 'হ্যালো অ্যালেক্স, ইউটিউবের অফিশিয়াল পলিসি অনুযায়ী ম্যানেজার হিসেবে ৭ দিন অতিবাহিত হওয়ার পরেই প্রাইমারি ওনার হিসেবে প্রমোট করা সম্ভব। এসক্রো সিকিউরিটি লক চালু আছে, চিন্তার কারণ নেই।',
              createdAt: '2026-10-14T12:45:00.000Z'
            }
          ],
          createdAt: '2026-10-14T12:00:00.000Z',
          updatedAt: '2026-10-14T12:45:00.000Z'
        },
        {
          id: 'tkt_102',
          ticketNumber: 'TK-8842',
          userId: 'usr_seller_2',
          userName: 'Elena Rostova',
          userEmail: 'elena@rostovamedia.com',
          subject: 'বিকাশ ও ব্যাংক পেআউট সেটআপ ভেরিফিকেশন',
          category: 'payment',
          priority: 'medium',
          status: 'resolved',
          messages: [
            {
              id: 'tmsg_3',
              senderId: 'usr_seller_2',
              senderName: 'Elena Rostova',
              senderRole: 'seller',
              text: 'আমার বিক্রয়মূল্যের টাকা বিকাশে নাকি সরাসরি সিটি ব্যাংক অ্যাকাউন্টে আসবে?',
              createdAt: '2026-10-13T09:00:00.000Z'
            },
            {
              id: 'tmsg_4',
              senderId: 'usr_admin_1',
              senderName: 'System Admin',
              senderRole: 'admin',
              text: 'আপনার প্রোফাইলে সেলার সেটিংসে যে ব্যাংক একাউন্ট দেওয়া আছে, তাতে সরাসরি বিডিটি সমমূল্যে পেআউট চলে যাবে।',
              createdAt: '2026-10-13T09:30:00.000Z'
            }
          ],
          createdAt: '2026-10-13T09:00:00.000Z',
          updatedAt: '2026-10-13T09:30:00.000Z'
        }
      ];
    }

    if (!this.data.notifications || this.data.notifications.length === 0) {
      this.data.notifications = [
        {
          id: 'notif_1',
          title: '🛡️ ১০০% সুরক্ষিত এসক্রো গ্যারান্টি',
          message: 'আলিফ ট্রাস্টে প্রতিটি লেনদেন ৭ দিনের ওনারশিপ ট্রায়াল এবং মনিটাইজেশন রি-ভেরিফিকেশন সম্পন্ন হওয়ার পর রিলিজ হয়।',
          targetAudience: 'all',
          type: 'info',
          isActive: true,
          createdAt: '2026-10-01T00:00:00.000Z'
        },
        {
          id: 'notif_2',
          title: '🎉 মেগা অফার: প্ল্যাটফর্ম ফি-তে ৫০% ছাড়!',
          message: 'কুপন কোড EIDBONUS ব্যবহার করে মাত্র ২.৫% ফিতে চ্যানেল বিক্রি বা কিনুন।',
          targetAudience: 'all',
          type: 'promo',
          isActive: true,
          createdAt: '2026-10-10T00:00:00.000Z'
        }
      ];
    }

    if (!this.data.auditLogs || this.data.auditLogs.length === 0) {
      this.data.auditLogs = [
        {
          id: 'log_1',
          adminId: 'usr_admin_1',
          adminName: 'System Admin',
          action: 'Channel Approved',
          targetType: 'channel',
          targetId: 'chn_auntie_kitchen',
          details: 'Approved verified cooking channel after AdSense proof review.',
          ipAddress: '103.114.98.22',
          createdAt: '2026-10-14T08:30:00.000Z'
        },
        {
          id: 'log_2',
          adminId: 'usr_admin_1',
          adminName: 'System Admin',
          action: 'Seller Badge Granted',
          targetType: 'user',
          targetId: 'usr_seller_1',
          details: 'Verified seller badge enabled after NID and video KYC completion.',
          ipAddress: '103.114.98.22',
          createdAt: '2026-10-13T11:00:00.000Z'
        },
        {
          id: 'log_3',
          adminId: 'usr_admin_1',
          adminName: 'System Admin',
          action: 'Escrow Dispute Freeze',
          targetType: 'dispute',
          targetId: 'ord_3',
          details: 'Escrow payment put on temporary freeze for 7-day manager audit.',
          ipAddress: '103.114.98.22',
          createdAt: '2026-10-14T14:00:00.000Z'
        }
      ];
    }

    // Ensure Super Admin User: alifsheenshopping@gmail.com with password '019Alif11#'
    const superAdminEmail = 'alifsheenshopping@gmail.com';
    const superAdminPassHash = hashPassword('019Alif11#');

    const existingAdmin = this.data.users.find(u => u.email.toLowerCase() === superAdminEmail.toLowerCase());
    if (existingAdmin) {
      existingAdmin.role = 'admin';
      existingAdmin.passwordHash = superAdminPassHash;
      existingAdmin.name = 'Alif Sheen Admin';
      existingAdmin.isVerifiedSeller = true;
    } else {
      this.data.users.unshift({
        id: 'usr_admin_alif',
        name: 'Alif Sheen Admin',
        email: superAdminEmail,
        passwordHash: superAdminPassHash,
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-01T00:00:00.000Z',
        isVerifiedSeller: true,
        bio: 'Alif Sheen Group & Alif Trust Super Administrator'
      });
    }

    // Demote any other user with role 'admin' to 'buyer' so ONLY alifsheenshopping@gmail.com is admin
    this.data.users.forEach(u => {
      if (u.email.toLowerCase() !== superAdminEmail.toLowerCase() && u.role === 'admin') {
        u.role = 'buyer';
      }
    });

    this.save();
  }
}

export const db = new Database();
