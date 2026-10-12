export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
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

export type AccountType =
  | 'cooking_lifestyle' // রান্না, রেসিপি, ফুড ও আন্টি/ফ্যামিলি ভ্লগ
  | 'faceless_cash_cow' // ফেসলেস ক্যাশ কাউ
  | 'shorts_creator' // ভাইরাল শর্টস চ্যানেল
  | 'gaming_stream' // গেমিং ও লাইভ স্ট্রিম
  | 'vintage_aged' // পুরানো ভিন্টেজ অ্যাকাউন্ট (2012-2018)
  | 'high_cpm_finance' // হাই CPM ফিন্যান্স ও বিজনেস
  | 'vlog_personal' // পার্সোনাল ভ্লগ
  | 'education_tech' // এডুকেশন ও টেক
  | 'general';

export interface ChannelListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerRating: number;
  sellerDealsCount: number;
  title: string;
  handle: string;
  channelUrl: string;
  niche: string;
  accountType?: AccountType;
  primaryLanguage?: string;
  tags?: string[];
  subscribers: number;
  lifetimeViews: number;
  monthlyViews: number;
  monthlyRevenue: number; // in USD
  monetizationStatus: MonetizationStatus;
  strikeStatus: StrikeStatus;
  hasSilverButton?: boolean;
  askingPrice: number; // in USD
  minOfferPrice?: number;
  description: string;
  creationYear: number;
  videoCount: number;
  analyticsScreenshots: string[]; // URLs of uploaded proof
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
  buyerGoogleEmail?: string; // used for Brand Account invitation
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
  rating: number; // 1-5
  comment: string;
  communicationRating: number;
  transferSpeedRating: number;
  createdAt: string;
}
