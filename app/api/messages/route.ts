import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const connectionId = searchParams.get("connection_id");

  if (!connectionId) {
    return NextResponse.json(
      { error: "connection_id is required" },
      { status: 400 }
    );
  }

  // Verify user is part of this connection and it's accepted
  const { data: connection } = await supabase
    .from("connections")
    .select("*")
    .eq("id", connectionId)
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .single();

  if (!connection) {
    return NextResponse.json(
      { error: "Connection not found or not accepted" },
      { status: 404 }
    );
  }

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("connection_id", connectionId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(messages ?? []);
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
  const { connection_id, content } = body;

  if (!connection_id || !content?.trim()) {
    return NextResponse.json(
      { error: "connection_id and content are required" },
      { status: 400 }
    );
  }

  if (content.length > 500) {
    return NextResponse.json(
      { error: "Message too long (max 500 characters)" },
      { status: 400 }
    );
  }

  // Verify user is part of this accepted connection
  const { data: connection } = await supabase
    .from("connections")
    .select("*")
    .eq("id", connection_id)
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .single();

  if (!connection) {
    return NextResponse.json(
      { error: "Connection not found or not accepted" },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      connection_id,
      sender_id: user.id,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
