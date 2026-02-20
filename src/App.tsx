// src/App.tsx
import { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Project from "./pages/Project";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Commits from "./pages/Commits";
import Contributors from "./pages/Contributors";
import Retrospective from "./pages/Retrospective";
import TaskList from "./pages/TaskList";
import Documents from "./pages/Documents";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProtectedRoute><Project /></ProtectedRoute>} />
          <Route path="/project/:id/commits" element={<ProtectedRoute><Commits /></ProtectedRoute>} />
          <Route path="/project/:id/contributors" element={<ProtectedRoute><Contributors /></ProtectedRoute>} />
          <Route path="/project/:id/retrospective" element={<ProtectedRoute><Retrospective /></ProtectedRoute>} />
          <Route path="/project/:id/tasks" element={<ProtectedRoute><TaskList /></ProtectedRoute>} />
          <Route path="/project/:id/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;