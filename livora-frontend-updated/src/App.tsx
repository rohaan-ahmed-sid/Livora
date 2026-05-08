import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import Welcome from "@/pages/Welcome";

import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import VerifyEmail from "@/pages/VerifyEmail";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Meals from "@/pages/Meals";
import Trends from "@/pages/Trends";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Alerts from "@/pages/Alerts";

import History from "@/pages/History";
import ManualEntry from "@/pages/ManualEntry";
import NotFound from "@/pages/NotFound";
import UpdatePersonalInfo from "@/pages/settings/UpdatePersonalInfo";
import UpdateEmail from "@/pages/settings/UpdateEmail";
import UpdatePhone from "@/pages/settings/UpdatePhone";
import ChangePassword from "@/pages/settings/ChangePassword";
import TwoFactorAuth from "@/pages/settings/TwoFactorAuth";
import Notifications from "@/pages/settings/Notifications";
import LanguageRegion from "@/pages/settings/LanguageRegion";
import HelpFaq from "@/pages/settings/HelpFaq";
import TermsPrivacy from "@/pages/settings/TermsPrivacy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth / Onboarding (no bottom nav) */}
          <Route path="/welcome" element={<Welcome />} />
          
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Main app (with bottom nav) */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/personal-info" element={<UpdatePersonalInfo />} />
            <Route path="/settings/email" element={<UpdateEmail />} />
            <Route path="/settings/phone" element={<UpdatePhone />} />
            <Route path="/settings/password" element={<ChangePassword />} />
            <Route path="/settings/two-factor" element={<TwoFactorAuth />} />
            <Route path="/settings/notifications" element={<Notifications />} />
            <Route path="/settings/language" element={<LanguageRegion />} />
            <Route path="/settings/help" element={<HelpFaq />} />
            <Route path="/settings/terms" element={<TermsPrivacy />} />
            <Route path="/alerts" element={<Alerts />} />
            
            <Route path="/history" element={<History />} />
            <Route path="/manual-entry" element={<ManualEntry />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
