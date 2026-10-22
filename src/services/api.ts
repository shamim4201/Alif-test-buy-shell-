import {
  User,
  ChannelListing,
  Order,
  Message,
  Review,
  AdminStats
} from '../types';
import { clientDbService } from './clientStorage';

const TOKEN_KEY = 'channeltrust_auth_token';
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

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

// Detect if static hosting / offline environment (e.g. Vercel static build or local file)
let isOfflineFallbackActive = false;

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const fullUrl = API_BASE_URL ? `${API_BASE_URL.replace(/\/$/, '')}${url}` : url;
  const res = await fetch(fullUrl, { ...options, headers });
  
  if (res.status === 404 || res.status === 502 || res.status === 503) {
    isOfflineFallbackActive = true;
    throw new Error(`Request failed with status ${res.status}`);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

// Automatically fallback to client storage if server returns 404 (static hosting / unconfigured backend) or is offline
async function callWithFallback<T>(
  apiCall: () => Promise<T>,
  fallbackCall: () => Promise<T>
): Promise<T> {
  if (isOfflineFallbackActive) {
    return await fallbackCall();
  }
  try {
    return await apiCall();
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (
      isOfflineFallbackActive ||
      msg.includes('status 404') ||
      msg.includes('status 502') ||
      msg.includes('status 503') ||
      msg.includes('Failed to fetch') ||
      msg.includes('NetworkError') ||
      msg.includes('Load failed') ||
      msg.includes('404')
    ) {
      isOfflineFallbackActive = true;
      return await fallbackCall();
    }
    throw err;
  }
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return callWithFallback(
      async () => {
        const data = await fetchWithAuth('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        setStoredToken(data.token);
        return data;
      },
      async () => {
        const data = await clientDbService.login(email, password);
        setStoredToken(data.token);
        return data;
      }
    );
  },

  async register(payload: { name: string; email: string; password: string; role: 'buyer' | 'seller'; bio?: string }): Promise<{ user: User; token: string }> {
    return callWithFallback(
      async () => {
        const data = await fetchWithAuth('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setStoredToken(data.token);
        return data;
      },
      async () => {
        const data = await clientDbService.register(payload);
        setStoredToken(data.token);
        return data;
      }
    );
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return callWithFallback(
      () => fetchWithAuth('/api/auth/me'),
      () => clientDbService.getCurrentUser(getStoredToken())
    );
  },

  async quickSwitch(role: 'admin' | 'seller' | 'buyer'): Promise<{ user: User; token: string }> {
    return callWithFallback(
      async () => {
        const data = await fetchWithAuth('/api/auth/quick-switch', {
          method: 'POST',
          body: JSON.stringify({ role })
        });
        setStoredToken(data.token);
        return data;
      },
      async () => {
        if (role === 'admin') {
          return clientDbService.login('alifsheenshopping@gmail.com', '019Alif11#');
        } else if (role === 'seller') {
          return clientDbService.login('apex.creators@gmail.com', 'seller1234');
        } else {
          return clientDbService.login('investor.mark@gmail.com', 'buyer1234');
        }
      }
    );
  },

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    return callWithFallback(
      () =>
        fetchWithAuth('/api/auth/profile', {
          method: 'PUT',
          body: JSON.stringify(updates)
        }),
      () => clientDbService.updateProfile(getStoredToken(), updates)
    );
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
    return callWithFallback(
      () => fetchWithAuth(`/api/channels${qStr ? `?${qStr}` : ''}`),
      () => clientDbService.getChannels(params)
    );
  },

  async getChannel(id: string): Promise<{ channel: ChannelListing; seller: User | null; reviews: Review[] }> {
    return callWithFallback(
      () => fetchWithAuth(`/api/channels/${id}`),
      () => clientDbService.getChannel(id)
    );
  },

  async createChannel(payload: Partial<ChannelListing>): Promise<{ channel: ChannelListing }> {
    return callWithFallback(
      () =>
        fetchWithAuth('/api/channels', {
          method: 'POST',
          body: JSON.stringify(payload)
        }),
      () => clientDbService.createChannel(payload, getStoredToken())
    );
  },

  async updateChannel(id: string, updates: Partial<ChannelListing>): Promise<{ channel: ChannelListing }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/channels/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates)
        }),
      () => clientDbService.updateChannel(id, updates)
    );
  },

  async deleteChannel(id: string): Promise<{ success: boolean; message: string }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/channels/${id}`, {
          method: 'DELETE'
        }),
      () => clientDbService.deleteChannel(id)
    );
  },

  // Orders
  async getOrders(): Promise<{ orders: Order[] }> {
    return callWithFallback(
      () => fetchWithAuth('/api/orders'),
      () => clientDbService.getOrders(getStoredToken())
    );
  },

  async getOrder(id: string): Promise<{ order: Order; channel: ChannelListing | null; seller: User | null; buyer: User | null }> {
    return callWithFallback(
      () => fetchWithAuth(`/api/orders/${id}`),
      () => clientDbService.getOrder(id)
    );
  },

  async createOrder(payload: { channelId: string; offeredPrice?: number; buyerGoogleEmail?: string }): Promise<{ order: Order }> {
    return callWithFallback(
      () =>
        fetchWithAuth('/api/orders', {
          method: 'POST',
          body: JSON.stringify(payload)
        }),
      () => clientDbService.createOrder(payload, getStoredToken())
    );
  },

  async confirmPayment(
    orderId: string,
    payload: {
      paymentMethod?: string;
      transactionRef?: string;
      screenshotUrl?: string;
      senderAccount?: string;
      notes?: string;
    }
  ): Promise<{ order: Order }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/orders/${orderId}/confirm-payment`, {
          method: 'POST',
          body: JSON.stringify(payload)
        }),
      () => clientDbService.confirmPayment(orderId, payload)
    );
  },

  async adminApprovePayment(orderId: string): Promise<{ order: Order }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/orders/${orderId}/admin-approve-payment`, {
          method: 'POST'
        }),
      () => clientDbService.adminApprovePayment(orderId)
    );
  },

  async adminRejectPayment(orderId: string, reason?: string): Promise<{ order: Order }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/orders/${orderId}/admin-reject-payment`, {
          method: 'POST',
          body: JSON.stringify({ reason })
        }),
      () => clientDbService.adminRejectPayment(orderId, reason)
    );
  },

  async setBuyerGoogleEmail(orderId: string, buyerGoogleEmail: string): Promise<{ order: Order }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/orders/${orderId}/set-google-email`, {
          method: 'POST',
          body: JSON.stringify({ buyerGoogleEmail })
        }),
      async () => {
        const res = await clientDbService.getOrder(orderId);
        res.order.buyerGoogleEmail = buyerGoogleEmail;
        return { order: res.order };
      }
    );
  },

  async updateTransferStep(orderId: string, stepNumber: number): Promise<{ order: Order }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/orders/${orderId}/step/${stepNumber}`, {
          method: 'POST'
        }),
      () => clientDbService.updateTransferStep(orderId, stepNumber)
    );
  },

  async completeOrder(orderId: string): Promise<{ order: Order }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/orders/${orderId}/complete`, {
          method: 'POST'
        }),
      () => clientDbService.completeOrder(orderId)
    );
  },

  async raiseDispute(orderId: string, reason: string): Promise<{ order: Order }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/orders/${orderId}/dispute`, {
          method: 'POST',
          body: JSON.stringify({ reason })
        }),
      () => clientDbService.raiseDispute(orderId, reason, getStoredToken())
    );
  },

  async cancelOrder(orderId: string): Promise<{ order: Order }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/orders/${orderId}/cancel`, {
          method: 'POST'
        }),
      () => clientDbService.cancelOrder(orderId)
    );
  },

  // Messages
  async getMessages(params?: { orderId?: string; channelId?: string }): Promise<{ messages: Message[] }> {
    const query = new URLSearchParams();
    if (params?.orderId) query.set('orderId', params.orderId);
    if (params?.channelId) query.set('channelId', params.channelId);
    const qStr = query.toString();
    return callWithFallback(
      () => fetchWithAuth(`/api/messages${qStr ? `?${qStr}` : ''}`),
      () => clientDbService.getMessages(params)
    );
  },

  async sendMessage(payload: { orderId?: string; channelId?: string; recipientId?: string; text: string; attachmentUrl?: string }): Promise<{ message: Message; flaggedWarning?: boolean }> {
    return callWithFallback(
      () =>
        fetchWithAuth('/api/messages', {
          method: 'POST',
          body: JSON.stringify(payload)
        }),
      () => clientDbService.sendMessage(payload, getStoredToken())
    );
  },

  // Reviews
  async getReviews(params?: { sellerId?: string; channelId?: string }): Promise<{ reviews: Review[] }> {
    const query = new URLSearchParams();
    if (params?.sellerId) query.set('sellerId', params.sellerId);
    if (params?.channelId) query.set('channelId', params.channelId);
    const qStr = query.toString();
    return callWithFallback(
      () => fetchWithAuth(`/api/reviews${qStr ? `?${qStr}` : ''}`),
      () => clientDbService.getReviews(params)
    );
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
    return callWithFallback(
      () =>
        fetchWithAuth('/api/reviews', {
          method: 'POST',
          body: JSON.stringify(payload)
        }),
      () => clientDbService.submitReview(payload, getStoredToken())
    );
  },

  // Upload
  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
    return callWithFallback(
      async () => {
        const formData = new FormData();
        formData.append('file', file);
        return fetchWithAuth('/api/upload', {
          method: 'POST',
          body: formData
        });
      },
      async () => {
        // Local base64 simulation
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              url: reader.result as string,
              filename: file.name
            });
          };
          reader.readAsDataURL(file);
        });
      }
    );
  },

  // Admin
  async getAdminStats(): Promise<AdminStats> {
    return callWithFallback(
      () => fetchWithAuth('/api/admin/stats'),
      () => clientDbService.getAdminStats()
    );
  },

  async reviewChannel(channelId: string, decision: 'approved' | 'rejected', notes?: string): Promise<{ channel: ChannelListing }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/admin/channels/${channelId}/review`, {
          method: 'POST',
          body: JSON.stringify({ decision, notes })
        }),
      () => clientDbService.reviewChannel(channelId, decision)
    );
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    return callWithFallback(
      () => fetchWithAuth('/api/admin/users'),
      () => clientDbService.getAdminUsers()
    );
  },

  async toggleUserBan(userId: string): Promise<{ user: User; message: string }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/admin/users/${userId}/toggle-ban`, {
          method: 'POST'
        }),
      () => clientDbService.toggleUserBan(userId)
    );
  },

  async toggleUserVerified(userId: string): Promise<{ user: User; message: string }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/admin/users/${userId}/toggle-verified`, {
          method: 'POST'
        }),
      () => clientDbService.toggleUserVerified(userId)
    );
  },

  async resolveDispute(orderId: string, resolutionAction: 'refund_buyer' | 'complete_order', notes?: string): Promise<{ order: Order; message: string }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/admin/disputes/${orderId}/resolve`, {
          method: 'POST',
          body: JSON.stringify({ resolutionAction, notes })
        }),
      () => clientDbService.resolveDispute(orderId, resolutionAction)
    );
  },

  async toggleChannelFeatured(channelId: string): Promise<{ channel: ChannelListing }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/admin/channels/${channelId}/toggle-featured`, {
          method: 'POST'
        }),
      () => clientDbService.toggleChannelFeatured(channelId)
    );
  },

  async toggleChannelStatus(channelId: string): Promise<{ channel: ChannelListing }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/admin/channels/${channelId}/toggle-status`, {
          method: 'POST'
        }),
      async () => {
        const ch = (await clientDbService.getChannels()).channels.find((c) => c.id === channelId);
        if (!ch) throw new Error('Channel not found');
        return clientDbService.updateChannel(channelId, {
          status: ch.status === 'active' ? 'paused' : 'active'
        });
      }
    );
  },

  async deleteAdminChannel(channelId: string): Promise<{ success: boolean; message: string }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/admin/channels/${channelId}`, {
          method: 'DELETE'
        }),
      () => clientDbService.deleteChannel(channelId)
    );
  },

  async updateUserRole(userId: string, role: 'buyer' | 'seller' | 'admin'): Promise<{ user: User; message: string }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/admin/users/${userId}/role`, {
          method: 'PUT',
          body: JSON.stringify({ role })
        }),
      () => clientDbService.updateUserRole(userId, role)
    );
  },

  async getAdminTransactions(): Promise<{ transactions: any[] }> {
    return callWithFallback(
      () => fetchWithAuth('/api/admin/transactions'),
      () => clientDbService.getAdminTransactions()
    );
  },

  async getWebsiteSettings(): Promise<{ settings: any }> {
    return callWithFallback(
      () => fetchWithAuth('/api/settings'),
      () => clientDbService.getWebsiteSettings()
    );
  },

  async updateWebsiteSettings(updates: any): Promise<{ settings: any; message: string }> {
    return callWithFallback(
      () =>
        fetchWithAuth('/api/admin/settings', {
          method: 'PUT',
          body: JSON.stringify(updates)
        }),
      () => clientDbService.updateWebsiteSettings(updates)
    );
  },

  async getAdminAuditLogs(): Promise<{ logs: any[] }> {
    return callWithFallback(
      () => fetchWithAuth('/api/admin/audit-logs'),
      () => clientDbService.getAdminAuditLogs()
    );
  },

  async getAdminTickets(): Promise<{ tickets: any[] }> {
    return callWithFallback(
      () => fetchWithAuth('/api/admin/tickets'),
      () => clientDbService.getAdminTickets()
    );
  },

  async replyAdminTicket(ticketId: string, text: string): Promise<{ ticket: any }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/admin/tickets/${ticketId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ text })
        }),
      () => clientDbService.replyAdminTicket(ticketId, text)
    );
  },

  async updateTicketStatus(ticketId: string, status: string): Promise<{ ticket: any }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/admin/tickets/${ticketId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status })
        }),
      () => clientDbService.updateTicketStatus(ticketId, status)
    );
  },

  async getAdminCoupons(): Promise<{ coupons: any[] }> {
    return callWithFallback(
      () => fetchWithAuth('/api/admin/coupons'),
      () => clientDbService.getAdminCoupons()
    );
  },

  async createAdminCoupon(payload: any): Promise<{ coupon: any }> {
    return callWithFallback(
      () =>
        fetchWithAuth('/api/admin/coupons', {
          method: 'POST',
          body: JSON.stringify(payload)
        }),
      () => clientDbService.createAdminCoupon(payload)
    );
  },

  async deleteAdminCoupon(id: string): Promise<{ success: boolean }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/admin/coupons/${id}`, {
          method: 'DELETE'
        }),
      () => clientDbService.deleteAdminCoupon(id)
    );
  },

  async getAdminFraudAlerts(): Promise<{ alerts: any[] }> {
    return callWithFallback(
      () => fetchWithAuth('/api/admin/fraud-alerts'),
      () => clientDbService.getAdminFraudAlerts()
    );
  },

  async resolveAdminFraudAlert(id: string): Promise<{ alert: any }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/admin/fraud-alerts/${id}/resolve`, {
          method: 'POST'
        }),
      () => clientDbService.resolveAdminFraudAlert(id)
    );
  },

  async getAdminNotifications(): Promise<{ notifications: any[] }> {
    return callWithFallback(
      () => fetchWithAuth('/api/admin/notifications'),
      () => clientDbService.getAdminNotifications()
    );
  },

  async createAdminNotification(payload: any): Promise<{ notification: any }> {
    return callWithFallback(
      () =>
        fetchWithAuth('/api/admin/notifications', {
          method: 'POST',
          body: JSON.stringify(payload)
        }),
      () => clientDbService.createAdminNotification(payload)
    );
  },

  async deleteAdminNotification(id: string): Promise<{ success: boolean }> {
    return callWithFallback(
      () =>
        fetchWithAuth(`/api/admin/notifications/${id}`, {
          method: 'DELETE'
        }),
      () => clientDbService.deleteAdminNotification(id)
    );
  },

  async exportAdminBackup(): Promise<any> {
    return callWithFallback(
      () => fetchWithAuth('/api/admin/backup/export'),
      () => clientDbService.exportAdminBackup()
    );
  },

  async restoreAdminBackup(payload: any): Promise<{ success: boolean; message: string }> {
    return callWithFallback(
      () =>
        fetchWithAuth('/api/admin/backup/restore', {
          method: 'POST',
          body: JSON.stringify(payload)
        }),
      () => clientDbService.restoreAdminBackup(payload)
    );
  }
};
