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
    <div className="bg-[#1a1a1a] rounded-2xl border border-[#3A3A3A] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#3A3A3A]">
        <MessageCircle className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white">{translate(lang, 'liveChat')}</h3>
        <span className="text-xs text-gray-500">· {venueName}</span>
      </div>

      <div ref={scrollRef} className="h-48 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin-slow" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-gray-500">{translate(lang, 'noChatMessages')}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-amber-400">{msg.user_name}</span>
                <span className="text-[10px] text-gray-600">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-gray-300 ml-2">{msg.message}</p>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 px-3 py-3 border-t border-[#3A3A3A]">
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder={translate(lang, 'yourName')}
          className="w-20 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-2 py-2 text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
        />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={translate(lang, 'sendMessage')}
          className="flex-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
        />
        <button
          onClick={sendMessage}
          className="w-9 h-9 rounded-lg gold-btn flex items-center justify-center flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
