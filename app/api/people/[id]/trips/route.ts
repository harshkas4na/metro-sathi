import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/people/[id]/trips - Get a connected user's upcoming trips
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: friendId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify they have an accepted connection
  const { data: connection } = await supabase
    .from("connections")
    .select("id, status")
    .or(
      `and(requester_id.eq.${user.id},recipient_id.eq.${friendId}),and(requester_id.eq.${friendId},recipient_id.eq.${user.id})`
    )
    .eq("status", "accepted")
    .maybeSingle();

  if (!connection) {
    return NextResponse.json(
      { error: "You must be connected to view their trips" },
      { status: 403 }
    );
  }

  const { data: trips, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", friendId)
    .gte("travel_date", new Date().toISOString().split("T")[0])
    .order("travel_date", { ascending: true })
    .order("travel_time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(trips ?? []);
}
