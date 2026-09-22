import { z } from "zod";
import {
  CARE_TYPES,
  PREFERRED_WORK_TYPES,
} from "@/lib/constants";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["family", "caregiver"]),
});

export const careRequestSchema = z.object({
  location: z.string().trim().min(2).max(200),
  startDate: z.string().min(1, "Start date is required"),
  hoursSchedule: z.string().trim().min(2).max(200),
  careType: z.enum(CARE_TYPES),
  requiredTasks: z.array(z.string()).min(1, "Select at least one care task"),
  preferredAttributes: z.string().trim().max(500).optional().or(z.literal("")),
  budgetMin: z.coerce.number().int().nonnegative().optional(),
  budgetMax: z.coerce.number().int().nonnegative().optional(),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const caregiverProfileSchema = z.object({
  photoUrl: z.string().trim().max(500).optional().or(z.literal("")),
  bio: z.string().trim().max(1000).optional().or(z.literal("")),
  location: z.string().trim().min(2).max(200),
  travelRadiusKm: z.coerce.number().int().min(0).max(200),
  education: z.string().trim().max(300).optional().or(z.literal("")),
  certifications: z.array(z.string()).default([]),
  experienceYears: z.coerce.number().int().min(0).max(60),
  careCapabilities: z.array(z.string()).min(1, "Select at least one capability"),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  availabilityDays: z.array(z.string()).min(1, "Select at least one day"),
  availabilityHours: z.string().trim().min(1).max(100),
  preferredWorkType: z.enum(PREFERRED_WORK_TYPES),
});

export const applicationSchema = z.object({
  careRequestId: z.string().min(1),
  message: z.string().trim().min(10, "Write a short introduction (10+ characters)").max(1000),
});

export const reviewSchema = z.object({
  matchId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const reportSchema = z.object({
  reportedUserId: z.string().min(1),
  reason: z.string().trim().min(5).max(200),
  details: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().trim().min(1).max(2000),
});
