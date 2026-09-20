import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { translate } from '@/lib/i18n';
import { supabase, type ChatMessage } from '@/lib/supabase';
import { filterProfanity } from '@/lib/types';

interface LiveChatProps {
  lang: Lang;
  venueId: string;
  venueName: string;
}

export default function LiveChat({ lang, venueId, venueName }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState('Guest');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserName(localStorage.getItem('pinner_username') || 'Guest');
  }, []);

  useEffect(() => {
    async function loadMessages() {
      setLoading(true);
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('venue_id', venueId)
        .order('created_at', { ascending: true })
        .limit(50);
      setMessages(data || []);
      setLoading(false);
    }
    loadMessages();

    const channel = supabase
      .channel(`chat-${venueId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `venue_id=eq.${venueId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [venueId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const filtered = filterProfanity(input.trim());
    const name = userName || 'Guest';
    localStorage.setItem('pinner_username', name);

    const { data } = await supabase
      .from('chat_messages')
      .insert({ venue_id: venueId, user_name: name, message: filtered })
      .select()
      .single();

    if (data) {
      setMessages(prev => [...prev, data]);
    }
    setInput('');
  }

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
        <MessageCircle className="w-4 h-4 text-red-500" />
        <h3 className="text-sm font-semibold text-gray-900">{translate(lang, 'liveChat')}</h3>
        <span className="text-xs text-gray-400">· {venueName}</span>
      </div>

      <div ref={scrollRef} className="h-48 overflow-y-auto px-4 py-3 space-y-2 bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin-slow" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-gray-400">{translate(lang, 'noChatMessages')}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-red-500">{msg.user_name}</span>
                <span className="text-[10px] text-gray-300">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-gray-600 ml-2">{msg.message}</p>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-200 bg-white">
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder={translate(lang, 'yourName')}
          className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400"
        />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={translate(lang, 'sendMessage')}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400"
        />
        <button
          onClick={sendMessage}
          className="w-9 h-9 rounded-lg red-btn flex items-center justify-center flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
