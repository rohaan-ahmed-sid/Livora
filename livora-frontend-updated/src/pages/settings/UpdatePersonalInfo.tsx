import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";

const dietaryOptions = [
  { id: "halal",       label: "Halal",       emoji: "🕌" },
  { id: "vegetarian",  label: "Vegetarian",  emoji: "🥗" },
  { id: "vegan",       label: "Vegan",       emoji: "🌱" },
  { id: "gluten-free", label: "Gluten-Free", emoji: "🌾" },
  { id: "dairy-free",  label: "Dairy-Free",  emoji: "🥛" },
  { id: "nut-free",    label: "Nut-Free",    emoji: "🥜" },
];

const UpdatePersonalInfo = () => {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const [name, setName]               = useState("");
  const [dob, setDob]                 = useState("");
  const [gender, setGender]           = useState("male");
  const [height, setHeight]           = useState("");
  const [weight, setWeight]           = useState("");
  const [diagYear, setDiagYear]       = useState("");
  const [hba1c, setHba1c]             = useState("");
  const [medication, setMedication]   = useState("oral");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [glucoseMin, setGlucoseMin]   = useState("");
  const [glucoseMax, setGlucoseMax]   = useState("");
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setDob(user.dob ?? "");
    setGender(user.gender ?? "male");
    setHeight(user.height_cm ? String(user.height_cm) : "");
    setWeight(user.weight_kg ? String(user.weight_kg) : "");
    setDiagYear(user.diagnosis_year ? String(user.diagnosis_year) : "");
    setHba1c(user.hba1c ? String(user.hba1c) : "");
    setMedication(user.medication_type ?? "oral");
    setActivityLevel(user.activity_level ?? "moderate");
    setGlucoseMin(user.target_glucose_min ? String(user.target_glucose_min) : "70");
    setGlucoseMax(user.target_glucose_max ? String(user.target_glucose_max) : "180");
    setDietaryPrefs(
      user.dietary_preferences
        ? user.dietary_preferences.split(",").filter(Boolean)
        : []
    );
  }, [user]);

  const togglePref = (id: string) => {
    setDietaryPrefs((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser({
        name,
        dob: dob || undefined,
        gender,
        height_cm: parseFloat(height) || undefined,
        weight_kg: parseFloat(weight) || undefined,
        diagnosis_year: parseInt(diagYear) || undefined,
        hba1c: parseFloat(hba1c) || undefined,
        medication_type: medication,
        activity_level: activityLevel,
        target_glucose_min: parseFloat(glucoseMin) || 70,
        target_glucose_max: parseFloat(glucoseMax) || 180,
        dietary_preferences: dietaryPrefs.join(","),
      });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 pt-2 pb-4"
    >
      <PageHeader title="Personal Info" subtitle="Update your details" />

      {/* Basic Info */}
      <div className="bg-card rounded-2xl p-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Date of Birth</label>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Gender</label>
          <div className="flex gap-2">
            {["male", "female", "other"].map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  gender === g
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="175"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Diabetes Info */}
      <div className="bg-card rounded-2xl p-4 space-y-4">
        <p className="text-sm font-semibold text-foreground">Diabetes Info</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Diagnosis Year</label>
            <input
              type="number"
              value={diagYear}
              onChange={(e) => setDiagYear(e.target.value)}
              placeholder="2020"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">HbA1c (%)</label>
            <input
              type="number"
              step="0.1"
              value={hba1c}
              onChange={(e) => setHba1c(e.target.value)}
              placeholder="7.0"
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Medication</label>
          <div className="grid grid-cols-4 gap-2">
            {["oral", "insulin", "both", "none"].map((m) => (
              <button
                key={m}
                onClick={() => setMedication(m)}
                className={`py-2 rounded-xl text-xs font-medium border transition-colors capitalize ${
                  medication === m
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-muted-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Activity Level</label>
          <div className="grid grid-cols-3 gap-2">
            {["low", "moderate", "high"].map((a) => (
              <button
                key={a}
                onClick={() => setActivityLevel(a)}
                className={`py-2 rounded-xl text-xs font-medium border transition-colors capitalize ${
                  activityLevel === a
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-muted-foreground"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Target Glucose Range (mg/dL)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={glucoseMin}
              onChange={(e) => setGlucoseMin(e.target.value)}
              placeholder="70"
              className={`${inputClass} text-center`}
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="number"
              value={glucoseMax}
              onChange={(e) => setGlucoseMax(e.target.value)}
              placeholder="180"
              className={`${inputClass} text-center`}
            />
          </div>
        </div>
      </div>

      {/* Dietary Preferences */}
      <div className="bg-card rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Dietary Preferences</p>
        <p className="text-xs text-muted-foreground">
          Food recommendations will only show items matching your selection.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {dietaryOptions.map((opt) => {
            const selected = dietaryPrefs.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => togglePref(opt.id)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border text-xs font-medium transition-colors ${
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-muted-foreground"
                }`}
              >
                <span className="text-lg">{opt.emoji}</span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {saving && <Loader2 size={16} className="animate-spin" />}
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </motion.div>
  );
};

export default UpdatePersonalInfo;
