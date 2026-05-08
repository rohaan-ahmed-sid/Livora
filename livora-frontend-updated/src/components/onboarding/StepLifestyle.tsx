import { Armchair, Dumbbell, Flame } from "lucide-react";
import { OnboardingData } from "@/pages/Onboarding";

interface Props { data: OnboardingData; update: (f: Partial<OnboardingData>) => void; }

const activityLevels = [
  { id: "low",      label: "Little or no exercise",          icon: Armchair },
  { id: "moderate", label: "Exercise 1-3 times/week",        icon: Dumbbell },
  { id: "high",     label: "Intense exercise 4+ times/week", icon: Flame },
];

const dietaryOptions = [
  { id: "halal",        label: "Halal",        emoji: "🕌" },
  { id: "vegetarian",   label: "Vegetarian",   emoji: "🥗" },
  { id: "vegan",        label: "Vegan",        emoji: "🌱" },
  { id: "gluten-free",  label: "Gluten-Free",  emoji: "🌾" },
  { id: "dairy-free",   label: "Dairy-Free",   emoji: "🥛" },
  { id: "nut-free",     label: "Nut-Free",     emoji: "🥜" },
];

const StepLifestyle = ({ data, update }: Props) => {
  const selectedPrefs: string[] = data.dietary_preferences
    ? data.dietary_preferences.split(",").filter(Boolean)
    : [];

  const togglePref = (id: string) => {
    const updated = selectedPrefs.includes(id)
      ? selectedPrefs.filter((p) => p !== id)
      : [...selectedPrefs, id];
    update({ dietary_preferences: updated.join(",") });
  };

  return (
    <div className="space-y-6 max-w-xs mx-auto">
      <h1 className="text-xl font-bold text-foreground">Lifestyle & Preferences</h1>

      {/* Target Glucose Range */}
      <div>
        <label className="text-xs font-medium text-foreground">Target Glucose Range (mg/dL):</label>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-[10px] text-muted-foreground">Min</span>
            <input type="number" value={data.target_glucose_min}
              onChange={(e) => update({ target_glucose_min: parseFloat(e.target.value) || 70 })}
              className="flex-1 bg-secondary text-foreground text-sm rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-primary text-center" />
          </div>
          <span className="text-muted-foreground">–</span>
          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-[10px] text-muted-foreground">Max</span>
            <input type="number" value={data.target_glucose_max}
              onChange={(e) => update({ target_glucose_max: parseFloat(e.target.value) || 180 })}
              className="flex-1 bg-secondary text-foreground text-sm rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-primary text-center" />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">*Range suggested by your physician. Default: 70–180.</p>
      </div>

      {/* Dietary Preferences */}
      <div>
        <label className="text-xs font-medium text-foreground">Dietary Preferences:</label>
        <p className="text-[10px] text-muted-foreground mb-2 mt-0.5">
          Select all that apply — food recommendations will respect these.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {dietaryOptions.map((opt) => {
            const selected = selectedPrefs.includes(opt.id);
            return (
              <button key={opt.id} onClick={() => togglePref(opt.id)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border text-xs font-medium transition-colors ${
                  selected ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
                }`}>
                <span className="text-lg">{opt.emoji}</span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity Level */}
      <div>
        <label className="text-xs font-medium text-foreground">Activity level:</label>
        <div className="space-y-2 mt-2">
          {activityLevels.map((a) => (
            <button key={a.id} onClick={() => update({ activity_level: a.id })}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
                data.activity_level === a.id ? "border-primary bg-primary/10" : "border-border bg-card"
              }`}>
              <a.icon size={20} className={data.activity_level === a.id ? "text-primary" : "text-muted-foreground"} />
              <span className="text-xs font-medium text-foreground">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepLifestyle;
