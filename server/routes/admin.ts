import express, { Request, Response } from 'express';
import { db } from '../db';
import { authenticate, requireRole } from './auth';

export const adminRouter = express.Router();

// Admin-only middleware for all routes here
adminRouter.use(authenticate, requireRole(['admin']));

adminRouter.get('/stats', (req: Request, res: Response) => {
  const channels = db.getChannels();
  const orders = db.getOrders();
  const users = db.getUsers();

  const completedOrders = orders.filter(o => o.status === 'completed');
  const disputedOrders = orders.filter(o => o.status === 'disputed');
  const activeOrders = orders.filter(o => o.status === 'transfer_in_progress' || o.status === 'payment_confirmed');

  const totalVolume = completedOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalFees = completedOrders.reduce((sum, o) => sum + o.platformFee, 0);

  const pendingListingApprovals = channels.filter(c => c.verificationStatus === 'pending');
  const activeListings = channels.filter(c => c.status === 'active' && c.verificationStatus === 'approved');

  res.json({
    totalVolume,
    totalFees,
    totalListings: channels.length,
    activeListings: activeListings.length,
    pendingApprovalsCount: pendingListingApprovals.length,
    totalOrders: orders.length,
    completedOrdersCount: completedOrders.length,
    activeOrdersCount: activeOrders.length,
    disputedOrdersCount: disputedOrders.length,
    totalUsers: users.length,
    sellersCount: users.filter(u => u.role === 'seller').length,
    buyersCount: users.filter(u => u.role === 'buyer').length
  });
});

adminRouter.post('/channels/:id/review', (req: Request, res: Response) => {
  const { decision, notes } = req.body; // 'approved' or 'rejected'
  const channel = db.getChannelById(req.params.id);

  if (!channel) {
    return res.status(404).json({ error: 'Channel listing not found' });
  }

  if (decision !== 'approved' && decision !== 'rejected') {
    return res.status(400).json({ error: "Decision must be 'approved' or 'rejected'" });
  }

  const updated = db.updateChannel(channel.id, {
    verificationStatus: decision,
    adminReviewNotes: notes || '',
    status: decision === 'approved' ? 'active' : 'paused'
  });

  // Notify seller
  db.createMessage({
    id: `msg_${Date.now()}`,
    channelId: channel.id,
    senderId: 'system',
    senderName: 'ChannelTrust Verification Team',
    senderRole: 'admin',
    recipientId: channel.sellerId,
    text: `Your channel listing "${channel.title}" has been ${decision.toUpperCase()} by platform admins. ${notes ? `Notes: ${notes}` : ''}`,
    createdAt: new Date().toISOString()
  });

  res.json({ channel: updated });
});

adminRouter.get('/users', (req: Request, res: Response) => {
  const users = db.getUsers().map(u => {
    const { passwordHash, ...safe } = u;
    return safe;
  });
  res.json({ users });
});

adminRouter.post('/users/:id/toggle-ban', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.role === 'admin') {
    return res.status(400).json({ error: 'Cannot ban platform administrators' });
  }

  const newBanState = !user.isBanned;
  const updated = db.updateUser(user.id, { isBanned: newBanState });

  const { passwordHash, ...safe } = updated!;
  res.json({ user: safe, message: newBanState ? 'User suspended' : 'User unbanned' });
});

adminRouter.post('/users/:id/toggle-verified', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const newVerifiedState = !user.isVerifiedSeller;
  const updated = db.updateUser(user.id, { isVerifiedSeller: newVerifiedState });

  const { passwordHash, ...safe } = updated!;
  res.json({ user: safe, message: newVerifiedState ? 'Verified badge granted' : 'Verified badge revoked' });
});

adminRouter.post('/disputes/:id/resolve', (req: Request, res: Response) => {
  const { resolutionAction, notes } = req.body; // 'refund_buyer' or 'complete_order'
  const order = db.getOrderById(req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.status !== 'disputed') {
    return res.status(400).json({ error: 'Order is not in disputed status' });
  }

  if (resolutionAction === 'refund_buyer') {
    const updated = db.updateOrder(order.id, {
      status: 'cancelled',
      disputeResolution: `Admin Resolved: Full refund issued to Buyer (${order.buyerName}). Resolution details: ${notes || 'Seller failed to provide valid Brand Account access'}`
    });

    // Reactivate channel for seller or keep paused
    db.updateChannel(order.channelId, { status: 'active' });

    res.json({ order: updated, message: 'Dispute resolved: Buyer refunded' });
  } else if (resolutionAction === 'complete_order') {
    const updated = db.updateOrder(order.id, {
      status: 'completed',
      disputeResolution: `Admin Resolved: Primary ownership confirmed by audit; payout released to Seller (${order.sellerName}). Notes: ${notes || 'Transfer verified through YouTube API/audit logs'}`
    });

    db.updateChannel(order.channelId, { status: 'sold' });

    res.json({ order: updated, message: 'Dispute resolved: Order marked completed' });
  } else {
    return res.status(400).json({ error: "Invalid action. Use 'refund_buyer' or 'complete_order'" });
  }
});
