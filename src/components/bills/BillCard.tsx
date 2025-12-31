import React from 'react';
import { Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { Bill } from '@/types/billing';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface BillCardProps {
  bill: Bill;
  onMarkComplete?: (id: string) => void;
}

export const BillCard: React.FC<BillCardProps> = ({ bill, onMarkComplete }) => {
  const navigate = useNavigate();
  const isPending = bill.status?.toLowerCase() === 'pending';

  return (
    <div className="bg-card rounded-2xl p-5 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">{bill.billNumber}</p>
          <h3 className="text-lg font-semibold text-foreground">{bill.customer.name}</h3>
          <p className="text-sm text-muted-foreground">{bill.customer.phone}</p>
        </div>
        <div className={cn(
          "px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5",
          isPending
            ? "bg-warning/10 text-warning"
            : "bg-success/10 text-success"
        )}>
          {isPending ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
          {isPending ? 'Pending' : 'Completed'}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {bill.items.slice(0, 3).map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {item.quantity}x {item.category?.name || item.categoryName}
            </span>
            <span className="font-medium text-foreground">₹{item.subtotal || item.total}</span>
          </div>
        ))}
        {bill.items.length > 3 && (
          <p className="text-xs text-muted-foreground">+{bill.items.length - 3} more items</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">Total Amount</p>
          <p className="text-xl font-bold text-primary">₹{bill.totalAmount}</p>
        </div>
        <div className="flex gap-2">
          {isPending && onMarkComplete && (
            <Button
              size="sm"
              variant="success"
              onClick={() => onMarkComplete(bill.id)}
            >
              Complete
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/bills/${bill.id}`)}
          >
            View <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
