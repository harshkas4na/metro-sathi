"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  UserPlus,
  MessageCircle,
  Clock,
  MapPin,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ImageViewer } from "@/components/image-viewer";
import type { Trip } from "@/lib/types";

interface PersonResult {
  id: string;
  name: string;
  user_id: string | null;
  age: number;
  gender: string;
  profile_pic_url: string | null;
  bio: string | null;
  connection_status: "none" | "pending" | "accepted";
  connection_id: string | null;
}

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

function formatDate(date: string) {
  const d = new Date(date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow";
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function PeoplePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PersonResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [expandedTrips, setExpandedTrips] = useState<Record<string, Trip[]>>({});
  const [loadingTrips, setLoadingTrips] = useState<string | null>(null);
  const [showTrips, setShowTrips] = useState<string | null>(null);

  const searchPeople = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    const res = await fetch(`/api/people?q=${encodeURIComponent(q.trim())}`);
    if (res.ok) {
      const data = await res.json();
      setResults(data);
    } else {
      setResults([]);
    }
    setLoading(false);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      searchPeople(query);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, searchPeople]);

  const handleConnect = async (recipientId: string) => {
    setConnectingId(recipientId);
    const res = await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient_id: recipientId }),
    });

    if (!res.ok) {
      const data = await res.json();
      if (res.status === 409) {
        toast.error("Connection request already exists");
      } else {
        toast.error(data.error || "Failed to send request");
      }
    } else {
      toast.success("Connection request sent!");
      setResults((prev) =>
        prev.map((p) =>
          p.id === recipientId ? { ...p, connection_status: "pending" } : p
        )
      );
    }
    setConnectingId(null);
  };

  const handleViewTrips = async (personId: string) => {
    if (showTrips === personId) {
      setShowTrips(null);
      return;
    }

    if (expandedTrips[personId]) {
      setShowTrips(personId);
      return;
    }

    setLoadingTrips(personId);
    const res = await fetch(`/api/people/${personId}/trips`);
    if (res.ok) {
      const trips = await res.json();
      setExpandedTrips((prev) => ({ ...prev, [personId]: trips }));
      setShowTrips(personId);
    } else {
      toast.error("Could not load trips");
    }
    setLoadingTrips(null);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">
          Find People
        </h1>
        <p className="mt-1 text-sm text-[#666666]">
          Search by name or user ID to connect and see their trips
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or user ID..."
          className="bg-white pl-10"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[#0066CC]" />
        </div>
      )}

      {/* Results */}
      {!loading && searched && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-[#666666]">
            {results.length} person{results.length !== 1 ? "s" : ""} found
          </p>
          {results.map((person) => (
            <div
              key={person.id}
              className="rounded-xl border border-[#E0E0E0] bg-white shadow-sm"
            >
              <div className="flex items-center gap-3 p-4">
                {/* Avatar */}
                {person.profile_pic_url ? (
                  <ImageViewer src={person.profile_pic_url} alt={`${person.name}'s profile picture`}>
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#E0E0E0] ring-2 ring-transparent transition-all hover:ring-[#0066CC]">
                      <img
                        src={person.profile_pic_url}
                        alt={person.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </ImageViewer>
                ) : (
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#E0E0E0]">
                    <div className="flex h-full w-full items-center justify-center bg-[#0066CC] text-sm font-bold text-white">
                      {getInitials(person.name)}
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-[#1A1A1A] truncate">
                    {person.name}
                  </h3>
                  {person.user_id && (
                    <p className="text-[11px] text-[#0066CC] truncate">@{person.user_id}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-[#666666]">
                    {person.age && <span>{person.age}y</span>}
                    {person.gender && (
                      <span
                        className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${person.gender === "Male"
                            ? "bg-[#DBEAFE] text-[#3B82F6]"
                            : person.gender === "Female"
                              ? "bg-[#FCE7F3] text-[#EC4899]"
                              : "bg-[#EDE9FE] text-[#8B5CF6]"
                          }`}
                      >
                        {person.gender}
                      </span>
                    )}
                  </div>
                  {person.bio && (
                    <p className="mt-0.5 text-xs text-[#999999] truncate">
                      {person.bio}
                    </p>
                  )}
                </div>

                {/* Action */}
                <div className="shrink-0">
                  {person.connection_status === "none" && (
                    <Button
                      size="sm"
                      className="gap-1 bg-[#0066CC] hover:bg-[#0052A3]"
                      onClick={() => handleConnect(person.id)}
                      disabled={connectingId === person.id}
                    >
                      {connectingId === person.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <UserPlus size={14} />
                      )}
                      Connect
                    </Button>
                  )}
                  {person.connection_status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="gap-1 border-[#F59E0B] text-[#F59E0B]"
                    >
                      <Clock size={14} />
                      Pending
                    </Button>
                  )}
                  {person.connection_status === "accepted" && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 border-[#0066CC] text-[#0066CC]"
                        onClick={() =>
                          router.push(`/connections?chat=${person.id}`)
                        }
                      >
                        <MessageCircle size={14} />
                        Chat
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* View Trips for connected users */}
              {person.connection_status === "accepted" && (
                <div className="border-t border-[#E0E0E0]">
                  <button
                    onClick={() => handleViewTrips(person.id)}
                    className="flex w-full items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-[#0066CC] hover:bg-[#F8F9FA]"
                  >
                    {loadingTrips === person.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : showTrips === person.id ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )}
                    {showTrips === person.id ? "Hide Trips" : "View Trips"}
                  </button>

                  {showTrips === person.id && expandedTrips[person.id] && (
                    <div className="border-t border-[#E0E0E0] px-4 py-3">
                      {expandedTrips[person.id].length === 0 ? (
                        <p className="text-center text-xs text-[#999999]">
                          No upcoming trips
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {expandedTrips[person.id].map((trip: Trip) => (
                            <div
                              key={trip.id}
                              className="flex items-center gap-2 rounded-lg bg-[#F8F9FA] px-3 py-2 text-xs"
                            >
                              <MapPin
                                size={12}
                                className="shrink-0 text-[#0066CC]"
                              />
                              <span className="truncate text-[#1A1A1A]">
                                {trip.start_station}
                              </span>
                              <ArrowRight
                                size={10}
                                className="shrink-0 text-[#999999]"
                              />
                              <span className="truncate text-[#1A1A1A]">
                                {trip.end_station}
                              </span>
                              <span className="ml-auto shrink-0 text-[#666666]">
                                {formatDate(trip.travel_date)}{" "}
                                {formatTime(trip.travel_time)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && searched && results.length === 0 && (
        <div className="flex flex-col items-center rounded-xl bg-white py-12 shadow-sm">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F3F5]">
            <Search size={28} className="text-[#999999]" />
          </div>
          <h3 className="text-base font-medium text-[#1A1A1A]">
            No one found
          </h3>
          <p className="mt-1 max-w-xs text-center text-sm text-[#666666]">
            Try a different name or check the spelling
          </p>
        </div>
      )}

      {/* Initial State */}
      {!loading && !searched && (
        <div className="flex flex-col items-center rounded-xl bg-white py-12 shadow-sm">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F3F5]">
            <Search size={28} className="text-[#999999]" />
          </div>
          <h3 className="text-base font-medium text-[#1A1A1A]">
            Search for people
          </h3>
          <p className="mt-1 max-w-xs text-center text-sm text-[#666666]">
            Type a name to find friends and travel companions
          </p>
        </div>
      )}
    </div>
  );
}
