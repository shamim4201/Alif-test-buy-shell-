import { Order, WebsiteSettings } from '../types';

/**
 * Normalizes phone numbers to international WhatsApp format (e.g. 017xxxxxxxx -> 88017xxxxxxxx)
 */
export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return '8801700000000';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '88' + cleaned;
  }
  return cleaned;
}

/**
 * Builds a direct WhatsApp URL with pre-filled message
 */
export function getWhatsAppUrl(phone: string, message: string): string {
  const normalizedPhone = formatWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encodedText}`;
}

/**
 * Builds a mailto link with pre-filled subject and body
 */
export function getEmailMailtoUrl(email: string, subject: string, body: string): string {
  const targetEmail = email || 'alifsheenshopping@gmail.com';
  return `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Generates an Order Notification message for WhatsApp
 */
export function buildOrderWhatsAppMessage(order: Order, customNote?: string): string {
  const isPaid =
    order.status === 'payment_confirmed' ||
    order.status === 'transfer_in_progress' ||
    order.status === 'completed' ||
    order.paymentDetails?.adminApprovalStatus === 'approved';
  const lines = [
    `🔔 *[Alif Trust - নতুন অর্ডার নোটিফিকেশন]* 🔔`,
    ``,
    `📋 *অর্ডার আইডি:* #${order.id}`,
    `📺 *অ্যাকাউন্ট / চ্যানেল:* ${order.channelTitle}`,
    `💰 *মোট মূল্য:* $${order.totalAmount || order.amount} (≈ ৳${((order.totalAmount || order.amount) * 122).toLocaleString('en-US')})`,
    `💳 *পেমেন্ট স্ট্যাটাস:* ${isPaid ? 'ভেরিফাইড ও ডিপোজিটেড' : 'যাচাইয়ের অপেক্ষায়'}`,
  ];

  if (order.paymentDetails?.method) {
    lines.push(`🏦 *পেমেন্ট মেথড:* ${order.paymentDetails.method}`);
  }
  if (order.paymentDetails?.transactionRef) {
    lines.push(`🔖 *ট্রানজেকশন আইডি:* ${order.paymentDetails.transactionRef}`);
  }
  if (order.buyerEmail) {
    lines.push(`👤 *ক্রেতার ইমেইল:* ${order.buyerEmail}`);
  }
  if (order.buyerName) {
    lines.push(`👤 *ক্রেতার নাম:* ${order.buyerName}`);
  }
  if (customNote) {
    lines.push(``, `📝 *বার্তা:* ${customNote}`);
  }

  lines.push(
    ``,
    `⚡ _দয়া করে অর্ডারটি দ্রুত ভেরিফাই করে হস্তান্তর প্রক্রিয়া সম্পন্ন করুন।_`,
    `🌐 *Alif Trust Buy & Sell - alif sheen group*`
  );

  return lines.join('\n');
}

/**
 * Generates an Order Notification Email
 */
export function buildOrderEmailContent(order: Order): { subject: string; body: string } {
  const subject = `[Alif Trust Alert] নতুন অর্ডার #${order.id} - ${order.channelTitle}`;
  const body = `আসসালামু আলাইকুম এডমিন,

Alif Trust Buy & Sell মার্কেটপ্লেসে একটি নতুন অর্ডার সম্পন্ন হয়েছে:

------------------------------------------------
অর্ডার বিবরণ:
------------------------------------------------
অর্ডার আইডি: #${order.id}
চ্যানেল / অ্যাকাউন্ট: ${order.channelTitle}
মূল্য (USD): $${order.totalAmount || order.amount}
আনুমানিক BDT: ৳${((order.totalAmount || order.amount) * 122).toLocaleString('en-US')}
পেমেন্ট মেথড: ${order.paymentDetails?.method || 'Escrow'}
ট্রানজেকশন রেফারেন্স: ${order.paymentDetails?.transactionRef || 'N/A'}
ক্রেতার নাম: ${order.buyerName || 'N/A'}
ক্রেতার ইমেইল: ${order.buyerEmail || 'N/A'}
তারিখ: ${new Date().toLocaleString('bn-BD')}

দয়া করে এডমিন প্যানেলে লগইন করে পেমেন্ট যাচাই এবং অ্যাকাউন্ট হস্তান্তর সম্পন্ন করুন।

ধন্যবাদ,
Alif Trust Escrow System
alifsheenshopping@gmail.com
`;

  return { subject, body };
}

/**
 * Generates General Contact WhatsApp message for customers
 */
export function buildGeneralInquiryWhatsAppMessage(channelTitle?: string): string {
  if (channelTitle) {
    return `আসসালামু আলাইকুম এডমিন, আমি Alif Trust মার্কেটপ্লেসে "${channelTitle}" অ্যাকাউন্টটি সম্পর্কে বিস্তারিত জানতে চাই এবং অর্ডার করতে ইচ্ছুক।`;
  }
  return `আসসালামু আলাইকুম এডমিন, আমি Alif Trust Buy & Sell মার্কেটপ্লেস থেকে আপনার সাথে সরাসরি কথা বলতে চাই।`;
}

/**
 * Generates General Contact Email for customers
 */
export function buildGeneralInquiryEmail(channelTitle?: string): { subject: string; body: string } {
  const subject = channelTitle
    ? `[Alif Trust Inquiry] ${channelTitle} অ্যাকাউন্ট সম্পর্কে অনুসন্ধান`
    : `[Alif Trust Inquiry] সাধারণ অনুসন্ধান ও সাপোর্ট`;

  const body = `আসসালামু আলাইকুম এডমিন,

আমি Alif Trust Buy & Sell ওয়েবসাইট থেকে যোগাযোগ করছি।
${channelTitle ? `আমি "${channelTitle}" অ্যাকাউন্টটির বিষয়ে বিস্তারিত জানতে চাই।` : 'আমি মার্কেটপ্লেস সম্পর্কে কিছু তথ্য জানতে চাই।'}

আমার প্রশ্ন/বার্তা:
(এখানে আপনার বার্তা লিখুন)

আমার যোগাযোগের নম্বর: 
আমার নাম: 

ধন্যবাদ।`;

  return { subject, body };
}

/**
 * Automatically dispatches background Telegram or CallMeBot alerts directly from browser
 */
export async function triggerClientSideAutoNotification(
  payload: {
    title: string;
    details: string;
    orderId?: string;
    amount?: number;
    paymentMethod?: string;
    trxId?: string;
    customerName?: string;
  },
  settings?: WebsiteSettings | null
) {
  try {
    const st = settings || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('channeltrust_settings') || '{}') : null);
    const formattedText = `🔔 *[Alif Trust অটোমেটিক নোটিফিকেশন]* 🔔\n\n📌 *${payload.title}*\n📝 ${payload.details}\n${payload.orderId ? `📋 অর্ডার আইডি: #${payload.orderId}\n` : ''}${payload.amount ? `💰 মূল্য: $${payload.amount} (≈ ৳${(payload.amount * 122).toLocaleString('en-US')})\n` : ''}${payload.paymentMethod ? `🏦 মেথড: ${payload.paymentMethod}\n` : ''}${payload.trxId ? `🔖 TrxID: ${payload.trxId}\n` : ''}${payload.customerName ? `👤 কাস্টমার: ${payload.customerName}\n` : ''}\n⏰ সময়: ${new Date().toLocaleTimeString('bn-BD')}`;

    // 1. Telegram Push Alert (Instant ringtone & push)
    if (st?.telegramBotToken && st?.telegramChatId) {
      const tgUrl = `https://api.telegram.org/bot${st.telegramBotToken}/sendMessage`;
      fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: st.telegramChatId,
          text: formattedText,
          parse_mode: 'Markdown'
        })
      }).catch(() => {});
    }

    // 2. Automated WhatsApp Push (CallMeBot)
    if (st?.callmebotApiKey && st?.whatsappSupport) {
      let phone = st.whatsappSupport.replace(/[^0-9]/g, '');
      if (phone.startsWith('0')) phone = '88' + phone;
      const callMeBotUrl = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(formattedText)}&apikey=${st.callmebotApiKey}`;
      fetch(callMeBotUrl, { mode: 'no-cors' }).catch(() => {});
    }
  } catch (e) {
    // Silent fail
  }
}
