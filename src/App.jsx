import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SocketProvider } from "./contexts/SocketContext";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import Disasters from "./pages/Disasters";
import DisasterDetail from "./pages/DisasterDetail";
import Reports from "./pages/Reports";
import Resources from "./pages/Resources";
import SocialMedia from "./pages/SocialMedia";
import Verification from "./pages/Verification";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <SocketProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/disasters" element={<Disasters />} />
                            <Route
                              path="/disasters/:id"
                              element={<DisasterDetail />}
                            />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/resources" element={<Resources />} />
                            <Route
                              path="/social-media"
                              element={<SocialMedia />}
                            />
                            <Route
                              path="/verification"
                              element={<Verification />}
                            />
                            <Route path="/settings" element={<Settings />} />
                          </Routes>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: "var(--toast-bg)",
                      color: "var(--toast-color)",
                      borderRadius: "8px",
                    },
                    success: {
                      iconTheme: {
                        primary: "#22c55e",
                        secondary: "#ffffff",
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: "#ef4444",
                        secondary: "#ffffff",
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </SocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
