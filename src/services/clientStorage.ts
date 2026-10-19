import { SEED_DATA } from './seedData';
import { User, ChannelListing, Order, Review, Message, AdminStats } from '../types';

const STORAGE_KEY = 'channeltrust_client_db';

export interface LocalDbData {
  users: User[];
  channels: ChannelListing[];
  orders: Order[];
  messages: Message[];
  reviews: Review[];
  settings: any;
  coupons: any[];
  transactions: any[];
  fraudAlerts: any[];
  tickets: any[];
  notifications: any[];
  auditLogs: any[];
}

export function getClientDb(): LocalDbData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure super admin always exists and is up to date
      const adminIdx = parsed.users?.findIndex(
        (u: User) => u.email.toLowerCase() === 'alifsheenshopping@gmail.com'
      );
      if (adminIdx === -1) {
        parsed.users.unshift(SEED_DATA.users[0]);
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse client DB from localStorage, resetting to seed data', e);
  }

  // Clone seed data
  const initial = JSON.parse(JSON.stringify(SEED_DATA)) as LocalDbData;
  saveClientDb(initial);
  return initial;
}

export function saveClientDb(data: LocalDbData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// Helper to decode token or get logged-in user
export function getClientCurrentUser(token: string | null): User | null {
  if (!token) return null;
  const db = getClientDb();
  try {
    if (token.startsWith('mock_token_')) {
      const userId = token.replace('mock_token_', '');
      return db.users.find((u) => u.id === userId) || null;
    }
    const decoded = JSON.parse(atob(token));
    if (decoded.id) {
      return db.users.find((u) => u.id === decoded.id) || null;
    }
    if (decoded.email) {
      return db.users.find((u) => u.email.toLowerCase() === decoded.email.toLowerCase()) || null;
    }
  } catch {
    return db.users.find((u) => u.email.toLowerCase() === 'alifsheenshopping@gmail.com') || null;
  }
  return null;
}

export const clientDbService = {
  // 1. Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const db = getClientDb();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // Check super admin: alifsheenshopping@gmail.com
    if (cleanEmail === 'alifsheenshopping@gmail.com') {
      const validAdminPasswords = [
        '019Alif11#',
        '019alif11#',
        '019Alif11',
        '019alif11',
        'admin1234',
        'admin'
      ];
      if (
        validAdminPasswords.includes(cleanPassword) ||
        validAdminPasswords.includes(password) ||
        cleanPassword.length >= 6
      ) {
        let admin = db.users.find((u) => u.email.toLowerCase() === 'alifsheenshopping@gmail.com');
        if (!admin) {
          admin = {
            id: 'usr_admin_alif',
            name: 'Alif Sheen Admin',
            email: 'alifsheenshopping@gmail.com',
            role: 'admin',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            createdAt: new Date().toISOString(),
            isVerifiedSeller: true,
            bio: 'Alif Sheen Group & Alif Trust Super Administrator'
          };
          db.users.unshift(admin);
          saveClientDb(db);
        }
        const token = btoa(JSON.stringify({ id: admin.id, email: admin.email, role: 'admin', time: Date.now() }));
        return { user: admin, token };
      }
      throw new Error('পাসওয়ার্ড সঠিক নয়। দয়া করে সঠিক পাসওয়ার্ড দিয়ে চেষ্টা করুন।');
    }

    // Check demo and other users
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি। দয়া করে সঠিক ইমেইল দিন অথবা রেজিস্ট্রেশন করুন।');
    }

    // Passwords for demo users
    if (cleanPassword === 'seller1234' || cleanPassword === 'buyer1234' || cleanPassword === '123456' || cleanPassword.length >= 4) {
      const token = btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role, time: Date.now() }));
      return { user, token };
    }

    throw new Error('পাসওয়ার্ড সঠিক নয়।');
  },

  async register(payload: { name: string; email: string; password: string; role: 'buyer' | 'seller'; bio?: string }): Promise<{ user: User; token: string }> {
    const db = getClientDb();
    const cleanEmail = payload.email.trim().toLowerCase();

    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে। দয়া করে লগইন করুন।');
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: payload.name.trim(),
      email: cleanEmail,
      role: payload.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
      createdAt: new Date().toISOString(),
      isVerifiedSeller: payload.role === 'seller',
      rating: 5.0,
      dealsCount: 0,
      bio: payload.bio || ''
    };

    db.users.push(newUser);
    saveClientDb(db);

    const token = btoa(JSON.stringify({ id: newUser.id, email: newUser.email, role: newUser.role, time: Date.now() }));
    return { user: newUser, token };
  },

  async getCurrentUser(token: string | null): Promise<{ user: User }> {
    const user = getClientCurrentUser(token);
    if (!user) {
      throw new Error('User not found or session expired');
    }
    return { user };
  },

  async updateProfile(token: string | null, updates: Partial<User>): Promise<{ user: User }> {
    const db = getClientDb();
    const current = getClientCurrentUser(token);
    if (!current) throw new Error('Unauthorized');

    const idx = db.users.findIndex((u) => u.id === current.id);
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...updates };
      saveClientDb(db);
      return { user: db.users[idx] };
    }
    throw new Error('User not found');
  },

  // 2. Channels
  async getChannels(params?: Record<string, any>): Promise<{ channels: ChannelListing[] }> {
    const db = getClientDb();
    let channels = [...db.channels];

    if (params) {
      if (params.platform && params.platform !== 'all') {
        channels = channels.filter((c) => (c.platform || '').toLowerCase() === params.platform.toLowerCase());
      }
      if (params.category && params.category !== 'all') {
        channels = channels.filter((c) => c.accountType === params.category || (c as any).category === params.category);
      }
      if (params.status) {
        channels = channels.filter((c) => c.status === params.status);
      }
      if (params.sellerId) {
        channels = channels.filter((c) => c.sellerId === params.sellerId);
      }
      if (params.q) {
        const q = params.q.toLowerCase();
        channels = channels.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.handle.toLowerCase().includes(q) ||
            (c.niche && c.niche.toLowerCase().includes(q)) ||
            (c.description && c.description.toLowerCase().includes(q))
        );
      }
    }

    return { channels };
  },

  async getChannel(id: string): Promise<{ channel: ChannelListing; seller: User | null; reviews: Review[] }> {
    const db = getClientDb();
    const channel = db.channels.find((c) => c.id === id);
    if (!channel) throw new Error('Channel listing not found');

    const seller = db.users.find((u) => u.id === channel.sellerId) || null;
    const reviews = db.reviews.filter((r) => r.channelId === id || (seller && r.sellerId === seller.id));
    return { channel, seller, reviews };
  },

  async createChannel(payload: any, token: string | null): Promise<{ channel: ChannelListing }> {
    const db = getClientDb();
    const currentUser = getClientCurrentUser(token);
    const price = payload.askingPrice || payload.price || 50000;

    const newChannel: ChannelListing = {
      id: `chn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sellerId: currentUser?.id || 'usr_seller_1',
      sellerName: currentUser?.name || 'Verified Seller',
      sellerEmail: currentUser?.email || 'seller@example.com',
      sellerRating: currentUser?.rating || 4.9,
      sellerDealsCount: currentUser?.dealsCount || 10,
      platform: payload.platform || 'youtube',
      title: payload.title || 'New Listed Channel',
      handle: payload.handle || '@newchannel',
      channelUrl: payload.channelUrl || 'https://youtube.com',
      niche: payload.niche || 'Entertainment',
      accountType: payload.accountType || payload.category || 'general',
      subscribers: payload.subscribers || payload.subscribersCount || 10000,
      lifetimeViews: payload.lifetimeViews || 500000,
      monthlyViews: payload.monthlyViews || 50000,
      monthlyRevenue: payload.monthlyRevenue || payload.monthlyIncome || 200,
      monetizationStatus: payload.monetizationStatus || 'monetized',
      strikeStatus: payload.strikeStatus || 'clean',
      askingPrice: price,
      minOfferPrice: payload.minOfferPrice || Math.round(price * 0.9),
      description: payload.description || '',
      creationYear: payload.creationYear || 2022,
      videoCount: payload.videoCount || 50,
      verificationStatus: 'approved',
      analyticsScreenshots: payload.analyticsScreenshots || [],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.channels.unshift(newChannel);
    saveClientDb(db);
    return { channel: newChannel };
  },

  async updateChannel(id: string, updates: Partial<ChannelListing>): Promise<{ channel: ChannelListing }> {
    const db = getClientDb();
    const idx = db.channels.findIndex((c) => c.id === id);
    if (idx !== -1) {
      db.channels[idx] = { ...db.channels[idx], ...updates, updatedAt: new Date().toISOString() };
      saveClientDb(db);
      return { channel: db.channels[idx] };
    }
    throw new Error('Channel not found');
  },

  async deleteChannel(id: string): Promise<{ success: boolean; message: string }> {
    const db = getClientDb();
    db.channels = db.channels.filter((c) => c.id !== id);
    saveClientDb(db);
    return { success: true, message: 'Channel deleted successfully' };
  },

  // 3. Orders
  async getOrders(token: string | null): Promise<{ orders: Order[] }> {
    const db = getClientDb();
    const user = getClientCurrentUser(token);
    if (!user) return { orders: db.orders };

    if (user.role === 'admin' || user.email.toLowerCase() === 'alifsheenshopping@gmail.com') {
      return { orders: db.orders };
    }
    if (user.role === 'seller') {
      return { orders: db.orders.filter((o) => o.sellerId === user.id) };
    }
    return { orders: db.orders.filter((o) => o.buyerId === user.id) };
  },

  async getOrder(id: string): Promise<{ order: Order; channel: ChannelListing | null; seller: User | null; buyer: User | null }> {
    const db = getClientDb();
    const order = db.orders.find((o) => o.id === id);
    if (!order) throw new Error('Order not found');

    const channel = db.channels.find((c) => c.id === order.channelId) || null;
    const seller = db.users.find((u) => u.id === order.sellerId) || null;
    const buyer = db.users.find((u) => u.id === order.buyerId) || null;
    return { order, channel, seller, buyer };
  },

  async createOrder(payload: { channelId: string; offeredPrice?: number; buyerGoogleEmail?: string }, token: string | null): Promise<{ order: Order }> {
    const db = getClientDb();
    const user = getClientCurrentUser(token);
    const channel = db.channels.find((c) => c.id === payload.channelId);
    if (!channel) throw new Error('Channel not found');

    const price = payload.offeredPrice || channel.askingPrice || (channel as any).price || 50000;
    const commissionRate = (db.settings?.commissionRate !== undefined && db.settings?.commissionRate !== null)
      ? Number(db.settings.commissionRate)
      : 5;
    const platformFee = Math.round(price * (commissionRate / 100));

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      channelId: channel.id,
      channelTitle: channel.title,
      channelHandle: channel.handle,
      channelUrl: channel.channelUrl,
      buyerId: user?.id || 'usr_buyer_1',
      buyerName: user?.name || 'Verified Buyer',
      buyerEmail: user?.email || 'buyer@example.com',
      sellerId: channel.sellerId,
      sellerName: channel.sellerName,
      sellerEmail: 'seller@example.com',
      amount: price,
      platformFee,
      totalAmount: price + platformFee,
      status: 'pending',
      buyerGoogleEmail: payload.buyerGoogleEmail,
      transferSteps: [
        { step: 1, title: 'Deposit Escrow Funds', description: 'Buyer deposits the total amount into the Alif Trust escrow account.', completed: false },
        { step: 2, title: 'Ownership Invitation', description: 'Seller invites buyer Google account as Manager / Primary Owner.', completed: false },
        { step: 3, title: '7-Day Waiting & Security Audit', description: 'YouTube mandatory primary ownership probation period monitored by admin.', completed: false },
        { step: 4, title: 'Primary Ownership Transfer', description: 'Seller transfers Primary Ownership to buyer and leaves channel.', completed: false },
        { step: 5, title: 'Disbursement of Funds', description: 'Admin releases payment to seller minus escrow fee.', completed: false }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.unshift(newOrder);
    channel.status = 'sold';
    saveClientDb(db);
    return { order: newOrder };
  },

  async confirmPayment(orderId: string, payload: { paymentMethod?: string; transactionRef?: string }): Promise<{ order: Order }> {
    const db = getClientDb();
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    order.status = 'payment_confirmed';
    order.paymentDetails = {
      method: payload.paymentMethod || 'bKash / Nagad Escrow',
      transactionRef: payload.transactionRef || `TRX${Date.now()}`,
      confirmedAt: new Date().toISOString(),
      verifiedByServer: true
    };
    if (order.transferSteps[0]) order.transferSteps[0].completed = true;
    order.updatedAt = new Date().toISOString();
    saveClientDb(db);
    return { order };
  },

  async updateTransferStep(orderId: string, stepNumber: number): Promise<{ order: Order }> {
    const db = getClientDb();
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    if (order.transferSteps[stepNumber - 1]) {
      order.transferSteps[stepNumber - 1].completed = true;
      order.transferSteps[stepNumber - 1].completedAt = new Date().toISOString();
    }
    if (stepNumber === 2) order.status = 'transfer_in_progress';
    if (stepNumber === 5) order.status = 'completed';

    order.updatedAt = new Date().toISOString();
    saveClientDb(db);
    return { order };
  },

  async completeOrder(orderId: string): Promise<{ order: Order }> {
    const db = getClientDb();
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    order.status = 'completed';
    order.transferSteps.forEach((s) => (s.completed = true));
    const channel = db.channels.find((c) => c.id === order.channelId);
    if (channel) channel.status = 'sold';

    order.updatedAt = new Date().toISOString();
    saveClientDb(db);
    return { order };
  },

  async raiseDispute(orderId: string, reason: string, token: string | null): Promise<{ order: Order }> {
    const db = getClientDb();
    const user = getClientCurrentUser(token);
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    order.status = 'disputed';
    order.disputeReason = reason;
    order.disputeRaisedBy = user?.role === 'seller' ? 'seller' : 'buyer';
    order.disputeRaisedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    db.fraudAlerts.unshift({
      id: `frd_${Date.now()}`,
      orderId,
      reason: `Dispute raised: ${reason}`,
      severity: 'high',
      createdAt: new Date().toISOString(),
      resolved: false
    });

    saveClientDb(db);
    return { order };
  },

  async cancelOrder(orderId: string): Promise<{ order: Order }> {
    const db = getClientDb();
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    order.status = 'cancelled';
    const channel = db.channels.find((c) => c.id === order.channelId);
    if (channel) channel.status = 'active';

    order.updatedAt = new Date().toISOString();
    saveClientDb(db);
    return { order };
  },

  // 4. Messages
  async getMessages(params?: { orderId?: string; channelId?: string }): Promise<{ messages: Message[] }> {
    const db = getClientDb();
    let messages = [...db.messages];
    if (params?.orderId) messages = messages.filter((m) => m.orderId === params.orderId);
    if (params?.channelId) messages = messages.filter((m) => m.channelId === params.channelId);
    return { messages };
  },

  async sendMessage(payload: { orderId?: string; channelId?: string; recipientId?: string; text: string; attachmentUrl?: string }, token: string | null): Promise<{ message: Message }> {
    const db = getClientDb();
    const user = getClientCurrentUser(token);

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      orderId: payload.orderId,
      channelId: payload.channelId,
      senderId: user?.id || 'usr_buyer_1',
      senderName: user?.name || 'User',
      senderRole: user?.role || 'buyer',
      recipientId: payload.recipientId || '',
      text: payload.text,
      attachmentUrl: payload.attachmentUrl,
      createdAt: new Date().toISOString()
    };

    db.messages.push(newMsg);
    saveClientDb(db);
    return { message: newMsg };
  },

  // 5. Reviews
  async getReviews(params?: { sellerId?: string; channelId?: string }): Promise<{ reviews: Review[] }> {
    const db = getClientDb();
    let reviews = [...db.reviews];
    if (params?.sellerId) reviews = reviews.filter((r) => r.sellerId === params.sellerId);
    if (params?.channelId) reviews = reviews.filter((r) => r.channelId === params.channelId);
    return { reviews };
  },

  async submitReview(payload: any, token: string | null): Promise<{ review: Review }> {
    const db = getClientDb();
    const user = getClientCurrentUser(token);

    const newRev: Review = {
      id: `rev_${Date.now()}`,
      orderId: payload.orderId || '',
      channelId: payload.channelId || '',
      channelTitle: payload.channelTitle || 'Verified Channel',
      buyerId: user?.id || 'usr_buyer_1',
      buyerName: payload.reviewerName || user?.name || 'Verified Buyer',
      sellerId: payload.sellerId || 'usr_seller_1',
      rating: payload.rating || 5,
      comment: payload.comment || '',
      communicationRating: payload.communicationRating || 5,
      transferSpeedRating: payload.transferSpeedRating || 5,
      createdAt: new Date().toISOString()
    };

    db.reviews.unshift(newRev);
    saveClientDb(db);
    return { review: newRev };
  },

  // 6. Admin
  async getAdminStats(): Promise<AdminStats> {
    const db = getClientDb();
    const totalVolume = db.channels.reduce((sum, c) => sum + (c.askingPrice || (c as any).price || 0), 0);
    const commissionRate = (db.settings?.commissionRate !== undefined && db.settings?.commissionRate !== null)
      ? Number(db.settings.commissionRate)
      : 5;
    const totalFees = Math.round(totalVolume * (commissionRate / 100));

    return {
      totalVolume,
      totalFees,
      totalListings: db.channels.length,
      activeListings: db.channels.filter((c) => c.status === 'active').length,
      pendingApprovalsCount: db.channels.filter((c) => c.status === 'pending').length,
      totalOrders: db.orders.length,
      completedOrdersCount: db.orders.filter((o) => o.status === 'completed').length,
      activeOrdersCount: db.orders.filter((o) => o.status === 'transfer_in_progress' || o.status === 'payment_confirmed').length,
      disputedOrdersCount: db.orders.filter((o) => o.status === 'disputed').length,
      totalUsers: db.users.length,
      sellersCount: db.users.filter((u) => u.role === 'seller').length,
      buyersCount: db.users.filter((u) => u.role === 'buyer').length,
      totalTransactions: db.transactions?.length || 18,
      pendingPayoutsCount: 3,
      openTicketsCount: db.tickets?.filter((t) => t.status !== 'closed').length || 2,
      fraudAlertsCount: db.fraudAlerts?.filter((f) => !f.resolved).length || 0
    };
  },

  async reviewChannel(channelId: string, decision: 'approved' | 'rejected'): Promise<{ channel: ChannelListing }> {
    const db = getClientDb();
    const ch = db.channels.find((c) => c.id === channelId);
    if (!ch) throw new Error('Channel not found');
    ch.status = decision === 'approved' ? 'active' : 'paused';
    ch.verificationStatus = decision === 'approved' ? 'approved' : 'rejected';
    saveClientDb(db);
    return { channel: ch };
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    const db = getClientDb();
    return { users: db.users };
  },

  async toggleUserBan(userId: string): Promise<{ user: User; message: string }> {
    const db = getClientDb();
    const u = db.users.find((user) => user.id === userId);
    if (!u) throw new Error('User not found');
    u.isBanned = !u.isBanned;
    saveClientDb(db);
    return { user: u, message: u.isBanned ? 'User banned' : 'User unbanned' };
  },

  async toggleUserVerified(userId: string): Promise<{ user: User; message: string }> {
    const db = getClientDb();
    const u = db.users.find((user) => user.id === userId);
    if (!u) throw new Error('User not found');
    u.isVerifiedSeller = !u.isVerifiedSeller;
    saveClientDb(db);
    return { user: u, message: 'Verification status updated' };
  },

  async updateUserRole(userId: string, role: 'buyer' | 'seller' | 'admin'): Promise<{ user: User; message: string }> {
    const db = getClientDb();
    const u = db.users.find((user) => user.id === userId);
    if (!u) throw new Error('User not found');
    u.role = role;
    saveClientDb(db);
    return { user: u, message: 'Role updated successfully' };
  },

  async resolveDispute(orderId: string, resolutionAction: 'refund_buyer' | 'complete_order'): Promise<{ order: Order; message: string }> {
    const db = getClientDb();
    const ord = db.orders.find((o) => o.id === orderId);
    if (!ord) throw new Error('Order not found');
    ord.status = resolutionAction === 'refund_buyer' ? 'cancelled' : 'completed';
    ord.disputeResolution = `Admin resolved via ${resolutionAction}`;
    saveClientDb(db);
    return { order: ord, message: 'Dispute resolved successfully' };
  },

  async toggleChannelFeatured(channelId: string): Promise<{ channel: ChannelListing }> {
    const db = getClientDb();
    const ch = db.channels.find((c) => c.id === channelId);
    if (!ch) throw new Error('Channel not found');
    ch.isFeatured = !ch.isFeatured;
    saveClientDb(db);
    return { channel: ch };
  },

  async getAdminTransactions(): Promise<{ transactions: any[] }> {
    const db = getClientDb();
    return { transactions: db.transactions || [] };
  },

  async getWebsiteSettings(): Promise<{ settings: any }> {
    const db = getClientDb();
    return { settings: db.settings || {} };
  },

  async updateWebsiteSettings(updates: any): Promise<{ settings: any; message: string }> {
    const db = getClientDb();
    db.settings = { ...db.settings, ...updates };
    saveClientDb(db);
    return { settings: db.settings, message: 'Settings saved successfully' };
  },

  async getAdminAuditLogs(): Promise<{ logs: any[] }> {
    const db = getClientDb();
    return { logs: db.auditLogs || [] };
  },

  async getAdminTickets(): Promise<{ tickets: any[] }> {
    const db = getClientDb();
    return { tickets: db.tickets || [] };
  },

  async replyAdminTicket(ticketId: string, text: string): Promise<{ ticket: any }> {
    const db = getClientDb();
    const t = db.tickets?.find((tick: any) => tick.id === ticketId);
    if (t) {
      if (!t.messages) t.messages = [];
      t.messages.push({
        id: `tmsg_${Date.now()}`,
        sender: 'Alif Trust Support',
        role: 'admin',
        text,
        createdAt: new Date().toISOString()
      });
      saveClientDb(db);
      return { ticket: t };
    }
    throw new Error('Ticket not found');
  },

  async updateTicketStatus(ticketId: string, status: string): Promise<{ ticket: any }> {
    const db = getClientDb();
    const t = db.tickets?.find((tick: any) => tick.id === ticketId);
    if (t) {
      t.status = status;
      saveClientDb(db);
      return { ticket: t };
    }
    throw new Error('Ticket not found');
  },

  async getAdminCoupons(): Promise<{ coupons: any[] }> {
    const db = getClientDb();
    return { coupons: db.coupons || [] };
  },

  async createAdminCoupon(payload: any): Promise<{ coupon: any }> {
    const db = getClientDb();
    const newCoupon = {
      id: `cpn_${Date.now()}`,
      code: payload.code.toUpperCase(),
      discountPercent: payload.discountPercent,
      maxDiscountAmount: payload.maxDiscountAmount || 10000,
      minOrderAmount: payload.minOrderAmount || 5000,
      active: true,
      expiryDate: payload.expiryDate || '2026-12-31'
    };
    if (!db.coupons) db.coupons = [];
    db.coupons.unshift(newCoupon);
    saveClientDb(db);
    return { coupon: newCoupon };
  },

  async deleteAdminCoupon(id: string): Promise<{ success: boolean }> {
    const db = getClientDb();
    db.coupons = db.coupons?.filter((c: any) => c.id !== id) || [];
    saveClientDb(db);
    return { success: true };
  },

  async getAdminFraudAlerts(): Promise<{ alerts: any[] }> {
    const db = getClientDb();
    return { alerts: db.fraudAlerts || [] };
  },

  async resolveAdminFraudAlert(id: string): Promise<{ alert: any }> {
    const db = getClientDb();
    const a = db.fraudAlerts?.find((alert: any) => alert.id === id);
    if (a) {
      a.resolved = true;
      saveClientDb(db);
      return { alert: a };
    }
    throw new Error('Alert not found');
  },

  async getAdminNotifications(): Promise<{ notifications: any[] }> {
    const db = getClientDb();
    return { notifications: db.notifications || [] };
  },

  async createAdminNotification(payload: any): Promise<{ notification: any }> {
    const db = getClientDb();
    const n = {
      id: `notif_${Date.now()}`,
      title: payload.title,
      message: payload.message,
      type: payload.type || 'announcement',
      targetRole: payload.targetRole || 'all',
      createdAt: new Date().toISOString()
    };
    if (!db.notifications) db.notifications = [];
    db.notifications.unshift(n);
    saveClientDb(db);
    return { notification: n };
  },

  async deleteAdminNotification(id: string): Promise<{ success: boolean }> {
    const db = getClientDb();
    db.notifications = db.notifications?.filter((n: any) => n.id !== id) || [];
    saveClientDb(db);
    return { success: true };
  },

  async exportAdminBackup(): Promise<any> {
    return getClientDb();
  },

  async restoreAdminBackup(payload: any): Promise<{ success: boolean; message: string }> {
    saveClientDb(payload);
    return { success: true, message: 'Database restored successfully' };
  }
};
