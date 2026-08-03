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
