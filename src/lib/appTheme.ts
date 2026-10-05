import { useCallback, useEffect, useSyncExternalStore } from "react";

/**
 * Light / dark switch for the steel theme.
 *
 * The `landing-*` colours resolve to CSS variables declared in globals.css:
 * dark by default, light when <html data-theme="light"> is set. The choice is
 * kept in localStorage; index.html applies it before React mounts so the
 * dashboard does not flash dark first. The dashboard layout owns the switch,
 * so every route rendered inside it follows the choice.
 */
export type AppTheme = "dark" | "light";

export const THEME_STORAGE_KEY = "touchbase-theme";
const THEME_EVENT = "touchbase-theme-change";

export function readStoredTheme(): AppTheme {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function writeStoredTheme(theme: AppTheme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage: the choice simply does not persist.
  }
}

function applyTheme(theme: AppTheme) {
  const root = document.documentElement;
  if (theme === "light") root.dataset.theme = "light";
  else delete root.dataset.theme;
}

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Read-only view of the stored theme; re-renders when it changes. */
export function useAppTheme(): AppTheme {
  return useSyncExternalStore(subscribe, readStoredTheme, () => "dark" as AppTheme);
}

/**
 * Applies the stored theme while the calling layout is mounted and restores
 * the dark default on unmount, so routes outside it (landing, auth) stay dark.
 */
export function useScopedAppTheme(): [AppTheme, (theme: AppTheme) => void] {
  const theme = useAppTheme();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => () => applyTheme("dark"), []);

  const setTheme = useCallback((next: AppTheme) => {
    writeStoredTheme(next);
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return [theme, setTheme];
}
