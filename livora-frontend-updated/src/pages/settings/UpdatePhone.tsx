import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";

const UpdatePhone = () => {
  const [phone, setPhone] = useState("+1 555 123 4548");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = () => {
    setOtpSent(true);
    toast.success("OTP sent to your new number");
  };

  const handleVerify = () => {
    if (otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }
    toast.success("Phone number updated successfully");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2 pb-4">
      <PageHeader title="Mobile Number" subtitle="Update your phone number" />

      <div className="bg-card rounded-2xl p-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>

        {otpSent && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Enter OTP</label>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit code" maxLength={6} className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary tracking-widest text-center" />
          </div>
        )}
      </div>

      <button onClick={otpSent ? handleVerify : handleSendOtp} className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-sm hover:opacity-90 transition-opacity">
        {otpSent ? "Verify & Update" : "Send OTP"}
      </button>
    </motion.div>
  );
};

export default UpdatePhone;
