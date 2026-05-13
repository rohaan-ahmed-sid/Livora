import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, TrendingDown, TrendingUp, Clock, Check,
  Stethoscope, ShieldAlert, Bell
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

type AlertType = "critical" | "warning" | "clinician" | "info";

interface Alert {
  id: number;
  type: AlertType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: typeof AlertTriangle;
  requiresClinician?: boolean;
  glucoseValue?: number;
  ppgrValue?: number;
}

const initialAlerts: Alert[] = [
  {
    id: 1,
    type: "critical",
    title: "Clinician Review Required — Critical Glucose",
    description: "Glucose reading of 275 mg/dL is critically high. This has been flagged for clinician review. Please contact your healthcare provider immediately.",
    time: "Just now",
    read: false,
    icon: ShieldAlert,
    requiresClinician: true,
    glucoseValue: 275,
  },
  {
    id: 2,
    type: "clinician",
    title: "Clinician Review Required — High PPGR Forecast",
    description: "Predicted postprandial glucose response of 68.4 mg/dL exceeds the safe threshold (60 mg/dL) for your last logged meal. Clinician review has been flagged.",
    time: "15 mins ago",
    read: false,
    icon: Stethoscope,
    requiresClinician: true,
    ppgrValue: 68.4,
  },
  {
    id: 3,
    type: "critical",
    title: "Hypoglycemia Risk Detected",
    description: "Glucose forecast predicts a drop below 70 mg/dL in the next 30 minutes. Consume fast-acting carbohydrates immediately and monitor closely.",
    time: "1 hour ago",
    read: false,
    icon: TrendingDown,
    glucoseValue: 68,
  },
  {
    id: 4,
    type: "warning",
    title: "Post-Meal Spike Detected",
    description: "Glucose exceeded 180 mg/dL after your last logged meal. Consider a lighter carbohydrate option next time.",
    time: "3 hours ago",
    read: false,
    icon: TrendingUp,
    glucoseValue: 195,
  },
  {
    id: 5,
    type: "clinician",
    title: "High Fasting Glucose — Clinician Advisory",
    description: "Fasting glucose reading of 148 mg/dL is above the recommended range (70–100 mg/dL). Your clinician has been notified for review.",
    time: "Yesterday",
    read: true,
    icon: Stethoscope,
    requiresClinician: true,
    glucoseValue: 148,
  },
  {
    id: 6,
    type: "info",
    title: "Sensor Calibration Reminder",
    description: "Your CGM sensor is due for calibration. Please calibrate within the next 2 hours to maintain reading accuracy.",
    time: "2 days ago",
    read: true,
    icon: Clock,
  },
];

const typeStyles: Record<AlertType, string> = {
  critical: "border-gauge-red/30 bg-gauge-red/5",
  clinician: "border-amber-500/30 bg-amber-500/5",
  warning: "border-gauge-yellow/30 bg-gauge-yellow/5",
  info: "border-border bg-card",
};

const iconStyles: Record<AlertType, string> = {
  critical: "bg-gauge-red/15 text-gauge-red",
  clinician: "bg-amber-500/15 text-amber-500",
  warning: "bg-gauge-yellow/15 text-gauge-yellow",
  info: "bg-primary/15 text-primary",
};

const typeLabel: Record<AlertType, string> = {
  critical: "CRITICAL",
  clinician: "CLINICIAN REVIEW",
  warning: "WARNING",
  info: "INFO",
};

const typeLabelStyles: Record<AlertType, string> = {
  critical: "bg-gauge-red/15 text-gauge-red",
  clinician: "bg-amber-500/15 text-amber-500",
  warning: "bg-gauge-yellow/15 text-gauge-yellow",
  info: "bg-primary/15 text-primary",
};

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [filter, setFilter] = useState<"all" | "unread" | "clinician">("all");

  const markAllRead = () => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  const markRead = (id: number) => setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));

  const filtered = alerts.filter((a) => {
    if (filter === "unread") return !a.read;
    if (filter === "clinician") return a.requiresClinician;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.read).length;
  const clinicianCount = alerts.filter((a) => a.requiresClinician && !a.read).length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2">
      <PageHeader
        title="Alerts"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        rightAction={
          <button onClick={markAllRead}
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
            <Check size={12} /> Mark all read
          </button>
        }
      />

      {/* Clinician banner if any unread clinician alerts */}
      <AnimatePresence>
        {clinicianCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex gap-3 items-start">
            <ShieldAlert size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-500 mb-0.5">
                {clinicianCount} Clinician Review{clinicianCount !== 1 ? "s" : ""} Pending
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                One or more of your recent readings have been automatically flagged for clinician review
                based on predicted PPGR values or glucose readings outside safe thresholds.
                Please contact your healthcare provider.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "unread", "clinician"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-colors capitalize ${
              filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"
            }`}>
            {f === "clinician" ? "🩺 Clinician" : f === "unread" ? `Unread (${unreadCount})` : "All"}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Bell size={32} className="opacity-30" />
              <p className="text-sm">No alerts in this category</p>
            </motion.div>
          )}
          {filtered.map((alert) => (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={() => markRead(alert.id)}
              className={`rounded-2xl border p-4 cursor-pointer transition-opacity ${typeStyles[alert.type]} ${
                !alert.read ? "ring-1 ring-primary/20" : "opacity-75"
              }`}
            >
              <div className="flex gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconStyles[alert.type]}`}>
                  <alert.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${typeLabelStyles[alert.type]}`}>
                        {typeLabel[alert.type]}
                      </span>
                      {alert.requiresClinician && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider bg-amber-500/15 text-amber-500">
                          Action Required
                        </span>
                      )}
                    </div>
                    {!alert.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-tight">{alert.title}</h3>
                  {(alert.glucoseValue || alert.ppgrValue) && (
                    <div className="flex gap-3 mt-1.5 mb-1.5">
                      {alert.glucoseValue && (
                        <span className="text-[10px] font-semibold bg-secondary px-2 py-0.5 rounded-lg text-foreground">
                          Glucose: {alert.glucoseValue} mg/dL
                        </span>
                      )}
                      {alert.ppgrValue && (
                        <span className="text-[10px] font-semibold bg-secondary px-2 py-0.5 rounded-lg text-foreground">
                          PPGR: +{alert.ppgrValue} mg/dL
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed">{alert.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{alert.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Alerts;
