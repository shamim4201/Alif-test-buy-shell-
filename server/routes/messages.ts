import express, { Request, Response } from 'express';
import { db } from '../db';
import { authenticate } from './auth';
import { Message, User } from '../types';

export const messagesRouter = express.Router();

messagesRouter.get('/', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { orderId, channelId } = req.query;

  const messages = db.getMessages(
    orderId as string | undefined,
    channelId as string | undefined,
    user.role === 'admin' ? undefined : user.id
  );

  res.json({ messages });
});

messagesRouter.post('/', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { orderId, channelId, recipientId, text, attachmentUrl } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text cannot be empty' });
  }

  let finalRecipientId = recipientId;

  // If orderId is provided, determine recipient
  if (orderId) {
    const order = db.getOrderById(orderId);
    if (order) {
      if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied to this order conversation' });
      }
      if (!finalRecipientId) {
        finalRecipientId = user.id === order.buyerId ? order.sellerId : order.buyerId;
      }
    }
  } else if (channelId) {
    const channel = db.getChannelById(channelId);
    if (channel && !finalRecipientId) {
      finalRecipientId = channel.sellerId;
    }
  }

  if (!finalRecipientId) {
    return res.status(400).json({ error: 'Recipient is required' });
  }

  // Safety filter check: warning on password or outside wire attempts
  const lower = text.toLowerCase();
  const dangerousPatterns = ['password', 'passcode', 'send me your password', 'western union', 'crypto direct', 'wire outside'];
  const hasWarning = dangerousPatterns.some(p => lower.includes(p));

  const newMessage: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderId,
    channelId,
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role,
    recipientId: finalRecipientId,
    text: text.trim(),
    attachmentUrl,
    createdAt: new Date().toISOString()
  };

  db.createMessage(newMessage);

  // If suspicious pattern detected, inject security reminder
  if (hasWarning) {
    db.createMessage({
      id: `msg_warn_${Date.now()}`,
      orderId,
      channelId,
      senderId: 'system',
      senderName: 'ChannelTrust Safety Bot',
      senderRole: 'admin',
      recipientId: user.id,
      text: '⚠️ SAFETY ALERT: ChannelTrust strictly prohibits asking for or sending Google account passwords. Transfers must ONLY occur via Google Brand Account primary ownership reassignment.',
      createdAt: new Date().toISOString()
    });
  }

  res.status(201).json({ message: newMessage, flaggedWarning: hasWarning });
});
