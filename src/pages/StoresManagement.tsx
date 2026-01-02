import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Store, Search, CheckCircle, XCircle, Eye, Power,
  MapPin, Phone, Mail, Calendar, AlertCircle
} from 'lucide-react';
import { api } from '@/lib/axios';

interface StoreData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstNumber?: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  _count?: {
    users: number;
    bills: number;
    customers: number;
    categories: number;
  };
  deactivationReason?: string;
  deactivatedAt?: string;
}

const StoresManagement: React.FC = () => {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreData[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stores');
      setStores(response.data.data);
      setFilteredStores(response.data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch stores',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    let filtered = stores;

    // Apply status filter
    if (filter === 'pending') {
      filtered = filtered.filter((s) => !s.isApproved);
    } else if (filter === 'approved') {
      filtered = filtered.filter((s) => s.isApproved);
    }

    // Apply search
    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase()) ||
          s.phone.includes(search)
      );
    }

    setFilteredStores(filtered);
  }, [search, filter, stores]);

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/stores/${id}/approve`);
      toast({
        title: 'Store Approved',
        description: 'Store has been approved and activated',
      });
      fetchStores();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve store',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this store? This will delete all data.')) {
      return;
    }

    try {
      await api.post(`/stores/${id}/reject`);
      toast({
        title: 'Store Rejected',
        description: 'Store has been rejected and deleted',
      });
      fetchStores();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject store',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    let reason = '';
    if (currentStatus) { // If currently active, we are deactivating
      reason = prompt('Please enter a reason for deactivation:') || '';
      if (!reason) {
        toast({
          title: 'Error',
          description: 'A reason is required to deactivate a store',
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      await api.post(`/stores/${id}/toggle-status`, { reason });
      toast({
        title: 'Status Updated',
        description: `Store has been ${currentStatus ? 'deactivated' : 'activated'} successfully`,
      });
      fetchStores();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout title="Stores Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Stores</h2>
            <p className="text-muted-foreground">
              Manage store registrations and approvals
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-4 shadow-soft">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search stores..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={filter === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilter('approved')}
              >
                Approved
              </Button>
            </div>
          </div>
        </div>

        {/* Stores List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading stores...</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No stores found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredStores.map((store) => (
              <div
                key={store.id}
                className="bg-card rounded-lg p-6 shadow-soft hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  {/* Store Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Store className="w-5 h-5 text-primary" />
                          {store.name}
                        </h3>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={store.isApproved ? 'default' : 'secondary'}>
                            {store.isApproved ? 'Approved' : 'Pending'}
                          </Badge>
                          <Badge variant={store.isActive ? 'default' : 'destructive'}>
                            {store.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {store.email}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {store.phone}
                      </div>
                      {store.address && (
                        <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                          <MapPin className="w-4 h-4" />
                          {store.address}
                          {store.city && `, ${store.city}`}
                          {store.state && `, ${store.state}`}
                          {store.pincode && ` - ${store.pincode}`}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Created: {new Date(store.createdAt).toLocaleDateString()}
                      </div>

                      {!store.isActive && store.deactivationReason && (
                        <div className="flex items-start gap-2 text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/10 col-span-2 mt-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-xs uppercase tracking-wider">Deactivation Reason</p>
                            <p className="text-sm">{store.deactivationReason}</p>
                            {store.deactivatedAt && (
                              <p className="text-[10px] opacity-70 mt-1">
                                Date: {new Date(store.deactivatedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Users: <strong>{store._count?.users ?? 0}</strong>
                      </span>
                      <span className="text-muted-foreground">
                        Bills: <strong>{store._count?.bills ?? 0}</strong>
                      </span>
                      <span className="text-muted-foreground">
                        Customers: <strong>{store._count?.customers ?? 0}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col gap-2">
                    {!store.isApproved && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(store.id)}
                          className="flex-1 lg:flex-none"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(store.id)}
                          className="flex-1 lg:flex-none"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    {store.isApproved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(store.id, store.isActive)}
                        className="flex-1 lg:flex-none"
                      >
                        <Power className="w-4 h-4 mr-2" />
                        {store.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StoresManagement;
