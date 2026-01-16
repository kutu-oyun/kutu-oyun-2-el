'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { Conversation, Message } from '@/types';

export default function MessagesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await api.messages.conversations() as Conversation[];
        setConversations(data);
        
        // Auto-select conversation if product param exists
        const productId = searchParams.get('product');
        if (productId) {
          const conv = data.find(c => c.product.id === productId);
          if (conv) {
            setSelectedConversation(conv);
          }
        }
      } catch (error) {
        console.error('Fetch conversations error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [user, searchParams]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (conversationId: string) => {
    try {
      const data = await api.messages.messages(conversationId) as { messages: Message[] };
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setIsSending(true);
    try {
      const message = await api.messages.send(selectedConversation.id, newMessage) as Message;
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const getOtherUser = (conv: Conversation) => {
    return conv.buyerId === user?.id ? conv.seller : conv.buyer;
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mesajlar</h1>

      <Card variant="bordered" padding="none" className="h-[600px] flex">
        {/* Conversations List */}
        <div className={`w-full md:w-80 border-r border-[var(--border)] ${selectedConversation ? 'hidden md:block' : ''}`}>
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="font-semibold">Sohbetler</h2>
          </div>
          
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-[var(--border)] rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[var(--border)] rounded w-3/4" />
                    <div className="h-3 bg-[var(--border)] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-[var(--muted)] mb-4" />
              <p className="text-[var(--muted)]">Henüz mesajınız yok</p>
            </div>
          ) : (
            <div className="overflow-y-auto h-[calc(100%-57px)]">
              {conversations.map((conv) => {
                const otherUser = getOtherUser(conv);
                const lastMessage = conv.messages?.[0];
                const unreadCount = conv._count?.messages || 0;
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 flex gap-3 hover:bg-[var(--border)] transition-colors text-left ${
                      selectedConversation?.id === conv.id ? 'bg-[var(--border)]' : ''
                    }`}
                  >
                    {otherUser.photoURL ? (
                      <img
                        src={otherUser.photoURL}
                        alt={otherUser.displayName || ''}
                        className="w-12 h-12 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white font-bold">
                          {otherUser.displayName?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{otherUser.displayName}</p>
                        {unreadCount > 0 && (
                          <span className="w-5 h-5 bg-[var(--primary)] text-white text-xs rounded-full flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--muted)] truncate">
                        {conv.product.title}
                      </p>
                      {lastMessage && (
                        <p className="text-xs text-[var(--muted)] truncate mt-1">
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-[var(--border)] rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {getOtherUser(selectedConversation).photoURL ? (
                  <img
                    src={getOtherUser(selectedConversation).photoURL}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {getOtherUser(selectedConversation).displayName?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {getOtherUser(selectedConversation).displayName}
                  </p>
                  <p className="text-sm text-[var(--muted)] truncate">
                    {selectedConversation.product.title}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isOwn = message.sender.id === user.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-[var(--primary)] text-white rounded-br-md'
                            : 'bg-[var(--border)] rounded-bl-md'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-[var(--muted)]'}`}>
                          {new Date(message.createdAt).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-[var(--border)]">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()} isLoading={isSending}>
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageSquare className="w-16 h-16 mx-auto text-[var(--muted)] mb-4" />
                <p className="text-lg font-medium mb-2">Sohbet Seçin</p>
                <p className="text-[var(--muted)]">
                  Mesajlaşmaya başlamak için sol taraftan bir sohbet seçin.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
