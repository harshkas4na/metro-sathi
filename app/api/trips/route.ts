import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/trips - Get current user's trips
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", user.id)
    .gte("travel_date", new Date().toISOString().split("T")[0])
    .order("travel_date", { ascending: true })
    .order("travel_time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/trips - Create a new trip
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { start_station, end_station, travel_date, travel_time, is_repeating, repeat_days } = body;

  if (!start_station || !end_station || !travel_date || !travel_time) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (start_station === end_station) {
    return NextResponse.json(
      { error: "Start and end stations must be different" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      start_station,
      end_station,
      travel_date,
      travel_time,
      is_repeating: is_repeating ?? false,
      repeat_days: repeat_days ?? [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
