import * as React from "react";
import { useTranslation } from "react-i18next";
import { translateText } from "@/lib/i18n";

export function useLocalizedChildren() {
  const { t } = useTranslation();

  return React.useCallback(
    (children: React.ReactNode): React.ReactNode =>
      React.Children.map(children, (child) =>
        typeof child === "string" ? translateText(t, child) : child,
      ),
    [t],
  );
}
