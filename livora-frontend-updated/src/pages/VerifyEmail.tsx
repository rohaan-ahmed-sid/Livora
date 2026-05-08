import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import LivoraLogo from "@/components/brand/LivoraLogo";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-8 pt-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <LivoraLogo size="sm" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full max-w-xs text-center"
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">Please check your email</h1>
        <p className="text-sm text-muted-foreground mb-8">
          We've sent a code to <span className="text-foreground font-medium">helloworld@gmail.com</span>
        </p>

        <div className="flex justify-center gap-3 mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-14 h-14 rounded-xl bg-card border border-border text-center text-xl font-bold text-foreground outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          className="w-full py-3.5 rounded-xl bg-card border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors mb-4"
        >
          Verify
        </button>

        <p className="text-xs text-muted-foreground">
          Send code again{" "}
          <span className="text-accent font-semibold">00:20</span>
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
