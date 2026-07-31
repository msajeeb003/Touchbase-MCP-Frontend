export const CADENCE_PRESETS = [
  "5 steps over 7 days",
  "3 steps over 5 days",
  "7 steps over 14 days",
] as const;

export const CADENCE_CUSTOM = "__custom__";

export function formatCadence(steps: number, days: number) {
  return `${steps} steps over ${days} days`;
}

export function parseCadence(cadence: string): { steps: number; days: number } | null {
  const match = /^(\d+)\s+steps\s+over\s+(\d+)\s+days$/i.exec(cadence.trim());
  if (!match) return null;
  return { steps: Number(match[1]), days: Number(match[2]) };
}

export function isCadencePreset(cadence: string) {
  return (CADENCE_PRESETS as readonly string[]).includes(cadence);
}

export function isValidCadence(cadence: string) {
  const parsed = parseCadence(cadence);
  return Boolean(parsed && parsed.steps >= 1 && parsed.days >= 1);
}
