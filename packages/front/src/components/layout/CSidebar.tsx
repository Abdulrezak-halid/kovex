import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CNavSection } from "@/components/layout/CNavSection";
import { permittedNavItems } from "@/components/layout/CNavigationConfig";
import { useCAuth } from "@/lib/auth";

export function CSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const { canManageUsers } = useCAuth();

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md flex items-center justify-center overflow-hidden">
              <img
                src="/kovex-icon.png"
                alt={t("appName")}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-sidebar-foreground leading-tight">
                {t("appName")}
              </p>
              <p className="text-xs text-sidebar-foreground/50">
                {t("appSubtitle")}
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 w-full justify-start gap-2 text-xs text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <a
              href="http://localhost:5000/api-docs/"
              target="_blank"
              rel="noreferrer"
              onClick={onNavigate}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("apiDocs")}
            </a>
          </Button>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {permittedNavItems(canManageUsers).map((item) => (
          <CNavSection
            key={item.labelKey}
            item={item}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-sidebar-border">
        <img
          src="/kovex-removebg.png"
          alt={t("appName")}
          className="w-auto items-baseline"
        />
      </div>
    </div>
  );
}
