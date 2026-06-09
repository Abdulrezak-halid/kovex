import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCAuth } from "@/lib/auth";

export function CLogoutConfirmDialog({
  children,
  onLogout,
}: {
  children: ReactNode;
  onLogout?: () => void;
}) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { logout } = useCAuth();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      onLogout?.();
      setLocation("/login");
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("logoutConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("logoutConfirmDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout}>
            {t("logout")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
