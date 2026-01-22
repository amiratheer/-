import { User, Order, Restaurant, MenuItem, OrderStatus, UserRole } from '../types';

// في استضافة هوستينغر، يفضل استخدام مسار نسبي إذا كان الباك إند على نفس الدومين
// أو وضع الدومين الكامل إذا كان منفصلاً
// سنستخدم '/api' ليعمل تلقائياً مع الدومين الحالي (مثال: aklaty.com/api)
const API_URL = '/api'; 

// إذا كنت ستستخدم دومين منفصل للباك إند (مثل api.aklaty.com)، غير السطر أعلاه إلى:
// const API_URL = 'https://api.aklaty.com/v1';

const getHeaders = () => {
  const token = localStorage.getItem('aklaty_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Generic Fetch Wrapper
const request = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...getHeaders(), ...options.headers }
    });

    if (response.status === 401) {
      localStorage.removeItem('aklaty_token');
      // Only reload if we are not already on login page to avoid loops
      if (!window.location.pathname.includes('login') && localStorage.getItem('aklaty_user_role')) {
          window.location.reload();
      }
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API Request Failed: ${endpoint}`, error);
    throw error;
  }
};

export const api = {
  // Authentication
  login: async (identifier: string, password: string): Promise<{ user: User, token: string }> => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return request('/auth/me');
  },

  // Restaurants & Menu (Public/Customer)
  getRestaurants: async (filters?: any): Promise<Restaurant[]> => {
    const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/restaurants${query}`);
  },

  getMenu: async (restaurantId: string): Promise<MenuItem[]> => {
    return request(`/restaurants/${restaurantId}/menu`);
  },

  // Orders
  getOrders: async (status?: OrderStatus): Promise<Order[]> => {
    const query = status ? `?status=${status}` : '';
    return request(`/orders${query}`);
  },

  createOrder: async (orderData: Partial<Order>): Promise<Order> => {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
    return request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  assignDriver: async (orderId: string): Promise<Order> => {
    return request(`/orders/${orderId}/assign-driver`, {
      method: 'POST'
    });
  },

  // Manager Specific
  updateMenuItem: async (itemId: string, data: Partial<MenuItem>): Promise<MenuItem> => {
    return request(`/menu/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  createMenuItem: async (data: Partial<MenuItem>): Promise<MenuItem> => {
    return request(`/menu`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Driver Location
  updateLocation: async (lat: number, lng: number) => {
    return request('/driver/location', {
      method: 'POST',
      body: JSON.stringify({ lat, lng })
    });
  }
};