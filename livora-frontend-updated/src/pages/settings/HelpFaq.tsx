import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

const faqs = [
  { q: "How does Livora predict glucose levels?", a: "Livora uses your historical glucose data, meal logs, and activity patterns to forecast trends using AI models. Predictions improve over time as more data is collected." },
  { q: "How do I connect my CGM sensor?", a: "Go to Profile → Connected Devices and tap your CGM device. Follow the on-screen Bluetooth pairing instructions. Currently supported: Dexcom G7, FreeStyle Libre 3." },
  { q: "Is my health data secure?", a: "Yes. All data is encrypted at rest and in transit. We never share your personal health information with third parties without your explicit consent." },
  { q: "How do I share my report with my doctor?", a: "Go to Profile → Share Report. You can generate a PDF summary of your glucose, meals, and activity data for any date range." },
  { q: "What does 'Time in Range' mean?", a: "Time in Range measures the percentage of time your glucose stays between 70-180 mg/dL. A higher percentage indicates better glucose management." },
  { q: "How do I delete my account?", a: "Go to Settings → Delete Account. This action is irreversible and will permanently remove all your data." },
];

const HelpFaq = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2 pb-4">
      <PageHeader title="Help & FAQ" subtitle="Frequently asked questions" />

      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-card rounded-2xl overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
              <span className="text-sm font-medium text-foreground pr-3">{faq.q}</span>
              <ChevronDown size={16} className={`text-muted-foreground shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <p className="text-xs text-muted-foreground leading-relaxed px-4 pb-4">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default HelpFaq;
