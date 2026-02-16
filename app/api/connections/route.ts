import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all connections where user is requester or recipient
  const { data: connections, error } = await supabase
    .from("connections")
    .select(
      `
      *,
      requester:profiles!connections_requester_id_fkey (
        id, name, age, gender, profile_pic_url, bio,
        instagram_handle, twitter_handle
      ),
      recipient:profiles!connections_recipient_id_fkey (
        id, name, age, gender, profile_pic_url, bio,
        instagram_handle, twitter_handle
      )
    `
    )
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Split into categories
  const pending = (connections ?? []).filter(
    (c) => c.status === "pending" && c.recipient_id === user.id
  );
  const sent = (connections ?? []).filter(
    (c) => c.status === "pending" && c.requester_id === user.id
  );
  const accepted = (connections ?? []).filter((c) => c.status === "accepted");

  return NextResponse.json({
    pending,
    sent,
    accepted,
    pendingCount: pending.length,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { recipient_id } = body;

  if (!recipient_id) {
    return NextResponse.json(
      { error: "Recipient ID is required" },
      { status: 400 }
    );
  }

  if (recipient_id === user.id) {
    return NextResponse.json(
      { error: "Cannot connect with yourself" },
      { status: 400 }
    );
  }

  // Check if connection already exists (in either direction)
  const { data: existing } = await supabase
    .from("connections")
    .select("id, status")
    .or(
      `and(requester_id.eq.${user.id},recipient_id.eq.${recipient_id}),and(requester_id.eq.${recipient_id},recipient_id.eq.${user.id})`
    )
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Connection already exists", status: existing.status },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("connections")
    .insert({
      requester_id: user.id,
      recipient_id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
