import { useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/layout/PageHeader";

interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onChange: () => void;
}

const ToggleRow = ({ label, description, value, onChange }: ToggleRowProps) => (
  <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
    <div className="flex-1">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground">{description}</p>
    </div>
    <button onClick={onChange} className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${value ? "bg-primary" : "bg-muted-foreground/30"}`}>
      <div className={`w-4 h-4 rounded-full bg-card transition-transform ${value ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  </div>
);

const Notifications = () => {
  const [settings, setSettings] = useState({
    glucoseAlerts: true,
    mealReminders: true,
    activityReminders: false,
    medicationReminders: true,
    weeklyReport: true,
    sounds: true,
    vibration: true,
  });

  const toggle = (key: keyof typeof settings) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2 pb-4">
      <PageHeader title="Notifications" subtitle="Manage alerts & reminders" />

      <div className="bg-card rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Health Alerts</h3>
        <div className="space-y-2">
          <ToggleRow label="Glucose Alerts" description="Hypo/hyper warnings" value={settings.glucoseAlerts} onChange={() => toggle("glucoseAlerts")} />
          <ToggleRow label="Meal Reminders" description="Remind to log meals" value={settings.mealReminders} onChange={() => toggle("mealReminders")} />
          <ToggleRow label="Activity Reminders" description="Daily movement goals" value={settings.activityReminders} onChange={() => toggle("activityReminders")} />
          <ToggleRow label="Medication Reminders" description="Dosage schedule alerts" value={settings.medicationReminders} onChange={() => toggle("medicationReminders")} />
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">General</h3>
        <div className="space-y-2">
          <ToggleRow label="Weekly Report" description="Summary every Sunday" value={settings.weeklyReport} onChange={() => toggle("weeklyReport")} />
          <ToggleRow label="Sounds" description="Notification sounds" value={settings.sounds} onChange={() => toggle("sounds")} />
          <ToggleRow label="Vibration" description="Haptic feedback" value={settings.vibration} onChange={() => toggle("vibration")} />
        </div>
      </div>
    </motion.div>
  );
};

export default Notifications;
