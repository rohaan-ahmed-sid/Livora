import { motion } from "framer-motion";
import {
  Moon,
  Sun,
  ChevronRight,
  Phone,
  Mail,
  Lock,
  UserPen,
  Globe,
  BellRing,
  ShieldCheck,
  LogOut,
  HelpCircle,
  FileText,
  Trash2,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";

interface SettingItemProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
}

const SettingItem = ({ icon: Icon, label, description, trailing, onClick, destructive = false }: SettingItemProps) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${destructive ? "bg-destructive/15" : "bg-primary/15"}`}>
      <Icon size={16} className={destructive ? "text-destructive" : "text-primary"} />
    </div>
    <div className="flex-1 text-left">
      <p className={`text-sm font-medium ${destructive ? "text-destructive" : "text-foreground"}`}>{label}</p>
      {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
    </div>
    {trailing ?? <ChevronRight size={14} className="text-muted-foreground" />}
  </button>
);

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2 pb-4">
      <PageHeader title="Settings" subtitle="Manage your account & preferences" />

      <div className="bg-card rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</h3>
        <div className="space-y-2">
          <SettingItem icon={UserPen} label="Update Personal Info" description="Name, date of birth, gender" onClick={() => navigate("/settings/personal-info")} />
          <SettingItem icon={Mail} label="Update Email" description="john.doe@example.com" onClick={() => navigate("/settings/email")} />
          <SettingItem icon={Phone} label="Update Mobile Number" description="+1 •••• ••48" onClick={() => navigate("/settings/phone")} />
          <SettingItem icon={Lock} label="Change Password" description="Last changed 30 days ago" onClick={() => navigate("/settings/password")} />
          <SettingItem icon={ShieldCheck} label="Two-Factor Authentication" description="Add an extra layer of security" onClick={() => navigate("/settings/two-factor")} />
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preferences</h3>
        <div className="space-y-2">
          <SettingItem
            icon={theme === "dark" ? Sun : Moon}
            label="Appearance"
            description={theme === "dark" ? "Dark mode" : "Light mode"}
            onClick={toggleTheme}
            trailing={
              <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${theme === "dark" ? "bg-primary" : "bg-muted-foreground/30"}`}>
                <div className={`w-4 h-4 rounded-full bg-card transition-transform ${theme === "dark" ? "translate-x-4" : "translate-x-0"}`} />
              </div>
            }
          />
          <SettingItem icon={BellRing} label="Notifications" description="Alerts, reminders & sounds" onClick={() => navigate("/settings/notifications")} />
          <SettingItem icon={Globe} label="Language & Region" description="English (US)" onClick={() => navigate("/settings/language")} />
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Support</h3>
        <div className="space-y-2">
          <SettingItem icon={HelpCircle} label="Help & FAQ" description="Get answers to common questions" onClick={() => navigate("/settings/help")} />
          <SettingItem icon={FileText} label="Terms & Privacy Policy" onClick={() => navigate("/settings/terms")} />
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 space-y-3">
        <div className="space-y-2">
          <SettingItem icon={LogOut} label="Sign Out" destructive />
          <SettingItem icon={Trash2} label="Delete Account" description="This action is irreversible" destructive />
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
