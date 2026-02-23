"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Gender } from "@/lib/types";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [name, setName] = useState(user?.user_metadata?.full_name ?? "");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.user_metadata?.avatar_url ?? null
  );

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum)) {
      newErrors.age = "Age is required";
    } else if (ageNum < 18) {
      newErrors.age = "You must be 18+ to use Metro Connect";
    } else if (ageNum > 100) {
      newErrors.age = "Please enter a valid age";
    }
    if (!gender) {
      newErrors.gender = "Please select your gender";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;

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

    setAvatarUrl(publicUrl);
    setUploading(false);
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: name.trim(),
        age: parseInt(age),
        gender,
        profile_pic_url: avatarUrl || user.user_metadata?.avatar_url || null,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save profile. Please try again.");
      setSaving(false);
      return;
    }

    await refreshProfile();
    setStep(3);
    setSaving(false);
  };

  const handleSkip = async () => {
    if (!user) return;

    setSaving(true);
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);

    await refreshProfile();
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo/full-logo.png"
            alt="Metro Sathi"
            width={160}
            height={48}
            className="h-12 w-auto object-contain"
            priority
          />
        </div>

        {/* Progress Bar */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  s < step
                    ? "bg-[#10B981] text-white"
                    : s === step
                      ? "bg-[#0066CC] text-white"
                      : "bg-[#E0E0E0] text-[#999999]"
                }`}
              >
                {s < step ? <Check size={16} /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-8 rounded-full ${
                    s < step ? "bg-[#10B981]" : "bg-[#E0E0E0]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg md:p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-semibold text-[#1A1A1A]">
                  Let&apos;s set up your profile
                </h1>
                <p className="mt-1 text-sm text-[#666666]">
                  Help others know who you are
                </p>
              </div>

              {/* Avatar Upload */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative"
                  disabled={uploading}
                >
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#E0E0E0] bg-[#F8F9FA] transition-colors group-hover:border-[#0066CC]">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Camera
                        size={28}
                        className="text-[#999999] group-hover:text-[#0066CC]"
                      />
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
              <p className="text-center text-xs text-[#999999]">
                Tap to upload photo (optional)
              </p>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="Your name"
                  className="bg-[#F1F3F5]"
                />
                {errors.name && (
                  <p className="text-sm text-[#EF4444]">{errors.name}</p>
                )}
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    if (errors.age) setErrors((prev) => ({ ...prev, age: "" }));
                  }}
                  placeholder="25"
                  min={18}
                  max={100}
                  className="bg-[#F1F3F5]"
                />
                {errors.age && (
                  <p className="text-sm text-[#EF4444]">{errors.age}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={gender}
                  onValueChange={(val) => {
                    setGender(val as Gender);
                    if (errors.gender)
                      setErrors((prev) => ({ ...prev, gender: "" }));
                  }}
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
                {errors.gender && (
                  <p className="text-sm text-[#EF4444]">{errors.gender}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  className="flex-1 text-[#666666]"
                  onClick={handleSkip}
                  disabled={saving}
                >
                  Skip for now
                </Button>
                <Button
                  className="flex-1 gap-1 bg-[#0066CC] hover:bg-[#0052A3]"
                  onClick={handleNext}
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Confirm & Save */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-semibold text-[#1A1A1A]">
                  Confirm your details
                </h1>
                <p className="mt-1 text-sm text-[#666666]">
                  You can always edit these later
                </p>
              </div>

              {/* Preview Card */}
              <div className="flex flex-col items-center gap-3 rounded-xl bg-[#F8F9FA] p-6">
                <div className="h-20 w-20 overflow-hidden rounded-full bg-[#E0E0E0]">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#0066CC] text-2xl font-bold text-white">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-[#1A1A1A]">
                    {name}
                  </h3>
                  <p className="text-sm text-[#666666]">
                    {age} years old &middot;{" "}
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        gender === "Male"
                          ? "bg-[#DBEAFE] text-[#3B82F6]"
                          : gender === "Female"
                            ? "bg-[#FCE7F3] text-[#EC4899]"
                            : "bg-[#EDE9FE] text-[#8B5CF6]"
                      }`}
                    >
                      {gender}
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  className="flex-1 gap-1 text-[#666666]"
                  onClick={handleBack}
                  disabled={saving}
                >
                  <ChevronLeft size={16} />
                  Back
                </Button>
                <Button
                  className="flex-1 gap-1 bg-[#0066CC] hover:bg-[#0052A3]"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  Save & Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D1FAE5]">
                <Check size={32} className="text-[#10B981]" />
              </div>
              <h1 className="text-xl font-semibold text-[#1A1A1A]">
                All set, {name.split(" ")[0]}!
              </h1>
              <p className="text-center text-sm text-[#666666]">
                You can now add trips and find travel companions on Delhi Metro.
              </p>
              <Button
                className="mt-2 w-full bg-[#0066CC] hover:bg-[#0052A3]"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
