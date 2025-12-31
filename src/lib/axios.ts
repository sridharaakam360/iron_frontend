import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('ironing_shop_user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.accessToken) {
          config.headers.Authorization = `Bearer ${userData.accessToken}`;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and has refresh token, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const user = localStorage.getItem('ironing_shop_user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          if (userData.refreshToken) {
            const response = await axios.post(`${API_URL}/auth/refresh-token`, {
              refreshToken: userData.refreshToken,
            });

            const { accessToken, refreshToken } = response.data.data;

            // Update stored tokens
            userData.accessToken = accessToken;
            userData.refreshToken = refreshToken;
            localStorage.setItem('ironing_shop_user', JSON.stringify(userData));

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('ironing_shop_user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
