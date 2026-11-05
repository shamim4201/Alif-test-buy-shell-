import express, { Request, Response } from 'express';
import { db, verifyToken } from '../db';
import { Review, User } from '../types';

export const reviewsRouter = express.Router();

reviewsRouter.get('/', (req: Request, res: Response) => {
  const { sellerId, channelId, status } = req.query;
  // By default, public browse shows only approved reviews unless status is specified
  const targetStatus = status ? (status as string) : 'approved';
  const reviews = db.getReviews(
    sellerId as string | undefined,
    channelId as string | undefined,
    targetStatus === 'all' ? undefined : (targetStatus as 'pending' | 'approved' | 'rejected')
  );
  res.json({ reviews });
});

reviewsRouter.post('/', (req: Request, res: Response) => {
  // Optional auth extraction
  let user: User | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      user = db.getUserById(payload.id) || null;
    }
  }

  const { orderId, channelId, rating, comment, communicationRating, transferSpeedRating, reviewerName } = req.body;

  // Case 1: Channel-specific or General platform review
  if (channelId || !orderId) {
    const channel = channelId ? db.getChannelById(channelId) : (db.getChannels()[0] || null);
    const targetChannelId = channel ? channel.id : (channelId || 'chn_platform');
    const targetChannelTitle = channel ? channel.title : 'ChannelTrust ভেরিফাইড একাউন্ট লেনদেন';
    const targetSellerId = channel ? channel.sellerId : 'usr_seller_1';

    const numRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const finalBuyerName = (user ? user.name : (reviewerName || 'যাচাইকৃত ক্রেতা')).trim();
    const finalBuyerId = user ? user.id : `guest_${Date.now()}`;

    // Admin submissions are auto-approved; users and guests go to pending moderation
    const initialStatus = user?.role === 'admin' ? 'approved' : 'pending';

    const newReview: Review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      channelId: targetChannelId,
      channelTitle: targetChannelTitle,
      buyerId: finalBuyerId,
      buyerName: finalBuyerName,
      sellerId: targetSellerId,
      rating: numRating,
      comment: (comment || 'চ্যানেলটি খুবই ভালো ও সন্তোষজনক ছিল। দ্রুত সব সাপোর্ট পেয়েছি।').trim(),
      communicationRating: Math.min(5, Math.max(1, Number(communicationRating) || 5)),
      transferSpeedRating: Math.min(5, Math.max(1, Number(transferSpeedRating) || 5)),
      status: initialStatus,
      createdAt: new Date().toISOString()
    };

    db.createReview(newReview);
    return res.status(201).json({
      review: newReview,
      message: initialStatus === 'pending'
        ? 'আপনার রিভিউ সফলভাবে জমা দেওয়া হয়েছে এবং এডমিন অনুমোদনের জন্য অপেক্ষমাণ। একবার জমা দিলে রিভিউ অপসারণ করা যায় না।'
        : 'রিভিউ সফলভাবে প্রকাশিত হয়েছে।'
    });
  }

  // Case 2: Order-specific review
  if (!user) {
    return res.status(401).json({ error: 'Please sign in to review an order' });
  }

  const order = db.getOrderById(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.buyerId !== user.id) {
    return res.status(403).json({ error: 'Only the verified buyer of this order can leave a review' });
  }

  if (order.status !== 'completed') {
    return res.status(400).json({ error: 'Reviews can only be submitted for completed orders' });
  }

  const existingReviews = db.getAllReviews().filter(r => r.orderId === orderId);
  if (existingReviews.length > 0) {
    return res.status(400).json({ error: 'এই অর্ডারের জন্য রিভিউ ইতিমধ্যে জমা দেওয়া হয়েছে। রিভিউ পরিবর্তন বা অপসারণযোগ্য নয়।' });
  }

  const numRating = Math.min(5, Math.max(1, Number(rating) || 5));
  const newReview: Review = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderId: order.id,
    channelId: order.channelId,
    channelTitle: order.channelTitle,
    buyerId: user.id,
    buyerName: user.name,
    sellerId: order.sellerId,
    rating: numRating,
    comment: (comment || 'Smooth and transparent transaction. Highly recommended!').trim(),
    communicationRating: Math.min(5, Math.max(1, Number(communicationRating) || 5)),
    transferSpeedRating: Math.min(5, Math.max(1, Number(transferSpeedRating) || 5)),
    status: user.role === 'admin' ? 'approved' : 'pending',
    createdAt: new Date().toISOString()
  };

  db.createReview(newReview);
  res.status(201).json({
    review: newReview,
    message: newReview.status === 'pending'
      ? 'আপনার রিভিউ সফলভাবে জমা দেওয়া হয়েছে এবং এডমিন অনুমোদনের অপেক্ষায় রয়েছে।'
      : 'রিভিউ প্রকাশিত হয়েছে।'
  });
});

// Explicitly disallow general deletion by buyers/sellers
reviewsRouter.delete('/:id', (req: Request, res: Response) => {
  return res.status(403).json({
    error: 'রিভিউ অপরিবর্তনীয় ও স্থায়ী। ব্যবহারকারী রিভিউ মুছে ফেলতে পারবেন না। কেবল এডমিন প্যানেল থেকে অনুমোদন বা ব্যবস্থাপনা সম্ভব।'
  });
});
