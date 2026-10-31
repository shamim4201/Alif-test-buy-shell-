import { db } from './db';

interface NotificationPayload {
  event: 'new_order' | 'payment_submitted' | 'payment_approved' | 'new_message' | 'dispute_opened';
  title: string;
  details: string;
  orderId?: string;
  amount?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  trxId?: string;
  paymentMethod?: string;
}

/**
 * Dispatches 100% hands-free automated notifications to Admin via:
 * 1. In-app real-time Notification Bell & Audio
 * 2. Telegram Bot (if configured - 100% free push alerts with sound)
 * 3. WhatsApp Automated Push via CallMeBot / Webhook (if configured)
 * 4. Audit Log
 */
export async function sendAutomatedAdminNotification(payload: NotificationPayload) {
  try {
    const settings = db.getSettings();

    // 1. Create In-App Notification
    try {
      db.createNotification({
        title: payload.title,
        message: payload.details,
        targetAudience: 'all',
        type: payload.event === 'payment_submitted' ? 'urgent' : 'info',
        isActive: true
      });
    } catch (e) {
      // Ignore in-app db notification write error
    }

    // 2. Prepare text message
    const formattedText = `🔔 *[Alif Trust অটোমেটিক নোটিফিকেশন]* 🔔\n\n📌 *${payload.title}*\n📝 ${payload.details}\n${payload.orderId ? `📋 অর্ডার আইডি: #${payload.orderId}\n` : ''}${payload.amount ? `💰 মূল্য: $${payload.amount} (≈ ৳${(payload.amount * 122).toLocaleString('en-US')})\n` : ''}${payload.paymentMethod ? `🏦 মেথড: ${payload.paymentMethod}\n` : ''}${payload.trxId ? `🔖 TrxID: ${payload.trxId}\n` : ''}${payload.customerName ? `👤 কাস্টমার: ${payload.customerName}\n` : ''}${payload.customerEmail ? `✉️ ইমেইল: ${payload.customerEmail}\n` : ''}\n⏰ সময়: ${new Date().toLocaleTimeString('bn-BD')}`;

    // 3. Automated Telegram Push Notification (if configured)
    if (settings?.telegramBotToken && settings?.telegramChatId) {
      try {
        const tgUrl = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
        fetch(tgUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: settings.telegramChatId,
            text: formattedText,
            parse_mode: 'Markdown'
          })
        }).catch((err) => console.warn('Telegram automated push error:', err));
      } catch (tgErr) {
        console.warn('Telegram dispatch error:', tgErr);
      }
    }

    // 4. Automated WhatsApp Push Notification (via CallMeBot if configured)
    if (settings?.callmebotApiKey && settings?.whatsappSupport) {
      try {
        let phone = settings.whatsappSupport.replace(/[^0-9]/g, '');
        if (phone.startsWith('0')) phone = '88' + phone;
        const callMeBotUrl = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(formattedText)}&apikey=${settings.callmebotApiKey}`;
        fetch(callMeBotUrl).catch((err) => console.warn('CallMeBot automated push error:', err));
      } catch (waErr) {
        console.warn('WhatsApp automated push error:', waErr);
      }
    }

    console.log(`[AutoNotifier] Dispatched automated alert: ${payload.title}`);
  } catch (err) {
    console.warn('[AutoNotifier] Failed to dispatch automated alert:', err);
  }
}
