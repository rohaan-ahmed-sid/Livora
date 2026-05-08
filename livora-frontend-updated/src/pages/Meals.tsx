import { motion } from "framer-motion";
import { Info, ArrowLeftRight, Search, ScanBarcode, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { mealsApi, predictApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Recommendation {
  meal_name: string;
  predicted_ppgr: number;
  risk_flag: "LOW" | "MODERATE" | "HIGH";
  carbs: number;
  protein: number;
  fat: number;
  rank: number;
}

const impactColors = {
  LOW: "bg-gauge-green/15 text-gauge-green",
  MODERATE: "bg-gauge-yellow/15 text-gauge-yellow",
  HIGH: "bg-gauge-red/15 text-gauge-red",
};

const foodEmojis: Record<string, string> = {
  "Grilled Chicken Breast": "🍗", "Egg Omelette (2 eggs)": "🍳", "Tuna Salad": "🥗",
  "Brown Rice (1 cup)": "🍚", "Chapati (2 pcs)": "🫓", "Daal (lentils, 1 bowl)": "🍲",
  "Greek Yogurt (1 cup)": "🥛", "Mixed Salad": "🥗", "Oats Porridge (1 bowl)": "🥣",
  "Roasted Chickpeas": "🫘", "Nuts Mix (30g)": "🥜", "Boiled Eggs (2)": "🥚",
};

const Meals = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState("lunch");
  const [carbs, setCarbs] = useState("");
  const [protein, setProtein] = useState("");
  const [fats, setFats] = useState("");
  const [fiber, setFiber] = useState("");
  const [logging, setLogging] = useState(false);

  const fetchRecs = () => {
    setLoadingRecs(true);
    predictApi.recommendations(8)
      .then((res) => setRecommendations(res.data))
      .catch(() => setRecommendations([]))
      .finally(() => setLoadingRecs(false));
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const handleLogMeal = async () => {
    if (!carbs && !protein && !fats) {
      toast({ title: "Enter at least one macro", variant: "destructive" });
      return;
    }
    setLogging(true);
    try {
      const res = await mealsApi.log({
        name: mealName || undefined,
        meal_type: mealType,
        carbs: parseFloat(carbs) || 0,
        protein: parseFloat(protein) || 0,
        fat: parseFloat(fats) || 0,
        fiber: parseFloat(fiber) || 0,
        recorded_at: new Date().toISOString(),
      });
      const meal = res.data;
      toast({
        title: "Meal logged ✓",
        description: `PPGR: ${meal.predicted_ppgr} mg/dL — Risk: ${meal.risk_flag}`,
      });
      setMealName(""); setCarbs(""); setProtein(""); setFats(""); setFiber("");
      // Refresh recommendations after logging
      predictApi.recommendations(8).then((r) => setRecommendations(r.data)).catch(() => {});
    } catch (err: any) {
      toast({ title: "Failed to log meal", description: err?.response?.data?.detail, variant: "destructive" });
    } finally {
      setLogging(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2">
      <div>
        <h1 className="text-xl font-bold text-foreground">Meals & Diet</h1>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">AI-ranked safe options for you</p>
          <button onClick={fetchRecs} className="text-xs text-primary font-medium hover:underline">
            Refresh
          </button>
        </div>
      </div>

      {/* DFRS Recommendations */}
      <div className="space-y-3">
        {loadingRecs ? (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : recommendations.length > 0 ? (
          recommendations.map((rec, idx) => (
            <div key={idx} className="bg-card rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{foodEmojis[rec.meal_name] ?? "🍽️"}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{rec.meal_name}</h3>
                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${impactColors[rec.risk_flag]}`}>
                      {rec.risk_flag} Impact · +{rec.predicted_ppgr} mg/dL
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setExpandedId(expandedId === idx ? null : idx)}
                    className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <Info size={14} />
                  </button>
                  <button onClick={() => { setCarbs(String(rec.carbs)); setProtein(String(rec.protein)); setFats(String(rec.fat)); setMealName(rec.meal_name); }}
                    className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Use this meal">
                    <ArrowLeftRight size={14} />
                  </button>
                </div>
              </div>
              {expandedId === idx && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  className="bg-primary/5 border border-primary/10 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Macros: </span>
                    {rec.carbs}g carbs · {rec.protein}g protein · {rec.fat}g fat
                  </p>
                </motion.div>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">Log a glucose reading to get personalized recommendations</p>
        )}
      </div>

      {/* Meal Logger */}
      <div className="bg-card rounded-2xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Log a Meal</h3>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Meal name (optional)" value={mealName} onChange={(e) => setMealName(e.target.value)}
              className="w-full bg-secondary text-foreground text-sm rounded-xl pl-9 pr-3 py-2.5 placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <select value={mealType} onChange={(e) => setMealType(e.target.value)}
            className="bg-secondary text-foreground text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-primary">
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Carbs (g)", value: carbs, set: setCarbs },
            { label: "Protein (g)", value: protein, set: setProtein },
            { label: "Fats (g)", value: fats, set: setFats },
            { label: "Fiber (g)", value: fiber, set: setFiber },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</label>
              <input type="number" value={value} onChange={(e) => set(e.target.value)}
                className="w-full mt-1 bg-secondary text-foreground text-sm rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-primary" placeholder="0" />
            </div>
          ))}
        </div>

        <button onClick={handleLogMeal} disabled={logging}
          className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70">
          {logging && <Loader2 size={14} className="animate-spin" />}
          {logging ? "Logging..." : "Log Meal"}
        </button>
      </div>
    </motion.div>
  );
};

export default Meals;
