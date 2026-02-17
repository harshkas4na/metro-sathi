"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Send, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import type { Message, UserProfile } from "@/lib/types";

interface ChatWindowProps {
  connectionId: string;
  otherUser: UserProfile;
  onBack: () => void;
  isConnected?: boolean;
  onSendConnectionRequest?: () => void;
  sendingConnectionRequest?: boolean;
}

export function ChatWindow({
  connectionId,
  otherUser,
  onBack,
  isConnected = true,
  onSendConnectionRequest,
  sendingConnectionRequest,
}: ChatWindowProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    // Use setTimeout to ensure DOM has updated before scrolling
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Track visual viewport height for mobile keyboard handling
  // Set on documentElement so the parent .chat-fullscreen class can read it
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      // Set CSS variable on :root so .chat-fullscreen parent can use it
      document.documentElement.style.setProperty(
        "--visual-viewport-height",
        `${viewport.height}px`
      );
      // Scroll to bottom when keyboard opens (viewport shrinks)
      scrollToBottom();
    };

    // Set initial value
    handleResize();

    viewport.addEventListener("resize", handleResize);
    viewport.addEventListener("scroll", handleResize);

    return () => {
      viewport.removeEventListener("resize", handleResize);
      viewport.removeEventListener("scroll", handleResize);
      // Clean up the CSS variable
      document.documentElement.style.removeProperty("--visual-viewport-height");
    };
  }, [scrollToBottom]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/messages?connection_id=${connectionId}`);
    if (res.ok) {
      const data = await res.json() as Message[];
      setMessages((prev) => {
        // Merge by ID: keep optimistic messages, add new ones
        const merged = new Map<string, Message>();
        for (const m of prev) merged.set(m.id, m);
        for (const m of data) merged.set(m.id, m);
        return Array.from(merged.values()).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
    } else if (loading) {
      toast.error("Failed to load messages");
    }
    setLoading(false);
  }, [connectionId, loading]);

  // Initial fetch (skip if not connected)
  useEffect(() => {
    if (isConnected) fetchMessages();
    else setLoading(false);
  }, [connectionId, isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling fallback for real-time messages (every 3s, skip if not connected)
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages, isConnected]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Subscribe to realtime messages (skip if not connected)
  useEffect(() => {
    if (!isConnected) return;
    const channel = supabase
      .channel(`messages:${connectionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates (from optimistic insert)
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [connectionId, supabase, isConnected]);

  const handleSend = async () => {
    if (!input.trim() || sending || !user) return;

    const content = input.trim();
    setInput("");
    setSending(true);

    // Optimistic message
    const optimisticMsg: Message = {
      id: `optimistic-${Date.now()}`,
      connection_id: connectionId,
      sender_id: user.id,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connection_id: connectionId, content }),
    });

    if (!res.ok) {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      toast.error("Failed to send message");
    } else {
      const data = await res.json();
      // Replace optimistic with real message
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? data : m))
      );
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const initials = otherUser.name
    ? otherUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "?";

  // Group messages by date
  const groupedMessages = groupByDate(messages);

  return (
    <div className="flex h-full flex-col">
      {/* Header - sticky so it stays visible when keyboard opens */}
      <div className="sticky top-0 z-10 flex shrink-0 items-center gap-3 border-b bg-white px-4 py-3">
        <button
          onClick={onBack}
          className="shrink-0 rounded-lg p-1 text-[#666666] hover:bg-[#F1F3F5] md:hidden"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#E0E0E0]">
          {otherUser.profile_pic_url ? (
            <img
              src={otherUser.profile_pic_url}
              alt={otherUser.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#0066CC] text-xs font-bold text-white">
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#1A1A1A]">
            {otherUser.name}
          </p>
          {otherUser.bio && (
            <p className="truncate text-xs text-[#666666]">{otherUser.bio}</p>
          )}
        </div>
      </div>

      {/* Not connected state */}
      {!isConnected && (
        <>
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF3C7]">
              <UserPlus size={24} className="text-[#D97706]" />
            </div>
            <p className="text-sm font-medium text-[#1A1A1A]">
              Not connected
            </p>
            <p className="mt-1 text-xs text-[#666666]">
              Send a connection request to start chatting with{" "}
              {otherUser.name.split(" ")[0]}
            </p>
          </div>
          <div className="border-t bg-[#FFFBEB] px-4 py-3 pb-safe">
            <Button
              className="w-full gap-2 bg-[#D97706] text-sm hover:bg-[#B45309]"
              onClick={onSendConnectionRequest}
              disabled={sendingConnectionRequest}
            >
              {sendingConnectionRequest ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              Send Connection Request
            </Button>
          </div>
        </>
      )}

      {/* Messages */}
      {isConnected && <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[#0066CC]" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#E6F2FF]">
              <Send size={24} className="text-[#0066CC]" />
            </div>
            <p className="text-sm font-medium text-[#1A1A1A]">
              Start the conversation
            </p>
            <p className="mt-1 text-xs text-[#666666]">
              Say hello to {otherUser.name.split(" ")[0]}!
            </p>
          </div>
        )}

        {!loading &&
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#E0E0E0]" />
                <span className="text-[11px] font-medium text-[#999999]">
                  {formatDateSeparator(group.date)}
                </span>
                <div className="h-px flex-1 bg-[#E0E0E0]" />
              </div>

              {/* Messages */}
              {group.messages.map((msg, idx) => {
                const isMine = msg.sender_id === user?.id;
                const showAvatar =
                  !isMine &&
                  (idx === 0 ||
                    group.messages[idx - 1].sender_id !== msg.sender_id);

                return (
                  <div
                    key={msg.id}
                    className={`mb-1.5 flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    {/* Other user avatar */}
                    {!isMine && (
                      <div className="mr-2 w-7 shrink-0">
                        {showAvatar && (
                          <div className="h-7 w-7 overflow-hidden rounded-full bg-[#E0E0E0]">
                            {otherUser.profile_pic_url ? (
                              <img
                                src={otherUser.profile_pic_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-[#0066CC] text-[10px] font-bold text-white">
                                {initials}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${isMine
                        ? "rounded-br-md bg-[#0066CC] text-white"
                        : "rounded-bl-md bg-white text-[#1A1A1A] shadow-sm"
                        }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {msg.content}
                      </p>
                      <p
                        className={`mt-0.5 text-right text-[10px] ${isMine ? "text-white/60" : "text-[#999999]"
                          }`}
                      >
                        {formatMessageTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

        <div ref={messagesEndRef} />
      </div>}

      {/* Input - shrink-0 ensures it stays visible */}
      {isConnected && <div className="shrink-0 border-t bg-white px-4 py-3 pb-safe">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            maxLength={500}
            className="flex-1 resize-none rounded-xl border border-[#E0E0E0] bg-[#F8F9FA] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#999999] focus:border-[#0066CC] focus:outline-none scrollbar-hide"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          <Button
            size="sm"
            aria-label="Send message"
            className="h-10 w-10 shrink-0 rounded-xl bg-[#0066CC] p-0 hover:bg-[#0052A3]"
            onClick={handleSend}
            disabled={!input.trim() || sending}
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </div>
      </div>}
    </div>
  );
}

// ==================== Helpers ====================

interface MessageGroup {
  date: string;
  messages: Message[];
}

function groupByDate(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  let currentDate = "";

  for (const msg of messages) {
    const date = new Date(msg.created_at).toLocaleDateString("en-CA"); // YYYY-MM-DD
    if (date !== currentDate) {
      currentDate = date;
      groups.push({ date, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }

  return groups;
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year:
      date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
