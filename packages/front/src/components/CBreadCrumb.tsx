import { Fragment } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { navItems } from "@/components/layout/CNavigationConfig";
import { translateText } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type IBreadcrumbEntry = {
  label: string;
  href?: string;
  isTranslationKey?: boolean;
};

const fallbackLabels: Record<string, IBreadcrumbEntry[]> = {
  "/": [{ label: "dashboard", isTranslationKey: true }],
  "/forbidden": [{ label: "Access Restricted" }],
};

function labelFromSegment(segment: string) {
  return segment
    .split("-")
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

function entriesFromNavigation(pathname: string): IBreadcrumbEntry[] | null {
  for (const item of navItems) {
    if (item.href === pathname) {
      return [{ label: item.labelKey, isTranslationKey: true }];
    }

    const child = item.children?.find((child) => child.href === pathname);
    if (child) {
      return [
        { label: item.labelKey, isTranslationKey: true },
        { label: child.labelKey, href: child.href, isTranslationKey: true },
      ];
    }
  }

  if (pathname.startsWith("/planning/projects/")) {
    return [
      { label: "planning", isTranslationKey: true },
      { label: "projects", href: "/planning/projects", isTranslationKey: true },
      { label: "Project Detail" },
    ];
  }

  return null;
}

function entriesFromPath(pathname: string): IBreadcrumbEntry[] {
  const fallback = fallbackLabels[pathname];
  if (fallback) return fallback;

  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) return fallbackLabels["/"];

  return segments.map((segment, index) => ({
    label: labelFromSegment(segment),
    href:
      index < segments.length - 1
        ? `/${segments.slice(0, index + 1).join("/")}`
        : undefined,
  }));
}

export function CBreadCrumb({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [location] = useLocation();
  const pathname = location.split("?")[0] || "/";
  const entries = entriesFromNavigation(pathname) ?? entriesFromPath(pathname);

  return (
    <Breadcrumb className={cn("text-xs", className)}>
      <BreadcrumbList>
        {entries.map((entry, index) => {
          const isLast = index === entries.length - 1;
          const label = entry.isTranslationKey
            ? t(entry.label)
            : translateText(t, entry.label);

          return (
            <Fragment key={`${entry.label}-${index}`}>
              <BreadcrumbItem>
                {isLast || !entry.href ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={entry.href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
