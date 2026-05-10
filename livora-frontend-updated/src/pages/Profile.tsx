import { motion } from "framer-motion";
import { FileText, ChevronRight, Pill, Calendar, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your health data</p>
        </div>
        <button onClick={() => navigate("/settings")}
          className="p-2 rounded-full bg-card text-foreground hover:bg-secondary transition-colors" aria-label="Settings">
          <Settings size={20} />
        </button>
      </div>

      <div className="bg-card rounded-2xl p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-lg">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-foreground">{user?.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{user?.email ?? "—"}</p>
          <p className="text-[10px] text-primary font-medium mt-0.5">{user?.diabetes_type ?? "T2D"}</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Health Profile</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
            <Calendar size={16} className="text-primary" />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Year of Diagnosis</p>
              <p className="text-sm font-medium text-foreground">{user?.diagnosis_year ?? "Not set"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
            <Pill size={16} className="text-primary" />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Medication</p>
              <p className="text-sm font-medium text-foreground capitalize">{user?.medication_type ?? "Not set"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
            <User size={16} className="text-primary" />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Target Range</p>
              <p className="text-sm font-medium text-foreground">
                {user?.target_glucose_min ?? 70} – {user?.target_glucose_max ?? 180} mg/dL
              </p>
            </div>
          </div>
        </div>
      </div>

      <button className="w-full bg-card rounded-2xl p-4 flex items-center justify-between hover:bg-secondary transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
            <FileText size={18} className="text-accent" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Share Report</p>
            <p className="text-[10px] text-muted-foreground">Generate PDF for medical review</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-muted-foreground" />
      </button>

      <button onClick={() => { logout(); navigate("/welcome"); }}
        className="w-full py-3 rounded-2xl border border-red-500/20 text-red-500 text-sm font-medium hover:bg-red-500/5 transition-colors">
        Sign Out
      </button>
    </motion.div>
  );
};

export default Profile;