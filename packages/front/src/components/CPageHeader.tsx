import { useTranslation } from "react-i18next";
import { translateText } from "@/lib/i18n";
import { useCAuth } from "@/lib/auth";

interface IPageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function CPageHeader({ title, description, action }: IPageHeaderProps) {
  const { t } = useTranslation();
  const { canManageData } = useCAuth();

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {translateText(t, title)}
        </h1>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {translateText(t, description)}
          </p>
        )}
      </div>
      {action && canManageData && <div>{action}</div>}
    </div>
  );
}
