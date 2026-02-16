"use client";

import { useState } from "react";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StationPicker } from "@/components/station-picker";
import { cn } from "@/lib/utils";

const WEEKDAYS = [
  { label: "M", value: 1 },
  { label: "T", value: 2 },
  { label: "W", value: 3 },
  { label: "T", value: 4 },
  { label: "F", value: 5 },
  { label: "S", value: 6 },
  { label: "S", value: 0 },
];

interface TripFormProps {
  onSubmit: (data: {
    start_station: string;
    end_station: string;
    travel_date: string;
    travel_time: string;
    is_repeating: boolean;
    repeat_days: number[];
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    start_station: string;
    end_station: string;
    travel_date: string;
    travel_time: string;
    is_repeating: boolean;
    repeat_days: number[];
  };
  submitLabel?: string;
}

export function TripForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = "Add Trip",
}: TripFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const [startStation, setStartStation] = useState(
    initialData?.start_station ?? ""
  );
  const [endStation, setEndStation] = useState(
    initialData?.end_station ?? ""
  );
  const [travelDate, setTravelDate] = useState(
    initialData?.travel_date ?? today
  );
  const [travelTime, setTravelTime] = useState(
    initialData?.travel_time ?? "09:00"
  );
  const [isRepeating, setIsRepeating] = useState(
    initialData?.is_repeating ?? false
  );
  const [repeatDays, setRepeatDays] = useState<number[]>(
    initialData?.repeat_days ?? []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const toggleDay = (day: number) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!startStation) newErrors.start_station = "Start station is required";
    if (!endStation) newErrors.end_station = "End station is required";
    if (startStation && endStation && startStation === endStation) {
      newErrors.end_station = "Start and end stations must be different";
    }
    if (!travelDate) newErrors.travel_date = "Date is required";
    if (!travelTime) newErrors.travel_time = "Time is required";

    // Check if date/time is in the past (for today)
    if (travelDate === today) {
      const now = new Date();
      const [h, m] = travelTime.split(":").map(Number);
      const tripTime = new Date();
      tripTime.setHours(h, m, 0, 0);
      if (tripTime < now && !isRepeating) {
        newErrors.travel_time = "Time must be in the future";
      }
    }

    if (isRepeating && repeatDays.length === 0) {
      newErrors.repeat_days = "Select at least one day";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        start_station: startStation,
        end_station: endStation,
        travel_date: travelDate,
        travel_time: travelTime,
        is_repeating: isRepeating,
        repeat_days: isRepeating ? repeatDays : [],
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Start Station */}
      <StationPicker
        label="Start Station"
        value={startStation}
        onChange={(val) => {
          setStartStation(val);
          if (errors.start_station)
            setErrors((prev) => ({ ...prev, start_station: "" }));
        }}
        placeholder="Select start station"
        error={errors.start_station}
      />

      {/* End Station */}
      <StationPicker
        label="End Station"
        value={endStation}
        onChange={(val) => {
          setEndStation(val);
          if (errors.end_station)
            setErrors((prev) => ({ ...prev, end_station: "" }));
        }}
        placeholder="Select end station"
        excludeStation={startStation}
        error={errors.end_station}
      />

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="travel-date" className="flex items-center gap-1.5">
            <Calendar size={14} />
            Date
          </Label>
          <Input
            id="travel-date"
            type="date"
            value={travelDate}
            onChange={(e) => {
              setTravelDate(e.target.value);
              if (errors.travel_date)
                setErrors((prev) => ({ ...prev, travel_date: "" }));
            }}
            min={today}
            className="bg-[#F1F3F5]"
          />
          {errors.travel_date && (
            <p className="text-sm text-[#EF4444]">{errors.travel_date}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="travel-time" className="flex items-center gap-1.5">
            <Clock size={14} />
            Time
          </Label>
          <Input
            id="travel-time"
            type="time"
            value={travelTime}
            onChange={(e) => {
              setTravelTime(e.target.value);
              if (errors.travel_time)
                setErrors((prev) => ({ ...prev, travel_time: "" }));
            }}
            className="bg-[#F1F3F5]"
          />
          {errors.travel_time && (
            <p className="text-sm text-[#EF4444]">{errors.travel_time}</p>
          )}
        </div>
      </div>

      {/* Trip Type */}
      <div className="space-y-2">
        <Label>Trip Type</Label>
        <RadioGroup
          value={isRepeating ? "repeating" : "one-time"}
          onValueChange={(val) => setIsRepeating(val === "repeating")}
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="one-time" id="one-time" />
            <Label htmlFor="one-time" className="cursor-pointer font-normal">
              One-time
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="repeating" id="repeating" />
            <Label htmlFor="repeating" className="cursor-pointer font-normal">
              Repeating
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Repeat Days */}
      {isRepeating && (
        <div className="space-y-2">
          <Label>Repeat Days</Label>
          <div className="flex gap-2">
            {WEEKDAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                  repeatDays.includes(day.value)
                    ? "border-[#0066CC] bg-[#0066CC] text-white"
                    : "border-[#E0E0E0] bg-white text-[#666666] hover:border-[#0066CC] hover:text-[#0066CC]"
                )}
              >
                {day.label}
              </button>
            ))}
          </div>
          {errors.repeat_days && (
            <p className="text-sm text-[#EF4444]">{errors.repeat_days}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="ghost"
          className="flex-1 text-[#666666]"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 gap-1 bg-[#0066CC] hover:bg-[#0052A3]"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
