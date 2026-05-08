import { Pill, Syringe, MoreHorizontal } from "lucide-react";
import { OnboardingData } from "@/pages/Onboarding";

interface Props { data: OnboardingData; update: (f: Partial<OnboardingData>) => void; }

const medications = [
  { id: "oral",    label: "Oral",    sublabel: "Metformin, etc.", icon: Pill },
  { id: "insulin", label: "Insulin", sublabel: "Fast/Long acting", icon: Syringe },
  { id: "both",    label: "Both",    sublabel: "Oral + Insulin",   icon: Pill },
  { id: "none",    label: "None",    sublabel: "",                 icon: MoreHorizontal },
];

const StepDiagnosis = ({ data, update }: Props) => {
  return (
    <div className="space-y-6 max-w-xs mx-auto">
      <h1 className="text-xl font-bold text-foreground">Your Diagnosis</h1>

      {/* Year of Diagnosis */}
      <div>
        <label className="text-xs font-medium text-foreground">Year of Diagnosis:</label>
        <div className="flex items-center justify-center gap-4 mt-3">
          <button onClick={() => update({ diagnosis_year: data.diagnosis_year - 1 })}
            className="text-muted-foreground text-lg font-medium hover:text-foreground">
            {data.diagnosis_year - 1}
          </button>
          <span className="text-3xl font-bold text-foreground">{data.diagnosis_year}</span>
          <button onClick={() => update({ diagnosis_year: Math.min(new Date().getFullYear(), data.diagnosis_year + 1) })}
            className="text-muted-foreground text-lg font-medium hover:text-foreground">
            {data.diagnosis_year + 1}
          </button>
        </div>
      </div>

      {/* HbA1c */}
      <div>
        <label className="text-xs font-medium text-foreground">HbA1c (%):</label>
        <div className="mt-2">
          <input type="range" min={4} max={14} step={0.1} value={data.hba1c}
            onChange={(e) => update({ hba1c: parseFloat(e.target.value) })}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary"
            style={{ background: `linear-gradient(to right, hsl(var(--gauge-green)), hsl(var(--gauge-yellow)), hsl(var(--gauge-red)))` }} />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>4%</span>
            <span className="font-semibold text-foreground">{data.hba1c.toFixed(1)}%</span>
            <span>14%</span>
          </div>
        </div>
      </div>

      {/* Medication Type */}
      <div>
        <label className="text-xs font-medium text-foreground">Medication Type:</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {medications.map((med) => (
            <button key={med.id} onClick={() => update({ medication_type: med.id })}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-colors ${
                data.medication_type === med.id ? "border-primary bg-primary/10" : "border-border bg-card"
              }`}>
              <med.icon size={24} className={data.medication_type === med.id ? "text-primary" : "text-muted-foreground"} />
              <span className="text-xs font-medium text-foreground">{med.label}</span>
              {med.sublabel && <span className="text-[10px] text-muted-foreground">{med.sublabel}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepDiagnosis;
