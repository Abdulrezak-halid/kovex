interface IPageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function CPageHeader({ title, description, action }: IPageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
