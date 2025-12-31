import React, { useEffect, useState } from 'react';
import { Store, Users, TrendingUp, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface StoreStats {
  totalStores: number;
  activeStores: number;
  pendingApproval: number;
  inactiveStores: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiringSoon: number;
  totalRevenue: number;
}

interface StoreSubscription {
  id: string;
  storeName: string;
  storeEmail: string;
  plan: string;
  status: string;
  renewalDate: string;
  amount: number;
  daysUntilRenewal: number;
}

const SuperAdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StoreStats>({
    totalStores: 0,
    activeStores: 0,
    pendingApproval: 0,
    inactiveStores: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    expiringSoon: 0,
    totalRevenue: 0,
  });
  const [expiringSubscriptions, setExpiringSubscriptions] = useState<StoreSubscription[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, subscriptionsResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/subscriptions/expiring-soon'),
      ]);

      setStats(statsResponse.data.data);
      setExpiringSubscriptions(subscriptionsResponse.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'EXPIRED':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'SUSPENDED':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan.toUpperCase()) {
      case 'FREE':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'PRO':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Super Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Super Admin Dashboard">
      {/* Store Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total Stores"
          value={stats.totalStores}
          icon={Store}
          variant="primary"
          delay={0}
        />
        <StatCard
          title="Active Stores"
          value={stats.activeStores}
          icon={CheckCircle}
          variant="default"
          delay={100}
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingApproval}
          icon={Clock}
          variant="default"
          delay={200}
        />
        <StatCard
          title="Inactive Stores"
          value={stats.inactiveStores}
          icon={XCircle}
          variant="accent"
          delay={300}
        />
      </div>

      {/* Subscription Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total Subscriptions"
          value={stats.totalSubscriptions}
          icon={Users}
          variant="primary"
          delay={400}
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={CheckCircle}
          variant="default"
          delay={500}
        />
        <StatCard
          title="Expiring Soon (30 days)"
          value={stats.expiringSoon}
          icon={AlertCircle}
          variant="default"
          delay={600}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          variant="accent"
          delay={700}
        />
      </div>

      {/* Expiring Subscriptions */}
      <div className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in delay-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Subscriptions Expiring Soon</h2>
          </div>
          <Button variant="ghost" onClick={() => navigate('/stores-management')}>
            View All Stores
          </Button>
        </div>

        {expiringSubscriptions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No subscriptions expiring in the next 30 days</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expiringSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl hover:bg-secondary/70 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{subscription.storeName}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPlanColor(subscription.plan)}`}>
                      {subscription.plan}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{subscription.storeEmail}</p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-foreground">₹{subscription.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    Renews in {subscription.daysUntilRenewal} days
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(subscription.renewalDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in delay-900">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/stores-management')}
            >
              <Store className="w-4 h-4 mr-2" />
              Manage Stores
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/subscriptions')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Manage Subscriptions
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/settings')}
            >
              <Users className="w-4 h-4 mr-2" />
              System Settings
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in delay-1000">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {stats.activeStores} stores currently active
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                {stats.pendingApproval} stores awaiting approval
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                {stats.expiringSoon} subscriptions expiring soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
