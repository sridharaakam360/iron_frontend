import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { ItemCategory } from '@/types/billing';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ItemSelectorProps {
  category: ItemCategory;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

export const ItemSelector: React.FC<ItemSelectorProps> = ({ 
  category, 
  quantity, 
  onQuantityChange 
}) => {
  const isSelected = quantity > 0;

  return (
    <div className={cn(
      "rounded-2xl p-4 border-2 transition-all duration-200",
      isSelected 
        ? "border-primary bg-primary/5 shadow-soft" 
        : "border-border bg-card hover:border-primary/50"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <h4 className="font-semibold text-foreground">{category.name}</h4>
            <p className="text-sm text-primary font-medium">₹{category.price}/pc</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-lg"
            onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
            disabled={quantity === 0}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-10 text-center font-semibold text-lg">{quantity}</span>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-lg"
            onClick={() => onQuantityChange(quantity + 1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {isSelected && (
          <p className="font-semibold text-primary">
            ₹{quantity * category.price}
          </p>
        )}
      </div>
    </div>
  );
};
