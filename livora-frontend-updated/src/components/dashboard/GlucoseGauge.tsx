import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface GlucoseGaugeProps {
  value: number;
  trend: "rising" | "stable" | "falling";
  status: "in-range" | "borderline" | "risk";
}

const statusColors = {
  "in-range": "text-gauge-green",
  borderline: "text-gauge-yellow",
  risk: "text-gauge-red",
};

const statusRingColors = {
  "in-range": "stroke-gauge-green",
  borderline: "stroke-gauge-yellow",
  risk: "stroke-gauge-red",
};

const statusLabels = {
  "in-range": "In Range",
  borderline: "Borderline",
  risk: "At Risk",
};

const trendIcons = {
  rising: ArrowUp,
  stable: ArrowRight,
  falling: ArrowDown,
};

const GlucoseGauge = ({ value, trend, status }: GlucoseGaugeProps) => {
  const TrendIcon = trendIcons[trend];
  const circumference = 2 * Math.PI * 70;
  // Normalize value between 40-400 mg/dL for visual
  const percent = Math.min(Math.max((value - 40) / (300 - 40), 0), 1);
  const dashOffset = circumference * (1 - percent);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-2xl p-6 flex flex-col items-center relative overflow-hidden"
    >
      <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">
        Current Glucose
      </p>

      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r="70"
            fill="none"
            className="stroke-border"
            strokeWidth="8"
          />
          <circle
            cx="80" cy="80" r="70"
            fill="none"
            className={statusRingColors[status]}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1">
            <span className={`text-4xl font-bold ${statusColors[status]}`}>
              {value}
            </span>
            <TrendIcon size={20} className={statusColors[status]} />
          </div>
          <span className="text-xs text-muted-foreground">mg/dL</span>
        </div>
      </div>

      <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
        status === "in-range"
          ? "bg-gauge-green/15 text-gauge-green"
          : status === "borderline"
          ? "bg-gauge-yellow/15 text-gauge-yellow"
          : "bg-gauge-red/15 text-gauge-red"
      }`}>
        {statusLabels[status]}
      </div>
    </motion.div>
  );
};

export default GlucoseGauge;
