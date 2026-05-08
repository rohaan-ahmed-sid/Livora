import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, TrendingUp, Check, Loader2, Bell } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useState, useEffect } from "react";
import { alertsApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface Alert {
  id: number;
  alert_type: "critical" | "warning" | "info";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const typeStyles = {
  critical: "border-gauge-red/30 bg-gauge-red/5",
  warning: "border-gauge-yellow/30 bg-gauge-yellow/5",
  info: "border-border bg-card",
};

const iconStyles = {
  critical: "bg-gauge-red/15 text-gauge-red",
  warning: "bg-gauge-yellow/15 text-gauge-yellow",
  info: "bg-primary/15 text-primary",
};

const typeIcons = {
  critical: TrendingDown,
  warning: TrendingUp,
  info: AlertTriangle,
};

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = () => {
    alertsApi.list()
      .then((res) => setAlerts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleMarkRead = async (id: number) => {
    await alertsApi.markRead(id).catch(console.error);
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, is_read: true } : a));
  };

  const handleMarkAllRead = async () => {
    await alertsApi.markAllRead().catch(console.error);
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
  };

  const unread = alerts.filter((a) => !a.is_read).length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2">
      <PageHeader
        title="Alerts"
        subtitle={`${unread} unread notification${unread !== 1 ? "s" : ""}`}
        rightAction={
          unread > 0 ? (
            <button onClick={handleMarkAllRead} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              <Check size={12} /> Mark all read
            </button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-3 text-muted-foreground">
          <Bell size={32} className="opacity-30" />
          <p className="text-sm">No alerts yet</p>
          <p className="text-xs">Alerts appear when glucose goes out of range</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = typeIcons[alert.alert_type];
            return (
              <div key={alert.id} onClick={() => !alert.is_read && handleMarkRead(alert.id)}
                className={`rounded-2xl border p-4 cursor-pointer transition-opacity ${typeStyles[alert.alert_type]} ${!alert.is_read ? "ring-1 ring-primary/20" : "opacity-75"}`}>
                <div className="flex gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconStyles[alert.alert_type]}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{alert.title}</h3>
                      {!alert.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Alerts;
