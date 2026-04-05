import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CheckIn from "./pages/CheckIn";
import Suggestions from "./pages/Suggestions";
import Affirmations from "./pages/Affirmations";
import Insights from "./pages/Insights";
import MoodHistory from "./pages/MoodHistory";
import NearbyPlaces from "./pages/NearbyPlaces";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import AppLayout from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/checkin" element={<CheckIn />} />
            <Route path="/suggestions" element={<Suggestions />} />
            <Route path="/affirmations" element={<Affirmations />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/history" element={<MoodHistory />} />
            <Route path="/places" element={<NearbyPlaces />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
