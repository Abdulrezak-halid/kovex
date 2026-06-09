import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Bell, Info, LogIn, LogOut, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchItems } from "@/components/layout/CNavigationConfig";
import { CLanguageDropdown } from "@/components/layout/CLanguageDropdown";
import { CLogoutConfirmDialog } from "@/components/layout/CLogoutConfirmDialog";
import { CThemeToggle } from "@/components/layout/CThemeToggle";
import { useCAuth } from "@/lib/auth";

export function CGlobalHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const { user } = useCAuth();

  const matches = search
    ? searchItems(user?.role)
        .map((item) => ({ ...item, label: t(item.labelKey) }))
        .filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase()),
        )
        .slice(0, 6)
    : [];

  function navigateTo(href: string) {
    setLocation(href);
    setSearch("");
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (matches[0]) {
      navigateTo(matches[0].href);
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 lg:hidden"
        onClick={onMenuClick}
        aria-label={t("openNavigation")}
      >
        <Menu className="h-4 w-4" />
      </Button>

      <form
        onSubmit={handleSearchSubmit}
        className="relative min-w-0 flex-1 max-w-xl"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("globalSearchPlaceholder")}
          className="h-9 bg-background pl-9 pr-3"
          aria-label={t("globalSearch")}
        />
        {matches.length > 0 && (
          <div className="absolute left-0 right-0 top-11 z-40 overflow-hidden rounded-md border border-border bg-popover shadow-lg">
            {matches.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => navigateTo(item.href)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <CLanguageDropdown />
        <CThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label={t("notifications")}
          title={t("notifications")}
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
        </Button>
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label={t("information")}
          title={t("information")}
        >
          <a
            href="http://localhost:5000/api-docs/"
            target="_blank"
            rel="noreferrer"
          >
            <Info className="h-4 w-4" />
          </a>
        </Button>
        {user ? (
          <CLogoutConfirmDialog>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label={t("logout")}
              title={t("logout")}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </CLogoutConfirmDialog>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setLocation("/login")}
            aria-label={t("login")}
            title={t("login")}
          >
            <LogIn className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
