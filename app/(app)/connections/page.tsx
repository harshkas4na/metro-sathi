"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  UserPlus,
  Check,
  X,
  MessageCircle,
  Loader2,
  Search,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileModal } from "@/components/profile-modal";
import { ChatWindow } from "@/components/chat-window";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import type { ConnectionWithUser, UserProfile } from "@/lib/types";
import Link from "next/link";

export default function ConnectionsPage() {
  return (
    <Suspense>
      <ConnectionsPageContent />
    </Suspense>
  );
}

function ConnectionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [pending, setPending] = useState<ConnectionWithUser[]>([]);
  const [sent, setSent] = useState<ConnectionWithUser[]>([]);
  const [accepted, setAccepted] = useState<ConnectionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  // Profile modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedConnectionStatus, setSelectedConnectionStatus] = useState<
    "none" | "pending" | "connected"
  >("none");

  // Chat
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(
    searchParams.get("chat")
  );

  const fetchConnections = useCallback(async () => {
    const res = await fetch("/api/connections");
    if (!res.ok) {
      toast.error("Failed to load connections");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setPending(data.pending);
    setSent(data.sent);
    setAccepted(data.accepted);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Sync URL chat param
  useEffect(() => {
    const chatParam = searchParams.get("chat");
    if (chatParam) {
      setActiveChatUserId(chatParam);
    }
  }, [searchParams]);

  const handleAccept = async (connectionId: string) => {
    setActionId(connectionId);
    const res = await fetch(`/api/connections/${connectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "accepted" }),
    });

    if (!res.ok) {
      toast.error("Failed to accept request");
    } else {
      toast.success("Connection accepted!");
      const conn = pending.find((c) => c.id === connectionId);
      if (conn) {
        setPending((prev) => prev.filter((c) => c.id !== connectionId));
        setAccepted((prev) => [{ ...conn, status: "accepted" }, ...prev]);
      }
    }
    setActionId(null);
  };

  const handleDecline = async (connectionId: string) => {
    setActionId(connectionId);
    const res = await fetch(`/api/connections/${connectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "declined" }),
    });

    if (!res.ok) {
      toast.error("Failed to decline request");
    } else {
      toast.info("Request declined");
      setPending((prev) => prev.filter((c) => c.id !== connectionId));
    }
    setActionId(null);
  };

  const getOtherUser = (connection: ConnectionWithUser): UserProfile => {
    return connection.requester_id === user?.id
      ? connection.recipient
      : connection.requester;
  };

  const openProfile = (
    profile: UserProfile,
    status: "none" | "pending" | "connected"
  ) => {
    setSelectedUser(profile);
    setSelectedConnectionStatus(status);
  };

  const openChat = (userId: string) => {
    setActiveChatUserId(userId);
    router.replace(`/connections?chat=${userId}`, { scroll: false });
  };

  const closeChat = () => {
    setActiveChatUserId(null);
    router.replace("/connections", { scroll: false });
  };

  // Find the active chat connection and user
  const activeChatConnection = activeChatUserId
    ? accepted.find((c) => {
        const other = getOtherUser(c);
        return other.id === activeChatUserId;
      })
    : null;
  const activeChatUser = activeChatConnection
    ? getOtherUser(activeChatConnection)
    : null;

  const defaultTab =
    activeChatUserId || (pending.length === 0 && accepted.length > 0)
      ? "connections"
      : "requests";

  return (
    <div className="space-y-6">
      {/* Desktop: Split View */}
      <div className="hidden md:block">
        <div className="flex gap-6">
          {/* Left: Connections List */}
          <div className={`${activeChatUser ? "w-80 shrink-0" : "flex-1"}`}>
            <div className="mb-4">
              <h1 className="text-2xl font-semibold text-[#1A1A1A]">
                Connections
              </h1>
              <p className="mt-1 text-sm text-[#666666]">
                Manage your travel connections
              </p>
            </div>

            <ConnectionsTabs
              defaultTab={defaultTab}
              pending={pending}
              sent={sent}
              accepted={accepted}
              loading={loading}
              actionId={actionId}
              activeChatUserId={activeChatUserId}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onOpenProfile={openProfile}
              onOpenChat={openChat}
              getOtherUser={getOtherUser}
              compact={!!activeChatUser}
            />
          </div>

          {/* Right: Chat Panel */}
          {activeChatUser && activeChatConnection && (
            <div className="flex-1 overflow-hidden rounded-xl border border-[#E0E0E0] bg-[#F8F9FA] shadow-sm" style={{ height: "calc(100vh - 140px)" }}>
              <ChatWindow
                connectionId={activeChatConnection.id}
                otherUser={activeChatUser}
                onBack={closeChat}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Full view or Chat overlay */}
      <div className="md:hidden">
        {activeChatUser && activeChatConnection ? (
          <div className="fixed inset-0 z-50 flex flex-col bg-[#F8F9FA]" style={{ height: "100dvh" }}>
            <ChatWindow
              connectionId={activeChatConnection.id}
              otherUser={activeChatUser}
              onBack={closeChat}
            />
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-semibold text-[#1A1A1A]">
                Connections
              </h1>
              <p className="mt-1 text-sm text-[#666666]">
                Manage your travel connections
              </p>
            </div>

            <ConnectionsTabs
              defaultTab={defaultTab}
              pending={pending}
              sent={sent}
              accepted={accepted}
              loading={loading}
              actionId={actionId}
              activeChatUserId={activeChatUserId}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onOpenProfile={openProfile}
              onOpenChat={openChat}
              getOtherUser={getOtherUser}
              compact={false}
            />
          </>
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        connectionStatus={selectedConnectionStatus}
        onMessage={() => {
          if (selectedUser) {
            setSelectedUser(null);
            openChat(selectedUser.id);
          }
        }}
        onReport={() => {
          toast.info("Report feature coming soon");
          setSelectedUser(null);
        }}
        showSocialLinks
      />
    </div>
  );
}

// ==================== Connections Tabs ====================

function ConnectionsTabs({
  defaultTab,
  pending,
  sent,
  accepted,
  loading,
  actionId,
  activeChatUserId,
  onAccept,
  onDecline,
  onOpenProfile,
  onOpenChat,
  getOtherUser,
  compact,
}: {
  defaultTab: string;
  pending: ConnectionWithUser[];
  sent: ConnectionWithUser[];
  accepted: ConnectionWithUser[];
  loading: boolean;
  actionId: string | null;
  activeChatUserId: string | null;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onOpenProfile: (
    profile: UserProfile,
    status: "none" | "pending" | "connected"
  ) => void;
  onOpenChat: (userId: string) => void;
  getOtherUser: (conn: ConnectionWithUser) => UserProfile;
  compact: boolean;
}) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="requests" className="flex-1 gap-1.5">
          Requests
          {pending.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[11px] font-bold text-white">
              {pending.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="connections" className="flex-1 gap-1.5">
          My Connections
          {accepted.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0066CC] px-1 text-[11px] font-bold text-white">
              {accepted.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      {/* ==================== REQUESTS TAB ==================== */}
      <TabsContent value="requests" className="mt-4 space-y-4">
        {loading && <SkeletonList />}

        {!loading && pending.length > 0 && (
          <div className="space-y-3">
            <p className="px-1 text-sm font-medium text-[#1A1A1A]">
              {pending.length} pending request
              {pending.length !== 1 ? "s" : ""}
            </p>
            {pending.map((conn) => {
              const profile = conn.requester;
              return (
                <ConnectionCard
                  key={conn.id}
                  profile={profile}
                  subtitle="wants to connect"
                  timestamp={conn.created_at}
                  onClick={() => onOpenProfile(profile, "pending")}
                  compact={compact}
                  actions={
                    <>
                      <Button
                        size="sm"
                        className="h-8 gap-1.5 bg-[#0066CC] text-xs hover:bg-[#0052A3]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAccept(conn.id);
                        }}
                        disabled={actionId === conn.id}
                      >
                        {actionId === conn.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDecline(conn.id);
                        }}
                        disabled={actionId === conn.id}
                      >
                        <X size={14} />
                        Decline
                      </Button>
                    </>
                  }
                />
              );
            })}
          </div>
        )}

        {!loading && sent.length > 0 && (
          <div className="space-y-3">
            <p className="px-1 text-sm font-medium text-[#666666]">
              Sent requests
            </p>
            {sent.map((conn) => {
              const profile = conn.recipient;
              return (
                <ConnectionCard
                  key={conn.id}
                  profile={profile}
                  subtitle="Request sent"
                  timestamp={conn.created_at}
                  onClick={() => onOpenProfile(profile, "pending")}
                  compact={compact}
                  actions={
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      disabled
                    >
                      <Clock size={14} className="mr-1.5" />
                      Pending
                    </Button>
                  }
                />
              );
            })}
          </div>
        )}

        {!loading && pending.length === 0 && sent.length === 0 && (
          <EmptyState
            icon={<UserPlus size={28} className="text-[#999999]" />}
            title="No pending requests"
            description="Connection requests will appear here"
          />
        )}
      </TabsContent>

      {/* ==================== MY CONNECTIONS TAB ==================== */}
      <TabsContent value="connections" className="mt-4 space-y-3">
        {loading && <SkeletonList />}

        {!loading && accepted.length > 0 && (
          <>
            <p className="px-1 text-sm font-medium text-[#1A1A1A]">
              {accepted.length} connection{accepted.length !== 1 ? "s" : ""}
            </p>
            {accepted.map((conn) => {
              const profile = getOtherUser(conn);
              const isActiveChat = activeChatUserId === profile.id;
              return (
                <ConnectionCard
                  key={conn.id}
                  profile={profile}
                  subtitle="Connected"
                  timestamp={conn.updated_at}
                  onClick={() => onOpenProfile(profile, "connected")}
                  compact={compact}
                  highlighted={isActiveChat}
                  actions={
                    <Button
                      size="sm"
                      className="h-8 gap-1.5 bg-[#0066CC] text-xs hover:bg-[#0052A3]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChat(profile.id);
                      }}
                    >
                      <MessageCircle size={14} />
                      Message
                    </Button>
                  }
                />
              );
            })}
          </>
        )}

        {!loading && accepted.length === 0 && (
          <EmptyState
            icon={<Users size={28} className="text-[#999999]" />}
            title="No connections yet"
            description="Search for companions to get started"
          />
        )}
      </TabsContent>
    </Tabs>
  );
}

// ==================== Sub-Components ====================

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-[#E0E0E0] bg-white p-4"
        >
          <div className="flex gap-3">
            <div className="h-12 w-12 shrink-0 rounded-full bg-[#E0E0E0]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-[#E0E0E0]" />
              <div className="h-3 w-1/2 rounded bg-[#E0E0E0]" />
              <div className="h-8 w-40 rounded bg-[#E0E0E0]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-white py-16 shadow-sm">
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F3F5]">
        {icon}
      </div>
      <h3 className="text-base font-medium text-[#1A1A1A]">{title}</h3>
      <p className="mt-1 text-sm text-[#666666]">{description}</p>
      <Link href="/search" className="mt-4">
        <Button className="gap-2 bg-[#0066CC] hover:bg-[#0052A3]">
          <Search size={16} />
          Find Companions
        </Button>
      </Link>
    </div>
  );
}

function ConnectionCard({
  profile,
  subtitle,
  timestamp,
  onClick,
  actions,
  compact = false,
  highlighted = false,
}: {
  profile: UserProfile;
  subtitle: string;
  timestamp: string;
  onClick: () => void;
  actions: React.ReactNode;
  compact?: boolean;
  highlighted?: boolean;
}) {
  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const genderBadgeClass =
    profile.gender === "Male"
      ? "bg-[#DBEAFE] text-[#3B82F6]"
      : profile.gender === "Female"
        ? "bg-[#FCE7F3] text-[#EC4899]"
        : "bg-[#EDE9FE] text-[#8B5CF6]";

  const timeAgo = getTimeAgo(timestamp);

  return (
    <div
      className={`cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-all hover:border-[#0066CC] hover:shadow-md ${
        highlighted
          ? "border-[#0066CC] bg-[#F0F7FF]"
          : "border-[#E0E0E0]"
      }`}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <div className="shrink-0">
          <div className={`overflow-hidden rounded-full bg-[#E0E0E0] ${compact ? "h-10 w-10" : "h-12 w-12"}`}>
            {profile.profile_pic_url ? (
              <img
                src={profile.profile_pic_url}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#0066CC] text-sm font-bold text-white">
                {initials}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-[#1A1A1A]">
              {profile.name}
            </span>
            {!compact && profile.age && (
              <span className="shrink-0 text-xs text-[#666666]">
                {profile.age}
              </span>
            )}
            {!compact && profile.gender && (
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${genderBadgeClass}`}
              >
                {profile.gender}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#666666]">
            <span>{subtitle}</span>
            <span>&middot;</span>
            <span>{timeAgo}</span>
          </div>

          {!compact && (
            <div className="flex items-center gap-2 pt-1">{actions}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
