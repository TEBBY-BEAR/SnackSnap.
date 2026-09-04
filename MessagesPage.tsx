import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Send, Search, Plus, Smile, Check, CheckCheck, MoreHorizontal } from 'lucide-react';
import type { ConversationWithProfile, MessageWithSender, SnackWithProfile } from '@/lib/types';
import { getConversations, getMessages, sendMessage, toggleMessageReaction, markMessageRead } from '@/lib/api';
import { demoSnacks } from '@/lib/demoData';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';

interface MessagesPageProps {
  preselectedUserId?: string | null;
  onClearPreselected?: () => void;
  sharedSnack?: SnackWithProfile | null;
  onClearSharedSnack?: () => void;
  onOpenUserProfile?: (userId: string) => void;
}

export function MessagesPage({
  preselectedUserId, onClearPreselected,
  sharedSnack, onClearSharedSnack, onOpenUserProfile,
}: MessagesPageProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationWithProfile | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typing, setTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactionTarget, setReactionTarget] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    getConversations(user.id).then((data) => {
      setConversations(data);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (preselectedUserId && conversations.length > 0) {
      const existing = conversations.find((c) => c.other_user?.id === preselectedUserId);
      if (existing) {
        openConversation(existing);
      } else {
        const demoUser = conversations.find((c) => c.other_user?.id === preselectedUserId);
        if (demoUser) openConversation(demoUser);
      }
      onClearPreselected?.();
    }
  }, [preselectedUserId, conversations]);

  useEffect(() => {
    if (sharedSnack && activeConversation) {
      handleSend(null, sharedSnack.id);
      onClearSharedSnack?.();
    }
  }, [sharedSnack, activeConversation]);

  function openConversation(conv: ConversationWithProfile) {
    setActiveConversation(conv);
    getMessages(conv.id).then((data) => {
      setMessages(data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
  }

  async function handleSend(textContent: string | null, sharedSnackId?: string | null) {
    if (!user || !activeConversation) return;
    if (!textContent && !sharedSnackId) return;

    const newMessage: MessageWithSender = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversation.id,
      sender_id: user.id,
      text: textContent,
      shared_snack_id: sharedSnackId ?? null,
      is_read: false,
      created_at: new Date().toISOString(),
      sender: null,
      reactions: [],
    };
    setMessages((prev) => [...prev, newMessage]);
    setText('');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    await sendMessage(activeConversation.id, user.id, textContent, sharedSnackId);

    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const replies = ['fr fr!', 'no way that looks so good', 'okay I need that', 'snack of the year ngl', 'the packaging is unreal', 'where do you get these', 'obsessed with your snack game'];
      const reply: MessageWithSender = {
        id: `reply-${Date.now()}`,
        conversation_id: activeConversation.id,
        sender_id: activeConversation.other_user?.id ?? '',
        text: replies[Math.floor(Math.random() * replies.length)],
        shared_snack_id: null,
        is_read: false,
        created_at: new Date().toISOString(),
        sender: {
          id: activeConversation.other_user?.id ?? '',
          username: activeConversation.other_user?.username ?? '',
          display_name: activeConversation.other_user?.display_name ?? '',
          avatar_url: activeConversation.other_user?.avatar_url ?? null,
        },
        reactions: [],
      };
      setMessages((prev) => [...prev, reply]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 2000);
  }

  async function handleReaction(messageId: string, emoji: string) {
    if (!user) return;
    setMessages((prev) => prev.map((m) => {
      if (m.id === messageId) {
        const existing = m.reactions?.find((r) => r.user_id === user.id && r.emoji === emoji);
        if (existing) {
          return { ...m, reactions: m.reactions?.filter((r) => !(r.user_id === user.id && r.emoji === emoji)) };
        }
        return { ...m, reactions: [...(m.reactions ?? []), { emoji, user_id: user.id }] };
      }
      return m;
    }));
    setReactionTarget(null);
    await toggleMessageReaction(messageId, user.id, emoji);
  }

  const filteredConversations = conversations.filter((c) =>
    c.other_user?.username.toLowerCase().includes(search.toLowerCase()) ||
    c.other_user?.display_name.toLowerCase().includes(search.toLowerCase())
  );

  const emojis = ['🔥', '😍', '😂', '😋', '👀', '💯', '🤝', '❤️'];

  if (activeConversation) {
    return (
      <div className="fixed inset-0 z-[80] bg-[#0a0a0f] flex flex-col">
        {/* Chat header */}
        <div className="glass border-b border-white/5 px-4 py-3 flex items-center gap-3 safe-bottom">
          <button onClick={() => setActiveConversation(null)} className="tap-scale">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <button
            onClick={() => activeConversation.other_user && onOpenUserProfile?.(activeConversation.other_user.id)}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <div className="relative">
              <img
                src={activeConversation.other_user?.avatar_url ?? 'https://images.pexels.com/photos/8941776/pexels-photo-8941776.jpeg?auto=compress&cs=tinysrgb&h=100&w=100'}
                alt={activeConversation.other_user?.display_name ?? 'User'}
                className="w-10 h-10 rounded-full object-cover"
              />
              {(activeConversation as any).other_user?.is_online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#c6ff00] border-2 border-[#0a0a0f]" />
              )}
            </div>
            <div className="text-left min-w-0">
              <p className="font-semibold text-sm truncate">{activeConversation.other_user?.display_name ?? 'User'}</p>
              <p className="text-xs text-white/40">
                {(activeConversation as any).other_user?.is_online ? 'Active now' : `@${activeConversation.other_user?.username ?? 'user'}`}
              </p>
            </div>
          </button>
          <button className="text-white/40 hover:text-white/70 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-2">
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id || (!msg.sender && msg.sender_id === user?.id);
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                <div className="max-w-[75%] group">
                  {msg.shared_snack_id && (
                    <div className="rounded-2xl glass-card overflow-hidden mb-1">
                      <SharedSnackPreview snackId={msg.shared_snack_id} />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 relative ${isMe ? 'gradient-animated text-white' : 'glass text-white'}`}
                    onDoubleClick={() => setReactionTarget(reactionTarget === msg.id ? null : msg.id)}
                  >
                    {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`text-[10px] ${isMe ? 'text-white/60' : 'text-white/30'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      {isMe && (
                        msg.is_read
                          ? <CheckCheck className="w-3 h-3 text-[#00f0ff]" />
                          : <Check className="w-3 h-3 text-white/40" />
                      )}
                    </div>
                    {reactionTarget === msg.id && (
                      <div className="absolute -top-10 left-0 right-0 flex justify-center gap-1 glass rounded-full px-2 py-1 animate-bounce-in z-10">
                        {emojis.map((e) => (
                          <button
                            key={e}
                            onClick={() => handleReaction(msg.id, e)}
                            className="text-lg tap-scale hover:scale-125 transition-transform"
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {msg.reactions.map((r, i) => (
                        <span key={i} className="text-sm glass rounded-full px-1.5 py-0.5">{r.emoji}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {typing && (
            <div className="flex justify-start animate-slide-up">
              <div className="glass rounded-2xl px-4 py-3 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse delay-200" />
                <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse delay-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="glass border-t border-white/5 p-3 safe-bottom">
          {showEmojiPicker && (
            <div className="flex gap-2 mb-2 px-2 animate-slide-up">
              {emojis.map((e) => (
                <button key={e} onClick={() => { setText(text + e); setShowEmojiPicker(false); }} className="text-2xl tap-scale hover:scale-125 transition-transform">
                  {e}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-white/50 hover:text-white transition-colors tap-scale">
              <Smile className="w-5 h-5" />
            </button>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(text)}
              placeholder="Message..."
              className="flex-1 px-4 py-2.5 rounded-full glass border border-white/10 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#ff2d92]/50 transition-colors"
            />
            <button
              onClick={() => handleSend(text)}
              disabled={!text.trim()}
              className="w-10 h-10 rounded-full gradient-animated flex items-center justify-center tap-scale disabled:opacity-40"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Conversation list
  return (
    <div className="pb-32 min-h-screen">
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-5 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-extrabold text-xl">Messages</h1>
          <button className="w-9 h-9 rounded-full gradient-animated flex items-center justify-center tap-scale">
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-white/10">
          <Search className="w-4 h-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
          />
        </div>
      </div>

      <div className="px-3 py-2 space-y-1">
        {loading ? (
          <div className="space-y-2 px-2 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-full skeleton" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-24 rounded skeleton" />
                  <div className="h-3 w-48 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40 text-sm">No conversations found</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => openConversation(conv)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors tap-scale text-left"
            >
              <div className="relative shrink-0">
                <img
                  src={conv.other_user?.avatar_url ?? 'https://images.pexels.com/photos/8941776/pexels-photo-8941776.jpeg?auto=compress&cs=tinysrgb&h=100&w=100'}
                  alt={conv.other_user?.display_name ?? 'User'}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {(conv as any).other_user?.is_online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#c6ff00] border-2 border-[#0a0a0f]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm truncate">{conv.other_user?.display_name ?? 'User'}</p>
                  <span className="text-[10px] text-white/30 shrink-0 ml-2">
                    {conv.last_message ? getTimeAgo(conv.last_message.created_at) : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-white/40 truncate flex-1">
                    {conv.last_message?.shared_snack_id ? 'Shared a snack' : conv.last_message?.text ?? 'Say hi!'}
                  </p>
                  {conv.unread_count && conv.unread_count > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#ff2d92] text-white text-[10px] font-bold shrink-0">
                      {conv.unread_count}
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function SharedSnackPreview({ snackId }: { snackId: string }) {
  const snack = demoSnacks.find((s) => s.id === snackId);
  if (!snack) return null;
  return (
    <div>
      <img src={snack.image_url} alt={snack.snack_name ?? 'Snack'} className="w-full h-32 object-cover" />
      <div className="p-2">
        <p className="text-xs font-semibold truncate">{snack.snack_name ?? 'Snack'}</p>
        <p className="text-[10px] text-white/40 truncate">{snack.brand} - {snack.flavor}</p>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
