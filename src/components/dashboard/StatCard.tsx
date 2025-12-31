import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  variant?: 'default' | 'primary' | 'accent' | 'success';
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  variant = 'default',
  delay = 0
}) => {
  const variants = {
    default: 'bg-card',
    primary: 'gradient-primary text-primary-foreground',
    accent: 'gradient-accent text-accent-foreground',
    success: 'bg-success text-success-foreground',
  };

  const iconBg = {
    default: 'bg-primary/10 text-primary',
    primary: 'bg-primary-foreground/20 text-primary-foreground',
    accent: 'bg-accent-foreground/20 text-accent-foreground',
    success: 'bg-success-foreground/20 text-success-foreground',
  };

  return (
    <div 
      className={cn(
        "rounded-2xl p-6 shadow-soft transition-all duration-300 hover:shadow-medium hover:-translate-y-1 animate-fade-in",
        variants[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            "text-sm font-medium mb-1",
            variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
          )}>
            {title}
          </p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p className={cn(
              "text-sm mt-2 font-medium",
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBg[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
