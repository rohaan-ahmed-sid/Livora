import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import StepAboutYou from "@/components/onboarding/StepAboutYou";
import StepDiagnosis from "@/components/onboarding/StepDiagnosis";
import StepLifestyle from "@/components/onboarding/StepLifestyle";
import StepDevices from "@/components/onboarding/StepDevices";
import { useAuth } from "@/contexts/AuthContext";

const steps = ["About You", "Diagnosis", "Lifestyle", "Devices"];

export interface OnboardingData {
  gender: string;
  dob: string;
  height_cm: number | null;
  weight_kg: number | null;
  diagnosis_year: number;
  hba1c: number;
  medication_type: string;
  target_glucose_min: number;
  target_glucose_max: number;
  activity_level: string;
  dietary_preferences: string;   // comma-separated e.g. "halal,vegan"
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState<OnboardingData>({
    gender: "",
    dob: "",
    height_cm: null,
    weight_kg: null,
    diagnosis_year: 2020,
    hba1c: 7.0,
    medication_type: "oral",
    target_glucose_min: 70,
    target_glucose_max: 180,
    activity_level: "moderate",
    dietary_preferences: "",
  });

  const update = (fields: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...fields }));

  const next = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setSaving(true);
      try {
        await updateUser({
          gender:              data.gender || undefined,
          dob:                 data.dob || undefined,
          height_cm:           data.height_cm || undefined,
          weight_kg:           data.weight_kg || undefined,
          diagnosis_year:      data.diagnosis_year,
          hba1c:               data.hba1c,
          medication_type:     data.medication_type,
          target_glucose_min:  data.target_glucose_min,
          target_glucose_max:  data.target_glucose_max,
          activity_level:      data.activity_level,
          dietary_preferences: data.dietary_preferences,
        });
      } catch (_) {
        // Don't block navigation
      } finally {
        setSaving(false);
        navigate("/");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-8 pb-6">
      <div className="flex gap-1.5 mb-8">
        {steps.map((_, i) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            {step === 0 && <StepAboutYou data={data} update={update} />}
            {step === 1 && <StepDiagnosis data={data} update={update} />}
            {step === 2 && <StepLifestyle data={data} update={update} />}
            {step === 3 && <StepDevices />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between pt-4 mt-auto">
        {step === steps.length - 1 ? (
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground">
            Skip for now
          </button>
        ) : <div />}
        <button onClick={next} disabled={saving}
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-70">
          {saving ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
