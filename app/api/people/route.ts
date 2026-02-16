import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/people?q=searchTerm - Search profiles by name
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ error: "Search query must be at least 2 characters" }, { status: 400 });
  }

  // Search profiles by name (case-insensitive), exclude current user
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, name, age, gender, profile_pic_url, bio")
    .neq("id", user.id)
    .ilike("name", `%${q}%`)
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json([]);
  }

  // Fetch connection statuses for all results
  const profileIds = profiles.map((p) => p.id);
  const { data: connections } = await supabase
    .from("connections")
    .select("id, requester_id, recipient_id, status")
    .or(
      `and(requester_id.eq.${user.id},recipient_id.in.(${profileIds.join(",")})),and(recipient_id.eq.${user.id},requester_id.in.(${profileIds.join(",")}))`
    );

  // Build connection status map
  const connectionMap: Record<string, { status: string; connectionId: string }> = {};
  for (const conn of connections ?? []) {
    const otherId = conn.requester_id === user.id ? conn.recipient_id : conn.requester_id;
    connectionMap[otherId] = { status: conn.status, connectionId: conn.id };
  }

  const results = profiles.map((p) => ({
    ...p,
    connection_status: connectionMap[p.id]?.status ?? "none",
    connection_id: connectionMap[p.id]?.connectionId ?? null,
  }));

  return NextResponse.json(results);
}
