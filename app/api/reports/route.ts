import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ReportReason } from "@/lib/types";

const VALID_REASONS: ReportReason[] = [
  "fake_profile",
  "harassment",
  "inappropriate",
  "spam",
  "safety",
  "other",
];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { reported_user_id, reason, description } = body;

  if (!reported_user_id || !reason) {
    return NextResponse.json(
      { error: "reported_user_id and reason are required" },
      { status: 400 }
    );
  }

  if (reported_user_id === user.id) {
    return NextResponse.json(
      { error: "Cannot report yourself" },
      { status: 400 }
    );
  }

  if (!VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  if (description && description.length > 500) {
    return NextResponse.json(
      { error: "Description too long (max 500 characters)" },
      { status: 400 }
    );
  }

  // Check for duplicate recent report
  const { data: existing } = await supabase
    .from("reports")
    .select("id")
    .eq("reporter_id", user.id)
    .eq("reported_user_id", reported_user_id)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "You have already reported this user" },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      reported_user_id,
      reason,
      description: description?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
