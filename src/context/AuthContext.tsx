import React, { createContext, useContext, useState, ReactNode } from 'react';
import { authAPI } from '../services/api.service';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  storeId?: string;
}

interface Store {
  id: string;
  name: string;
  isActive: boolean;
  deactivationReason: string | null;
}

interface AuthContextType {
  user: User | null;
  store: Store | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('ironing_shop_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.user || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [store, setStore] = useState<Store | null>(() => {
    const stored = localStorage.getItem('ironing_shop_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.store || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });

      if (response.success) {
        const { user: userData, store: storeData, accessToken, refreshToken } = response.data;
        setUser(userData);
        setStore(storeData || null);
        localStorage.setItem('ironing_shop_user', JSON.stringify({
          user: userData,
          store: storeData,
          accessToken,
          refreshToken,
        }));
        toast.success('Login successful!');
        return true;
      }
      toast.error('Login failed');
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setStore(null);
      localStorage.removeItem('ironing_shop_user');
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider value={{ user, store, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
