"use client";

import { useRouter } from "next/navigation";
import { TripForm } from "@/components/trip-form";
import { toast } from "sonner";

export default function NewTripPage() {
  const router = useRouter();

  const handleSubmit = async (data: {
    start_station: string;
    end_station: string;
    travel_date: string;
    travel_time: string;
    is_repeating: boolean;
    repeat_days: number[];
  }) => {
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Failed to add trip. Please try again.");
      return;
    }

    toast.success("Trip added! Others can now find you.");
    router.push("/trips");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Add Trip</h1>
        <p className="mt-1 text-sm text-[#666666]">
          Post your metro trip so others can find you
        </p>
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm md:p-6">
        <TripForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
