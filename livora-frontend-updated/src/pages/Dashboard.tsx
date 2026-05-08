import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import GlucoseGauge from "@/components/dashboard/GlucoseGauge";
import PredictiveCard from "@/components/dashboard/PredictiveCard";
import QuickActions from "@/components/dashboard/QuickActions";
import ActivitySummary from "@/components/dashboard/ActivitySummary";
import { dashboardApi, glucoseApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardData {
  latest_glucose: number | null;
  glucose_trend: "rising" | "stable" | "falling";
  glucose_status: "in-range" | "borderline" | "risk";
  forecast_30min: number | null;
  steps_today: number;
  sleep_last_night: number | null;
  unread_alerts: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    dashboardApi.get()
      .then((res) => setData(res.data))
      .catch(console.error);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const glucoseValue = data?.latest_glucose ?? 0;
  const trend = data?.glucose_trend ?? "stable";
  const status = data?.glucose_status ?? "in-range";
  const forecast = data?.forecast_30min ?? null;
  const steps = data?.steps_today ?? 0;
  const sleep = data?.sleep_last_night ?? 0;
  const sleepGoal = user?.sleep_goal_hours ?? 8;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2">
      <div>
        <h1 className="text-xl font-bold text-foreground">{greeting()} {user?.name ? `👋` : "👋"}</h1>
        <p className="text-sm text-muted-foreground">Here's your health snapshot</p>
      </div>

      {glucoseValue > 0 ? (
        <GlucoseGauge value={Math.round(glucoseValue)} trend={trend} status={status} />
      ) : (
        <div className="bg-card rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px]">
          <p className="text-sm text-muted-foreground">No glucose reading yet</p>
          <p className="text-xs text-muted-foreground mt-1">Log your first reading via Manual Entry</p>
        </div>
      )}

      {forecast !== null ? (
        <PredictiveCard forecast={Math.round(forecast)} minutes={30} />
      ) : (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Forecast available after logging glucose readings</p>
        </div>
      )}

      <QuickActions />
      <ActivitySummary steps={steps} stepsGoal={10000} sleepHours={sleep} sleepGoal={sleepGoal} />
    </motion.div>
  );
};

export default Dashboard;
