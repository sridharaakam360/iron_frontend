import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { BillProvider } from "@/context/BillContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import StoreRegister from "./pages/StoreRegister";
import Dashboard from "./pages/Dashboard";
import EmployeeManagement from "./pages/EmployeeManagement";
import NewBill from "./pages/NewBill";
import Bills from "./pages/Bills";
import BillDetails from "./pages/BillDetails";
import Settings from "./pages/Settings";
import StoresManagement from "./pages/StoresManagement";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import StoreDeactivated from "./pages/StoreDeactivated";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BillProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<StoreRegister />} />
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/new-bill" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                  <NewBill />
                </ProtectedRoute>
              } />
              <Route path="/bills" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                  <Bills />
                </ProtectedRoute>
              } />
              <Route path="/bills/:id" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                  <BillDetails />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE']}>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/stores-management" element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <StoresManagement />
                </ProtectedRoute>
              } />
              <Route path="/subscriptions" element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <SubscriptionManagement />
                </ProtectedRoute>
              } />
              <Route path="/employees" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <EmployeeManagement />
                </ProtectedRoute>
              } />
              <Route path="/store-deactivated" element={<StoreDeactivated />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </BillProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
