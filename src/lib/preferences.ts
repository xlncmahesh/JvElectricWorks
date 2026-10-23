/**
 * Last-selected shopping category — persisted in localStorage so the /buy
 * page can highlight the visitor's previous choice across navigation and refresh,
 * without requiring a user account.
 */

const STORAGE_KEY = 'jve_last_category';

export function getLastCategory(): string | null {
  try { return localStorage.getItem(STORAGE_KEY); }
  catch { return null; }
}

export function setLastCategory(slug: string): void {
  try { localStorage.setItem(STORAGE_KEY, slug); }
  catch { /* ignore in environments where localStorage is unavailable */ }
}
