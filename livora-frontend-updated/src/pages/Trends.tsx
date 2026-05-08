import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Apple, Loader2 } from "lucide-react";
import { glucoseApi, mealsApi, predictApi } from "@/lib/api";
import { format, subHours } from "date-fns";

const timeFilters = ["1h", "6h", "12h", "24h"];
const filterHours: Record<string, number> = { "1h": 1, "6h": 6, "12h": 12, "24h": 24 };

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">{payload[0]?.payload?.time}</p>
      {payload.map((p: any, i: number) => p.value != null && (
        <p key={i} className="text-xs font-medium" style={{ color: p.color }}>
          {p.name}: {Math.round(p.value)} mg/dL
        </p>
      ))}
    </div>
  );
};

const Trends = () => {
  const [activeFilter, setActiveFilter] = useState("24h");
  const [chartData, setChartData] = useState<any[]>([]);
  const [mealEvents, setMealEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<number | null>(null);

  useEffect(() => {
    const hours = filterHours[activeFilter];
    const days = Math.max(1, Math.ceil(hours / 24));
    setLoading(true);

    Promise.all([
      glucoseApi.list(days),
      mealsApi.list(days),
    ]).then(([gRes, mRes]) => {
      const cutoff = subHours(new Date(), hours);

      const readings = (gRes.data as any[])
        .filter((r) => new Date(r.recorded_at) >= cutoff)
        .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

      const meals = (mRes.data as any[])
        .filter((m) => new Date(m.recorded_at) >= cutoff)
        .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

      setMealEvents(meals);

      // Build chart points
      const points = readings.map((r) => ({
        time: format(new Date(r.recorded_at), hours <= 6 ? "HH:mm" : "MMM d HH:mm"),
        actual: r.value,
        predicted: undefined as number | undefined,
      }));

      // Get forecast and append as next point
      if (readings.length >= 3) {
        const vals = readings.slice(-36).map((r: any) => r.value);
        predictApi.glucoseForecast(vals).then((res) => {
          const f = res.data.forecast_mg_dl;
          setForecast(f);
          // Add forecast as a dashed point 30 min in future
          const lastTime = new Date(readings[readings.length - 1].recorded_at);
          const forecastTime = new Date(lastTime.getTime() + 30 * 60 * 1000);
          setChartData([
            ...points,
            {
              time: format(forecastTime, hours <= 6 ? "HH:mm" : "MMM d HH:mm"),
              actual: undefined,
              predicted: f,
            },
          ]);
        }).catch(() => setChartData(points));
      } else {
        setChartData(points);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [activeFilter]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2">
      <div>
        <h1 className="text-xl font-bold text-foreground">Trends</h1>
        <p className="text-sm text-muted-foreground">Glucose history & forecasting</p>
      </div>

      {/* Time Filters */}
      <div className="flex gap-2">
        {timeFilters.map((f) => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeFilter === f ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Forecast banner */}
      {forecast !== null && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 flex items-center justify-between">
          <p className="text-xs text-foreground font-medium">30-min forecast</p>
          <p className="text-sm font-bold text-primary">{Math.round(forecast)} mg/dL</p>
        </div>
      )}

      {/* Chart */}
      <div className="bg-card rounded-2xl p-4">
        {loading ? (
          <div className="flex justify-center items-center h-[250px]">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : chartData.filter(d => d.actual != null).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground gap-2">
            <p className="text-sm">No readings in the last {activeFilter}</p>
            <p className="text-xs">Log glucose via Manual Entry</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={180} stroke="hsl(var(--gauge-red))" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: "180", position: "right", fontSize: 9, fill: "hsl(var(--gauge-red))" }} />
              <ReferenceLine y={70}  stroke="hsl(var(--gauge-red))" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: "70",  position: "right", fontSize: 9, fill: "hsl(var(--gauge-red))" }} />
              <Line type="monotone" dataKey="actual" stroke="hsl(var(--chart))" strokeWidth={2.5}
                dot={{ r: 3, fill: "hsl(var(--chart))" }} connectNulls={false} name="Actual" />
              <Line type="monotone" dataKey="predicted" stroke="hsl(var(--accent))" strokeWidth={2}
                strokeDasharray="6 3" dot={{ r: 4, fill: "hsl(var(--accent))" }} connectNulls={false} name="Forecast" />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded" style={{ backgroundColor: "hsl(var(--chart))" }} />
            <span className="text-[10px] text-muted-foreground">Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded border-t-2 border-dashed" style={{ borderColor: "hsl(var(--accent))" }} />
            <span className="text-[10px] text-muted-foreground">Forecast (+30min)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 border-t border-dashed border-gauge-red" />
            <span className="text-[10px] text-muted-foreground">Target range</span>
          </div>
        </div>
      </div>

      {/* Meal Events */}
      {mealEvents.length > 0 && (
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Meals in this period</h3>
          <div className="space-y-2">
            {mealEvents.map((meal, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-secondary">
                <Apple size={16} className="text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{meal.name || meal.meal_type || "Meal"}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(meal.recorded_at), "h:mm a")} · {meal.carbs}g carbs
                    {meal.risk_flag && ` · ${meal.risk_flag}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Trends;
