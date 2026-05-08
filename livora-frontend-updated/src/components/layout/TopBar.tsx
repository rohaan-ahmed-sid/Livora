import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LivoraLogo from "@/components/brand/LivoraLogo";

const TopBar = () => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <LivoraLogo size="sm" />
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/alerts")}
          className="relative p-2 rounded-full bg-card text-foreground hover:bg-secondary transition-colors"
          aria-label="Alerts"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
