import express, { Request, Response } from 'express';
import { db } from '../db';
import { authenticate, requireRole } from './auth';
import { ChannelListing, User } from '../types';

export const channelsRouter = express.Router();

channelsRouter.get('/', (req: Request, res: Response) => {
  const {
    search,
    niche,
    accountType,
    budgetPreset,
    minSubs,
    maxSubs,
    minPrice,
    maxPrice,
    monetization,
    verifiedOnly,
    platform,
    sellerId,
    status,
    sort
  } = req.query;

  let channels = db.getChannels();

  // Filter by seller
  if (sellerId) {
    channels = channels.filter(c => c.sellerId === sellerId);
  } else if (!status || status !== 'all') {
    // By default, public browse shows only active & approved channels
    // unless admin or seller views their own
    channels = channels.filter(c => c.status === 'active' && c.verificationStatus === 'approved');
  }

  // Filter by platform (youtube, facebook, tiktok, instagram, telegram, twitter)
  if (platform && typeof platform === 'string' && platform !== 'all') {
    channels = channels.filter(c => (c.platform || 'youtube') === platform);
  }

  // Account Type filter
  if (accountType && typeof accountType === 'string' && accountType !== 'all') {
    channels = channels.filter(c => c.accountType === accountType);
  }

  // Search keyword in title, handle, description, niche, tags, accountType, platform
  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    // Synonym mapping for Bengali / English terms (e.g. আন্টি / auntie / রান্না / cooking, facebook / ফেসবুক, tiktok / টিকটক)
    const isAuntieOrCooking = q.includes('আন্টি') || q.includes('anti') || q.includes('aunt') || q.includes('রান্না') || q.includes('কুকিং') || q.includes('রেসিপি');
    const isGaming = q.includes('গেম') || q.includes('gaming');
    const isCashCow = q.includes('ক্যাশ') || q.includes('cash');
    const isFacebook = q.includes('ফেসবুক') || q.includes('facebook') || q.includes('fb') || q.includes('পেজ') || q.includes('page');
    const isTiktok = q.includes('টিকটক') || q.includes('tiktok') || q.includes('tt');
    const isInstagram = q.includes('ইনস্টাগ্রাম') || q.includes('instagram') || q.includes('insta') || q.includes('ig');
    const isTelegram = q.includes('টেলিগ্রাম') || q.includes('telegram') || q.includes('tg');
    const isTwitter = q.includes('টুইটার') || q.includes('twitter') || q === 'x';
    const isYoutube = q.includes('ইউটিউব') || q.includes('youtube') || q.includes('yt');

    channels = channels.filter(c => {
      const cPlatform = c.platform || 'youtube';
      const matchText =
        c.title.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.niche.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        cPlatform.toLowerCase().includes(q) ||
        (c.monetizationTool && c.monetizationTool.toLowerCase().includes(q)) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(q))) ||
        (c.accountType && c.accountType.toLowerCase().includes(q));

      if (matchText) return true;
      if (isFacebook && cPlatform === 'facebook') return true;
      if (isTiktok && cPlatform === 'tiktok') return true;
      if (isInstagram && cPlatform === 'instagram') return true;
      if (isTelegram && cPlatform === 'telegram') return true;
      if (isTwitter && cPlatform === 'twitter') return true;
      if (isYoutube && cPlatform === 'youtube') return true;

      if (isAuntieOrCooking && (c.accountType === 'cooking_lifestyle' || c.niche.toLowerCase().includes('lifestyle') || c.title.toLowerCase().includes('kitchen') || c.title.toLowerCase().includes('cooking') || c.title.toLowerCase().includes('auntie'))) {
        return true;
      }
      if (isGaming && (c.accountType === 'gaming_stream' || c.niche.toLowerCase().includes('gaming'))) {
        return true;
      }
      if (isCashCow && c.accountType === 'faceless_cash_cow') {
        return true;
      }
      return false;
    });
  }

  // Niche filter
  if (niche && typeof niche === 'string' && niche !== 'All') {
    channels = channels.filter(c => c.niche.toLowerCase() === niche.toLowerCase());
  }

  // Budget preset filter
  if (budgetPreset && typeof budgetPreset === 'string') {
    if (budgetPreset === 'under_1k') {
      channels = channels.filter(c => c.askingPrice <= 1000);
    } else if (budgetPreset === '1k_3k') {
      channels = channels.filter(c => c.askingPrice >= 1000 && c.askingPrice <= 3000);
    } else if (budgetPreset === '3k_8k') {
      channels = channels.filter(c => c.askingPrice >= 3000 && c.askingPrice <= 8000);
    } else if (budgetPreset === '8k_15k') {
      channels = channels.filter(c => c.askingPrice >= 8000 && c.askingPrice <= 15000);
    } else if (budgetPreset === '15k_plus') {
      channels = channels.filter(c => c.askingPrice >= 15000);
    }
  }

  // Min & max subscribers
  if (minSubs) {
    const val = Number(minSubs);
    if (!isNaN(val)) channels = channels.filter(c => c.subscribers >= val);
  }
  if (maxSubs) {
    const val = Number(maxSubs);
    if (!isNaN(val)) channels = channels.filter(c => c.subscribers <= val);
  }

  // Min & max price
  if (minPrice) {
    const val = Number(minPrice);
    if (!isNaN(val)) channels = channels.filter(c => c.askingPrice >= val);
  }
  if (maxPrice) {
    const val = Number(maxPrice);
    if (!isNaN(val)) channels = channels.filter(c => c.askingPrice <= val);
  }

  // Monetization filter
  if (monetization && typeof monetization === 'string' && monetization !== 'all') {
    channels = channels.filter(c => c.monetizationStatus === monetization);
  }

  // Verified seller only
  if (verifiedOnly === 'true') {
    const usersMap = new Map(db.getUsers().map(u => [u.id, u]));
    channels = channels.filter(c => {
      const seller = usersMap.get(c.sellerId);
      return seller && seller.isVerifiedSeller;
    });
  }

  // Sort
  if (sort === 'price_asc') {
    channels.sort((a, b) => a.askingPrice - b.askingPrice);
  } else if (sort === 'price_desc') {
    channels.sort((a, b) => b.askingPrice - a.askingPrice);
  } else if (sort === 'subs_desc') {
    channels.sort((a, b) => b.subscribers - a.subscribers);
  } else if (sort === 'revenue_desc') {
    channels.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);
  } else {
    // Newest first by default
    channels.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({ channels });
});

channelsRouter.get('/:id', (req: Request, res: Response) => {
  const channel = db.getChannelById(req.params.id);
  if (!channel) {
    return res.status(404).json({ error: 'Channel listing not found' });
  }

  const seller = db.getUserById(channel.sellerId);
  const reviews = db.getReviews(channel.sellerId);

  res.json({
    channel,
    seller: seller ? {
      id: seller.id,
      name: seller.name,
      avatar: seller.avatar,
      isVerifiedSeller: seller.isVerifiedSeller,
      rating: seller.rating || 5.0,
      dealsCount: seller.dealsCount || 0,
      createdAt: seller.createdAt,
      bio: seller.bio
    } : null,
    reviews
  });
});

channelsRouter.post('/', authenticate, requireRole(['seller', 'admin']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const {
    title,
    handle,
    channelUrl,
    niche,
    accountType,
    primaryLanguage,
    tags,
    subscribers,
    lifetimeViews,
    monthlyViews,
    monthlyRevenue,
    monetizationStatus,
    strikeStatus,
    hasSilverButton,
    askingPrice,
    minOfferPrice,
    description,
    creationYear,
    videoCount,
    analyticsScreenshots,
    audience
  } = req.body;

  if (!title || !channelUrl || !niche || askingPrice === undefined) {
    return res.status(400).json({ error: 'Title, YouTube URL, niche, and asking price are required' });
  }

  if (Number(askingPrice) <= 0) {
    return res.status(400).json({ error: 'Asking price must be greater than 0' });
  }

  const newChannel: ChannelListing = {
    id: `chn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sellerId: user.id,
    sellerName: user.name,
    sellerEmail: user.email,
    sellerRating: user.rating || 5.0,
    sellerDealsCount: user.dealsCount || 0,
    title: title.trim(),
    handle: handle ? (handle.startsWith('@') ? handle : `@${handle}`) : `@${title.replace(/\s+/g, '')}`,
    channelUrl: channelUrl.trim(),
    niche: niche.trim(),
    accountType: accountType || 'general',
    primaryLanguage: primaryLanguage || 'English',
    tags: Array.isArray(tags) ? tags : [],
    subscribers: Number(subscribers) || 0,
    lifetimeViews: Number(lifetimeViews) || 0,
    monthlyViews: Number(monthlyViews) || 0,
    monthlyRevenue: Number(monthlyRevenue) || 0,
    monetizationStatus: monetizationStatus || 'monetized',
    strikeStatus: strikeStatus || 'clean',
    hasSilverButton: Boolean(hasSilverButton),
    askingPrice: Number(askingPrice),
    minOfferPrice: minOfferPrice ? Number(minOfferPrice) : undefined,
    description: description || '',
    creationYear: Number(creationYear) || new Date().getFullYear(),
    videoCount: Number(videoCount) || 10,
    analyticsScreenshots: Array.isArray(analyticsScreenshots) ? analyticsScreenshots : [],
    // Verified sellers or admins get instant approval; others get pending
    verificationStatus: user.role === 'admin' || user.isVerifiedSeller ? 'approved' : 'pending',
    isFeatured: false,
    status: user.role === 'admin' || user.isVerifiedSeller ? 'active' : 'pending',
    audience: audience || {
      topCountries: [
        { country: 'United States', percentage: 50 },
        { country: 'United Kingdom', percentage: 20 },
        { country: 'Canada', percentage: 15 }
      ],
      ageDistribution: [
        { range: '18-24', percentage: 40 },
        { range: '25-34', percentage: 45 }
      ],
      genderSplit: { male: 70, female: 30 }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.createChannel(newChannel);
  res.status(201).json({ channel: newChannel });
});

channelsRouter.put('/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const channel = db.getChannelById(req.params.id);

  if (!channel) {
    return res.status(404).json({ error: 'Channel listing not found' });
  }

  if (channel.sellerId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'You do not have permission to edit this listing' });
  }

  const {
    title,
    handle,
    channelUrl,
    niche,
    subscribers,
    lifetimeViews,
    monthlyViews,
    monthlyRevenue,
    monetizationStatus,
    strikeStatus,
    hasSilverButton,
    askingPrice,
    minOfferPrice,
    description,
    creationYear,
    videoCount,
    analyticsScreenshots,
    status
  } = req.body;

  const updates: Partial<ChannelListing> = {};
  if (title) updates.title = title;
  if (handle) updates.handle = handle;
  if (channelUrl) updates.channelUrl = channelUrl;
  if (niche) updates.niche = niche;
  if (subscribers !== undefined) updates.subscribers = Number(subscribers);
  if (lifetimeViews !== undefined) updates.lifetimeViews = Number(lifetimeViews);
  if (monthlyViews !== undefined) updates.monthlyViews = Number(monthlyViews);
  if (monthlyRevenue !== undefined) updates.monthlyRevenue = Number(monthlyRevenue);
  if (monetizationStatus) updates.monetizationStatus = monetizationStatus;
  if (strikeStatus) updates.strikeStatus = strikeStatus;
  if (hasSilverButton !== undefined) updates.hasSilverButton = Boolean(hasSilverButton);
  if (askingPrice !== undefined) updates.askingPrice = Number(askingPrice);
  if (minOfferPrice !== undefined) updates.minOfferPrice = Number(minOfferPrice);
  if (description !== undefined) updates.description = description;
  if (creationYear !== undefined) updates.creationYear = Number(creationYear);
  if (videoCount !== undefined) updates.videoCount = Number(videoCount);
  if (analyticsScreenshots !== undefined) updates.analyticsScreenshots = analyticsScreenshots;
  if (status && ['active', 'paused', 'sold'].includes(status)) updates.status = status;

  const updated = db.updateChannel(channel.id, updates);
  res.json({ channel: updated });
});

channelsRouter.delete('/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const channel = db.getChannelById(req.params.id);

  if (!channel) {
    return res.status(404).json({ error: 'Channel listing not found' });
  }

  if (channel.sellerId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'You do not have permission to delete this listing' });
  }

  db.deleteChannel(channel.id);
  res.json({ success: true, message: 'Channel listing deleted successfully' });
});
