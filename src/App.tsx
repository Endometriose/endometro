import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Pesquisa from "./pages/Pesquisa";
import Dashboard from "./pages/Dashboard";
import EmpresaDashboard from "./pages/EmpresaDashboard";
import RelatorioIndividual from "./pages/RelatorioIndividual";
import NotFound from "./pages/NotFound";
import UterusChat from "./components/UterusChat";

import ScrollToTop from "./components/ScrollToTop";

import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pesquisa" element={<Pesquisa />} />
          <Route 
            path="/relatorio" 
            element={
              <ProtectedRoute requireRole="participante">
                <RelatorioIndividual />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requireRole="instituicao">
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/banco-de-dados" 
            element={
              <ProtectedRoute requireRole="instituicao">
                <EmpresaDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* IA Útero Global - Disponível em todas as rotas */}
        <UterusChat />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
