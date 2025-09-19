import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import LiveChannels from "./pages/LiveChannels";
import VideoOnDemand from "./pages/VideoOnDemand";
import GuestMessages from "./pages/GuestMessages";
import GuestMessageResponses from "./pages/GuestMessageResponses";
import Devices from "./pages/Devices";
import Login from "./pages/Login";
import PasswordReset from "./pages/PasswordReset";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Authentication routes - no layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          
          {/* Protected routes with layout */}
          <Route path="/*" element={
            <ProtectedRoute>
              <SidebarProvider>
                <div className="min-h-screen flex w-full bg-gradient-dark">
                  {/* Global sidebar trigger */}
                  <header className="fixed top-0 left-0 z-50 h-12 flex items-center bg-background/80 backdrop-blur-md border-b border-border">
                    <SidebarTrigger className="ml-4" />
                  </header>
                  
                  <AppSidebar />
                  
                  <main className="flex-1 pt-12">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/channels" element={<LiveChannels />} />
                      <Route path="/vod" element={<VideoOnDemand />} />
                      <Route path="/guest-messages" element={<GuestMessages />} />
                      <Route path="/guest-messages/:messageId/responses" element={<GuestMessageResponses />} />
                      <Route path="/devices" element={<Devices />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
