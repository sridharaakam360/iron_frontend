import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { store, user, logout } = useAuth();
  const isDeactivated = store && !store.isActive && user?.role !== 'SUPER_ADMIN';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-72">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-8">
          {isDeactivated ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-up">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">Store Deactivated</h1>
              <div className="max-w-md bg-card border border-destructive/20 p-6 rounded-2xl shadow-soft mb-8">
                <p className="text-muted-foreground mb-2 font-medium">Deactivation Reason:</p>
                <p className="text-destructive text-lg font-semibold italic">
                  "{store?.deactivationReason || 'No reason provided'}"
                </p>
              </div>
              <p className="text-muted-foreground mb-8 text-sm">
                Please contact our support or a super administrator to resolve this and reactivate your store.
              </p>
              <Button
                variant="outline"
                onClick={() => logout()}
                className="gap-2 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};
