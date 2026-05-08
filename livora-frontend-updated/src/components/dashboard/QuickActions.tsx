import { Plus, PersonStanding, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/meals")}
          className="flex-1 flex items-center gap-3 bg-accent text-accent-foreground rounded-2xl p-4 font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          Log Meal
        </button>
        <button
          onClick={() => navigate("/manual-entry?tab=activity")}
          className="flex-1 flex items-center gap-3 bg-card border border-border text-foreground rounded-2xl p-4 font-semibold text-sm hover:bg-secondary transition-colors"
        >
          <PersonStanding size={20} />
          Add Activity
        </button>
      </div>
      <button
        onClick={() => navigate("/manual-entry")}
        className="w-full flex items-center gap-3 bg-card border border-border text-foreground rounded-2xl p-4 font-semibold text-sm hover:bg-secondary transition-colors"
      >
        <Pencil size={20} className="text-primary" />
        Manual Entry (Glucose, BP, Sleep)
      </button>
    </div>
  );
};

export default QuickActions;
