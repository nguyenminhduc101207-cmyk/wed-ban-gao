import {
  Category,
  Product,
  DeliveryZone,
  Order,
  OrderQuote,
  User,
} from '../types';
import {
  FIXTURE_CATEGORIES,
  FIXTURE_PRODUCTS,
  FIXTURE_ZONES,
} from './fixtures';

const BASE_URL = ''; // Do dùng Vite proxy /api -> http://localhost:3001

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const errorMsg =
      (data && data.message) ||
      (Array.isArray(data?.message) ? data.message.join(', ') : null) ||
      res.statusText ||
      'Đã xảy ra lỗi khi kết nối máy chủ';
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    async register(data: {
      email: string;
      password: string;
      fullName: string;
      phone: string;
      address?: string;
    }) {
      return request<{ user: User; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async login(data: { email: string; password: string }) {
      return request<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async getMe(): Promise<User | null> {
      try {
        return await request<User>('/api/auth/me');
      } catch {
        return null;
      }
    },

    async logout() {
      return request<{ success: boolean; message: string }>(
        '/api/auth/logout',
        { method: 'POST' },
      );
    },
  },

  // Catalog
  catalog: {
    async getCategories(): Promise<Category[]> {
      try {
        return await request<Category[]>('/api/catalog/categories');
      } catch (err) {
        console.warn('API error, using fixture categories', err);
        return FIXTURE_CATEGORIES;
      }
    },

    async getFeaturedProducts(): Promise<Product[]> {
      try {
        return await request<Product[]>('/api/catalog/products/featured');
      } catch (err) {
        console.warn('API error, using fixture products', err);
        return FIXTURE_PRODUCTS;
      }
    },

    async getProducts(params?: {
      search?: string;
      category?: string;
      sort?: string;
      page?: number;
      limit?: number;
    }): Promise<{
      items: Product[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }> {
      try {
        const q = new URLSearchParams();
        if (params?.search) q.append('search', params.search);
        if (params?.category) q.append('category', params.category);
        if (params?.sort) q.append('sort', params.sort);
        if (params?.page) q.append('page', String(params.page));
        if (params?.limit) q.append('limit', String(params.limit));

        return await request(`/api/catalog/products?${q.toString()}`);
      } catch (err) {
        console.warn('API error, using fixture product list', err);
        return {
          items: FIXTURE_PRODUCTS,
          total: FIXTURE_PRODUCTS.length,
          page: 1,
          limit: 12,
          totalPages: 1,
        };
      }
    },

    async getProductBySlug(slug: string): Promise<Product> {
      try {
        return await request<Product>(`/api/catalog/products/${slug}`);
      } catch (err) {
        console.warn(`API error for slug ${slug}, using fixture product`, err);
        const found = FIXTURE_PRODUCTS.find((p) => p.slug === slug);
        if (found) return found;
        throw err;
      }
    },
  },

  // Delivery Zones
  deliveryZones: {
    async getAll(): Promise<DeliveryZone[]> {
      try {
        return await request<DeliveryZone[]>('/api/delivery-zones');
      } catch (err) {
        console.warn('API error, using fixture delivery zones', err);
        return FIXTURE_ZONES;
      }
    },
  },

  // Orders
  orders: {
    async calculateQuote(data: {
      items: { skuId: string; quantity: number }[];
      deliveryZoneId: string;
    }): Promise<OrderQuote> {
      return request<OrderQuote>('/api/orders/quote', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async createOrder(data: {
      items: { skuId: string; quantity: number }[];
      deliveryZoneId: string;
      recipientName: string;
      recipientPhone: string;
      recipientAddress: string;
      paymentMethod: string;
      note?: string;
      idempotencyKey?: string;
    }): Promise<Order> {
      return request<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async getOrderByCode(code: string): Promise<Order> {
      return request<Order>(`/api/orders/code/${code}`);
    },

    async getOrderById(id: string): Promise<Order> {
      return request<Order>(`/api/orders/${id}`);
    },

    async getMyOrders(): Promise<Order[]> {
      return request<Order[]>('/api/orders/my-orders');
    },

    async getStaffOrders(status?: string): Promise<Order[]> {
      const q = status ? `?status=${status}` : '';
      return request<Order[]>(`/api/orders/staff/orders${q}`);
    },

    async transitionStatus(
      orderId: string,
      status: string,
      note?: string,
      assignedStaffId?: string,
    ): Promise<Order> {
      return request<Order>(`/api/orders/${orderId}/transition`, {
        method: 'POST',
        body: JSON.stringify({ status, note, assignedStaffId }),
      });
    },

    async cancelOrder(
      orderId: string,
      note?: string,
    ): Promise<{ success: boolean; message: string; order: Order }> {
      return request(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      });
    },

    async confirmReceipt(
      orderId: string,
    ): Promise<{ success: boolean; message: string; order: Order }> {
      return request(`/api/orders/${orderId}/confirm-receipt`, {
        method: 'POST',
      });
    },
  },
};
