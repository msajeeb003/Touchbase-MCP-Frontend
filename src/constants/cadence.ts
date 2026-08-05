export function formatCadence(steps: number, days: number) {
  return `${steps} steps over ${days} days`;
}

export function parseCadence(cadence: string): { steps: number; days: number } | null {
  const match = /^(\d+)\s+steps\s+over\s+(\d+)\s+days$/i.exec(cadence.trim());
  if (!match) return null;
  return { steps: Number(match[1]), days: Number(match[2]) };
}

export function isValidCadence(cadence: string) {
  const parsed = parseCadence(cadence);
  return Boolean(parsed && parsed.steps >= 1 && parsed.days >= 1);
}

/** Digits only, integer greater than 0. Empty / 0 / non-numeric → null. */
export function parsePositiveIntInput(raw: string): number | null {
  const value = raw.trim();
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return parsed;
}

export function getCadenceFieldError(raw: string): string | null {
  if (raw.trim() === "") return "Enter a number greater than 0";
  if (parsePositiveIntInput(raw) === null) return "Enter a number greater than 0";
  return null;
}
