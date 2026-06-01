import type { TFunction } from "i18next";

export function textKey(text: string) {
  const words = text
    .replace(/[$?.,—]/g, " ")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      return index === 0 ? lower : `${lower[0].toUpperCase()}${lower.slice(1)}`;
    })
    .join("");
}

export function translateText(t: TFunction, text: string) {
  return t(textKey(text), text);
}
