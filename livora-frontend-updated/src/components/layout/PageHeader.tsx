import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

const PageHeader = ({ title, subtitle, showBack = true, rightAction }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-card hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
      )}
      <div className="flex-1">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {rightAction}
    </div>
  );
};

export default PageHeader;
