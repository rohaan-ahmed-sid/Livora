import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LivoraLogo from "@/components/brand/LivoraLogo";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center mb-16"
      >
        <LivoraLogo size="lg" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="w-full max-w-xs space-y-6"
      >
        <h1 className="text-3xl font-bold text-foreground leading-tight">
          Keep your<br />Health in check
        </h1>

        <div className="space-y-3 pt-4">
          <button
            onClick={() => navigate("/signin")}
            className="w-full py-3.5 rounded-xl bg-card border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="w-full py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Create account
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          Welcome to your personal health tracker
        </p>
      </motion.div>
    </div>
  );
};

export default Welcome;
