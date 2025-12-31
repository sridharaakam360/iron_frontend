import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, User, Mail, Phone, MapPin, Building2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';

const StoreRegister: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    storeName: '',
    storeEmail: '',
    storePhone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    console.log('🟡 [FRONTEND] Starting registration...', {
      storeName: formData.storeName,
      storeEmail: formData.storeEmail,
    });

    setLoading(true);
    const startTime = Date.now();

    try {
      console.log('🟡 [FRONTEND] Sending request to /stores/register...');
      const response = await api.post('/stores/register', {
        storeName: formData.storeName,
        storeEmail: formData.storeEmail,
        storePhone: formData.storePhone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        gstNumber: formData.gstNumber,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        password: formData.password,
      });

      console.log(`✅ [FRONTEND] Registration successful! Time: ${Date.now() - startTime}ms`, response.data);

      toast({
        title: 'Registration Successful!',
        description: response.data.message || 'Your store registration is pending approval.',
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.log(`❌ [FRONTEND] Registration failed! Time: ${Date.now() - startTime}ms`, error);
      toast({
        title: 'Registration Failed',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-4xl bg-card rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Store Registration</h1>
          <p className="text-muted-foreground mt-2">
            Register your laundry shop with IronPress
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Store Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Store Name *</label>
                <Input
                  name="storeName"
                  placeholder="My Laundry Shop"
                  value={formData.storeName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Store Email *</label>
                <Input
                  name="storeEmail"
                  type="email"
                  placeholder="store@example.com"
                  value={formData.storeEmail}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Store Phone *</label>
                <Input
                  name="storePhone"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.storePhone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">GST Number</label>
                <Input
                  name="gstNumber"
                  placeholder="22AAAAA0000A1Z5"
                  value={formData.gstNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Address</label>
              <Input
                name="address"
                placeholder="123 Main Street"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">City</label>
                <Input
                  name="city"
                  placeholder="Bangalore"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">State</label>
                <Input
                  name="state"
                  placeholder="Karnataka"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Pincode</label>
                <Input
                  name="pincode"
                  placeholder="560001"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Admin Information */}
          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Admin Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Admin Name *</label>
                <Input
                  name="adminName"
                  placeholder="John Doe"
                  value={formData.adminName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Admin Email *</label>
                <Input
                  name="adminEmail"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password *</label>
                <Input
                  name="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm Password *</label>
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Registering store...
                </>
              ) : (
                'Register Store'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreRegister;
