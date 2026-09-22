export const ROLES = ["family", "caregiver", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const CARE_TYPES = ["live_in", "visit_based"] as const;
export type CareType = (typeof CARE_TYPES)[number];

export const PREFERRED_WORK_TYPES = ["live_in", "visit_based", "both"] as const;
export type PreferredWorkType = (typeof PREFERRED_WORK_TYPES)[number];

export const VERIFICATION_STATUSES = ["pending", "verified", "rejected"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const CARE_REQUEST_STATUSES = ["open", "matched", "closed", "cancelled"] as const;
export type CareRequestStatus = (typeof CARE_REQUEST_STATUSES)[number];

export const APPLICATION_STATUSES = ["pending", "accepted", "rejected", "withdrawn"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const MATCH_STATUSES = ["proposed", "confirmed", "completed", "cancelled"] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const DOCUMENT_TYPES = ["id", "certificate", "reference", "other"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;
export type DocumentReviewStatus = (typeof DOCUMENT_REVIEW_STATUSES)[number];

export const REPORT_STATUSES = ["open", "reviewed", "dismissed"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const NOTIFICATION_TYPES = [
  "new_application",
  "new_message",
  "match_confirmed",
  "schedule_reminder",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const CARE_TASK_OPTIONS = [
  "Mobility assistance",
  "Bathing & hygiene",
  "Medication management",
  "Meal preparation",
  "Companionship",
  "Housekeeping",
  "Transportation",
  "Wound care",
  "Dementia care",
  "Post-surgery care",
] as const;

export const LANGUAGE_OPTIONS = ["Arabic", "English", "French"] as const;
