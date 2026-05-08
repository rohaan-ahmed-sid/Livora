import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isSameDay, startOfDay, endOfDay } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, Utensils, Activity, Droplets, Moon, Footprints, Loader2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { glucoseApi, mealsApi, activityApi, sleepApi } from "@/lib/api";

type Tab = "glucose" | "meals" | "activity";

const impactColors: Record<string, string> = {
  LOW:      "bg-gauge-green/15 text-gauge-green",
  MODERATE: "bg-gauge-yellow/15 text-gauge-yellow",
  HIGH:     "bg-gauge-red/15 text-gauge-red",
};

const activityIcons: Record<string, any> = {
  walking: Footprints, running: Footprints, cycling: Activity,
  strength: Activity, swimming: Activity, yoga: Activity,
};

const History = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<Tab>("glucose");
  const [loading, setLoading] = useState(false);

  const [glucoseData, setGlucoseData]   = useState<any[]>([]);
  const [mealsData, setMealsData]       = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [sleepData, setSleepData]       = useState<any | null>(null);

  const today = new Date();

  const navigateDay = (dir: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + dir);
    if (next <= today) setSelectedDate(next);
  };

  useEffect(() => {
    setLoading(true);
    const dayStart = startOfDay(selectedDate).toISOString();
    const dayEnd   = endOfDay(selectedDate).toISOString();

    // Fetch all data for selected date (fetch 90 days, then filter client-side)
    Promise.all([
      glucoseApi.list(90),
      mealsApi.list(90),
      activityApi.list(90),
      sleepApi.list(90),
    ]).then(([gRes, mRes, aRes, sRes]) => {
      const inDay = (dateStr: string) => {
        const d = new Date(dateStr);
        return d >= startOfDay(selectedDate) && d <= endOfDay(selectedDate);
      };

      setGlucoseData((gRes.data as any[]).filter((r) => inDay(r.recorded_at)));
      setMealsData((mRes.data as any[]).filter((r) => inDay(r.recorded_at)));
      setActivityData((aRes.data as any[]).filter((r) => inDay(r.recorded_at)));

      const sleeps = (sRes.data as any[]).filter((r) => inDay(r.recorded_at));
      setSleepData(sleeps.length > 0 ? sleeps[0] : null);
    }).catch(console.error).finally(() => setLoading(false));
  }, [selectedDate]);

  // Stats
  const glucoseValues = glucoseData.map((r) => r.value);
  const avg  = glucoseValues.length ? Math.round(glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length) : null;
  const min  = glucoseValues.length ? Math.round(Math.min(...glucoseValues)) : null;
  const max  = glucoseValues.length ? Math.round(Math.max(...glucoseValues)) : null;
  const inRange = glucoseValues.length
    ? Math.round((glucoseValues.filter((v) => v >= 70 && v <= 180).length / glucoseValues.length) * 100)
    : null;

  const tabs = [
    { id: "glucose" as Tab,  label: "Glucose",  icon: Droplets },
    { id: "meals" as Tab,    label: "Meals",    icon: Utensils },
    { id: "activity" as Tab, label: "Activity", icon: Activity },
  ];

  const isEmpty = !loading && glucoseData.length === 0 && mealsData.length === 0 && activityData.length === 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2">
      <PageHeader title="History" subtitle="Review your past health data" />

      {/* Date Selector */}
      <div className="flex items-center justify-between bg-card rounded-2xl p-3 border border-border">
        <button onClick={() => navigateDay(-1)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <ChevronLeft size={18} className="text-foreground" />
        </button>

        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-secondary transition-colors">
              <CalendarIcon size={16} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {isSameDay(selectedDate, today) ? "Today" : format(selectedDate, "MMM d, yyyy")}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar mode="single" selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              disabled={(date) => date > today}
              initialFocus className={cn("p-3 pointer-events-auto")} />
          </PopoverContent>
        </Popover>

        <button onClick={() => navigateDay(1)} disabled={isSameDay(selectedDate, today)}
          className="p-2 rounded-xl hover:bg-secondary transition-colors disabled:opacity-30">
          <ChevronRight size={18} className="text-foreground" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center py-12 gap-2 text-muted-foreground">
          <p className="text-sm">No data for {format(selectedDate, "MMM d, yyyy")}</p>
          <p className="text-xs">Log entries via Manual Entry or Meals</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card rounded-2xl p-3 border border-border text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Avg Glucose</p>
              <p className="text-lg font-bold text-foreground mt-1">{avg ?? "—"}</p>
              <p className="text-[10px] text-muted-foreground">mg/dL</p>
            </div>
            <div className="bg-card rounded-2xl p-3 border border-border text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">In Range</p>
              <p className="text-lg font-bold text-primary mt-1">{inRange !== null ? `${inRange}%` : "—"}</p>
              <p className="text-[10px] text-muted-foreground">70–180</p>
            </div>
            <div className="bg-card rounded-2xl p-3 border border-border text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Sleep</p>
              <p className="text-lg font-bold text-foreground mt-1">{sleepData ? `${sleepData.hours}h` : "—"}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{sleepData?.quality ?? ""}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-card rounded-2xl p-1 border border-border">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                <tab.icon size={14} />{tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab + selectedDate.toDateString()}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }} className="space-y-3">

              {activeTab === "glucose" && (
                <>
                  {glucoseData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No glucose readings for this day</p>
                  ) : (
                    <>
                      {/* Bar chart */}
                      <div className="bg-card rounded-2xl p-4 border border-border">
                        <p className="text-xs font-semibold text-foreground mb-3">Readings ({glucoseData.length})</p>
                        <div className="flex items-end gap-2 h-24">
                          {glucoseData.map((r, i) => {
                            const pct = Math.max(10, Math.min(100, ((r.value - 60) / 160) * 100));
                            const color = r.value < 70 ? "bg-gauge-red" : r.value > 180 ? "bg-gauge-red" : r.value > 140 ? "bg-gauge-yellow" : "bg-gauge-green";
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[8px] text-muted-foreground">{Math.round(r.value)}</span>
                                <div className={`w-full rounded-sm ${color}`} style={{ height: `${pct}%` }} />
                                <span className="text-[8px] text-muted-foreground capitalize">{r.context?.replace("-", " ") ?? ""}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-card rounded-2xl p-3 border border-border">
                          <p className="text-[10px] text-muted-foreground font-medium">Lowest</p>
                          <p className="text-base font-bold text-gauge-green">{min} mg/dL</p>
                        </div>
                        <div className="bg-card rounded-2xl p-3 border border-border">
                          <p className="text-[10px] text-muted-foreground font-medium">Highest</p>
                          <p className="text-base font-bold text-gauge-red">{max} mg/dL</p>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {activeTab === "meals" && (
                mealsData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No meals logged for this day</p>
                ) : (
                  <div className="space-y-3">
                    {mealsData.map((meal, i) => (
                      <div key={i} className="bg-card rounded-2xl p-4 border border-border">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🍽️</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-foreground truncate">{meal.name || meal.meal_type || "Meal"}</h3>
                              {meal.risk_flag && (
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${impactColors[meal.risk_flag] ?? ""}`}>
                                  {meal.risk_flag}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {format(new Date(meal.recorded_at), "h:mm a")} · {meal.meal_type}
                            </p>
                            <div className="flex gap-3 mt-2">
                              <span className="text-[10px] text-muted-foreground">C: <b className="text-foreground">{meal.carbs}g</b></span>
                              <span className="text-[10px] text-muted-foreground">P: <b className="text-foreground">{meal.protein}g</b></span>
                              <span className="text-[10px] text-muted-foreground">F: <b className="text-foreground">{meal.fat}g</b></span>
                              {meal.predicted_ppgr && (
                                <span className="text-[10px] text-muted-foreground">PPGR: <b className="text-foreground">+{Math.round(meal.predicted_ppgr)}</b></span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === "activity" && (
                <div className="space-y-3">
                  {activityData.length === 0 && !sleepData ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No activity logged for this day</p>
                  ) : (
                    <>
                      {activityData.map((act, i) => {
                        const Icon = activityIcons[act.activity_type] ?? Activity;
                        return (
                          <div key={i} className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Icon size={18} className="text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-foreground capitalize">{act.activity_type}</h3>
                              <p className="text-[10px] text-muted-foreground capitalize">{act.intensity} · {format(new Date(act.recorded_at), "h:mm a")}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-foreground">{act.duration_minutes} min</p>
                              {act.calories_burned && <p className="text-[10px] text-accent font-medium">{Math.round(act.calories_burned)} kcal</p>}
                            </div>
                          </div>
                        );
                      })}
                      {sleepData && (
                        <div className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Moon size={18} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-foreground">Sleep</h3>
                            <p className="text-[10px] text-muted-foreground capitalize">Quality: {sleepData.quality}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">{sleepData.hours}h</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

export default History;
