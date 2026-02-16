"use client";

import { MapPin, Clock, ArrowRight, UserPlus, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/types";

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

interface TripCardProps {
  user: UserProfile;
  startStation: string;
  endStation: string;
  travelTime: string;
  matchQuality: string;
  connectionStatus: "none" | "pending" | "connected";
  onConnect?: () => void;
  onMessage?: () => void;
  onCardClick?: () => void;
  connecting?: boolean;
}

export function TripCard({
  user,
  startStation,
  endStation,
  travelTime,
  matchQuality,
  connectionStatus,
  onConnect,
  onMessage,
  onCardClick,
  connecting,
}: TripCardProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const genderBadgeClass =
    user.gender === "Male"
      ? "bg-[#DBEAFE] text-[#3B82F6]"
      : user.gender === "Female"
        ? "bg-[#FCE7F3] text-[#EC4899]"
        : "bg-[#EDE9FE] text-[#8B5CF6]";

  return (
    <div
      className="cursor-pointer rounded-xl border border-[#E0E0E0] bg-white p-4 shadow-sm transition-all hover:border-[#0066CC] hover:shadow-md"
      onClick={onCardClick}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-[#E0E0E0]">
            {user.profile_pic_url ? (
              <img
                src={user.profile_pic_url}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#0066CC] text-sm font-bold text-white">
                {initials}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Name + Age + Gender */}
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-[#1A1A1A]">
              {user.name}
            </span>
            {user.age && (
              <span className="shrink-0 text-xs text-[#666666]">
                {user.age}
              </span>
            )}
            {user.gender && (
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${genderBadgeClass}`}
              >
                {user.gender}
              </span>
            )}
          </div>

          {/* Route */}
          <div className="flex items-center gap-1.5 text-xs text-[#666666]">
            <MapPin size={12} className="shrink-0 text-[#0066CC]" />
            <span className="truncate">{startStation}</span>
            <ArrowRight size={10} className="shrink-0 text-[#999999]" />
            <span className="truncate">{endStation}</span>
          </div>

          {/* Time + Match */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-[#666666]">
              <Clock size={12} />
              {formatTime(travelTime)}
            </span>
            <span className="rounded-full bg-[#E6F2FF] px-2 py-0.5 text-[10px] font-medium text-[#0066CC]">
              {matchQuality}
            </span>
          </div>

          {/* Action Button */}
          <div className="pt-1">
            {connectionStatus === "none" && (
              <Button
                size="sm"
                className="h-8 gap-1.5 bg-[#0066CC] text-xs hover:bg-[#0052A3]"
                onClick={(e) => {
                  e.stopPropagation();
                  onConnect?.();
                }}
                disabled={connecting}
              >
                {connecting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UserPlus size={14} />
                )}
                Connect
              </Button>
            )}
            {connectionStatus === "pending" && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                disabled
              >
                Pending
              </Button>
            )}
            {connectionStatus === "connected" && (
              <Button
                size="sm"
                className="h-8 gap-1.5 bg-[#0066CC] text-xs hover:bg-[#0052A3]"
                onClick={(e) => {
                  e.stopPropagation();
                  onMessage?.();
                }}
              >
                <MessageCircle size={14} />
                Message
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TripCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-[#E0E0E0] bg-white p-4">
      <div className="flex gap-3">
        <div className="h-12 w-12 shrink-0 rounded-full bg-[#E0E0E0]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-[#E0E0E0]" />
          <div className="h-3 w-1/2 rounded bg-[#E0E0E0]" />
          <div className="h-3 w-1/3 rounded bg-[#E0E0E0]" />
          <div className="h-8 w-24 rounded bg-[#E0E0E0]" />
        </div>
      </div>
    </div>
  );
}
