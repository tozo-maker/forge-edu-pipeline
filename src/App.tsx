
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import PipelineIntro from "./pages/PipelineIntro";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectWizard from "./pages/ProjectWizard";
import ProjectDetails from "./pages/ProjectDetails";
import NotFound from "./pages/NotFound";
import { useAuth } from "./contexts/AuthContext";

// Pipeline stage components
import OutlineContextStage from "./components/pipeline/stages/OutlineContextStage";
import SectionDetailsStage from "./components/pipeline/stages/SectionDetailsStage";
import ClaudePromptsStage from "./components/pipeline/stages/ClaudePromptsStage";
import ContentGenerationStage from "./components/pipeline/stages/ContentGenerationStage";
import ValidationStage from "./components/pipeline/stages/ValidationStage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/pipeline-intro" element={<ProtectedRoute><PipelineIntro /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/projects/new" element={<ProtectedRoute><ProjectWizard /></ProtectedRoute>} />
      
      {/* Project and pipeline stages routes */}
      <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
      <Route path="/projects/:projectId/project_config" element={<ProtectedRoute><ProjectWizard /></ProtectedRoute>} />
      <Route path="/projects/:projectId/outline_context" element={<ProtectedRoute><OutlineContextStage /></ProtectedRoute>} />
      <Route path="/projects/:projectId/section_details" element={<ProtectedRoute><SectionDetailsStage /></ProtectedRoute>} />
      <Route path="/projects/:projectId/claude_prompts" element={<ProtectedRoute><ClaudePromptsStage /></ProtectedRoute>} />
      <Route path="/projects/:projectId/content" element={<ProtectedRoute><ContentGenerationStage /></ProtectedRoute>} />
      <Route path="/projects/:projectId/validation" element={<ProtectedRoute><ValidationStage /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
