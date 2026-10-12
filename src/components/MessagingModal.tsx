import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Message } from '../types';
import { X, Send, ShieldCheck, AlertTriangle, MessageSquare, CheckCheck } from 'lucide-react';

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
    if (inputText.toLowerCase().includes('password')) {
      setWarningAlert('Security Reminder: Never exchange Google passwords. Transfers are executed via Google Brand Account Manager invites only.');
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
        setWarningAlert('Message sent, but triggered a security advisory regarding credentials.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px] text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{channelTitle || 'Channel Communication'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Chatting with {counterpartName || 'Counterparty'} • Safe ChannelVault
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Alert Bar */}
        <div className="bg-amber-950/30 border-b border-amber-900/40 px-4 py-2 flex items-center gap-2 text-xs text-amber-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Notice: Chat is audited. Do not share Google account passwords or off-platform payment info.</span>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/50">
          {loading && messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">Loading conversation history...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No messages yet. Send a message to initiate communication.
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === user?.id;
              const isSystem = m.senderId === 'system';

              if (isSystem) {
                return (
                  <div key={m.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5 text-red-400 font-bold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {m.senderName}
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                    <span className="text-[10px] text-slate-500 block text-right">
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
                  <div className="text-[10px] text-slate-400 mb-0.5 px-1">
                    {isMe ? 'You' : m.senderName} ({m.senderRole})
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                      isMe
                        ? 'bg-red-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    <span
                      className={`text-[9px] mt-1 block text-right ${
                        isMe ? 'text-red-200' : 'text-slate-400'
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
          <div className="px-4 py-2 bg-amber-950/70 border-t border-amber-800/80 text-amber-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{warningAlert}</span>
          </div>
        )}

        {/* Input box */}
        <form onSubmit={handleSend} className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a safe message (no passwords)..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 transition"
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
