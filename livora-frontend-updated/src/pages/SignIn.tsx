import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LivoraLogo from "@/components/brand/LivoraLogo";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-8 pt-16">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <LivoraLogo size="md" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="w-full max-w-xs">
        <h1 className="text-2xl font-bold text-foreground text-center mb-1">Sign in</h1>
        <div className="w-10 h-0.5 bg-primary mx-auto mb-8" />

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground">Email</label>
            <div className="relative mt-1">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="demo@email.com" required
                className="w-full bg-secondary text-foreground text-sm rounded-xl pl-9 pr-3 py-3 placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Password</label>
            <div className="relative mt-1">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="enter your password" required
                className="w-full bg-secondary text-foreground text-sm rounded-xl pl-9 pr-10 py-3 placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => setRemember(!remember)}
                className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-colors ${remember ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}>
                {remember && "✓"}
              </div>
              <span className="text-xs text-foreground">Remember Me</span>
            </label>
            <button type="button" className="text-xs text-accent font-medium hover:underline">Forgot Password?</button>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity mt-2 flex items-center justify-center gap-2 disabled:opacity-70">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Don't have an Account ?{" "}
          <button onClick={() => navigate("/signup")} className="text-accent font-medium hover:underline">Create Account!</button>
        </p>
      </motion.div>
    </div>
  );
};

export default SignIn;
