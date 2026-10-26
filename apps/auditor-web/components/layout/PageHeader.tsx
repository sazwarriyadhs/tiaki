import { LucideIcon } from "lucide-react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  action
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <div className="page-eyebrow">
          <Icon />
          {eyebrow}
        </div>

        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {action ? (
        <div className="page-header-actions">{action}</div>
      ) : null}
    </div>
  );
}
