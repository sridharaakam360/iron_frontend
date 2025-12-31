export interface ItemCategory {
  id: string;
  name: string;
  price: number;
  icon: string;
}

export interface BillItem {
  id?: string;
  categoryId: string;
  categoryName?: string;
  category?: ItemCategory;
  quantity: number;
  price: number;
  subtotal?: number;
  total?: number; // Legacy, will use subtotal
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  customer: Customer;
  items: BillItem[];
  totalAmount: number;
  status: string; // 'PENDING', 'COMPLETED', etc.
  notes?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  completedAt?: string | Date;
}

export interface DashboardStats {
  totalBills: number;
  pendingBills: number;
  completedBills: number;
  todayRevenue: number;
  weeklyRevenue: number;
}
