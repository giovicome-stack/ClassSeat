import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "sonner";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (user === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user === null) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <AuthProvider>
              <Toaster position="top-right" richColors />
              <Routes>
                <Route
                  path="/auth"
                  element={
                    <GuestRoute>
                      <AuthPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
