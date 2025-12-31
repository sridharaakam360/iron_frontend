import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BillCard } from '@/components/bills/BillCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBills } from '@/context/BillContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type FilterStatus = 'all' | 'pending' | 'completed';

const Bills: React.FC = () => {
  const { bills, markAsCompleted, loading } = useBills();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const customerName = bill.customer?.name || '';
      const customerPhone = bill.customer?.phone || '';
      const billNumber = bill.billNumber || '';

      const matchesSearch =
        customerName.toLowerCase().includes(search.toLowerCase()) ||
        customerPhone.includes(search) ||
        billNumber.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' || bill.status.toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [bills, search, filterStatus]);

  const handleMarkComplete = async (id: string) => {
    try {
      await markAsCompleted(id);
      toast({
        title: "Bill completed!",
        description: "Customer has been notified.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bill status",
        variant: "destructive",
      });
    }
  };

  const filterButtons: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <DashboardLayout title="All Bills">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or bill ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12"
          />
        </div>

        <div className="flex gap-2">
          {filterButtons.map((btn) => (
            <Button
              key={btn.value}
              variant={filterStatus === btn.value ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setFilterStatus(btn.value)}
              className={cn(
                "transition-all",
                filterStatus === btn.value && "shadow-soft"
              )}
            >
              {btn.label}
            </Button>
          ))}
        </div>

        <Button onClick={() => navigate('/new-bill')} className="gap-2">
          <Plus className="w-4 h-4" />
          New Bill
        </Button>
      </div>

      {/* Bills List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && bills.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Loading bills...</p>
          </div>
        ) : (
          filteredBills.map((bill, index) => (
            <div key={bill.id} style={{ animationDelay: `${index * 50}ms` }}>
              <BillCard
                bill={bill}
                onMarkComplete={handleMarkComplete}
              />
            </div>
          ))
        )}
      </div>

      {filteredBills.length === 0 && !loading && (
        <div className="text-center py-16 animate-fade-in">
          <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">No bills found</p>
          <p className="text-muted-foreground mb-6">
            {search ? 'Try adjusting your search terms' : 'Create your first bill to get started'}
          </p>
          {!search && (
            <Button onClick={() => navigate('/new-bill')}>Create Bill</Button>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Bills;
