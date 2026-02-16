"use client";

import { useState, useRef } from "react";
import {
  Camera,
  Loader2,
  LogOut,
  Pencil,
  Instagram,
  Twitter,
  Phone,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Gender } from "@/lib/types";

export default function ProfilePage() {
  const { profile, refreshProfile, signOut, loading } = useAuth();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Edit form state
  const [name, setName] = useState(profile?.name ?? "");
  const [age, setAge] = useState(profile?.age?.toString() ?? "");
  const [gender, setGender] = useState<Gender | "">(
    (profile?.gender as Gender) ?? ""
  );
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [instagram, setInstagram] = useState(
    profile?.instagram_handle ?? ""
  );
  const [twitter, setTwitter] = useState(profile?.twitter_handle ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [phoneVisible, setPhoneVisible] = useState(
    profile?.phone_visible ?? false
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const startEditing = () => {
    setName(profile?.name ?? "");
    setAge(profile?.age?.toString() ?? "");
    setGender((profile?.gender as Gender) ?? "");
    setBio(profile?.bio ?? "");
    setInstagram(profile?.instagram_handle ?? "");
    setTwitter(profile?.twitter_handle ?? "");
    setPhone(profile?.phone ?? "");
    setPhoneVisible(profile?.phone_visible ?? false);
    setAvatarPreview(null);
    setEditing(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${profile.id}/avatar.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (error) {
      toast.error("Failed to upload image");
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    await supabase
      .from("profiles")
      .update({ profile_pic_url: `${publicUrl}?t=${Date.now()}` })
      .eq("id", profile.id);

    setUploading(false);
    toast.success("Photo updated");
  };

  const handleSave = async () => {
    if (!profile) return;

    if (!name.trim() || name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      toast.error("Please enter a valid age (18-100)");
      return;
    }
    if (!gender) {
      toast.error("Please select your gender");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: name.trim(),
        age: ageNum,
        gender,
        bio: bio.trim() || null,
        instagram_handle: instagram.trim() || null,
        twitter_handle: twitter.trim() || null,
        phone: phone.trim() || null,
        phone_visible: phoneVisible,
      })
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to save profile");
      setSaving(false);
      return;
    }

    await refreshProfile();
    setEditing(false);
    setSaving(false);
    toast.success("Profile updated");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#0066CC]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-sm text-[#666666]">Profile not found</p>
        <Button onClick={signOut} variant="ghost" className="text-[#EF4444]">
          Sign Out
        </Button>
      </div>
    );
  }

  const displayPic =
    avatarPreview || profile.profile_pic_url;
  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  // ─── View Mode ───
  if (!editing) {
    return (
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center rounded-xl bg-white p-6 shadow-sm">
          {/* Avatar */}
          <div className="relative mb-3">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-[#E0E0E0]">
              {displayPic ? (
                <img
                  src={displayPic}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#0066CC] text-2xl font-bold text-white">
                  {initials}
                </div>
              )}
            </div>
          </div>

          <h1 className="text-xl font-semibold text-[#1A1A1A]">
            {profile.name}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-[#666666]">
            {profile.age && <span>{profile.age} years old</span>}
            {profile.gender && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  profile.gender === "Male"
                    ? "bg-[#DBEAFE] text-[#3B82F6]"
                    : profile.gender === "Female"
                      ? "bg-[#FCE7F3] text-[#EC4899]"
                      : "bg-[#EDE9FE] text-[#8B5CF6]"
                }`}
              >
                {profile.gender}
              </span>
            )}
          </div>
          {profile.bio && (
            <p className="mt-2 max-w-xs text-center text-sm text-[#666666]">
              {profile.bio}
            </p>
          )}

          {/* Social Links */}
          {(profile.instagram_handle || profile.twitter_handle) && (
            <div className="mt-3 flex items-center gap-4">
              {profile.instagram_handle && (
                <a
                  href={`https://instagram.com/${profile.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#E1306C]"
                >
                  <Instagram size={16} />
                  {profile.instagram_handle}
                </a>
              )}
              {profile.twitter_handle && (
                <a
                  href={`https://twitter.com/${profile.twitter_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#1DA1F2]"
                >
                  <Twitter size={16} />
                  {profile.twitter_handle}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Settings List */}
        <div className="rounded-xl bg-white shadow-sm">
          <button
            onClick={startEditing}
            className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-[#F8F9FA]"
          >
            <div className="flex items-center gap-3">
              <Pencil size={18} className="text-[#666666]" />
              <span className="text-sm font-medium text-[#1A1A1A]">
                Edit Profile
              </span>
            </div>
            <span className="text-sm text-[#999999]">&rsaquo;</span>
          </button>
          <Separator />
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-[#F8F9FA]"
          >
            <LogOut size={18} className="text-[#EF4444]" />
            <span className="text-sm font-medium text-[#EF4444]">Logout</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── Edit Mode ───
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Edit Profile</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditing(false)}
          className="text-[#666666]"
        >
          <X size={18} />
        </Button>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm md:p-6">
        <div className="space-y-5">
          {/* Avatar */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative"
              disabled={uploading}
            >
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#E0E0E0]">
                {displayPic ? (
                  <img
                    src={displayPic}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#0066CC] text-2xl font-bold text-white">
                    {initials}
                  </div>
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                  <Loader2 size={20} className="animate-spin text-white" />
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#0066CC] text-white shadow-md">
                <Camera size={14} />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#F1F3F5]"
            />
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="edit-age">Age</Label>
            <Input
              id="edit-age"
              type="number"
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={18}
              max={100}
              className="bg-[#F1F3F5]"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={gender}
              onValueChange={(val) => setGender(val as Gender)}
            >
              <SelectTrigger className="bg-[#F1F3F5]">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="edit-bio">
              Bio{" "}
              <span className="font-normal text-[#999999]">(optional)</span>
            </Label>
            <Textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 100))}
              placeholder="Short bio about yourself"
              maxLength={100}
              rows={2}
              className="resize-none bg-[#F1F3F5]"
            />
            <p className="text-right text-xs text-[#999999]">
              {bio.length}/100
            </p>
          </div>

          <Separator />

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#1A1A1A]">
              Social Links{" "}
              <span className="font-normal text-[#999999]">(optional)</span>
            </h3>

            <div className="space-y-2">
              <Label htmlFor="edit-instagram" className="flex items-center gap-1.5">
                <Instagram size={14} />
                Instagram
              </Label>
              <Input
                id="edit-instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="your_handle"
                className="bg-[#F1F3F5]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-twitter" className="flex items-center gap-1.5">
                <Twitter size={14} />
                Twitter / X
              </Label>
              <Input
                id="edit-twitter"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="your_handle"
                className="bg-[#F1F3F5]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="flex items-center gap-1.5">
                <Phone size={14} />
                Phone
              </Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="bg-[#F1F3F5]"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#666666]">
                  Share phone with connections
                </span>
                <Switch
                  checked={phoneVisible}
                  onCheckedChange={setPhoneVisible}
                />
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1 text-[#666666]"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-1 bg-[#0066CC] hover:bg-[#0052A3]"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
