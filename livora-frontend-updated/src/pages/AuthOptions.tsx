import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LivoraLogo from "@/components/brand/LivoraLogo";
import { Apple, Mail } from "lucide-react";

const AuthOptions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <LivoraLogo size="md" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full max-w-xs space-y-3"
      >
        <button className="w-full flex items-center gap-3 py-3.5 px-5 rounded-xl bg-card border border-border text-foreground font-medium text-sm hover:bg-secondary transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" className="text-primary"><text x="4" y="18" fontSize="16" fontWeight="bold" fill="currentColor">G</text></svg>
          Continue with Google
        </button>
        <button className="w-full flex items-center gap-3 py-3.5 px-5 rounded-xl bg-card border border-border text-foreground font-medium text-sm hover:bg-secondary transition-colors">
          <Apple size={18} />
          Continue with Apple
        </button>
        <button
          onClick={() => navigate("/signin")}
          className="w-full flex items-center gap-3 py-3.5 px-5 rounded-xl bg-card border border-border text-foreground font-medium text-sm hover:bg-secondary transition-colors"
        >
          <Mail size={18} className="text-muted-foreground" />
          Continue with Email
        </button>

        <div className="flex items-center gap-3 py-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/signin")}
            className="text-primary font-medium hover:underline"
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthOptions;
