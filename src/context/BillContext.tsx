import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Bill, DashboardStats } from '@/types/billing';
import { billsAPI } from '@/services/api.service';
import { useAuth } from './AuthContext';

interface BillContextType {
  bills: Bill[];
  loading: boolean;
  addBill: (billData: any) => Promise<void>;
  updateBill: (id: string, updates: any) => Promise<void>;
  markAsCompleted: (id: string) => Promise<void>;
  getBill: (id: string) => Promise<Bill | undefined>;
  getStats: () => DashboardStats | null;
  refreshBills: () => Promise<void>;
}

const BillContext = createContext<BillContextType | undefined>(undefined);

export const BillProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await billsAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchBills = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const response = await billsAPI.getAll();
      if (response.success) {
        setBills(response.data || []);
      }
      await fetchStats();
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchStats]);

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'SUPER_ADMIN') {
      fetchBills();
    }
  }, [isAuthenticated, user?.role, fetchBills]);

  const addBill = async (billData: any) => {
    try {
      const response = await billsAPI.create(billData);
      if (response.success) {
        await fetchBills();
      }
    } catch (error) {
      console.error('Failed to add bill:', error);
      throw error;
    }
  };

  const updateBill = async (id: string, updates: any) => {
    try {
      const response = await billsAPI.update(id, updates);
      if (response.success) {
        await fetchBills();
      }
    } catch (error) {
      console.error('Failed to update bill:', error);
      throw error;
    }
  };

  const markAsCompleted = async (id: string) => {
    await updateBill(id, { status: 'COMPLETED' });
  };

  const getBill = async (id: string) => {
    try {
      const response = await billsAPI.getById(id);
      return response.data;
    } catch (error) {
      console.error('Failed to get bill:', error);
      return undefined;
    }
  };

  const getStats = () => stats;

  return (
    <BillContext.Provider value={{
      bills,
      loading,
      addBill,
      updateBill,
      markAsCompleted,
      getBill,
      getStats,
      refreshBills: fetchBills
    }}>
      {children}
    </BillContext.Provider>
  );
};

export const useBills = () => {
  const context = useContext(BillContext);
  if (context === undefined) {
    throw new Error('useBills must be used within a BillProvider');
  }
  return context;
};
