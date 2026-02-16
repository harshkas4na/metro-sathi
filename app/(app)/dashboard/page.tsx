"use client";

import { useState, useEffect } from "react";
import {
  CalendarPlus,
  Search,
  MessageCircle,
  ArrowRight,
  MapPin,
  Clock,
  Users,
  UserPlus,
  TrainFront,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

interface DashboardTrip {
  id: string;
  start_station: string;
  end_station: string;
  travel_date: string;
  travel_time: string;
  is_repeating: boolean;
}

interface DashboardStats {
  tripCount: number;
  connectionCount: number;
  pendingCount: number;
}

const howItWorks = [
  {
    icon: CalendarPlus,
    title: "Add your trip",
    description: "Post your metro route and travel time",
  },
  {
    icon: Search,
    title: "Find companions",
    description: "Search for travelers on similar routes",
  },
  {
    icon: MessageCircle,
    title: "Connect & chat",
    description: "Send requests and chat in-app",
  },
];

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [trips, setTrips] = useState<DashboardTrip[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    tripCount: 0,
    connectionCount: 0,
    pendingCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch trips and connections in parallel
      const [tripsRes, connRes] = await Promise.all([
        fetch("/api/trips"),
        fetch("/api/connections"),
      ]);

      if (tripsRes.ok) {
        const tripsData = await tripsRes.json();
        setTrips(tripsData.slice(0, 3)); // Show top 3
        setStats((prev) => ({ ...prev, tripCount: tripsData.length }));
      }

      if (connRes.ok) {
        const connData = await connRes.json();
        setStats((prev) => ({
          ...prev,
          connectionCount: connData.accepted?.length ?? 0,
          pendingCount: connData.pendingCount ?? 0,
        }));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const firstName = profile?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-[#1A1A1A] md:text-3xl">
          Hey, {firstName}!
        </h1>
        <p className="mt-1 text-sm text-[#666666]">
          Find your travel companion today
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/trips"
          className="rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6F2FF]">
            <TrainFront size={18} className="text-[#0066CC]" />
          </div>
          <p className="mt-2 text-xl font-bold text-[#1A1A1A]">
            {loading ? "-" : stats.tripCount}
          </p>
          <p className="text-xs text-[#666666]">Trips</p>
        </Link>
        <Link
          href="/connections"
          className="rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DCFCE7]">
            <Users size={18} className="text-[#16A34A]" />
          </div>
          <p className="mt-2 text-xl font-bold text-[#1A1A1A]">
            {loading ? "-" : stats.connectionCount}
          </p>
          <p className="text-xs text-[#666666]">Connections</p>
        </Link>
        <Link
          href="/connections"
          className="relative rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FEF3C7]">
            <UserPlus size={18} className="text-[#D97706]" />
          </div>
          <p className="mt-2 text-xl font-bold text-[#1A1A1A]">
            {loading ? "-" : stats.pendingCount}
          </p>
          <p className="text-xs text-[#666666]">Pending</p>
          {stats.pendingCount > 0 && (
            <span className="absolute right-3 top-3 flex h-2.5 w-2.5 rounded-full bg-[#EF4444]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EF4444] opacity-75" />
            </span>
          )}
        </Link>
      </div>

      {/* Upcoming Trips */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Upcoming Trips
          </h2>
          <Link
            href="/trips"
            className="flex items-center gap-1 text-sm font-medium text-[#0066CC]"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl bg-white p-4 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-[#E0E0E0]" />
                  <div className="h-3 w-1/2 rounded bg-[#E0E0E0]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && trips.length > 0 && (
          <div className="space-y-2">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href="/trips"
                className="block rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-[#1A1A1A]">
                  <MapPin size={14} className="shrink-0 text-[#0066CC]" />
                  <span className="truncate">{trip.start_station}</span>
                  <ArrowRight size={12} className="shrink-0 text-[#999999]" />
                  <span className="truncate">{trip.end_station}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-[#666666]">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(trip.travel_time)}
                  </span>
                  <span>
                    {trip.is_repeating
                      ? "Repeating"
                      : formatDate(trip.travel_date)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && trips.length === 0 && (
          <div className="flex flex-col items-center rounded-xl bg-white py-10 shadow-sm">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F3F5]">
              <MapPin size={28} className="text-[#999999]" />
            </div>
            <h3 className="text-base font-medium text-[#1A1A1A]">
              No trips yet
            </h3>
            <p className="mt-1 text-sm text-[#666666]">
              Add your first trip to find travel companions
            </p>
            <Link href="/trips/new" className="mt-4">
              <Button className="gap-2 bg-[#0066CC] hover:bg-[#0052A3]">
                <CalendarPlus size={18} />
                Add Trip
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* How it Works (only show when no trips yet) */}
      {!loading && trips.length === 0 && (
        <div className="rounded-xl bg-white p-4 shadow-sm md:p-6">
          <h2 className="mb-4 text-base font-semibold text-[#1A1A1A]">
            How it works
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {howItWorks.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E6F2FF]">
                  <step.icon size={20} className="text-[#0066CC]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#1A1A1A]">
                    {step.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#666666]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="grid gap-3 md:grid-cols-2">
        <Link href="/trips/new" className="block">
          <Button className="h-12 w-full gap-2 bg-[#0066CC] text-[15px] hover:bg-[#0052A3]">
            <CalendarPlus size={20} />
            Add New Trip
          </Button>
        </Link>
        <Link href="/search" className="block">
          <Button
            variant="outline"
            className="h-12 w-full gap-2 border-[#0066CC] text-[15px] text-[#0066CC] hover:bg-[#E6F2FF]"
          >
            <Search size={20} />
            Find Companions
          </Button>
        </Link>
      </div>
    </div>
  );
}
