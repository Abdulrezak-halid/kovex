const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneCharactersPattern = /^[0-9+()\-\s]*$/;

export const phoneInputPattern = "[0-9+()\\-\\s]*";

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return emailPattern.test(normalizeEmail(value));
}

export function sanitizePhoneInput(value: string) {
  return value.replace(/[^0-9+()\-\s]/g, "");
}

export function isValidPhone(value: string) {
  return phoneCharactersPattern.test(value);
}
