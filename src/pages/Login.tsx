import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shirt, Mail, Lock, ArrowRight, Store } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  // Prefill demo credentials during local development for faster testing
  const [email, setEmail] = useState(import.meta.env.DEV ? 'superadmin@ironpress.com' : '');
  const [password, setPassword] = useState(import.meta.env.DEV ? 'Admin@123' : '');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.1),transparent)]" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <div className="flex items-center gap-4 mb-8 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
              <Shirt className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">IronPress</h1>
              <p className="text-primary-foreground/80">Billing System</p>
            </div>
          </div>
          <h2 className="text-3xl font-semibold mb-4 animate-fade-in delay-100">
            Streamline Your Ironing Business
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-md animate-fade-in delay-200">
            Manage bills, track orders, and notify customers with our powerful yet simple billing solution.
          </p>
          
          <div className="mt-12 space-y-4 animate-fade-in delay-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                ✓
              </div>
              <span>Quick bill creation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                ✓
              </div>
              <span>Real-time calculations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                ✓
              </div>
              <span>Customer notifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-10">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Shirt className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">IronPress</h1>
              <p className="text-sm text-muted-foreground">Billing System</p>
            </div>
          </div>

          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back</h2>
            <p className="text-muted-foreground mb-8">Sign in to manage your shop</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="admin@shop.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>

            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    New to IronPress?
                  </span>
                </div>
              </div>

              <Link to="/register">
                <Button variant="outline" className="w-full" type="button">
                  <Store className="w-4 h-4 mr-2" />
                  Register Your Store
                </Button>
              </Link>

              <p className="text-center text-xs text-muted-foreground">
                Store registration requires SuperAdmin approval
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
