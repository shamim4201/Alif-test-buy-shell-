import express, { Request, Response } from 'express';
import { db } from '../db';
import { authenticate } from './auth';
import { Order, OrderStatus, OrderTransferStep, User } from '../types';
import { sendAutomatedAdminNotification } from '../notifier';

export const ordersRouter = express.Router();

function getInitialTransferSteps(): OrderTransferStep[] {
  return [
    {
      step: 1,
      title: 'Buyer Google Email Provided',
      description: 'Buyer provides their clean Google Account email for the YouTube Brand Account invitation (Passwords never shared).',
      completed: false
    },
    {
      step: 2,
      title: 'Brand Account Manager Invite Sent',
      description: 'Seller adds the Buyer email as a Manager under YouTube Studio > Settings > Permissions / Brand Account.',
      completed: false
    },
    {
      step: 3,
      title: 'Manager Invitation Accepted',
      description: 'Buyer accepts the email invitation from Google to gain Manager access to the YouTube channel.',
      completed: false
    },
    {
      step: 4,
      title: '7-Day Google Security Cooldown Period',
      description: 'Mandatory Google security policy: Primary Owner can only be reassigned after 7 days as Manager.',
      completed: false
    },
    {
      step: 5,
      title: 'Primary Ownership Transferred to Buyer',
      description: 'Seller promotes Buyer from Manager to Primary Owner and steps down from the Brand Account.',
      completed: false
    },
    {
      step: 6,
      title: 'Ownership Inspection & Fund Release',
      description: 'Buyer verifies sole ownership of the YouTube channel and authorizes payout release to Seller.',
      completed: false
    }
  ];
}

ordersRouter.get('/', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;

  let orders = db.getOrders();
  if (user.role === 'admin') {
    // Admin sees all orders
  } else if (user.role === 'seller') {
    orders = orders.filter(o => o.sellerId === user.id || o.buyerId === user.id);
  } else {
    // Buyer
    orders = orders.filter(o => o.buyerId === user.id);
  }

  res.json({ orders });
});

ordersRouter.get('/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const order = db.getOrderById(req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied to this order' });
  }

  const channel = db.getChannelById(order.channelId);
  const seller = db.getUserById(order.sellerId);
  const buyer = db.getUserById(order.buyerId);

  res.json({ order, channel, seller, buyer });
});

// Create a new purchase request / order
ordersRouter.post('/', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { channelId, offeredPrice, buyerGoogleEmail } = req.body;

  if (!channelId) {
    return res.status(400).json({ error: 'channelId is required' });
  }

  const channel = db.getChannelById(channelId);
  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' });
  }

  if (channel.sellerId === user.id) {
    return res.status(400).json({ error: 'You cannot purchase your own channel' });
  }

  if (channel.status !== 'active') {
    return res.status(400).json({ error: 'This channel is currently not available for purchase' });
  }

  const amount = Number(offeredPrice) || channel.askingPrice;
  const platformFee = Math.round(amount * 0.05); // 5% marketplace transaction fee
  const totalAmount = amount + platformFee;

  const newOrder: Order = {
    id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    channelId: channel.id,
    channelTitle: channel.title,
    channelHandle: channel.handle,
    channelUrl: channel.channelUrl,
    buyerId: user.id,
    buyerName: user.name,
    buyerEmail: user.email,
    sellerId: channel.sellerId,
    sellerName: channel.sellerName,
    sellerEmail: channel.sellerEmail,
    amount,
    platformFee,
    totalAmount,
    status: 'pending',
    buyerGoogleEmail: buyerGoogleEmail ? buyerGoogleEmail.trim() : undefined,
    transferSteps: getInitialTransferSteps(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.createOrder(newOrder);

  // Trigger automated hands-free notification to Admin
  sendAutomatedAdminNotification({
    event: 'new_order',
    title: `নতুন অর্ডার ক্রিয়েট হয়েছে (#${newOrder.id})`,
    details: `চ্যানেল: ${newOrder.channelTitle}। মূল্য: $${newOrder.totalAmount} (≈ ৳${(newOrder.totalAmount * 122).toLocaleString('en-US')})।`,
    orderId: newOrder.id,
    amount: newOrder.totalAmount,
    customerName: newOrder.buyerName,
    customerEmail: newOrder.buyerEmail
  });

  // Send an automated system message in chat
  db.createMessage({
    id: `msg_${Date.now()}`,
    orderId: newOrder.id,
    senderId: 'system',
    senderName: 'ChannelTrust Security Bot',
    senderRole: 'admin',
    recipientId: channel.sellerId,
    text: `New Purchase Request created by ${user.name} for $${amount.toLocaleString()}. Reminder: Never share Google passwords. Transfer is strictly done via YouTube Studio Brand Account Manager invitation.`,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ order: newOrder });
});

// Server-side payment verification
ordersRouter.post('/:id/confirm-payment', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { paymentMethod, transactionRef, screenshotUrl, senderAccount, notes } = req.body;
  const order = db.getOrderById(req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.buyerId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Only the buyer or admin can submit payment' });
  }

  if (order.status !== 'pending') {
    return res.status(400).json({ error: `Cannot submit payment for order with status '${order.status}'` });
  }

  const ref = transactionRef?.trim() || `TXN-CT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const paymentDetails = {
    method: paymentMethod || 'Secure Marketplace Escrow',
    transactionRef: ref,
    screenshotUrl: screenshotUrl || undefined,
    senderAccount: senderAccount?.trim() || undefined,
    notes: notes?.trim() || undefined,
    confirmedAt: new Date().toISOString(),
    verifiedByServer: false,
    adminApprovalStatus: 'pending' as const
  };

  const updated = db.updateOrder(order.id, {
    status: 'pending',
    paymentDetails
  });

  // Trigger automated hands-free notification to Admin on Payment Submission
  sendAutomatedAdminNotification({
    event: 'payment_submitted',
    title: `💰 বায়ার পেমেন্ট সাবমিট করেছে! (#${order.id})`,
    details: `মেথড: ${paymentMethod} | TrxID: ${ref} ${senderAccount ? `| প্রেরক: ${senderAccount}` : ''} | চ্যানেল: ${order.channelTitle}`,
    orderId: order.id,
    amount: order.totalAmount,
    paymentMethod,
    trxId: ref,
    customerName: order.buyerName,
    customerEmail: order.buyerEmail
  });

  // Post system notice to escrow audit
  db.createMessage({
    id: `msg_${Date.now()}`,
    orderId: order.id,
    senderId: 'system',
    senderName: 'ChannelTrust Escrow Auditor',
    senderRole: 'admin',
    recipientId: order.sellerId,
    text: `Buyer has submitted payment deposit (TrxID: ${ref}). Order is pending Admin verification and escrow vault confirmation before transfer can begin.`,
    createdAt: new Date().toISOString()
  });

  res.json({ order: updated });
});

// Admin approves escrow payment
ordersRouter.post('/:id/admin-approve-payment', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Only platform admin can verify and approve payments' });
  }

  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (!order.paymentDetails) {
    return res.status(400).json({ error: 'No payment details submitted yet' });
  }

  const transferSteps = [...order.transferSteps];
  if (transferSteps[0]) {
    transferSteps[0].completed = true;
    transferSteps[0].completedAt = new Date().toISOString();
  }

  const updatedPaymentDetails = {
    ...order.paymentDetails,
    verifiedByServer: true,
    adminApprovalStatus: 'approved' as const,
    adminReviewedAt: new Date().toISOString(),
    adminRejectionReason: undefined
  };

  const updated = db.updateOrder(order.id, {
    status: 'transfer_in_progress',
    paymentDetails: updatedPaymentDetails,
    transferSteps
  });

  db.updateChannel(order.channelId, { status: 'paused' });

  db.createMessage({
    id: `msg_${Date.now()}`,
    orderId: order.id,
    senderId: 'system',
    senderName: 'ChannelTrust Escrow Management',
    senderRole: 'admin',
    recipientId: order.buyerId,
    text: `✅ Payment of $${order.totalAmount.toLocaleString()} has been officially VERIFIED by Admin and locked in Escrow Vault. Handover steps are now unlocked. Seller will now proceed with transfer invitation.`,
    createdAt: new Date().toISOString()
  });

  res.json({ order: updated });
});

// Admin rejects and resets fake or invalid payment details
ordersRouter.post('/:id/admin-reject-payment', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Only platform admin can reject payments' });
  }

  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { reason } = req.body;
  const rejectionReason = reason?.trim() || 'ভুল বা ভুয়া পেমেন্ট তথ্য (Invalid or unverified Transaction Reference / Screenshot proof).';

  const transferSteps = [...order.transferSteps];
  if (transferSteps[0]) {
    transferSteps[0].completed = false;
    transferSteps[0].completedAt = undefined;
  }

  const updatedPaymentDetails = order.paymentDetails ? {
    ...order.paymentDetails,
    verifiedByServer: false,
    adminApprovalStatus: 'rejected' as const,
    adminRejectionReason: rejectionReason,
    adminReviewedAt: new Date().toISOString()
  } : undefined;

  const updated = db.updateOrder(order.id, {
    status: 'pending',
    paymentDetails: updatedPaymentDetails,
    transferSteps
  });

  db.createMessage({
    id: `msg_${Date.now()}`,
    orderId: order.id,
    senderId: 'system',
    senderName: 'ChannelTrust Security Alert',
    senderRole: 'admin',
    recipientId: order.buyerId,
    text: `⚠️ PAYMENT REJECTED & RESET: Admin audit could not verify the submitted payment. Reason: "${rejectionReason}". Buyer cannot proceed with channel transfer until valid payment is submitted and approved.`,
    createdAt: new Date().toISOString()
  });

  res.json({ order: updated });
});

// Update buyer Google email for Brand Account transfer
ordersRouter.post('/:id/set-google-email', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { buyerGoogleEmail } = req.body;
  const order = db.getOrderById(req.params.id);

  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.buyerId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Only buyer or admin can update this email' });
  }

  if (!buyerGoogleEmail || !buyerGoogleEmail.includes('@')) {
    return res.status(400).json({ error: 'Valid Google email is required' });
  }

  const transferSteps = [...order.transferSteps];
  if (transferSteps[0]) {
    transferSteps[0].completed = true;
    transferSteps[0].completedAt = new Date().toISOString();
  }

  const updated = db.updateOrder(order.id, {
    buyerGoogleEmail: buyerGoogleEmail.trim().toLowerCase(),
    transferSteps
  });

  res.json({ order: updated });
});

// Advance a transfer step
ordersRouter.post('/:id/step/:stepNumber', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const stepNumber = Number(req.params.stepNumber);
  const order = db.getOrderById(req.params.id);

  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  const steps = [...order.transferSteps];
  const targetStep = steps.find(s => s.step === stepNumber);
  if (!targetStep) return res.status(404).json({ error: 'Step not found' });

  targetStep.completed = true;
  targetStep.completedAt = new Date().toISOString();

  const updated = db.updateOrder(order.id, { transferSteps: steps });

  db.createMessage({
    id: `msg_${Date.now()}`,
    orderId: order.id,
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role,
    recipientId: user.id === order.buyerId ? order.sellerId : order.buyerId,
    text: `Transfer Step ${stepNumber} marked as COMPLETED: "${targetStep.title}".`,
    createdAt: new Date().toISOString()
  });

  res.json({ order: updated });
});

// Complete order
ordersRouter.post('/:id/complete', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const order = db.getOrderById(req.params.id);

  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.buyerId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Only buyer or admin can mark order as completed and release funds' });
  }

  // Mark all transfer steps complete
  const steps = order.transferSteps.map(s => ({
    ...s,
    completed: true,
    completedAt: s.completedAt || new Date().toISOString()
  }));

  const updated = db.updateOrder(order.id, {
    status: 'completed',
    transferSteps: steps
  });

  // Mark channel as sold
  db.updateChannel(order.channelId, { status: 'sold' });

  // Increment seller deal count
  const seller = db.getUserById(order.sellerId);
  if (seller) {
    db.updateUser(seller.id, { dealsCount: (seller.dealsCount || 0) + 1 });
  }

  db.createMessage({
    id: `msg_${Date.now()}`,
    orderId: order.id,
    senderId: 'system',
    senderName: 'ChannelTrust Settlement Hub',
    senderRole: 'admin',
    recipientId: order.sellerId,
    text: `CONGRATULATIONS! Buyer has confirmed sole Primary Ownership. Transaction completed and payout of $${order.amount.toLocaleString()} has been released to Seller.`,
    createdAt: new Date().toISOString()
  });

  res.json({ order: updated });
});

// Raise a dispute
ordersRouter.post('/:id/dispute', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { reason } = req.body;
  const order = db.getOrderById(req.params.id);

  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  if (!reason || reason.trim().length < 10) {
    return res.status(400).json({ error: 'Please provide a detailed dispute reason (minimum 10 characters)' });
  }

  const updated = db.updateOrder(order.id, {
    status: 'disputed',
    disputeReason: reason.trim(),
    disputeRaisedBy: user.id === order.buyerId ? 'buyer' : 'seller',
    disputeRaisedAt: new Date().toISOString()
  });

  db.createMessage({
    id: `msg_${Date.now()}`,
    orderId: order.id,
    senderId: 'system',
    senderName: 'ChannelTrust Dispute Center',
    senderRole: 'admin',
    recipientId: user.id === order.buyerId ? order.sellerId : order.buyerId,
    text: `DISPUTE OPENED by ${user.name}. Reason: "${reason.trim()}". All payouts are frozen. A ChannelTrust compliance arbitrator will review the channel transfer logs.`,
    createdAt: new Date().toISOString()
  });

  res.json({ order: updated });
});

// Cancel order
ordersRouter.post('/:id/cancel', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const order = db.getOrderById(req.params.id);

  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  if (order.status === 'completed') {
    return res.status(400).json({ error: 'Cannot cancel an already completed order' });
  }

  const updated = db.updateOrder(order.id, {
    status: 'cancelled'
  });

  // Re-enable channel listing if it was paused
  const channel = db.getChannelById(order.channelId);
  if (channel && channel.status === 'paused') {
    db.updateChannel(channel.id, { status: 'active' });
  }

  res.json({ order: updated });
});

// Buyer requests a dedicated Payoneer or custom payment link from admin
ordersRouter.post('/:id/request-custom-payment', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const order = db.getOrderById(req.params.id);

  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.buyerId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Only the buyer can request a custom payment link' });
  }

  const { provider, buyerEmail, note } = req.body;
  const targetProvider = provider?.trim() || 'Payoneer';
  const targetEmail = (buyerEmail?.trim() || user.email || order.buyerEmail).toLowerCase();

  const customPaymentRequest = {
    provider: targetProvider,
    status: 'requested' as const,
    buyerEmail: targetEmail,
    amount: order.totalAmount,
    currency: 'USD',
    note: note?.trim() || undefined,
    requestedAt: new Date().toISOString()
  };

  const updated = db.updateOrder(order.id, {
    customPaymentRequest
  });

  // Automated notification to Admin
  sendAutomatedAdminNotification({
    event: 'payment_submitted',
    title: `💳 বায়ার ${targetProvider} পেমেন্ট লিংকের আবেদন করেছে (#${order.id})`,
    details: `বায়ার: ${order.buyerName} (${targetEmail})। চ্যানেল: ${order.channelTitle}। পরিমাণ: $${order.totalAmount} USD। অনুগ্রহ করে বায়ারকে ${targetProvider} পেমেন্ট লিংক বা ইনভয়েস প্রদান করুন।`,
    orderId: order.id,
    amount: order.totalAmount,
    customerName: order.buyerName,
    customerEmail: targetEmail
  });

  // Chat message to order thread
  db.createMessage({
    id: `msg_${Date.now()}`,
    orderId: order.id,
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role,
    recipientId: 'admin',
    text: `📢 আমি এই অর্ডারের জন্য ${targetProvider}-এ পেমেন্ট করতে চাই (অ্যামাউন্ট: $${order.totalAmount} USD, Email: ${targetEmail})। অনুগ্রহ করে আমার জন্য একটি ডেডিকেটেড ${targetProvider} পেমেন্ট রিকোয়েস্ট / লিংক প্রদান করুন।`,
    createdAt: new Date().toISOString()
  });

  res.json({
    order: updated,
    message: `${targetProvider} পেমেন্ট রিকোয়েস্ট সফলভাবে এডমিনের কাছে পাঠানো হয়েছে। এডমিন লিংক প্রস্তুত করে দেওয়া মাত্র এখানে দেখতে পাবেন।`
  });
});

// Admin assigns/generates a custom Payoneer or payment link specifically for this order
ordersRouter.post('/:id/assign-custom-payment', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Only super administrators can assign custom payment links' });
  }

  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const { provider, paymentUrl, recipientAccount, instructions } = req.body;
  if (!paymentUrl || !paymentUrl.trim()) {
    return res.status(400).json({ error: 'Payment URL / Link is required' });
  }

  const targetProvider = provider?.trim() || order.customPaymentRequest?.provider || 'Payoneer';

  const customPaymentRequest = {
    provider: targetProvider,
    status: 'provided' as const,
    paymentUrl: paymentUrl.trim(),
    recipientAccount: recipientAccount?.trim() || undefined,
    instructions: instructions?.trim() || undefined,
    buyerEmail: order.customPaymentRequest?.buyerEmail || order.buyerEmail,
    amount: order.totalAmount,
    currency: 'USD',
    assignedAt: new Date().toISOString(),
    assignedBy: user.email
  };

  const updated = db.updateOrder(order.id, {
    customPaymentRequest
  });

  // Chat message notifying buyer
  db.createMessage({
    id: `msg_${Date.now()}`,
    orderId: order.id,
    senderId: 'system',
    senderName: 'ChannelTrust Escrow Management',
    senderRole: 'admin',
    recipientId: order.buyerId,
    text: `🎯 এডমিন আপনার অর্ডারের জন্য ${targetProvider} পেমেন্ট লিংক তৈরি করেছেন: ${paymentUrl.trim()}${instructions ? ` (নোট: ${instructions.trim()})` : ''}। লিংকে ক্লিক করে আপনার পেমেন্ট সম্পন্ন করুন এবং ট্রানজেকশন আইডি / রসিদ আপলোড করুন।`,
    createdAt: new Date().toISOString()
  });

  res.json({
    order: updated,
    message: `বায়ারের অর্ডারের জন্য ${targetProvider} পেমেন্ট লিংক সফলভাবে তৈরি ও প্রদান করা হয়েছে।`
  });
});
