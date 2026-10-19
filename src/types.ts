export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  isVerifiedSeller?: boolean;
  isBanned?: boolean;
  rating?: number;
  dealsCount?: number;
  bio?: string;
}

export type MonetizationStatus = 'monetized' | 'not_monetized' | 'in_review';
export type StrikeStatus = 'clean' | '1_strike' | '2_strikes';
export type ChannelVerificationStatus = 'pending' | 'approved' | 'rejected';

export interface AudienceData {
  topCountries: { country: string; percentage: number }[];
  ageDistribution: { range: string; percentage: number }[];
  genderSplit: { male: number; female: number };
}

export type PlatformType = 'youtube' | 'facebook' | 'tiktok' | 'instagram' | 'telegram' | 'twitter';

export type AccountType =
  | 'cooking_lifestyle'
  | 'faceless_cash_cow'
  | 'shorts_creator'
  | 'gaming_stream'
  | 'vintage_aged'
  | 'high_cpm_finance'
  | 'vlog_personal'
  | 'education_tech'
  | 'facebook_page'
  | 'tiktok_viral'
  | 'instagram_theme'
  | 'telegram_signal'
  | 'twitter_crypto'
  | 'general';

export interface ChannelListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerRating: number;
  sellerDealsCount: number;
  platform?: PlatformType; // 'youtube' | 'facebook' | 'tiktok' | 'instagram' | 'telegram' | 'twitter'
  title: string;
  handle: string;
  channelUrl: string;
  niche: string;
  accountType?: AccountType;
  primaryLanguage?: string;
  tags?: string[];
  subscribers: number; // For FB/TikTok/IG/Twitter: Followers, For TG: Members, For YT: Subscribers
  lifetimeViews: number;
  monthlyViews: number;
  monthlyRevenue: number;
  monetizationStatus: MonetizationStatus;
  strikeStatus: StrikeStatus;
  hasSilverButton?: boolean;
  pageQuality?: 'green' | 'yellow' | 'red';
  isVerifiedBadge?: boolean;
  monetizationTool?: string; // e.g. "In-Stream Ads", "TikTok Creator Rewards", "AdSense", "TikTok Shop"
  askingPrice: number;
  minOfferPrice?: number;
  description: string;
  creationYear: number;
  videoCount: number;
  analyticsScreenshots: string[];
  verificationStatus: ChannelVerificationStatus;
  adminReviewNotes?: string;
  isFeatured?: boolean;
  status: 'active' | 'pending' | 'sold' | 'paused';
  audience?: AudienceData;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'payment_confirmed'
  | 'transfer_in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface OrderTransferStep {
  step: number;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
}

export interface Order {
  id: string;
  channelId: string;
  channelTitle: string;
  channelHandle: string;
  channelUrl: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  amount: number;
  platformFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentDetails?: {
    method: string;
    transactionRef: string;
    confirmedAt: string;
    verifiedByServer: boolean;
  };
  transferSteps: OrderTransferStep[];
  disputeReason?: string;
  disputeRaisedBy?: 'buyer' | 'seller';
  disputeRaisedAt?: string;
  disputeResolution?: string;
  buyerGoogleEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  orderId?: string;
  channelId?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  text: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId?: string;
  channelId: string;
  channelTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  rating: number;
  comment: string;
  communicationRating: number;
  transferSpeedRating: number;
  createdAt: string;
}

export interface AdminStats {
  totalVolume: number;
  totalFees: number;
  totalListings: number;
  activeListings: number;
  pendingApprovalsCount: number;
  totalOrders: number;
  completedOrdersCount: number;
  activeOrdersCount: number;
  disputedOrdersCount: number;
  totalUsers: number;
  sellersCount: number;
  buyersCount: number;
  totalTransactions?: number;
  pendingPayoutsCount?: number;
  openTicketsCount?: number;
  fraudAlertsCount?: number;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'channel' | 'user' | 'order' | 'dispute' | 'settings' | 'coupon' | 'ticket' | 'payment';
  targetId: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface SupportTicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'buyer' | 'seller' | 'admin';
  text: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: 'account' | 'payment' | 'transfer' | 'listing' | 'dispute' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: SupportTicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  validUntil: string;
  usageCount: number;
  usageLimit: number;
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  orderId?: string;
  userId: string;
  userName: string;
  userRole: 'buyer' | 'seller';
  type: 'deposit' | 'escrow_lock' | 'payout' | 'refund' | 'commission';
  amount: number;
  currency: 'USD' | 'BDT';
  fee: number;
  paymentMethod: 'bkash' | 'nagad' | 'bank_transfer' | 'card' | 'crypto' | 'internal_wallet';
  paymentProvider?: string;
  transactionRef: string;
  status: 'success' | 'pending' | 'failed';
  notes?: string;
  createdAt: string;
}

export interface FraudAlert {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  riskScore: number; // 0 to 100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  triggerReason: string;
  details: string;
  targetId?: string;
  targetType?: 'channel' | 'order' | 'payout' | 'login';
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export interface WebsiteSettings {
  siteName: string;
  siteTagline: string;
  logoUrl?: string;
  primaryColor: string;
  commissionRate: number; // e.g., 5%
  minimumListingPrice: number;
  featuredListingFee: number;
  maintenanceMode: boolean;
  contactEmail: string;
  contactPhone: string;
  whatsappSupport: string;
  bkashMerchantNumber: string;
  nagadMerchantNumber: string;
  bankDetails: string;
  enable2FA: boolean;
  termsOfService: string;
  privacyPolicy: string;
  refundPolicy: string;
  safetyProtocol: string;
  marketplaceGuide?: string;
  securityStandardTitle?: string;
  securityStandardDescription?: string;
  securityStandardBadge?: string;
  trustBadgeText?: string;
  footerDisclaimer?: string;

  // Header Titles
  policiesMenuTitle?: string;
  marketplaceMenuTitle?: string;
  securityStandardMenuTitle?: string;

  // Marketplace Menu Links Labels
  marketplaceLinkBrowse?: string;
  marketplaceLinkSell?: string;
  marketplaceLinkHowTransferWorks?: string;
  marketplaceLinkBuyerHub?: string;

  // Policies Menu Links Labels
  policyLinkTos?: string;
  policyLinkPrivacy?: string;
  policyLinkRefund?: string;
  policyLinkSafety?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'buyers' | 'sellers';
  type: 'info' | 'warning' | 'urgent' | 'promo';
  isActive: boolean;
  createdAt: string;
}
