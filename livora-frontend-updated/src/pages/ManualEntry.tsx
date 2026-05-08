import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Droplets, Heart, Footprints, Moon, Save, Bike, Dumbbell, Waves, PersonStanding, Clock, Flame, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "@/hooks/use-toast";
import { glucoseApi, activityApi, sleepApi, authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type Tab = "glucose" | "bp" | "activity" | "sleep";

const tabs: { id: Tab; label: string; icon: typeof Droplets }[] = [
  { id: "glucose", label: "Glucose", icon: Droplets },
  { id: "bp", label: "BP", icon: Heart },
  { id: "activity", label: "Activity", icon: Footprints },
  { id: "sleep", label: "Sleep", icon: Moon },
];

const activityTypes = [
  { id: "walking", label: "Walking", icon: Footprints, met: 3.5 },
  { id: "running", label: "Running", icon: PersonStanding, met: 8.0 },
  { id: "cycling", label: "Cycling", icon: Bike, met: 6.0 },
  { id: "strength", label: "Strength", icon: Dumbbell, met: 5.0 },
  { id: "swimming", label: "Swimming", icon: Waves, met: 7.0 },
  { id: "yoga", label: "Yoga", icon: Heart, met: 2.5 },
];

const intensityLevels = [
  { id: "light", label: "Light", color: "bg-gauge-green text-gauge-green" },
  { id: "moderate", label: "Moderate", color: "bg-gauge-yellow text-gauge-yellow" },
  { id: "vigorous", label: "Vigorous", color: "bg-gauge-red text-gauge-red" },
];

const ManualEntry = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("glucose");
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["glucose", "bp", "activity", "sleep"].includes(tab)) {
      setActiveTab(tab as Tab);
    }
  }, [searchParams]);

  // Glucose state
  const [glucoseValue, setGlucoseValue] = useState("");
  const [glucoseUnit, setGlucoseUnit] = useState<"mg/dL" | "mmol/L">("mg/dL");
  const [glucoseContext, setGlucoseContext] = useState<"fasting" | "pre-meal" | "post-meal" | "bedtime">("fasting");

  // BP state (local only — no BP endpoint)
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");

  // Activity state
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [intensity, setIntensity] = useState("moderate");
  const [activityDuration, setActivityDuration] = useState(30);
  const [activityNotes, setActivityNotes] = useState("");

  const selectedActivityData = activityTypes.find((a) => a.id === selectedActivity);
  const estimatedCalories = selectedActivityData
    ? Math.round(selectedActivityData.met * 3.5 * 70 * (activityDuration / 60) / 200 * activityDuration)
    : 0;

  // Sleep state
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [sleepQuality, setSleepQuality] = useState<"poor" | "fair" | "good" | "excellent">("good");

  const calcSleepHours = (): number => {
    if (!bedtime || !wakeTime) return 7;
    const [bh, bm] = bedtime.split(":").map(Number);
    const [wh, wm] = wakeTime.split(":").map(Number);
    let mins = (wh * 60 + wm) - (bh * 60 + bm);
    if (mins < 0) mins += 24 * 60;
    return Math.round((mins / 60) * 10) / 10;
  };

  const handleSave = async () => {
    setLoading(true);
    const now = new Date().toISOString();
    try {
      if (activeTab === "glucose") {
        if (!glucoseValue) { toast({ title: "Enter a glucose value", variant: "destructive" }); return; }
        let val = parseFloat(glucoseValue);
        if (glucoseUnit === "mmol/L") val = Math.round(val * 18.0182 * 10) / 10;
        await glucoseApi.add(val, glucoseContext, now);
        setGlucoseValue("");

      } else if (activeTab === "activity") {
        if (!selectedActivity) { toast({ title: "Select an activity type", variant: "destructive" }); return; }
        await activityApi.log({
          activity_type: selectedActivity,
          duration_minutes: activityDuration,
          intensity,
          calories_burned: estimatedCalories,
          notes: activityNotes || undefined,
          recorded_at: now,
        });
        setSelectedActivity(null);
        setActivityNotes("");

      } else if (activeTab === "sleep") {
        const hours = calcSleepHours();
        await sleepApi.log({
          hours,
          quality: sleepQuality,
          bedtime: bedtime || undefined,
          wake_time: wakeTime || undefined,
          recorded_at: now,
        });
        setBedtime("");
        setWakeTime("");

      } else if (activeTab === "bp") {
        if (!systolic || !diastolic) {
          toast({ title: "Enter both systolic and diastolic", variant: "destructive" });
          return;
        }
        await import("@/lib/api").then(({ default: api }) =>
          api.post(`/auth/bp?systolic=${systolic}&diastolic=${diastolic}`)
        );
        setSystolic(""); setDiastolic(""); setHeartRate("");
      }

      toast({
        title: "Saved ✓",
        description: `Your ${tabs.find((t) => t.id === activeTab)?.label} data has been logged.`,
      });
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err?.response?.data?.detail || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-secondary text-foreground text-sm rounded-xl px-3 py-3 outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2">
      <PageHeader title="Manual Entry" subtitle="Log your health data manually" />

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl text-xs font-medium transition-colors ${
              activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"
            }`}>
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Glucose Form */}
      {activeTab === "glucose" && (
        <motion.div key="glucose" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Blood Glucose Reading</h3>
          <div>
            <label className="text-xs font-medium text-foreground">Reading Context:</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(["fasting", "pre-meal", "post-meal", "bedtime"] as const).map((ctx) => (
                <button key={ctx} onClick={() => setGlucoseContext(ctx)}
                  className={`py-2 rounded-xl text-xs font-medium border transition-colors capitalize ${
                    glucoseContext === ctx ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground"
                  }`}>
                  {ctx.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">Glucose Level:</label>
            <div className="flex items-center gap-2 mt-1.5">
              <input type="number" value={glucoseValue} onChange={(e) => setGlucoseValue(e.target.value)}
                placeholder="Enter value" className={`${inputClass} flex-1`} />
              <div className="flex items-center gap-1 bg-secondary rounded-xl px-2 py-2">
                {(["mg/dL", "mmol/L"] as const).map((u) => (
                  <button key={u} onClick={() => setGlucoseUnit(u)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                      glucoseUnit === u ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Blood Pressure Form */}
      {activeTab === "bp" && (
        <motion.div key="bp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Blood Pressure Reading</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground">Systolic (mmHg)</label>
              <input type="number" value={systolic} onChange={(e) => setSystolic(e.target.value)} placeholder="120" className={`${inputClass} mt-1.5`} />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Diastolic (mmHg)</label>
              <input type="number" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} placeholder="80" className={`${inputClass} mt-1.5`} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">Heart Rate (bpm)</label>
            <input type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} placeholder="72" className={`${inputClass} mt-1.5`} />
          </div>
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Tip: </span>
              Take your blood pressure reading while seated and relaxed.
            </p>
          </div>
        </motion.div>
      )}

      {/* Activity Form */}
      {activeTab === "activity" && (
        <motion.div key="activity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Activity Type</p>
            <div className="grid grid-cols-3 gap-3">
              {activityTypes.map((activity) => {
                const isActive = selectedActivity === activity.id;
                return (
                  <button key={activity.id} onClick={() => setSelectedActivity(activity.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                      isActive ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border bg-card hover:bg-secondary"
                    }`}>
                    <activity.icon size={22} className={isActive ? "text-primary" : "text-muted-foreground"} />
                    <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>{activity.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Intensity</p>
            <div className="flex gap-3">
              {intensityLevels.map((level) => (
                <button key={level.id} onClick={() => setIntensity(level.id)}
                  className={`flex-1 py-3 rounded-2xl border text-sm font-medium transition-all ${
                    intensity === level.id ? `border-transparent ${level.color.split(" ")[0]}/15 ${level.color.split(" ")[1]}` : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}>
                  {level.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">Duration</p>
              <div className="flex items-center gap-1.5 text-sm text-primary font-semibold">
                <Clock size={14} />{activityDuration} min
              </div>
            </div>
            <input type="range" min={5} max={120} step={5} value={activityDuration}
              onChange={(e) => setActivityDuration(Number(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>5 min</span><span>120 min</span>
            </div>
          </div>
          {selectedActivity && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-accent/10 border border-accent/20">
              <Flame size={20} className="text-accent" />
              <div>
                <p className="text-sm font-semibold text-foreground">~{estimatedCalories} kcal</p>
                <p className="text-xs text-muted-foreground">Estimated calories burned</p>
              </div>
            </motion.div>
          )}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Notes (optional)</p>
            <textarea value={activityNotes} onChange={(e) => setActivityNotes(e.target.value)}
              placeholder="How did you feel? Any observations..."
              className="w-full bg-card border border-border rounded-2xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none h-20 focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </motion.div>
      )}

      {/* Sleep Form */}
      {activeTab === "sleep" && (
        <motion.div key="sleep" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Sleep Log</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground">Bedtime</label>
              <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} className={`${inputClass} mt-1.5`} />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Wake Time</label>
              <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className={`${inputClass} mt-1.5`} />
            </div>
          </div>
          {bedtime && wakeTime && (
            <p className="text-xs text-primary font-medium">Calculated: {calcSleepHours()} hours</p>
          )}
          <div>
            <label className="text-xs font-medium text-foreground">Sleep Quality:</label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {(["poor", "fair", "good", "excellent"] as const).map((q) => (
                <button key={q} onClick={() => setSleepQuality(q)}
                  className={`py-2 rounded-xl text-xs font-medium border transition-colors capitalize ${
                    sleepQuality === q ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground"
                  }`}>
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Why log sleep? </span>
              Sleep quality significantly affects glucose regulation and insulin sensitivity.
            </p>
          </div>
        </motion.div>
      )}

      {/* Save Button */}
      <button onClick={handleSave} disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-70">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {loading ? "Saving..." : "Save Entry"}
      </button>
    </motion.div>
  );
};

export default ManualEntry;
