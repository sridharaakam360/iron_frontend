import React from 'react';
import { Receipt, Clock, CheckCircle, IndianRupee, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { BillCard } from '@/components/bills/BillCard';
import { useBills } from '@/context/BillContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import SuperAdminDashboard from './SuperAdminDashboard';

const Dashboard: React.FC = () => {
  const { bills, getStats, markAsCompleted, loading } = useBills();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const stats = getStats();

  const recentBills = bills.slice(0, 4);

  // If Super Admin, show the Super Admin Dashboard
  if (user?.role === 'SUPER_ADMIN') {
    return <SuperAdminDashboard />;
  }

  const handleMarkComplete = async (id: string) => {
    try {
      await markAsCompleted(id);
      toast({
        title: "Bill completed!",
        description: "Customer notification will be sent.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bill status",
        variant: "destructive",
      });
    }
  };

  if (loading && !stats) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total Bills"
          value={stats?.totalBills || 0}
          icon={Receipt}
          variant="primary"
          delay={0}
        />
        <StatCard
          title="Pending"
          value={stats?.pendingBills || 0}
          icon={Clock}
          variant="default"
          delay={100}
        />
        <StatCard
          title="Completed"
          value={stats?.completedBills || 0}
          icon={CheckCircle}
          variant="default"
          delay={200}
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${stats?.todayRevenue || 0}`}
          icon={IndianRupee}
          variant="accent"
          delay={300}
        />
      </div>

      {/* Weekly Revenue Card */}
      <div className="bg-card rounded-2xl p-6 shadow-soft mb-8 animate-fade-in delay-400">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Weekly Revenue</p>
            <p className="text-4xl font-bold text-foreground">₹{stats?.weeklyRevenue || 0}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-success" />
          </div>
        </div>
      </div>

      {/* Recent Bills */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Recent Bills</h2>
        <Button variant="ghost" onClick={() => navigate('/bills')}>
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recentBills.map((bill) => (
          <BillCard
            key={bill.id}
            bill={bill}
            onMarkComplete={handleMarkComplete}
          />
        ))}
      </div>

      {recentBills.length === 0 && (
        <div className="text-center py-12 bg-card rounded-2xl">
          <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No bills yet</p>
          <Button onClick={() => navigate('/new-bill')}>Create First Bill</Button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
