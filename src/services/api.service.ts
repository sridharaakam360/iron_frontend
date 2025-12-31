import api from '../lib/axios';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface BillCreateData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  items: {
    categoryId: string;
    quantity: number;
  }[];
  notes?: string;
}

export interface BillUpdateData {
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface CategoryData {
  name: string;
  price: number;
  icon?: string;
}

export interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Bills API
export const billsAPI = {
  create: async (data: BillCreateData) => {
    const response = await api.post('/bills', data);
    return response.data;
  },

  getAll: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/bills', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/bills/${id}`);
    return response.data;
  },

  update: async (id: string, data: BillUpdateData) => {
    const response = await api.put(`/bills/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/bills/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/bills/stats');
    return response.data;
  },

  downloadPDF: async (id: string) => {
    const response = await api.get(`/bills/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async (includeInactive = false) => {
    const response = await api.get('/categories', {
      params: { includeInactive },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data: CategoryData) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CategoryData & { isActive?: boolean }>) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// Customers API
export const customersAPI = {
  getAll: async (params?: { search?: string; page?: number; limit?: number }) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (data: CustomerData) => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CustomerData>) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  sendBillNotification: async (billId: string, type: 'SMS' | 'EMAIL') => {
    const response = await api.post(`/notifications/bills/${billId}/send`, { type });
    return response.data;
  },

  getHistory: async (billId?: string) => {
    const response = await api.get('/notifications/history', {
      params: { billId },
    });
    return response.data;
  },
};

export default {
  auth: authAPI,
  bills: billsAPI,
  categories: categoriesAPI,
  customers: customersAPI,
  notifications: notificationsAPI,
};
