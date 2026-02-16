import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/profile - Get current user's profile
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log("[API /api/profile GET] user:", user?.id ?? "NULL", "| authError:", authError?.message ?? "none");

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  console.log("[API /api/profile GET] query result:", data ? "found" : "null", "| error:", error?.message ?? "none", "| code:", error?.code ?? "none");

  if (error) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PATCH /api/profile - Update current user's profile
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, age, gender, bio, instagram_handle, twitter_handle, phone, phone_visible, profile_pic_url } = body;

  // Validation
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }
  }

  if (age !== undefined) {
    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      return NextResponse.json(
        { error: "Age must be between 18 and 100" },
        { status: 400 }
      );
    }
  }

  if (gender !== undefined) {
    if (!["Male", "Female", "Other"].includes(gender)) {
      return NextResponse.json(
        { error: "Invalid gender value" },
        { status: 400 }
      );
    }
  }

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name.trim();
  if (age !== undefined) updateData.age = Number(age);
  if (gender !== undefined) updateData.gender = gender;
  if (bio !== undefined) updateData.bio = bio?.trim() || null;
  if (instagram_handle !== undefined) updateData.instagram_handle = instagram_handle?.trim() || null;
  if (twitter_handle !== undefined) updateData.twitter_handle = twitter_handle?.trim() || null;
  if (phone !== undefined) updateData.phone = phone?.trim() || null;
  if (phone_visible !== undefined) updateData.phone_visible = phone_visible;
  if (profile_pic_url !== undefined) updateData.profile_pic_url = profile_pic_url;

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
