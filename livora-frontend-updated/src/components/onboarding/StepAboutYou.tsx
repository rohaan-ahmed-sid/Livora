import { User, UserRound } from "lucide-react";
import { OnboardingData } from "@/pages/Onboarding";

interface Props { data: OnboardingData; update: (f: Partial<OnboardingData>) => void; }

const StepAboutYou = ({ data, update }: Props) => {
  const setDobPart = (part: "mm" | "dd" | "yyyy", val: string) => {
    const parts = data.dob ? data.dob.split("-") : ["", "", ""];
    const [yyyy, mm, dd] = parts.length === 3 ? parts : ["", "", ""];
    const next = { yyyy, mm, dd, [part]: val };
    if (next.yyyy && next.mm && next.dd) {
      update({ dob: `${next.yyyy}-${next.mm}-${next.dd}` });
    } else {
      update({ dob: `${next.yyyy}-${next.mm}-${next.dd}` });
    }
  };

  const dobParts = data.dob ? data.dob.split("-") : ["", "", ""];
  const [yyyy, mm, dd] = dobParts;

  return (
    <div className="space-y-6 max-w-xs mx-auto">
      <h1 className="text-xl font-bold text-foreground">Tell Us About You</h1>

      {/* Gender */}
      <div className="flex gap-4 justify-center">
        {(["male", "female"] as const).map((g) => (
          <button key={g} onClick={() => update({ gender: g })}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-colors w-28 ${
              data.gender === g ? "border-primary bg-primary/10" : "border-border bg-card"
            }`}>
            {g === "male"
              ? <User size={32} className={data.gender === g ? "text-primary" : "text-muted-foreground"} />
              : <UserRound size={32} className={data.gender === g ? "text-primary" : "text-muted-foreground"} />}
            <span className="text-xs font-medium text-foreground capitalize">{g}</span>
          </button>
        ))}
      </div>

      {/* DOB */}
      <div>
        <label className="text-xs font-medium text-foreground">Date of Birth:</label>
        <div className="flex gap-2 mt-1.5">
          <select value={mm} onChange={(e) => setDobPart("mm", e.target.value)}
            className="flex-1 bg-secondary text-foreground text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-primary appearance-none">
            <option value="">MM</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={String(i + 1).padStart(2, "0")}>{String(i + 1).padStart(2, "0")}</option>
            ))}
          </select>
          <select value={dd} onChange={(e) => setDobPart("dd", e.target.value)}
            className="flex-1 bg-secondary text-foreground text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-primary appearance-none">
            <option value="">DD</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i} value={String(i + 1).padStart(2, "0")}>{String(i + 1).padStart(2, "0")}</option>
            ))}
          </select>
          <select value={yyyy} onChange={(e) => setDobPart("yyyy", e.target.value)}
            className="flex-1 bg-secondary text-foreground text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-primary appearance-none">
            <option value="">YYYY</option>
            {Array.from({ length: 80 }, (_, i) => {
              const year = 2025 - i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">*Accurate Date of Birth required to determine age.</p>
      </div>

      {/* Height */}
      <div>
        <label className="text-xs font-medium text-foreground">Height (cm):</label>
        <input type="number" value={data.height_cm ?? ""} onChange={(e) => update({ height_cm: parseFloat(e.target.value) || null })}
          placeholder="e.g. 175"
          className="w-full mt-1.5 bg-secondary text-foreground text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-primary" />
        <p className="text-[10px] text-muted-foreground mt-1">*Measure without footwear.</p>
      </div>

      {/* Weight */}
      <div>
        <label className="text-xs font-medium text-foreground">Weight (kg):</label>
        <input type="number" value={data.weight_kg ?? ""} onChange={(e) => update({ weight_kg: parseFloat(e.target.value) || null })}
          placeholder="e.g. 70"
          className="w-full mt-1.5 bg-secondary text-foreground text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-primary" />
        <p className="text-[10px] text-muted-foreground mt-1">*Measure without heavy clothing.</p>
      </div>
    </div>
  );
};

export default StepAboutYou;
