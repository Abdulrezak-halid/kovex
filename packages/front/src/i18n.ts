import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import tr from "./locales/tr.json";

export const supportedLanguages = ["en", "tr"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const savedLanguage = localStorage.getItem("language");
const browserLanguage = navigator.language.split("-", 1)[0];
const initialLanguage: SupportedLanguage = supportedLanguages.includes(
  savedLanguage as SupportedLanguage,
)
  ? (savedLanguage as SupportedLanguage)
  : supportedLanguages.includes(browserLanguage as SupportedLanguage)
    ? (browserLanguage as SupportedLanguage)
    : "en";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  lng: initialLanguage,
  resources: {
    en: {
      translation: en,
    },
    tr: {
      translation: tr,
    },
  },
});

i18n.on("languageChanged", (language) => {
  localStorage.setItem("language", language);
  document.documentElement.lang = language;
});

document.documentElement.lang = i18n.language;

export default i18n;
