import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be under 50 characters"),
  age: z
    .number({ error: "Age is required" })
    .int("Age must be a whole number")
    .min(18, "You must be 18+ to use Metro Connect")
    .max(100, "Please enter a valid age"),
  gender: z.enum(["Male", "Female", "Other"], {
    error: "Please select your gender",
  }),
  bio: z
    .string()
    .max(100, "Bio must be under 100 characters")
    .optional()
    .or(z.literal("")),
  instagram_handle: z
    .string()
    .max(30, "Handle too long")
    .optional()
    .or(z.literal("")),
  twitter_handle: z
    .string()
    .max(30, "Handle too long")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(15, "Phone number too long")
    .optional()
    .or(z.literal("")),
  phone_visible: z.boolean().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const onboardingBasicSchema = profileSchema.pick({
  name: true,
  age: true,
  gender: true,
});

export type OnboardingBasicData = z.infer<typeof onboardingBasicSchema>;

export const tripSchema = z
  .object({
    start_station: z.string().min(1, "Start station is required"),
    end_station: z.string().min(1, "End station is required"),
    travel_date: z.string().min(1, "Travel date is required"),
    travel_time: z.string().min(1, "Travel time is required"),
    is_repeating: z.boolean(),
    repeat_days: z.array(z.number().min(0).max(6)),
  })
  .refine((data) => data.start_station !== data.end_station, {
    message: "Start and end stations must be different",
    path: ["end_station"],
  });

export type TripFormData = z.infer<typeof tripSchema>;
