import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LivoraLogo from "@/components/brand/LivoraLogo";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.name, form.password);
      navigate("/onboarding");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-8 pt-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <LivoraLogo size="sm" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="w-full max-w-xs">
        <h1 className="text-2xl font-bold text-foreground text-center mb-1">Create Account</h1>
        <div className="w-10 h-0.5 bg-primary mx-auto mb-6" />

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-3.5">
          <div>
            <label className="text-xs font-medium text-foreground">Full Name</label>
            <div className="relative mt-1">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="John Doe" required
                className="w-full bg-secondary text-foreground text-sm rounded-xl pl-9 pr-3 py-3 placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Email</label>
            <div className="relative mt-1">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="demo@email.com" required
                className="w-full bg-secondary text-foreground text-sm rounded-xl pl-9 pr-3 py-3 placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Password</label>
            <div className="relative mt-1">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="enter your password" required
                className="w-full bg-secondary text-foreground text-sm rounded-xl pl-9 pr-10 py-3 placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Confirm Password</label>
            <div className="relative mt-1">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type={showCpw ? "text" : "password"} value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="enter your password" required
                className="w-full bg-secondary text-foreground text-sm rounded-xl pl-9 pr-10 py-3 placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <button type="button" onClick={() => setShowCpw(!showCpw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showCpw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed">
            By creating an account you agree to our{" "}
            <button type="button" className="text-foreground font-medium underline">Terms and Conditions</button>
          </p>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-5">
          Already have an Account ?{" "}
          <button onClick={() => navigate("/signin")} className="text-primary font-medium hover:underline">Sign in</button>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;
