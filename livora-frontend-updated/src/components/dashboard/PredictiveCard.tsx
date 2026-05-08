import { TrendingUp, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PredictiveCardProps {
  forecast: number;
  minutes: number;
}

const PredictiveCard = ({ forecast, minutes }: PredictiveCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <TrendingUp size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Forecast: {forecast} mg/dL
          </p>
          <p className="text-xs text-muted-foreground">in {minutes} mins</p>
        </div>
      </div>
      <button
        onClick={() => navigate("/trends")}
        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        View Graph
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

export default PredictiveCard;
