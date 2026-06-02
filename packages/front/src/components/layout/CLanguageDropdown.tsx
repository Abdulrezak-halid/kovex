import { useTranslation } from "react-i18next";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "en", labelKey: "english", shortLabel: "EN", flag: "🇺🇸" },
  { code: "tr", labelKey: "turkish", shortLabel: "TR", flag: "🇹🇷" },
] as const;

export function CLanguageDropdown() {
  const { i18n, t } = useTranslation();
  const current =
    languages.find((language) => i18n.language.startsWith(language.code)) ??
    languages[0];

  function changeLanguage(language: "en" | "tr") {
    void i18n.changeLanguage(language);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
          aria-label={t("language")}
        >
          <span aria-hidden="true">{current.flag}</span>
          <span className="hidden text-xs font-medium sm:inline">
            {current.shortLabel}
          </span>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((language) => {
          const isActive = current.code === language.code;
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className="cursor-pointer"
            >
              <span aria-hidden="true">{language.flag}</span>
              <span>{t(language.labelKey)}</span>
              {isActive && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
