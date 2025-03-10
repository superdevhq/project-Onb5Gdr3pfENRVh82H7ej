
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/layout/Layout";
import ModernLayout from "@/components/layout/ModernLayout";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Events from "@/pages/Events";
import EventDetails from "@/pages/EventDetails";
import CreateEvent from "@/pages/CreateEvent";
import NotFound from "@/pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Pages with Modern Layout */}
          <Route
            path="/"
            element={
              <ModernLayout>
                <Index />
              </ModernLayout>
            }
          />
          <Route
            path="/events"
            element={
              <ModernLayout>
                <Events />
              </ModernLayout>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ModernLayout>
                <EventDetails />
              </ModernLayout>
            }
          />
          <Route
            path="/how-it-works"
            element={
              <ModernLayout>
                <div className="container mx-auto px-4 py-12">
                  <h1 className="text-3xl font-bold mb-6">How It Works</h1>
                  <p className="text-white/70">This page is under construction.</p>
                </div>
              </ModernLayout>
            }
          />
          <Route
            path="/pricing"
            element={
              <ModernLayout>
                <div className="container mx-auto px-4 py-12">
                  <h1 className="text-3xl font-bold mb-6">Pricing</h1>
                  <p className="text-white/70">This page is under construction.</p>
                </div>
              </ModernLayout>
            }
          />
          <Route
            path="/help"
            element={
              <ModernLayout>
                <div className="container mx-auto px-4 py-12">
                  <h1 className="text-3xl font-bold mb-6">Help Center</h1>
                  <p className="text-white/70">This page is under construction.</p>
                </div>
              </ModernLayout>
            }
          />
          <Route
            path="/search"
            element={
              <ModernLayout>
                <div className="container mx-auto px-4 py-12">
                  <h1 className="text-3xl font-bold mb-6">Search Events</h1>
                  <p className="text-white/70">This page is under construction.</p>
                </div>
              </ModernLayout>
            }
          />

          {/* Auth Pages */}
          <Route
            path="/login"
            element={
              <ModernLayout>
                <Login />
              </ModernLayout>
            }
          />
          <Route
            path="/signup"
            element={
              <ModernLayout>
                <Signup />
              </ModernLayout>
            }
          />

          {/* Dashboard Pages */}
          <Route
            path="/dashboard"
            element={
              <ModernLayout>
                <Dashboard />
              </ModernLayout>
            }
          />
          <Route
            path="/create"
            element={
              <ModernLayout>
                <CreateEvent />
              </ModernLayout>
            }
          />

          {/* 404 Page */}
          <Route
            path="*"
            element={
              <ModernLayout>
                <NotFound />
              </ModernLayout>
            }
          />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
