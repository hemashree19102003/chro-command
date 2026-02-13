import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HRApps from "./pages/HRApps";
import Dashboard from "./pages/Dashboard";
import Recruit from "./pages/Recruit";
import People from "./pages/People";
import Payroll from "./pages/Payroll";
import Expense from "./pages/Expense";
import SignModule from "./pages/SignModule";
import Shifts from "./pages/Shifts";
import Workerly from "./pages/Workerly";
import CommandCenter from "./pages/CommandCenter";
import Analytics from "./pages/Analytics";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HRApps />} />
          <Route path="/hr" element={<HRApps />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recruit" element={<Recruit />} />
          <Route path="/people" element={<People />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/expense" element={<Expense />} />
          <Route path="/sign" element={<SignModule />} />
          <Route path="/shifts" element={<Shifts />} />
          <Route path="/workerly" element={<Workerly />} />
          <Route path="/command-center" element={<CommandCenter />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
