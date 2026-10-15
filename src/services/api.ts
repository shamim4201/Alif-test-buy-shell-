import {
  User,
  ChannelListing,
  Order,
  Message,
  Review,
  AdminStats
} from '../types';

const TOKEN_KEY = 'channeltrust_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setStoredToken(data.token);
    return data;
  },

  async register(payload: { name: string; email: string; password: string; role: 'buyer' | 'seller'; bio?: string }): Promise<{ user: User; token: string }> {
    const data = await fetchWithAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setStoredToken(data.token);
    return data;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return fetchWithAuth('/api/auth/me');
  },

  async quickSwitch(role: 'admin' | 'seller' | 'buyer'): Promise<{ user: User; token: string }> {
    const data = await fetchWithAuth('/api/auth/quick-switch', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
    setStoredToken(data.token);
    return data;
  },

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    return fetchWithAuth('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // Channels
  async getChannels(params?: Record<string, any>): Promise<{ channels: ChannelListing[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== null) {
          query.set(k, String(v));
        }
      });
    }
    const qStr = query.toString();
    return fetchWithAuth(`/api/channels${qStr ? `?${qStr}` : ''}`);
  },

  async getChannel(id: string): Promise<{ channel: ChannelListing; seller: User | null; reviews: Review[] }> {
    return fetchWithAuth(`/api/channels/${id}`);
  },

  async createChannel(payload: Partial<ChannelListing>): Promise<{ channel: ChannelListing }> {
    return fetchWithAuth('/api/channels', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateChannel(id: string, updates: Partial<ChannelListing>): Promise<{ channel: ChannelListing }> {
    return fetchWithAuth(`/api/channels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteChannel(id: string): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth(`/api/channels/${id}`, {
      method: 'DELETE'
    });
  },

  // Orders
  async getOrders(): Promise<{ orders: Order[] }> {
    return fetchWithAuth('/api/orders');
  },

  async getOrder(id: string): Promise<{ order: Order; channel: ChannelListing | null; seller: User | null; buyer: User | null }> {
    return fetchWithAuth(`/api/orders/${id}`);
  },

  async createOrder(payload: { channelId: string; offeredPrice?: number; buyerGoogleEmail?: string }): Promise<{ order: Order }> {
    return fetchWithAuth('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async confirmPayment(orderId: string, payload: { paymentMethod?: string; transactionRef?: string }): Promise<{ order: Order }> {
    return fetchWithAuth(`/api/orders/${orderId}/confirm-payment`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async setBuyerGoogleEmail(orderId: string, buyerGoogleEmail: string): Promise<{ order: Order }> {
    return fetchWithAuth(`/api/orders/${orderId}/set-google-email`, {
      method: 'POST',
      body: JSON.stringify({ buyerGoogleEmail })
    });
  },

  async updateTransferStep(orderId: string, stepNumber: number): Promise<{ order: Order }> {
    return fetchWithAuth(`/api/orders/${orderId}/step/${stepNumber}`, {
      method: 'POST'
    });
  },

  async completeOrder(orderId: string): Promise<{ order: Order }> {
    return fetchWithAuth(`/api/orders/${orderId}/complete`, {
      method: 'POST'
    });
  },

  async raiseDispute(orderId: string, reason: string): Promise<{ order: Order }> {
    return fetchWithAuth(`/api/orders/${orderId}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  async cancelOrder(orderId: string): Promise<{ order: Order }> {
    return fetchWithAuth(`/api/orders/${orderId}/cancel`, {
      method: 'POST'
    });
  },

  // Messages
  async getMessages(params?: { orderId?: string; channelId?: string }): Promise<{ messages: Message[] }> {
    const query = new URLSearchParams();
    if (params?.orderId) query.set('orderId', params.orderId);
    if (params?.channelId) query.set('channelId', params.channelId);
    const qStr = query.toString();
    return fetchWithAuth(`/api/messages${qStr ? `?${qStr}` : ''}`);
  },

  async sendMessage(payload: { orderId?: string; channelId?: string; recipientId?: string; text: string; attachmentUrl?: string }): Promise<{ message: Message; flaggedWarning?: boolean }> {
    return fetchWithAuth('/api/messages', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Reviews
  async getReviews(params?: { sellerId?: string; channelId?: string }): Promise<{ reviews: Review[] }> {
    const query = new URLSearchParams();
    if (params?.sellerId) query.set('sellerId', params.sellerId);
    if (params?.channelId) query.set('channelId', params.channelId);
    const qStr = query.toString();
    return fetchWithAuth(`/api/reviews${qStr ? `?${qStr}` : ''}`);
  },

  async submitReview(payload: {
    orderId?: string;
    channelId?: string;
    rating: number;
    comment: string;
    communicationRating?: number;
    transferSpeedRating?: number;
    reviewerName?: string;
  }): Promise<{ review: Review }> {
    return fetchWithAuth('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Upload
  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return fetchWithAuth('/api/upload', {
      method: 'POST',
      body: formData
    });
  },

  // Admin
  async getAdminStats(): Promise<AdminStats> {
    return fetchWithAuth('/api/admin/stats');
  },

  async reviewChannel(channelId: string, decision: 'approved' | 'rejected', notes?: string): Promise<{ channel: ChannelListing }> {
    return fetchWithAuth(`/api/admin/channels/${channelId}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes })
    });
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    return fetchWithAuth('/api/admin/users');
  },

  async toggleUserBan(userId: string): Promise<{ user: User; message: string }> {
    return fetchWithAuth(`/api/admin/users/${userId}/toggle-ban`, {
      method: 'POST'
    });
  },

  async toggleUserVerified(userId: string): Promise<{ user: User; message: string }> {
    return fetchWithAuth(`/api/admin/users/${userId}/toggle-verified`, {
      method: 'POST'
    });
  },

  async resolveDispute(orderId: string, resolutionAction: 'refund_buyer' | 'complete_order', notes?: string): Promise<{ order: Order; message: string }> {
    return fetchWithAuth(`/api/admin/disputes/${orderId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolutionAction, notes })
    });
  },

  async toggleChannelFeatured(channelId: string): Promise<{ channel: ChannelListing }> {
    return fetchWithAuth(`/api/admin/channels/${channelId}/toggle-featured`, {
      method: 'POST'
    });
  },

  async toggleChannelStatus(channelId: string): Promise<{ channel: ChannelListing }> {
    return fetchWithAuth(`/api/admin/channels/${channelId}/toggle-status`, {
      method: 'POST'
    });
  },

  async deleteAdminChannel(channelId: string): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth(`/api/admin/channels/${channelId}`, {
      method: 'DELETE'
    });
  },

  async updateUserRole(userId: string, role: 'buyer' | 'seller' | 'admin'): Promise<{ user: User; message: string }> {
    return fetchWithAuth(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  },

  async getAdminTransactions(): Promise<{ transactions: any[] }> {
    return fetchWithAuth('/api/admin/transactions');
  },

  async getWebsiteSettings(): Promise<{ settings: any }> {
    return fetchWithAuth('/api/admin/settings');
  },

  async updateWebsiteSettings(updates: any): Promise<{ settings: any; message: string }> {
    return fetchWithAuth('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async getAdminAuditLogs(): Promise<{ logs: any[] }> {
    return fetchWithAuth('/api/admin/audit-logs');
  },

  async getAdminTickets(): Promise<{ tickets: any[] }> {
    return fetchWithAuth('/api/admin/tickets');
  },

  async replyAdminTicket(ticketId: string, text: string): Promise<{ ticket: any }> {
    return fetchWithAuth(`/api/admin/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  },

  async updateTicketStatus(ticketId: string, status: string): Promise<{ ticket: any }> {
    return fetchWithAuth(`/api/admin/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  async getAdminCoupons(): Promise<{ coupons: any[] }> {
    return fetchWithAuth('/api/admin/coupons');
  },

  async createAdminCoupon(payload: any): Promise<{ coupon: any }> {
    return fetchWithAuth('/api/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async deleteAdminCoupon(id: string): Promise<{ success: boolean }> {
    return fetchWithAuth(`/api/admin/coupons/${id}`, {
      method: 'DELETE'
    });
  },

  async getAdminFraudAlerts(): Promise<{ alerts: any[] }> {
    return fetchWithAuth('/api/admin/fraud-alerts');
  },

  async resolveAdminFraudAlert(id: string): Promise<{ alert: any }> {
    return fetchWithAuth(`/api/admin/fraud-alerts/${id}/resolve`, {
      method: 'POST'
    });
  },

  async getAdminNotifications(): Promise<{ notifications: any[] }> {
    return fetchWithAuth('/api/admin/notifications');
  },

  async createAdminNotification(payload: any): Promise<{ notification: any }> {
    return fetchWithAuth('/api/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async deleteAdminNotification(id: string): Promise<{ success: boolean }> {
    return fetchWithAuth(`/api/admin/notifications/${id}`, {
      method: 'DELETE'
    });
  },

  async exportAdminBackup(): Promise<any> {
    return fetchWithAuth('/api/admin/backup/export');
  },

  async restoreAdminBackup(payload: any): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth('/api/admin/backup/restore', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

