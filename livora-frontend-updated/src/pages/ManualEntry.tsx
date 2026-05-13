import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets, Heart, Footprints, Moon, Save, Bike, Dumbbell,
  Waves, PersonStanding, Clock, Flame, Loader2, AlertTriangle,
  CalendarClock, Timer
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "@/hooks/use-toast";
import { glucoseApi, activityApi, sleepApi } from "@/lib/api";

type Tab = "glucose" | "bp" | "activity" | "sleep";
type TimeMode = "now" | "manual";

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

// ── Validation helpers ─────────────────────────────────────────────────────────
const GLUCOSE_LIMITS = { min: 20, max: 600 };
const BP_LIMITS = { systolicMin: 60, systolicMax: 250, diastolicMin: 40, diastolicMax: 150, hrMin: 30, hrMax: 220 };

function validateGlucose(val: string, unit: "mg/dL" | "mmol/L"): string | null {
  const n = parseFloat(val);
  if (!val || isNaN(n)) return "Please enter a glucose value.";
  const mgdl = unit === "mmol/L" ? n * 18.0182 : n;
  if (mgdl < GLUCOSE_LIMITS.min) return `Value too low (min ${unit === "mmol/L" ? "1.1 mmol/L" : "20 mg/dL"}).`;
  if (mgdl > GLUCOSE_LIMITS.max) return `Value too high (max ${unit === "mmol/L" ? "33.3 mmol/L" : "600 mg/dL"}).`;
  return null;
}

function validateBP(sys: string, dia: string, hr: string): string | null {
  const s = parseInt(sys), d = parseInt(dia), h = parseInt(hr);
  if (!sys || isNaN(s)) return "Enter systolic pressure.";
  if (!dia || isNaN(d)) return "Enter diastolic pressure.";
  if (!hr || isNaN(h)) return "Enter heart rate.";
  if (s < BP_LIMITS.systolicMin || s > BP_LIMITS.systolicMax) return `Systolic must be ${BP_LIMITS.systolicMin}–${BP_LIMITS.systolicMax} mmHg.`;
  if (d < BP_LIMITS.diastolicMin || d > BP_LIMITS.diastolicMax) return `Diastolic must be ${BP_LIMITS.diastolicMin}–${BP_LIMITS.diastolicMax} mmHg.`;
  if (s <= d) return "Systolic must be greater than diastolic.";
  if (h < BP_LIMITS.hrMin || h > BP_LIMITS.hrMax) return `Heart rate must be ${BP_LIMITS.hrMin}–${BP_LIMITS.hrMax} bpm.`;
  return null;
}

// ── Clinician risk check ───────────────────────────────────────────────────────
function getGlucoseRisk(mgdl: number, context: string): { level: "critical" | "warning" | null; msg: string } | null {
  if (mgdl < 54) return { level: "critical", msg: `⚠️ CRITICAL: Glucose ${mgdl} mg/dL is severely low. Seek immediate medical attention.` };
  if (mgdl < 70) return { level: "critical", msg: `⚠️ Hypoglycemia detected (${mgdl} mg/dL). Clinician review recommended.` };
  if (mgdl > 250) return { level: "critical", msg: `⚠️ CRITICAL: Glucose ${mgdl} mg/dL is dangerously high. Clinician review required.` };
  if (mgdl > 180 && context === "fasting") return { level: "warning", msg: `High fasting glucose (${mgdl} mg/dL). Clinician review advised.` };
  if (mgdl > 200) return { level: "warning", msg: `Elevated glucose (${mgdl} mg/dL). Monitor closely and consider contacting your clinician.` };
  return null;
}

function getBPRisk(sys: number, dia: number, hr: number): { level: "critical" | "warning" | null; msg: string } | null {
  if (sys >= 180 || dia >= 120) return { level: "critical", msg: `⚠️ Hypertensive crisis (${sys}/${dia} mmHg). Seek immediate medical attention.` };
  if (sys >= 140 || dia >= 90) return { level: "warning", msg: `High blood pressure (${sys}/${dia} mmHg). Clinician review recommended.` };
  if (sys < 90 || dia < 60) return { level: "warning", msg: `Low blood pressure (${sys}/${dia} mmHg). Monitor and consult your clinician.` };
  if (hr > 100) return { level: "warning", msg: `Elevated heart rate (${hr} bpm). Clinician review advised.` };
  if (hr < 50) return { level: "warning", msg: `Low heart rate (${hr} bpm). Consult your clinician.` };
  return null;
}

// ── Timestamp helper ───────────────────────────────────────────────────────────
function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// ── Component ──────────────────────────────────────────────────────────────────
const ManualEntry = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("glucose");
  const [loading, setLoading] = useState(false);

  // Timestamp
  const [timeMode, setTimeMode] = useState<TimeMode>("now");
  const [manualDatetime, setManualDatetime] = useState(toLocalDatetimeValue(new Date()));

  // Risk banner
  const [riskBanner, setRiskBanner] = useState<{ level: "critical" | "warning"; msg: string } | null>(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["glucose", "bp", "activity", "sleep"].includes(tab)) setActiveTab(tab as Tab);
  }, [searchParams]);

  // Reset risk banner on tab change
  useEffect(() => { setRiskBanner(null); }, [activeTab]);

  // Glucose state
  const [glucoseValue, setGlucoseValue] = useState("");
  const [glucoseUnit, setGlucoseUnit] = useState<"mg/dL" | "mmol/L">("mg/dL");
  const [glucoseContext, setGlucoseContext] = useState<"fasting" | "pre-meal" | "post-meal" | "bedtime">("fasting");
  const [glucoseError, setGlucoseError] = useState<string | null>(null);

  // BP state
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [bpError, setBpError] = useState<string | null>(null);

  // Activity state
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [intensity, setIntensity] = useState("moderate");
  const [activityDuration, setActivityDuration] = useState(30);
  const [activityNotes, setActivityNotes] = useState("");
  const [activityError, setActivityError] = useState<string | null>(null);

  const selectedActivityData = activityTypes.find((a) => a.id === selectedActivity);
  const estimatedCalories = selectedActivityData
    ? Math.round(selectedActivityData.met * 3.5 * 70 * (activityDuration / 60) / 200 * activityDuration)
    : 0;

  // Sleep state
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [sleepQuality, setSleepQuality] = useState<"poor" | "fair" | "good" | "excellent">("good");
  const [sleepError, setSleepError] = useState<string | null>(null);

  const calcSleepHours = (): number => {
    if (!bedtime || !wakeTime) return 7;
    const [bh, bm] = bedtime.split(":").map(Number);
    const [wh, wm] = wakeTime.split(":").map(Number);
    let mins = (wh * 60 + wm) - (bh * 60 + bm);
    if (mins < 0) mins += 24 * 60;
    return Math.round((mins / 60) * 10) / 10;
  };

  const getTimestamp = (): string => {
    if (timeMode === "now") return new Date().toISOString();
    return new Date(manualDatetime).toISOString();
  };

  const handleSave = async () => {
    setRiskBanner(null);
    setGlucoseError(null);
    setBpError(null);
    setActivityError(null);
    setSleepError(null);

    const ts = getTimestamp();
    setLoading(true);

    try {
      if (activeTab === "glucose") {
        const err = validateGlucose(glucoseValue, glucoseUnit);
        if (err) { setGlucoseError(err); return; }

        let mgdl = parseFloat(glucoseValue);
        if (glucoseUnit === "mmol/L") mgdl = Math.round(mgdl * 18.0182 * 10) / 10;

        // Clinician risk check
        const risk = getGlucoseRisk(mgdl, glucoseContext);
        if (risk) setRiskBanner(risk);

        await glucoseApi.add(mgdl, glucoseContext, ts);
        setGlucoseValue("");

      } else if (activeTab === "bp") {
        const err = validateBP(systolic, diastolic, heartRate);
        if (err) { setBpError(err); return; }

        const risk = getBPRisk(parseInt(systolic), parseInt(diastolic), parseInt(heartRate));
        if (risk) setRiskBanner(risk);

        // BP stored locally — no backend endpoint yet
        toast({ title: "BP Logged", description: `${systolic}/${diastolic} mmHg — HR ${heartRate} bpm recorded.` });
        setSystolic(""); setDiastolic(""); setHeartRate("");
        return;

      } else if (activeTab === "activity") {
        if (!selectedActivity) { setActivityError("Please select an activity type."); return; }
        await activityApi.log({
          activity_type: selectedActivity,
          duration_minutes: activityDuration,
          intensity,
          calories_burned: estimatedCalories,
          notes: activityNotes || undefined,
          recorded_at: ts,
        });
        setSelectedActivity(null);
        setActivityNotes("");

      } else if (activeTab === "sleep") {
        if (!bedtime || !wakeTime) { setSleepError("Please set both bedtime and wake time."); return; }
        const hours = calcSleepHours();
        if (hours < 1 || hours > 16) { setSleepError("Sleep duration seems incorrect. Please check the times."); return; }
        await sleepApi.log({
          hours,
          quality: sleepQuality,
          bedtime: bedtime || undefined,
          wake_time: wakeTime || undefined,
          recorded_at: ts,
        });
        setBedtime(""); setWakeTime("");
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
  const errorClass = "text-xs text-gauge-red font-medium mt-1 flex items-center gap-1";

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

      {/* ── Timestamp Selector ── */}
      <div className="bg-card rounded-2xl p-4 space-y-3">
        <p className="text-xs font-semibold text-foreground">Recording Time</p>
        <div className="flex gap-2">
          <button onClick={() => setTimeMode("now")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-colors ${
              timeMode === "now" ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground"
            }`}>
            <Timer size={14} /> Use Current Time
          </button>
          <button onClick={() => setTimeMode("manual")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-colors ${
              timeMode === "manual" ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground"
            }`}>
            <CalendarClock size={14} /> Set Manually
          </button>
        </div>
        <AnimatePresence>
          {timeMode === "manual" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <input
                type="datetime-local"
                value={manualDatetime}
                max={toLocalDatetimeValue(new Date())}
                onChange={(e) => setManualDatetime(e.target.value)}
                className={inputClass}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Cannot log future timestamps.</p>
            </motion.div>
          )}
        </AnimatePresence>
        {timeMode === "now" && (
          <p className="text-[10px] text-muted-foreground">Will be recorded as: {new Date().toLocaleString()}</p>
        )}
      </div>

      {/* ── Clinician Risk Banner ── */}
      <AnimatePresence>
        {riskBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className={`rounded-2xl p-4 flex gap-3 items-start border ${
              riskBanner.level === "critical"
                ? "bg-gauge-red/10 border-gauge-red/30 text-gauge-red"
                : "bg-gauge-yellow/10 border-gauge-yellow/30 text-gauge-yellow"
            }`}>
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold mb-0.5">
                {riskBanner.level === "critical" ? "Clinician Review Required" : "Clinician Advisory"}
              </p>
              <p className="text-xs leading-relaxed">{riskBanner.msg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Glucose Form ── */}
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
              <input type="number" value={glucoseValue}
                onChange={(e) => { setGlucoseValue(e.target.value); setGlucoseError(null); }}
                placeholder="Enter value" className={`${inputClass} flex-1 ${glucoseError ? "ring-1 ring-gauge-red" : ""}`} />
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
            {glucoseError && <p className={errorClass}><AlertTriangle size={12} />{glucoseError}</p>}
          </div>
          <div className="bg-secondary/50 rounded-xl p-3 text-[10px] text-muted-foreground space-y-0.5">
            <p>Normal fasting: 70–100 mg/dL &nbsp;|&nbsp; Pre-meal: 80–130 mg/dL</p>
            <p>Post-meal (&lt;2h): &lt;180 mg/dL &nbsp;|&nbsp; Clinician alert: &gt;250 or &lt;70 mg/dL</p>
          </div>
        </motion.div>
      )}

      {/* ── Blood Pressure Form ── */}
      {activeTab === "bp" && (
        <motion.div key="bp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Blood Pressure Reading</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground">Systolic (mmHg)</label>
              <input type="number" value={systolic}
                onChange={(e) => { setSystolic(e.target.value); setBpError(null); }}
                placeholder="120" className={`${inputClass} mt-1.5 ${bpError ? "ring-1 ring-gauge-red" : ""}`} />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Diastolic (mmHg)</label>
              <input type="number" value={diastolic}
                onChange={(e) => { setDiastolic(e.target.value); setBpError(null); }}
                placeholder="80" className={`${inputClass} mt-1.5 ${bpError ? "ring-1 ring-gauge-red" : ""}`} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">Heart Rate (bpm)</label>
            <input type="number" value={heartRate}
              onChange={(e) => { setHeartRate(e.target.value); setBpError(null); }}
              placeholder="72" className={`${inputClass} mt-1.5`} />
          </div>
          {bpError && <p className={errorClass}><AlertTriangle size={12} />{bpError}</p>}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Tip: </span>
              Sit quietly for 5 minutes before measuring. Avoid caffeine or exercise 30 minutes prior.
              Clinician alert triggers at ≥180/120 mmHg.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Activity Form ── */}
      {activeTab === "activity" && (
        <motion.div key="activity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Activity Type</p>
            <div className="grid grid-cols-3 gap-3">
              {activityTypes.map((activity) => {
                const isActive = selectedActivity === activity.id;
                return (
                  <button key={activity.id} onClick={() => { setSelectedActivity(activity.id); setActivityError(null); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                      isActive ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border bg-card hover:bg-secondary"
                    }`}>
                    <activity.icon size={22} className={isActive ? "text-primary" : "text-muted-foreground"} />
                    <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>{activity.label}</span>
                  </button>
                );
              })}
            </div>
            {activityError && <p className={`${errorClass} mt-2`}><AlertTriangle size={12} />{activityError}</p>}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Intensity</p>
            <div className="flex gap-3">
              {intensityLevels.map((level) => (
                <button key={level.id} onClick={() => setIntensity(level.id)}
                  className={`flex-1 py-3 rounded-2xl border text-sm font-medium transition-all ${
                    intensity === level.id
                      ? `border-transparent ${level.color.split(" ")[0]}/15 ${level.color.split(" ")[1]}`
                      : "border-border bg-card text-muted-foreground hover:bg-secondary"
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

      {/* ── Sleep Form ── */}
      {activeTab === "sleep" && (
        <motion.div key="sleep" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Sleep Log</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground">Bedtime</label>
              <input type="time" value={bedtime}
                onChange={(e) => { setBedtime(e.target.value); setSleepError(null); }}
                className={`${inputClass} mt-1.5 ${sleepError ? "ring-1 ring-gauge-red" : ""}`} />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Wake Time</label>
              <input type="time" value={wakeTime}
                onChange={(e) => { setWakeTime(e.target.value); setSleepError(null); }}
                className={`${inputClass} mt-1.5 ${sleepError ? "ring-1 ring-gauge-red" : ""}`} />
            </div>
          </div>
          {bedtime && wakeTime && (
            <p className="text-xs text-primary font-medium">Duration: {calcSleepHours()} hours</p>
          )}
          {sleepError && <p className={errorClass}><AlertTriangle size={12} />{sleepError}</p>}
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
