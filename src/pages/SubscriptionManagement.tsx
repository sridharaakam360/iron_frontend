import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';
import { Plus } from 'lucide-react';

interface Store {
  id: string;
  name: string;
  email: string;
}

interface SubscriptionFormData {
  storeId: string;
  plan: string;
  billingCycle: string;
  amount: string;
  startDate: string;
  endDate?: string;
}

const PLAN_DESCRIPTIONS: Record<string, string> = {
  FREE: 'Basic access with custom expiration date. No monthly costs.',
  PRO: 'Full featured plan with standard billing cycles (Monthly, Quarterly, Yearly).',
};

const SubscriptionManagement: React.FC = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [formData, setFormData] = useState<SubscriptionFormData>({
    storeId: '',
    plan: 'FREE',
    billingCycle: 'CUSTOM',
    amount: '0',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handleSubmit = async () => {
    if (!formData.storeId || !formData.amount) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/subscriptions', {
        storeId: formData.storeId,
        plan: formData.plan,
        billingCycle: formData.billingCycle,
        amount: parseFloat(formData.amount || '0'),
        startDate: formData.startDate,
        endDate: formData.plan === 'FREE' ? formData.endDate : undefined,
      });

      toast({
        title: 'Success',
        description: 'Subscription created successfully',
      });

      setOpen(false);
      setFormData({
        storeId: '',
        plan: 'FREE',
        billingCycle: 'CUSTOM',
        amount: '0',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create subscription',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoadingList(true);
      const response = await api.get('/admin/subscriptions');
      setSubscriptions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subscriptions',
        variant: 'destructive',
      });
    } finally {
      setLoadingList(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await api.get('/stores');
      setStores(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  React.useEffect(() => {
    fetchSubscriptions();
    fetchStores();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/subscriptions/${id}`, { status });
      toast({
        title: 'Success',
        description: `Subscription ${status.toLowerCase()} successfully`,
      });
      fetchSubscriptions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update subscription',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt('Please enter a cancellation reason:');
    if (reason === null) return;

    try {
      await api.patch(`/admin/subscriptions/${id}`, { status: 'CANCELLED', cancelReason: reason });
      toast({
        title: 'Success',
        description: 'Subscription cancelled successfully',
      });
      fetchSubscriptions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to cancel subscription',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout title="Subscription Management">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Manage Subscriptions</h2>
            <p className="text-muted-foreground">Create and manage store subscriptions</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Subscription
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Subscription</DialogTitle>
                <DialogDescription>
                  Enter subscription details for the store
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="store">Store</Label>
                  <Select
                    value={formData.storeId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, storeId: value }))}
                  >
                    <SelectTrigger id="store">
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name} ({store.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="plan">Plan</Label>
                    <Select
                      value={formData.plan}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, plan: value }))}
                    >
                      <SelectTrigger id="plan">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FREE">Free</SelectItem>
                        <SelectItem value="PRO">Pro</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {PLAN_DESCRIPTIONS[formData.plan]}
                    </p>
                  </div>

                  {formData.plan === 'PRO' && (
                    <div className="grid gap-2">
                      <Label htmlFor="billingCycle">Billing Cycle</Label>
                      <Select
                        value={formData.billingCycle}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, billingCycle: value }))}
                      >
                        <SelectTrigger id="billingCycle">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MONTHLY">Monthly</SelectItem>
                          <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                          <SelectItem value="YEARLY">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    disabled={formData.plan === 'FREE'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>

                  {formData.plan === 'FREE' ? (
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">Expiry Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Subscription'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Subscription List - To be implemented */}
        <div className="bg-card rounded-2xl overflow-hidden shadow-soft">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">All Subscriptions</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-6 py-4 font-semibold text-sm">Store</th>
                  <th className="px-6 py-4 font-semibold text-sm">Plan</th>
                  <th className="px-6 py-4 font-semibold text-sm">Status</th>
                  <th className="px-6 py-4 font-semibold text-sm">Amount</th>
                  <th className="px-6 py-4 font-semibold text-sm">Dates</th>
                  <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loadingList ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      Loading subscriptions...
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium">{sub.store.name}</div>
                        <div className="text-xs text-muted-foreground">{sub.store.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sub.plan === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700' :
                          sub.plan === 'PROFESSIONAL' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                          {sub.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          sub.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">₹{sub.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="text-xs">
                          <span className="text-muted-foreground">Ends:</span> {new Date(sub.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs">
                          <span className="text-muted-foreground">Renew:</span> {new Date(sub.renewalDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {sub.status === 'ACTIVE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(sub.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout >
  );
};

export default SubscriptionManagement;
