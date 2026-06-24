export const USER_ROLES = {
  WORKER: "worker",
  CLIENT: "client",
  ADMIN: "admin",
};

export const JOB_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ON_HOLD: "on_hold",
};

export const APPLICATION_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
  SHORTLISTED: "shortlisted",
};

export const JOB_STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  on_hold: "On Hold",
};

export const APPLICATION_STATUS_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  shortlisted: "Shortlisted",
};

export const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
];

export const DURATION_OPTIONS = [
  { value: "less_than_week", label: "Less than 1 week" },
  { value: "1-4_weeks", label: "1 to 4 weeks" },
  { value: "1-3_months", label: "1 to 3 months" },
  { value: "3-6_months", label: "3 to 6 months" },
  { value: "more_than_6_months", label: "More than 6 months" },
];
