import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/welcome" replace />;
  return <Outlet />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Redirect root to welcome if not handled by ProtectedRoute */}
          <Route path="/" element={<Navigate to="/welcome" replace />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
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
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;