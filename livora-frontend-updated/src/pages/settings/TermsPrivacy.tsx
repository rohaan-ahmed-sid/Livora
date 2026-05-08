import { motion } from "framer-motion";
import PageHeader from "@/components/layout/PageHeader";

const TermsPrivacy = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2 pb-4">
    <PageHeader title="Terms & Privacy" subtitle="Legal information" />

    <div className="bg-card rounded-2xl p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Terms of Service</h3>
        <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
          <p>By using Livora, you agree to these terms. Livora is a health management tool and is not a substitute for professional medical advice, diagnosis, or treatment.</p>
          <p>You are responsible for the accuracy of the data you enter. Livora provides predictions and insights based on your data, but these should be verified with your healthcare provider.</p>
          <p>We reserve the right to update these terms at any time. Continued use of the app constitutes acceptance of modified terms.</p>
        </div>
      </div>
    </div>

    <div className="bg-card rounded-2xl p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Privacy Policy</h3>
        <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
          <p>Your privacy is important to us. We collect only the data necessary to provide our health management services: glucose readings, meal logs, activity data, and profile information.</p>
          <p>All personal health data is encrypted at rest and in transit using industry-standard AES-256 encryption. We never sell your data to third parties.</p>
          <p>You may request a full export or deletion of your data at any time through Settings → Delete Account.</p>
          <p>We use anonymized, aggregated data to improve our AI prediction models. No individual can be identified from this data.</p>
        </div>
      </div>
    </div>

    <p className="text-[10px] text-muted-foreground text-center">Last updated: April 2026</p>
  </motion.div>
);

export default TermsPrivacy;
