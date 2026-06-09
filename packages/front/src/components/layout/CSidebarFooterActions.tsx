import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bug, History, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CLogoutConfirmDialog } from "@/components/layout/CLogoutConfirmDialog";
import { useCAuth } from "@/lib/auth";

type SidebarAction = "issueReportRequest" | "changelog" | "myProfile";

const actionContent: Record<
  SidebarAction,
  { titleKey: string; descriptionKey: string }
> = {
  issueReportRequest: {
    titleKey: "issueReportRequest",
    descriptionKey: "issueReportRequestDescription",
  },
  changelog: {
    titleKey: "changelog",
    descriptionKey: "changelogDescription",
  },
  myProfile: {
    titleKey: "myProfile",
    descriptionKey: "myProfileDescription",
  },
};

export function CSidebarFooterActions({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useCAuth();
  const [activeAction, setActiveAction] = useState<SidebarAction | null>(null);
  const activeContent = activeAction ? actionContent[activeAction] : null;

  return (
    <div className="border-t border-sidebar-border px-3 py-3">
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-start gap-2 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => setActiveAction("issueReportRequest")}
        >
          <Bug className="h-3.5 w-3.5" />
          {t("issueReportRequest")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-start gap-2 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => setActiveAction("changelog")}
        >
          <History className="h-3.5 w-3.5" />
          {t("changelog")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-start gap-2 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => setActiveAction("myProfile")}
        >
          <User className="h-3.5 w-3.5" />
          {t("myProfile")}
        </Button>
        <CLogoutConfirmDialog onLogout={onNavigate}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start gap-2 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t("logout")}
          </Button>
        </CLogoutConfirmDialog>
      </div>

      <Dialog
        open={activeAction != null}
        onOpenChange={(open) => {
          if (!open) setActiveAction(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activeContent ? t(activeContent.titleKey) : ""}
            </DialogTitle>
            <DialogDescription>
              {activeContent ? t(activeContent.descriptionKey) : ""}
            </DialogDescription>
          </DialogHeader>
          {activeAction === "myProfile" && user ? (
            <div className="rounded-md border border-border bg-muted/30 p-4 text-sm">
              <dl className="grid gap-3">
                <div>
                  <dt className="text-xs font-medium uppercase text-muted-foreground">
                    {t("name")}
                  </dt>
                  <dd className="mt-1 font-medium">{user.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-muted-foreground">
                    {t("email")}
                  </dt>
                  <dd className="mt-1">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-muted-foreground">
                    {t("role")}
                  </dt>
                  <dd className="mt-1 capitalize">{user.role}</dd>
                </div>
              </dl>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveAction(null)}>
              {t("ok")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
