import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, ShoppingBag, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ItemSelector } from '@/components/bills/ItemSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { categoriesAPI } from '@/services/api.service';
import { useBills } from '@/context/BillContext';
import { ItemCategory } from '@/types/billing';
import { useToast } from '@/hooks/use-toast';

const NewBill: React.FC = () => {
  const navigate = useNavigate();
  const { addBill } = useBills();
  const { toast } = useToast();

  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await categoriesAPI.getAll();
        if (response.success) {
          setCategories(response.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [toast]);

  const selectedItems = useMemo(() => {
    return categories
      .filter(cat => quantities[cat.id] > 0)
      .map(cat => ({
        categoryId: cat.id,
        categoryName: cat.name,
        quantity: quantities[cat.id],
        price: cat.price,
        total: quantities[cat.id] * cat.price,
      }));
  }, [quantities, categories]);

  const totalAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.total, 0);
  }, [selectedItems]);

  const totalItems = useMemo(() => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  }, [quantities]);

  const handleQuantityChange = (categoryId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [categoryId]: quantity,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter customer name and phone number.",
        variant: "destructive",
      });
      return;
    }

    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item.",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const confirmCreateBill = async () => {
    try {
      setIsSubmitting(true);
      const billData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        items: selectedItems.map(item => ({
          categoryId: item.categoryId,
          quantity: item.quantity
        }))
      };

      await addBill(billData);

      toast({
        title: "Bill created!",
        description: `Bill created successfully for ₹${totalAmount}.`,
      });

      setShowConfirmation(false);
      navigate('/bills');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create bill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="New Bill">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Customer Details */}
        <div className="bg-card rounded-2xl p-6 shadow-soft mb-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Customer Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="pl-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="Phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="pl-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email (Optional)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="pl-11"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Item Selection */}
        <div className="bg-card rounded-2xl p-6 shadow-soft mb-6 animate-fade-in delay-100">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Select Items
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingCategories ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground bg-card/50 rounded-2xl border border-dashed">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Loading items...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-card/50 rounded-2xl border border-dashed">
                <p>No categories found. Please add them in Settings.</p>
              </div>
            ) : (
              categories.map((category) => (
                <ItemSelector
                  key={category.id}
                  category={category}
                  quantity={quantities[category.id] || 0}
                  onQuantityChange={(qty) => handleQuantityChange(category.id, qty)}
                />
              ))
            )}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="bg-card rounded-2xl p-6 shadow-soft animate-fade-in delay-200 sticky bottom-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {totalItems} item{totalItems !== 1 ? 's' : ''} selected
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="text-3xl font-bold text-primary">₹{totalAmount}</span>
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 sm:flex-none"
                disabled={selectedItems.length === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Bill'
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={confirmCreateBill}
        title="Confirm Bill Creation"
        description={`Create bill for ${customerName} with ${totalItems} item(s) totaling ₹${totalAmount}?`}
        confirmText="Create Bill"
        cancelText="Cancel"
      />
    </DashboardLayout>
  );
};

export default NewBill;
