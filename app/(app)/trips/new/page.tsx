"use client";

import { useRouter } from "next/navigation";
import { TripForm } from "@/components/trip-form";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function NewTripPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (data: {
    start_station: string;
    end_station: string;
    travel_date: string;
    travel_time: string;
    is_repeating: boolean;
    repeat_days: number[];
  }) => {
    const { error } = await supabase.from("trips").insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      ...data,
    });

    if (error) {
      toast.error("Failed to add trip. Please try again.");
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
