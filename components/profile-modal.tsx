"use client";

import { useState } from "react";
import {
  MapPin,
  Clock,
  ArrowRight,
  Instagram,
  Twitter,
  UserPlus,
  MessageCircle,
  Loader2,
  Flag,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReportModal } from "@/components/report-modal";
import type { UserProfile } from "@/lib/types";

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: UserProfile | null;
  tripDetails?: {
    startStation: string;
    endStation: string;
    travelTime: string;
    matchQuality: string;
    isRepeating?: boolean;
    repeatDays?: number[];
  };
  connectionStatus: "none" | "pending" | "connected";
  onConnect?: () => void;
  onMessage?: () => void;
  onReport?: () => void;
  connecting?: boolean;
  showSocialLinks?: boolean;
}

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ProfileModal({
  open,
  onClose,
  user,
  tripDetails,
  connectionStatus,
  onConnect,
  onMessage,
  onReport,
  connecting,
  showSocialLinks = false,
}: ProfileModalProps) {
  const [reportOpen, setReportOpen] = useState(false);

  if (!user) return null;

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

  const handleReport = () => {
    setReportOpen(true);
  };

  const handleReportClose = () => {
    setReportOpen(false);
    onReport?.();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-sm">
          <DialogHeader className="sr-only">
            <DialogTitle>{user.name}&apos;s Profile</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4 pt-2">
            {/* Avatar */}
            <div className="h-24 w-24 overflow-hidden rounded-full bg-[#E0E0E0]">
              {user.profile_pic_url ? (
                <img
                  src={user.profile_pic_url}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#0066CC] text-2xl font-bold text-white">
                  {initials}
                </div>
              )}
            </div>

            {/* Name + Age + Gender */}
            <div className="text-center">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">
                {user.name}
                {user.age && (
                  <span className="ml-1.5 text-base font-normal text-[#666666]">
                    {user.age}
                  </span>
                )}
              </h2>
              {user.gender && (
                <span
                  className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${genderBadgeClass}`}
                >
                  {user.gender}
                </span>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="max-w-xs text-center text-sm text-[#666666]">
                {user.bio}
              </p>
            )}

            {/* Trip Details */}
            {tripDetails && (
              <div className="w-full rounded-lg bg-[#F8F9FA] p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-[#1A1A1A]">
                  <MapPin size={14} className="shrink-0 text-[#0066CC]" />
                  <span className="truncate">{tripDetails.startStation}</span>
                  <ArrowRight size={14} className="shrink-0 text-[#999999]" />
                  <span className="truncate">{tripDetails.endStation}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#666666]">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(tripDetails.travelTime)}
                  </span>
                  <span className="rounded-full bg-[#E6F2FF] px-2 py-0.5 text-[10px] font-medium text-[#0066CC]">
                    {tripDetails.matchQuality}
                  </span>
                </div>
                {tripDetails.isRepeating &&
                  tripDetails.repeatDays &&
                  tripDetails.repeatDays.length > 0 && (
                    <p className="text-xs text-[#666666]">
                      Repeats:{" "}
                      {tripDetails.repeatDays
                        .sort((a, b) => a - b)
                        .map((d) => WEEKDAY_NAMES[d])
                        .join(", ")}
                    </p>
                  )}
              </div>
            )}

            {/* Social Links (only if connected) */}
            {showSocialLinks &&
              connectionStatus === "connected" &&
              (user.instagram_handle || user.twitter_handle) && (
                <div className="flex items-center gap-4">
                  {user.instagram_handle && (
                    <a
                      href={`https://instagram.com/${user.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#E1306C]"
                    >
                      <Instagram size={16} />
                      {user.instagram_handle}
                    </a>
                  )}
                  {user.twitter_handle && (
                    <a
                      href={`https://twitter.com/${user.twitter_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#1DA1F2]"
                    >
                      <Twitter size={16} />
                      {user.twitter_handle}
                    </a>
                  )}
                </div>
              )}

            {/* Action Buttons */}
            <div className="w-full space-y-2 pt-2">
              {connectionStatus === "none" && (
                <Button
                  className="w-full gap-2 bg-[#0066CC] hover:bg-[#0052A3]"
                  onClick={onConnect}
                  disabled={connecting}
                >
                  {connecting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  Connect
                </Button>
              )}
              {connectionStatus === "pending" && (
                <Button className="w-full" variant="outline" disabled>
                  Request Pending
                </Button>
              )}
              {connectionStatus === "connected" && (
                <Button
                  className="w-full gap-2 bg-[#0066CC] hover:bg-[#0052A3]"
                  onClick={onMessage}
                >
                  <MessageCircle size={16} />
                  Message
                </Button>
              )}
            </div>

            {/* Report */}
            <button
              onClick={handleReport}
              className="flex items-center gap-1 text-xs text-[#EF4444] hover:underline"
            >
              <Flag size={12} />
              Report User
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      <ReportModal
        open={reportOpen}
        onClose={handleReportClose}
        reportedUserId={user.id}
        reportedUserName={user.name}
      />
    </>
  );
}
