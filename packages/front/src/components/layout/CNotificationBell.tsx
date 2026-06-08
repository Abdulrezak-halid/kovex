import { useQueryClient } from "@tanstack/react-query";
import {
  getGetUnreadNotificationCountQueryKey,
  getListNotificationsQueryKey,
  type Notification,
  useGetUnreadNotificationCount,
  useListNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@sme-erp/api-client";
import {
  Bell,
  CheckCheck,
  ClipboardList,
  Package,
  ReceiptText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  notificationTargetPath,
  unreadCountLabel,
} from "@/lib/notifications";

const notificationLimit = 10;

function notificationIcon(notification: Notification) {
  if (notification.type === "low_stock") return Package;
  if (notification.type === "overdue_invoice") return ReceiptText;
  return ClipboardList;
}

function formatNotificationTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CNotificationBell() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const listParams = { limit: notificationLimit };
  const notificationsQuery = useListNotifications(listParams, {
    query: {
      queryKey: getListNotificationsQueryKey(listParams),
      staleTime: 30_000,
      refetchInterval: 60_000,
    },
  });
  const unreadQuery = useGetUnreadNotificationCount({
    query: {
      queryKey: getGetUnreadNotificationCountQueryKey(),
      staleTime: 30_000,
      refetchInterval: 60_000,
    },
  });
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();
  const unreadCount = unreadQuery.data?.count ?? 0;

  function invalidateNotifications() {
    queryClient.invalidateQueries({
      queryKey: getListNotificationsQueryKey(listParams),
    });
    queryClient.invalidateQueries({
      queryKey: getGetUnreadNotificationCountQueryKey(),
    });
  }

  async function handleNotificationClick(notification: Notification) {
    if (!notification.isRead) {
      await markReadMutation.mutateAsync({ id: notification.id });
      invalidateNotifications();
    }
    setLocation(notificationTargetPath(notification));
  }

  async function handleMarkAllRead() {
    await markAllMutation.mutateAsync();
    invalidateNotifications();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label={t("notifications")}
          title={t("notifications")}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
              {unreadCountLabel(unreadCount)}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div>
            <p className="text-sm font-semibold">{t("notifications")}</p>
            <p className="text-xs text-muted-foreground">
              {t("unreadNotifications", { count: unreadCount })}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markAllMutation.isPending}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {t("markAllRead")}
          </Button>
        </div>

        <div className="max-h-96 overflow-y-auto p-1">
          {notificationsQuery.isLoading ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t("loading")}
            </div>
          ) : notificationsQuery.data?.length ? (
            notificationsQuery.data.map((notification) => {
              const Icon = notificationIcon(notification);
              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex w-full gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-muted",
                    !notification.isRead && "bg-primary/5",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground",
                      !notification.isRead && "text-primary",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start gap-2">
                      <span className="line-clamp-1 font-medium">
                        {notification.title}
                      </span>
                      {!notification.isRead && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </span>
                    <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {notification.message}
                    </span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t("noNotifications")}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
