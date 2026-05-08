import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Smartphone, Mail } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";

const methods = [
  { id: "sms", label: "SMS", description: "Receive codes via text message", icon: Smartphone },
  { id: "email", label: "Email", description: "Receive codes via email", icon: Mail },
];

const TwoFactorAuth = () => {
  const [enabled, setEnabled] = useState(false);
  const [method, setMethod] = useState("sms");

  const handleToggle = () => {
    setEnabled(!enabled);
    toast.success(enabled ? "2FA disabled" : "2FA enabled successfully");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2 pb-4">
      <PageHeader title="Two-Factor Auth" subtitle="Add extra security to your account" />

      <div className="bg-card rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <ShieldCheck size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Two-Factor Authentication</p>
              <p className="text-[10px] text-muted-foreground">{enabled ? "Enabled" : "Disabled"}</p>
            </div>
          </div>
          <button onClick={handleToggle} className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${enabled ? "bg-primary" : "bg-muted-foreground/30"}`}>
            <div className={`w-5 h-5 rounded-full bg-card transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {enabled && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verification Method</p>
          {methods.map((m) => (
            <button key={m.id} onClick={() => setMethod(m.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${method === m.id ? "bg-primary/10 border border-primary/30" : "bg-secondary"}`}>
              <m.icon size={18} className={method === m.id ? "text-primary" : "text-muted-foreground"} />
              <div className="text-left flex-1">
                <p className={`text-sm font-medium ${method === m.id ? "text-primary" : "text-foreground"}`}>{m.label}</p>
                <p className="text-[10px] text-muted-foreground">{m.description}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${method === m.id ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                {method === m.id && <div className="w-full h-full rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" /></div>}
              </div>
            </button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default TwoFactorAuth;
