"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  CalendarPlus,
  Clock,
  Repeat,
  Pencil,
  Trash2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TripForm } from "@/components/trip-form";
import { toast } from "sonner";
import Link from "next/link";
import type { Trip } from "@/lib/types";

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function groupTripsByDate(trips: Trip[]) {
  const groups: Record<string, Trip[]> = {};
  for (const trip of trips) {
    const label = formatDate(trip.travel_date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(trip);
  }
  return groups;
}

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    const res = await fetch("/api/trips");
    if (res.ok) {
      const data = await res.json();
      setTrips(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete trip");
    } else {
      toast.success("Trip deleted");
      setTrips((prev) => prev.filter((t) => t.id !== id));
    }
    setDeletingId(null);
  };

  const handleEdit = async (data: {
    start_station: string;
    end_station: string;
    travel_date: string;
    travel_time: string;
    is_repeating: boolean;
    repeat_days: number[];
  }) => {
    if (!editingTrip) return;

    const res = await fetch(`/api/trips/${editingTrip.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Failed to update trip");
      return;
    }

    toast.success("Trip updated");
    setEditingTrip(null);
    fetchTrips();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#0066CC]" />
      </div>
    );
  }

  const grouped = groupTripsByDate(trips);
  const groupKeys = Object.keys(grouped);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">My Trips</h1>
          <p className="mt-1 text-sm text-[#666666]">
            {trips.length} upcoming trip{trips.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/trips/new">
          <Button className="gap-2 bg-[#0066CC] hover:bg-[#0052A3]">
            <CalendarPlus size={18} />
            <span className="hidden sm:inline">Add Trip</span>
          </Button>
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl bg-white py-16 shadow-sm">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F3F5]">
            <MapPin size={28} className="text-[#999999]" />
          </div>
          <h3 className="text-base font-medium text-[#1A1A1A]">
            No upcoming trips
          </h3>
          <p className="mt-1 text-sm text-[#666666]">
            Add a trip to let others find you
          </p>
          <Link href="/trips/new" className="mt-4">
            <Button className="gap-2 bg-[#0066CC] hover:bg-[#0052A3]">
              <CalendarPlus size={18} />
              Add Your First Trip
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {groupKeys.map((dateLabel) => (
            <div key={dateLabel}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#999999]">
                {dateLabel}
              </h2>
              <div className="space-y-3">
                {grouped[dateLabel].map((trip) => (
                  <div
                    key={trip.id}
                    className="rounded-xl border border-[#E0E0E0] bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1 space-y-2">
                        {/* Route */}
                        <div className="flex items-center gap-2 text-sm font-medium text-[#1A1A1A]">
                          <MapPin
                            size={14}
                            className="shrink-0 text-[#0066CC]"
                          />
                          <span className="truncate">
                            {trip.start_station}
                          </span>
                          <ArrowRight
                            size={14}
                            className="shrink-0 text-[#999999]"
                          />
                          <span className="truncate">{trip.end_station}</span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-4 text-xs text-[#666666]">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatTime(trip.travel_time)}
                          </span>
                          {trip.is_repeating && trip.repeat_days.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Repeat size={12} />
                              {trip.repeat_days
                                .sort((a, b) => a - b)
                                .map((d) => WEEKDAY_NAMES[d])
                                .join(", ")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-2 flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-[#666666] hover:text-[#0066CC]"
                          onClick={() => setEditingTrip(trip)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-[#666666] hover:text-[#EF4444]"
                          onClick={() => handleDelete(trip.id)}
                          disabled={deletingId === trip.id}
                        >
                          {deletingId === trip.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingTrip}
        onOpenChange={(open) => !open && setEditingTrip(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Trip</DialogTitle>
          </DialogHeader>
          {editingTrip && (
            <TripForm
              initialData={{
                start_station: editingTrip.start_station,
                end_station: editingTrip.end_station,
                travel_date: editingTrip.travel_date,
                travel_time: editingTrip.travel_time,
                is_repeating: editingTrip.is_repeating,
                repeat_days: editingTrip.repeat_days,
              }}
              onSubmit={handleEdit}
              onCancel={() => setEditingTrip(null)}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
