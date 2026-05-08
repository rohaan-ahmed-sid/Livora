import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";

const UpdateEmail = () => {
  const [currentEmail] = useState("john.doe@example.com");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSave = () => {
    if (!newEmail || !password) {
      toast.error("Please fill all fields");
      return;
    }
    toast.success("Verification email sent to your new address");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2 pb-4">
      <PageHeader title="Update Email" subtitle="Change your email address" />

      <div className="bg-card rounded-2xl p-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Current Email</label>
          <div className="w-full bg-secondary/50 rounded-xl px-3 py-2.5 text-sm text-muted-foreground">{currentEmail}</div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">New Email</label>
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Enter new email" className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <button onClick={handleSave} className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-sm hover:opacity-90 transition-opacity">Update Email</button>
    </motion.div>
  );
};

export default UpdateEmail;
