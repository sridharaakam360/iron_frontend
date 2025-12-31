import React from 'react';
import { AlertCircle, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const StoreDeactivated: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Get store deactivation reason from localStorage or context
  const storeData = JSON.parse(localStorage.getItem('ironing_shop_user') || '{}');
  const deactivationReason = storeData?.store?.deactivationReason;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-card rounded-3xl shadow-2xl p-8 md:p-12 animate-fade-in">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-foreground mb-4">
            Store Access Suspended
          </h1>

          {/* Subtitle */}
          <p className="text-center text-muted-foreground mb-8">
            Your store account has been temporarily deactivated
          </p>

          {/* Deactivation Reason */}
          {deactivationReason && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Reason for Deactivation
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {deactivationReason}
              </p>
            </div>
          )}

          {/* What to do next */}
          <div className="bg-secondary/30 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">What to do next?</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Contact Support</p>
                  <p className="text-sm text-muted-foreground">
                    Email us at support@ironpress.com for assistance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Call Us</p>
                  <p className="text-sm text-muted-foreground">
                    Reach out at +91-XXXXXXXXXX during business hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-secondary/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Logged in as:</p>
            <p className="font-medium text-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Logout
          </Button>

          {/* Footer Note */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            If you believe this is a mistake, please contact our support team immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoreDeactivated;
