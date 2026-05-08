import { Footprints, Moon } from "lucide-react";

interface ActivitySummaryProps {
  steps: number;
  stepsGoal: number;
  sleepHours: number;
  sleepGoal: number;
}

const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full h-2 rounded-full bg-border overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

const ActivitySummary = ({ steps, stepsGoal, sleepHours, sleepGoal }: ActivitySummaryProps) => {
  return (
    <div className="bg-card rounded-2xl p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Daily Activity</h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Footprints size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-foreground font-medium">Steps</span>
              <span className="text-muted-foreground">{steps.toLocaleString()} / {stepsGoal.toLocaleString()}</span>
            </div>
            <ProgressBar value={steps} max={stepsGoal} color="bg-primary" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
            <Moon size={16} className="text-accent" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-foreground font-medium">Sleep</span>
              <span className="text-muted-foreground">{sleepHours}h / {sleepGoal}h</span>
            </div>
            <ProgressBar value={sleepHours} max={sleepGoal} color="bg-accent" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitySummary;
