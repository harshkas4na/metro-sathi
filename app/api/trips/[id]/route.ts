import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PUT /api/trips/[id] - Update a trip
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { start_station, end_station, travel_date, travel_time, is_repeating, repeat_days } = body;

  if (start_station && end_station && start_station === end_station) {
    return NextResponse.json(
      { error: "Start and end stations must be different" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("trips")
    .update({
      start_station,
      end_station,
      travel_date,
      travel_time,
      is_repeating: is_repeating ?? false,
      repeat_days: repeat_days ?? [],
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/trips/[id] - Delete a trip
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
