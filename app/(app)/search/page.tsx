"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StationPicker } from "@/components/station-picker";
import { TripCard, TripCardSkeleton } from "@/components/trip-card";
import { ProfileModal } from "@/components/profile-modal";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import type { UserProfile, GenderFilter } from "@/lib/types";

interface SearchResult {
  id: string;
  user_id: string;
  start_station: string;
  end_station: string;
  travel_time: string;
  travel_date: string;
  is_repeating: boolean;
  repeat_days: number[];
  match_quality: string;
  user: UserProfile;
}

export default function SearchPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();

  const today = new Date().toISOString().split("T")[0];

  // Search form
  const [startStation, setStartStation] = useState("");
  const [endStation, setEndStation] = useState("");
  const [travelDate, setTravelDate] = useState(today);
  const [travelTime, setTravelTime] = useState("09:00");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("All");

  // Results
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Connection states
  const [connectionMap, setConnectionMap] = useState<
    Record<string, "none" | "pending" | "connected">
  >({});
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Profile modal
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null
  );

  const handleSearch = async () => {
    if (!startStation || !endStation) {
      toast.error("Please select start and end stations");
      return;
    }
    if (startStation === endStation) {
      toast.error("Start and end stations must be different");
      return;
    }

    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams({
      start_station: startStation,
      end_station: endStation,
      travel_date: travelDate,
      travel_time: travelTime,
      gender_filter: genderFilter,
    });

    const res = await fetch(`/api/search?${params}`);
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Search failed");
      setLoading(false);
      return;
    }

    setResults(data);

    // Fetch connection statuses for all result users
    if (user && data.length > 0) {
      const userIds = data.map((r: SearchResult) => r.user.id);
      const { data: connections } = await supabase
        .from("connections")
        .select("*")
        .or(
          `and(requester_id.eq.${user.id},recipient_id.in.(${userIds.join(",")})),and(recipient_id.eq.${user.id},requester_id.in.(${userIds.join(",")}))`
        );

      const map: Record<string, "none" | "pending" | "connected"> = {};
      for (const uid of userIds) {
        const conn = connections?.find(
          (c) =>
            (c.requester_id === user.id && c.recipient_id === uid) ||
            (c.recipient_id === user.id && c.requester_id === uid)
        );
        if (!conn) {
          map[uid] = "none";
        } else if (conn.status === "accepted") {
          map[uid] = "connected";
        } else if (conn.status === "pending") {
          map[uid] = "pending";
        } else {
          map[uid] = "none";
        }
      }
      setConnectionMap(map);
    }

    setLoading(false);
  };

  const handleConnect = async (recipientId: string) => {
    if (!user) return;

    setConnectingId(recipientId);
    const { error } = await supabase.from("connections").insert({
      requester_id: user.id,
      recipient_id: recipientId,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("Connection request already sent");
      } else {
        toast.error("Failed to send request");
      }
    } else {
      toast.success("Connection request sent!");
      setConnectionMap((prev) => ({ ...prev, [recipientId]: "pending" }));
    }
    setConnectingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">
          Find Companions
        </h1>
        <p className="mt-1 text-sm text-[#666666]">
          Search for travelers on your route
        </p>
      </div>

      {/* Search Form */}
      <div className="rounded-xl bg-white p-4 shadow-sm md:p-6">
        <div className="space-y-4">
          <StationPicker
            label="Start Station"
            value={startStation}
            onChange={setStartStation}
            placeholder="Where are you boarding?"
          />

          <StationPicker
            label="End Station"
            value={endStation}
            onChange={setEndStation}
            placeholder="Where are you going?"
            excludeStation={startStation}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="search-date">Date</Label>
              <Input
                id="search-date"
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                min={today}
                className="bg-[#F1F3F5]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-time">Time</Label>
              <Input
                id="search-time"
                type="time"
                value={travelTime}
                onChange={(e) => setTravelTime(e.target.value)}
                className="bg-[#F1F3F5]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <SlidersHorizontal size={14} />
              Gender Preference
            </Label>
            <Select
              value={genderFilter}
              onValueChange={(val) => setGenderFilter(val as GenderFilter)}
            >
              <SelectTrigger className="bg-[#F1F3F5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Everyone</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="h-11 w-full gap-2 bg-[#0066CC] text-[15px] hover:bg-[#0052A3]"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
            Search
          </Button>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-[#666666]">Finding travelers...</span>
          </div>
          <TripCardSkeleton />
          <TripCardSkeleton />
          <TripCardSkeleton />
        </div>
      )}

      {!loading && searched && results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-medium text-[#1A1A1A]">
              {results.length} traveler{results.length !== 1 ? "s" : ""} found
            </span>
          </div>
          {results.map((result) => (
            <TripCard
              key={result.id}
              user={result.user}
              startStation={result.start_station}
              endStation={result.end_station}
              travelTime={result.travel_time}
              matchQuality={result.match_quality}
              connectionStatus={
                connectionMap[result.user.id] ?? "none"
              }
              connecting={connectingId === result.user.id}
              onConnect={() => handleConnect(result.user.id)}
              onMessage={() =>
                router.push(`/connections?chat=${result.user.id}`)
              }
              onCardClick={() => setSelectedResult(result)}
            />
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="flex flex-col items-center rounded-xl bg-white py-12 shadow-sm">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F3F5]">
            <Search size={28} className="text-[#999999]" />
          </div>
          <h3 className="text-base font-medium text-[#1A1A1A]">
            No travelers found
          </h3>
          <p className="mt-2 max-w-xs text-center text-sm text-[#666666]">
            We couldn&apos;t find anyone on this route. Try:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-[#666666]">
            <li>&bull; Adjusting your time by &plusmn;30 minutes</li>
            <li>&bull; Removing the gender filter</li>
            <li>&bull; Searching a different route</li>
          </ul>
          <Button
            variant="outline"
            className="mt-4 border-[#0066CC] text-[#0066CC]"
            onClick={() => {
              setSearched(false);
              setResults([]);
            }}
          >
            Modify Search
          </Button>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal
        open={!!selectedResult}
        onClose={() => setSelectedResult(null)}
        user={selectedResult?.user ?? null}
        tripDetails={
          selectedResult
            ? {
                startStation: selectedResult.start_station,
                endStation: selectedResult.end_station,
                travelTime: selectedResult.travel_time,
                matchQuality: selectedResult.match_quality,
                isRepeating: selectedResult.is_repeating,
                repeatDays: selectedResult.repeat_days,
              }
            : undefined
        }
        connectionStatus={
          selectedResult
            ? connectionMap[selectedResult.user.id] ?? "none"
            : "none"
        }
        connecting={
          selectedResult
            ? connectingId === selectedResult.user.id
            : false
        }
        onConnect={() =>
          selectedResult && handleConnect(selectedResult.user.id)
        }
        onMessage={() => {
          if (selectedResult) {
            router.push(`/connections?chat=${selectedResult.user.id}`);
          }
        }}
        onReport={() => {
          toast.info("Report feature coming soon");
          setSelectedResult(null);
        }}
        showSocialLinks
      />
    </div>
  );
}
