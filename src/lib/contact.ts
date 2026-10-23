export interface SavedContact {
  email: string;
  phone: string;
}

function indianDigits(value: string): string {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+91') || trimmed.startsWith('0091') || (digits.length === 12 && digits.startsWith('91'))) {
    return digits.slice(-10);
  }
  return digits.slice(0, 10);
}

export function normalizeIndianPhone(value: string): string {
  const digits = indianDigits(value);
  return digits ? `+91${digits}` : '';
}

export function phoneDigits(value: string): string {
  return indianDigits(value);
}

export function isValidIndianPhone(value: string): boolean {
  return /^[6-9]\d{9}$/.test(phoneDigits(value));
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

const CONTACT_KEY = 'jve_saved_contact';

export function readSavedContact(): SavedContact {
  try {
    const saved = JSON.parse(localStorage.getItem(CONTACT_KEY) ?? '{}') as Partial<SavedContact>;
    return { email: saved.email ?? '', phone: saved.phone ?? '' };
  } catch {
    return { email: '', phone: '' };
  }
}

export function saveContact(contact: Partial<SavedContact>): void {
  const current = readSavedContact();
  try {
    localStorage.setItem(CONTACT_KEY, JSON.stringify({
      email: contact.email?.trim() || current.email,
      phone: contact.phone ? normalizeIndianPhone(contact.phone) : current.phone,
    }));
  } catch {
    // Local storage is optional.
  }
}
