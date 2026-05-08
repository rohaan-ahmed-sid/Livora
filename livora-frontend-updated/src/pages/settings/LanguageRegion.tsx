import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";

const languages = [
  { code: "en", label: "English (US)" },
  { code: "ur", label: "اردو" },
  { code: "sd", label: "سنڌي" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "zh", label: "中文" },
];

const units = [
  { id: "mgdl", label: "mg/dL" },
  { id: "mmol", label: "mmol/L" },
];

const LanguageRegion = () => {
  const [lang, setLang] = useState("en");
  const [unit, setUnit] = useState("mgdl");

  const handleLang = (code: string) => {
    setLang(code);
    toast.success("Language updated");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2 pb-4">
      <PageHeader title="Language & Region" subtitle="Set language and glucose units" />

      <div className="bg-card rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Language</h3>
        <div className="space-y-1">
          {languages.map((l) => (
            <button key={l.code} onClick={() => handleLang(l.code)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${lang === l.code ? "bg-primary/10" : "hover:bg-secondary"}`}>
              <span className={`text-sm font-medium ${lang === l.code ? "text-primary" : "text-foreground"}`}>{l.label}</span>
              {lang === l.code && <Check size={16} className="text-primary" />}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Glucose Unit</h3>
        <div className="flex gap-2">
          {units.map((u) => (
            <button key={u.id} onClick={() => setUnit(u.id)} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${unit === u.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {u.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LanguageRegion;
