import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  if (!status || !["accepted", "declined"].includes(status)) {
    return NextResponse.json(
      { error: "Status must be 'accepted' or 'declined'" },
      { status: 400 }
    );
  }

  // Verify user is the recipient of this connection
  const { data: connection, error: fetchError } = await supabase
    .from("connections")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !connection) {
    return NextResponse.json(
      { error: "Connection not found" },
      { status: 404 }
    );
  }

  if (connection.recipient_id !== user.id) {
    return NextResponse.json(
      { error: "Only the recipient can accept or decline" },
      { status: 403 }
    );
  }

  if (connection.status !== "pending") {
    return NextResponse.json(
      { error: "Connection is no longer pending" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("connections")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
