export const ROLES = {
  USER: "user",
  ADMIN: "admin",
  DEALER: "dealer",
  DELIVERY_PARTNER: "delivery partner",
} as const;

export const USER_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  INACTIVE: "inactive",
  REJECTED: "rejected"
} as const;
