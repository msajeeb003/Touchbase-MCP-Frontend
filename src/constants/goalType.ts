export const GOAL_TYPES = [
  "Book another call",
  "Get a reply",
  "Build relationship",
  "Close the deal",
  "Send proposal",
  "Share resources",
] as const;

export type GoalType = (typeof GOAL_TYPES)[number];
