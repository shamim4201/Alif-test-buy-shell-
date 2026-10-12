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
  OrderStatus
} from './types';

interface DatabaseSchema {
  users: User[];
  channels: ChannelListing[];
  orders: Order[];
  messages: Message[];
  reviews: Review[];
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
        return;
      } catch (e) {
        console.error('Failed to parse database.json, re-initializing seed data', e);
      }
    }

    this.seed();
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
      id: 'usr_admin_1',
      name: 'System Admin',
      email: 'admin@channeltrust.com',
      passwordHash: hashPassword('admin1234'),
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-01T00:00:00.000Z',
      isVerifiedSeller: true,
      bio: 'ChannelTrust Platform Compliance & Dispute Officer'
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
}

export const db = new Database();
