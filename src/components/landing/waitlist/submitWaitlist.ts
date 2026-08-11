export type WaitlistPayload = {
  name: string;
  email: string;
  role: string;
  country: string;
};

/**
 * Posts waitlist details to a Google Apps Script web app.
 * Uses text/plain body so the browser skips a CORS preflight.
 */
export async function submitWaitlist(
  payload: WaitlistPayload,
): Promise<void> {
  const url = import.meta.env.VITE_WAITLIST_SCRIPT_URL as string | undefined;
  if (!url) {
    throw new Error("Waitlist script URL is not configured");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error("Could not save waitlist request");
  }

  const text = (await response.text()).trim();
  if (!text) return;

  try {
    const data = JSON.parse(text) as { ok?: boolean; error?: string };
    if (data.ok === false) {
      throw new Error(data.error || "Could not save waitlist request");
    }
  } catch (error) {
    if (error instanceof SyntaxError) return;
    throw error;
  }
}
