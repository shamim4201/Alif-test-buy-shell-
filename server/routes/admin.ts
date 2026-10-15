import express, { Request, Response } from 'express';
import { db } from '../db';
import { authenticate, requireRole } from './auth';

export const adminRouter = express.Router();

// Admin-only middleware for all routes here
adminRouter.use(authenticate, requireRole(['admin']));

// 1. Dashboard Overview Stats
adminRouter.get('/stats', (req: Request, res: Response) => {
  const channels = db.getChannels();
  const orders = db.getOrders();
  const users = db.getUsers();
  const tickets = db.getTickets();
  const fraudAlerts = db.getFraudAlerts();
  const transactions = db.getTransactions();

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
    buyersCount: users.filter(u => u.role === 'buyer').length,
    totalTransactions: transactions.length,
    pendingPayoutsCount: orders.filter(o => o.status === 'payment_confirmed' || o.status === 'transfer_in_progress').length,
    openTicketsCount: tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
    fraudAlertsCount: fraudAlerts.filter(a => !a.resolved).length
  });
});

// 2. Channel Listing Management
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

  // Audit log
  db.createAuditLog({
    adminId: (req as any).user?.id || 'admin',
    adminName: (req as any).user?.name || 'Administrator',
    action: `Channel ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
    targetType: 'channel',
    targetId: channel.id,
    details: `${decision.toUpperCase()}: ${channel.title}. ${notes ? `Notes: ${notes}` : ''}`,
    ipAddress: req.ip
  });

  // Notify seller
  db.createMessage({
    id: `msg_${Date.now()}`,
    channelId: channel.id,
    senderId: 'system',
    senderName: 'Alif Trust Verification Team',
    senderRole: 'admin',
    recipientId: channel.sellerId,
    text: `Your channel listing "${channel.title}" has been ${decision.toUpperCase()} by platform admins. ${notes ? `Notes: ${notes}` : ''}`,
    createdAt: new Date().toISOString()
  });

  res.json({ channel: updated });
});

adminRouter.post('/channels/:id/toggle-featured', (req: Request, res: Response) => {
  const channel = db.getChannelById(req.params.id);
  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' });
  }
  const isFeatured = !channel.isFeatured;
  const updated = db.updateChannel(channel.id, { isFeatured });

  db.createAuditLog({
    adminId: (req as any).user?.id || 'admin',
    adminName: (req as any).user?.name || 'Administrator',
    action: isFeatured ? 'Listing Featured' : 'Listing Unfeatured',
    targetType: 'channel',
    targetId: channel.id,
    details: `Featured flag toggled to ${isFeatured} for channel "${channel.title}"`,
    ipAddress: req.ip
  });

  res.json({ channel: updated });
});

adminRouter.post('/channels/:id/toggle-status', (req: Request, res: Response) => {
  const channel = db.getChannelById(req.params.id);
  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' });
  }
  const newStatus = channel.status === 'active' ? 'paused' : 'active';
  const updated = db.updateChannel(channel.id, { status: newStatus });

  db.createAuditLog({
    adminId: (req as any).user?.id || 'admin',
    adminName: (req as any).user?.name || 'Administrator',
    action: `Channel Status Changed to ${newStatus}`,
    targetType: 'channel',
    targetId: channel.id,
    details: `Status set to ${newStatus} for channel "${channel.title}"`,
    ipAddress: req.ip
  });

  res.json({ channel: updated });
});

adminRouter.delete('/channels/:id', (req: Request, res: Response) => {
  const channel = db.getChannelById(req.params.id);
  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' });
  }
  const deleted = db.deleteChannel(req.params.id);

  if (deleted) {
    db.createAuditLog({
      adminId: (req as any).user?.id || 'admin',
      adminName: (req as any).user?.name || 'Administrator',
      action: 'Channel Deleted',
      targetType: 'channel',
      targetId: req.params.id,
      details: `Removed duplicate/fake listing: ${channel.title}`,
      ipAddress: req.ip
    });
    res.json({ success: true, message: 'Channel listing removed' });
  } else {
    res.status(500).json({ error: 'Failed to delete channel' });
  }
});

// 3. User Management
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

  db.createAuditLog({
    adminId: (req as any).user?.id || 'admin',
    adminName: (req as any).user?.name || 'Administrator',
    action: newBanState ? 'User Suspended' : 'User Reinstated',
    targetType: 'user',
    targetId: user.id,
    details: `${newBanState ? 'Suspended' : 'Unbanned'} account: ${user.name} (${user.email})`,
    ipAddress: req.ip
  });

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

  db.createAuditLog({
    adminId: (req as any).user?.id || 'admin',
    adminName: (req as any).user?.name || 'Administrator',
    action: newVerifiedState ? 'Seller Verified' : 'Verification Revoked',
    targetType: 'user',
    targetId: user.id,
    details: `${newVerifiedState ? 'Granted' : 'Revoked'} verified badge for ${user.name}`,
    ipAddress: req.ip
  });

  const { passwordHash, ...safe } = updated!;
  res.json({ user: safe, message: newVerifiedState ? 'Verified badge granted' : 'Verified badge revoked' });
});

adminRouter.put('/users/:id/role', (req: Request, res: Response) => {
  const { role } = req.body;
  if (!role || !['buyer', 'seller', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified' });
  }

  const user = db.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updated = db.updateUser(user.id, { role });
  db.createAuditLog({
    adminId: (req as any).user?.id || 'admin',
    adminName: (req as any).user?.name || 'Administrator',
    action: `Role Changed to ${role}`,
    targetType: 'user',
    targetId: user.id,
    details: `Updated role for ${user.name} (${user.email}) to ${role}`,
    ipAddress: req.ip
  });

  const { passwordHash, ...safe } = updated!;
  res.json({ user: safe, message: `Role changed to ${role}` });
});

// 4. Disputes & Escrow Resolution
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

    db.updateChannel(order.channelId, { status: 'active' });

    db.createAuditLog({
      adminId: (req as any).user?.id || 'admin',
      adminName: (req as any).user?.name || 'Administrator',
      action: 'Dispute Resolved: Refund Buyer',
      targetType: 'dispute',
      targetId: order.id,
      details: `Full refund ($${order.amount}) issued to ${order.buyerName}. Reason: ${notes || 'Seller non-compliance'}`,
      ipAddress: req.ip
    });

    // Record transaction
    db.createTransaction({
      orderId: order.id,
      userId: order.buyerId,
      userName: order.buyerName,
      userRole: 'buyer',
      type: 'refund',
      amount: order.amount,
      currency: 'USD',
      fee: 0,
      paymentMethod: 'bkash',
      paymentProvider: 'bKash Auto Refund',
      transactionRef: `REF-${Date.now().toString().slice(-6)}`,
      status: 'success',
      notes: `Escrow refund for order ${order.id}`
    });

    res.json({ order: updated, message: 'Dispute resolved: Buyer refunded' });
  } else if (resolutionAction === 'complete_order') {
    const updated = db.updateOrder(order.id, {
      status: 'completed',
      disputeResolution: `Admin Resolved: Primary ownership confirmed by audit; payout released to Seller (${order.sellerName}). Notes: ${notes || 'Transfer verified through YouTube API/audit logs'}`
    });

    db.updateChannel(order.channelId, { status: 'sold' });

    db.createAuditLog({
      adminId: (req as any).user?.id || 'admin',
      adminName: (req as any).user?.name || 'Administrator',
      action: 'Dispute Resolved: Seller Payout',
      targetType: 'dispute',
      targetId: order.id,
      details: `Net payout ($${order.amount - order.platformFee}) released to ${order.sellerName}. Notes: ${notes || 'Verified primary ownership transfer'}`,
      ipAddress: req.ip
    });

    // Record seller payout transaction
    db.createTransaction({
      orderId: order.id,
      userId: order.sellerId,
      userName: order.sellerName,
      userRole: 'seller',
      type: 'payout',
      amount: order.amount - order.platformFee,
      currency: 'USD',
      fee: 0,
      paymentMethod: 'bank_transfer',
      paymentProvider: 'City Bank Ltd',
      transactionRef: `PAY-${Date.now().toString().slice(-6)}`,
      status: 'success',
      notes: `Escrow payout released for completed order ${order.id}`
    });

    res.json({ order: updated, message: 'Dispute resolved: Order marked completed' });
  } else {
    return res.status(400).json({ error: "Invalid action. Use 'refund_buyer' or 'complete_order'" });
  }
});

// 5. Payment & Commission Management
adminRouter.get('/transactions', (_req: Request, res: Response) => {
  const transactions = db.getTransactions();
  res.json({ transactions });
});

// 6. Website Settings
adminRouter.get('/settings', (_req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({ settings });
});

adminRouter.put('/settings', (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  db.createAuditLog({
    adminId: (req as any).user?.id || 'admin',
    adminName: (req as any).user?.name || 'Administrator',
    action: 'Settings Updated',
    targetType: 'settings',
    targetId: 'global_config',
    details: `Updated platform settings (commission: ${updated.commissionRate}%, 2FA: ${updated.enable2FA})`,
    ipAddress: req.ip
  });
  res.json({ settings: updated, message: 'Settings successfully updated' });
});

// 7. Admin Audit Logs
adminRouter.get('/audit-logs', (_req: Request, res: Response) => {
  const logs = db.getAuditLogs();
  res.json({ logs });
});

// 8. Advanced: Support Tickets
adminRouter.get('/tickets', (_req: Request, res: Response) => {
  const tickets = db.getTickets();
  res.json({ tickets });
});

adminRouter.post('/tickets/:id/messages', (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Message text required' });
  }
  const ticket = db.createTicketMessage(req.params.id, {
    senderId: (req as any).user?.id || 'admin',
    senderName: (req as any).user?.name || 'Administrator',
    senderRole: 'admin',
    text
  });
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ ticket });
});

adminRouter.put('/tickets/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const ticket = db.updateTicketStatus(req.params.id, status);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ ticket });
});

// 9. Advanced: Coupons
adminRouter.get('/coupons', (_req: Request, res: Response) => {
  const coupons = db.getCoupons();
  res.json({ coupons });
});

adminRouter.post('/coupons', (req: Request, res: Response) => {
  const { code, discountType, discountValue, minOrderAmount, maxDiscount, validUntil, usageLimit, isActive } = req.body;
  if (!code || !discountValue) {
    return res.status(400).json({ error: 'Code and discountValue required' });
  }
  const coupon = db.createCoupon({
    code: code.toUpperCase().trim(),
    discountType: discountType || 'percentage',
    discountValue: Number(discountValue),
    minOrderAmount: Number(minOrderAmount) || 0,
    maxDiscount: Number(maxDiscount) || undefined,
    validUntil: validUntil || new Date(Date.now() + 30 * 86400000).toISOString(),
    usageLimit: Number(usageLimit) || 100,
    isActive: isActive !== false
  });
  res.json({ coupon });
});

adminRouter.delete('/coupons/:id', (req: Request, res: Response) => {
  const success = db.deleteCoupon(req.params.id);
  res.json({ success });
});

// 10. Advanced: Fraud Alerts
adminRouter.get('/fraud-alerts', (_req: Request, res: Response) => {
  const alerts = db.getFraudAlerts();
  res.json({ alerts });
});

adminRouter.post('/fraud-alerts/:id/resolve', (req: Request, res: Response) => {
  const alert = db.resolveFraudAlert(req.params.id, (req as any).user?.name || 'Administrator');
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  res.json({ alert });
});

// 11. Advanced: Notifications & Broadcasts
adminRouter.get('/notifications', (_req: Request, res: Response) => {
  const notifications = db.getNotifications();
  res.json({ notifications });
});

adminRouter.post('/notifications', (req: Request, res: Response) => {
  const { title, message, targetAudience, type } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message required' });
  }
  const notif = db.createNotification({
    title,
    message,
    targetAudience: targetAudience || 'all',
    type: type || 'info',
    isActive: true
  });
  res.json({ notification: notif });
});

adminRouter.delete('/notifications/:id', (req: Request, res: Response) => {
  const success = db.deleteNotification(req.params.id);
  res.json({ success });
});

// 12. Backup Export & Restore
adminRouter.get('/backup/export', (_req: Request, res: Response) => {
  const data = db.exportBackup();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=alif_trust_backup_${Date.now()}.json`);
  res.json(data);
});

adminRouter.post('/backup/restore', (req: Request, res: Response) => {
  const success = db.restoreBackup(req.body);
  if (!success) {
    return res.status(400).json({ error: 'Invalid backup format' });
  }
  res.json({ success: true, message: 'Database restored successfully' });
});
