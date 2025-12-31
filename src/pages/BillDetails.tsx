import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Clock, CheckCircle, Send, Printer } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useBills } from '@/context/BillContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const BillDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBill, markAsCompleted } = useBills();
  const { toast } = useToast();
  const [bill, setBill] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchBill = React.useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getBill(id);
      setBill(data);
    } catch (error) {
      console.error('Failed to fetch bill:', error);
    } finally {
      setLoading(false);
    }
  }, [id, getBill]);

  React.useEffect(() => {
    fetchBill();
  }, [fetchBill]);

  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!bill) {
    return (
      <DashboardLayout title="Bill Not Found">
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Bill not found</p>
          <Button onClick={() => navigate('/bills')}>Back to Bills</Button>
        </div>
      </DashboardLayout>
    );
  }

  const isPending = bill.status?.toLowerCase() === 'pending';

  const handleMarkComplete = async () => {
    try {
      await markAsCompleted(bill.id);
      toast({
        title: "Bill completed!",
        description: "Customer notification sent successfully.",
      });
      fetchBill();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bill status",
        variant: "destructive",
      });
    }
  };

  const handleSendNotification = () => {
    toast({
      title: "Notification sent!",
      description: `Message sent to ${bill.customer?.phone}`,
    });
  };

  return (
    <DashboardLayout title={bill.billNumber}>
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/bills')}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Bills
        </Button>

        {/* Bill Header */}
        <div className="bg-card rounded-2xl p-6 shadow-soft mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{bill.billNumber}</h1>
              <p className="text-sm text-muted-foreground">
                Created on {new Date(bill.createdAt).toLocaleDateString('en-IN', {
                  dateStyle: 'long',
                })} at {new Date(bill.createdAt).toLocaleTimeString('en-IN', {
                  timeStyle: 'short',
                })}
              </p>
            </div>
            <div className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 self-start",
              isPending
                ? "bg-warning/10 text-warning"
                : "bg-success/10 text-success"
            )}>
              {isPending ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              {isPending ? 'Pending' : 'Completed'}
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="font-semibold text-foreground">{bill.customer.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-semibold text-foreground">{bill.customer.phone}</p>
              </div>
            </div>
            {bill.customer.email && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground truncate">{bill.customer.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="bg-card rounded-2xl shadow-soft mb-6 overflow-hidden animate-fade-in delay-100">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Items</h2>
            {bill.notes && (
              <p className="text-sm text-muted-foreground italic">Note: {bill.notes}</p>
            )}
          </div>
          <div className="divide-y divide-border">
            {bill.items.map((item: any, index: number) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">
                    {item.category?.icon || '👕'}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{item.category?.name || item.categoryName}</p>
                    <p className="text-sm text-muted-foreground">₹{item.price} × {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold text-foreground">₹{item.subtotal || item.total}</p>
              </div>
            ))}
          </div>
          <div className="p-6 bg-secondary/50 flex justify-between items-center">
            <span className="text-lg font-semibold text-foreground">Total Amount</span>
            <span className="text-2xl font-bold text-primary">₹{bill.totalAmount}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 animate-fade-in delay-200">
          {isPending && (
            <Button variant="success" onClick={handleMarkComplete} className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Mark as Completed
            </Button>
          )}
          <Button variant="outline" onClick={handleSendNotification} className="gap-2">
            <Send className="w-4 h-4" />
            Send Notification
          </Button>
          <Button variant="secondary" className="gap-2">
            <Printer className="w-4 h-4" />
            Print Bill
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BillDetails;
