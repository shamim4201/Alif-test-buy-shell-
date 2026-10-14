import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../services/api';
import { Message } from '../types';
import { X, Send, ShieldCheck, AlertTriangle, MessageSquare } from 'lucide-react';

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  channelId?: string;
  channelTitle?: string;
  counterpartName?: string;
  recipientId?: string;
}

export const MessagingModal: React.FC<MessagingModalProps> = ({
  isOpen,
  onClose,
  orderId,
  channelId,
  channelTitle,
  counterpartName,
  recipientId
}) => {
  const { user } = useAuth();
  const { t } = useCurrency();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [warningAlert, setWarningAlert] = useState<string | null>(null);

  const loadMessages = async () => {
    if (!isOpen) return;
    try {
      setLoading(true);
      const res = await api.getMessages({ orderId, channelId });
      setMessages(res.messages);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [isOpen, orderId, channelId]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Check for password warning client-side as well
    if (inputText.toLowerCase().includes('password') || inputText.includes('পাসওয়ার্ড')) {
      setWarningAlert(t(
        'নিরাপত্তা সতর্কতা: কখনো গুগল/ফেসবুক পাসওয়ার্ড শেয়ার করবেন না। হস্তান্তর শুধুমাত্র অফিসিয়াল ইনভাইটের মাধ্যমে সম্পন্ন হয়।',
        'Security Reminder: Never exchange passwords. Transfers are executed via official platform invitations only.'
      ));
    } else {
      setWarningAlert(null);
    }

    try {
      setSending(true);
      const res = await api.sendMessage({
        orderId,
        channelId,
        recipientId,
        text: inputText
      });
      setInputText('');
      setMessages((prev) => [...prev, res.message]);
      if (res.flaggedWarning) {
        setWarningAlert(t(
          'মেসেজ পাঠানো হয়েছে, তবে নিরাপত্তা নির্দেশিকা অনুসরণের জন্য সতর্কবার্তা রেকর্ড করা হয়েছে।',
          'Message sent, but triggered a security advisory regarding credentials.'
        ));
      }
    } catch (err: any) {
      alert(err.message || t('মেসেজ পাঠাতে ব্যর্থ হয়েছে', 'Failed to send message'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px] text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{channelTitle || t('অ্যাকাউন্ট যোগাযোগ', 'Channel Communication')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {t('কথোপকথন: ', 'Chatting with ')}{counterpartName || t('পক্ষ', 'Counterparty')} • {t('নিরাপদ এস্ক্রো চ্যাট', 'Safe Escrow Chat')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Alert Bar */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs text-amber-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t('সতর্কতা: চ্যাট অডিট হয়। পাসওয়ার্ড বা অফ-প্ল্যাটফর্ম পেমেন্ট তথ্য আদান-প্রদান নিষিদ্ধ।', 'Notice: Chat is audited. Do not share account passwords or off-platform payment info.')}</span>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
          {loading && messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">{t('কথোপকথন লোড হচ্ছে...', 'Loading conversation history...')}</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              {t('এখনো কোনো মেসেজ নেই। যোগাযোগ শুরু করতে মেসেজ পাঠান।', 'No messages yet. Send a message to initiate communication.')}
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === user?.id;
              const isSystem = m.senderId === 'system';

              if (isSystem) {
                return (
                  <div key={m.id} className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-red-600 font-bold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {m.senderName}
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                    <span className="text-[10px] text-slate-400 block text-right">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[10px] text-slate-500 mb-0.5 px-1">
                    {isMe ? t('আপনি', 'You') : m.senderName} ({m.senderRole === 'buyer' ? t('ক্রেতা', 'Buyer') : m.senderRole === 'seller' ? t('বিক্রেতা', 'Seller') : t('অ্যাডমিন', 'Admin')})
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                      isMe
                        ? 'bg-red-600 text-white rounded-tr-none shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    <span
                      className={`text-[9px] mt-1 block text-right ${
                        isMe ? 'text-red-100' : 'text-slate-400'
                      }`}
                    >
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Warning Alert if triggered */}
        {warningAlert && (
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{warningAlert}</span>
          </div>
        )}

        {/* Input box */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('নিরাপদ মেসেজ লিখুন (পাসওয়ার্ড ছাড়া)...', 'Type a safe message (no passwords)...')}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-red-500 transition"
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {t('পাঠান', 'Send')}
          </button>
        </form>
      </div>
    </div>
  );
};
