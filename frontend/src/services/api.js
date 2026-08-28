import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple in-memory cache to reduce server load
const cache = new Map();

export const clearCache = () => {
  cache.clear();
};

const getCached = async (url, config = {}) => {
  const key = `${url}?${new URLSearchParams(config.params || {}).toString()}`;
  if (cache.has(key)) {
    return cache.get(key);
  }
  const res = await api.get(url, config);
  cache.set(key, res);
  return res;
};

// ── Dashboard ──────────────────────────────────────────────
export const getDashboardStats = async (params = {}) => {
  const res = await getCached('/dashboard/stats', { params });
  return res.data;
};

// ── Customers ──────────────────────────────────────────────
export const getCustomers = async (search = '') => {
  const res = await getCached('/customers', { params: { search } });
  return res.data;
};

export const getCustomerById = async (id) => {
  const res = await getCached(`/customers/${id}`);
  return res.data;
};

export const createCustomer = async (data) => {
  const res = await api.post('/customers', data);
  return res.data;
};

export const recordCustomerPayment = async (id, data) => {
  const res = await api.post(`/customers/${id}/payments`, data);
  return res.data;
};

export const updateCustomer = async (id, data) => {
  const res = await api.put(`/customers/${id}`, data);
  return res.data;
};

export const deleteCustomer = async (id) => {
  const res = await api.delete(`/customers/${id}`);
  return res.data;
};

// ── Products ───────────────────────────────────────────────
export const getProducts = async (params = {}) => {
  const res = await getCached('/products', { params });
  return res.data;
};

export const getProductById = async (id) => {
  const res = await getCached(`/products/${id}`);
  return res.data;
};

export const createProduct = async (data) => {
  const res = await api.post('/products', data);
  return res.data;
};

export const updateProduct = async (id, data) => {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

// ── Orders ─────────────────────────────────────────────────
export const getOrders = async (params = {}) => {
  const res = await getCached('/orders', { params });
  return res.data;
};

export const getOrderById = async (id) => {
  const res = await getCached(`/orders/${id}`);
  return res.data;
};

export const getNextOrderNumber = async () => {
  // Always fetch fresh for order numbers to avoid collisions
  const res = await api.get('/orders/next-number');
  return res.data;
};

export const createOrder = async (data) => {
  const res = await api.post('/orders', data);
  return res.data;
};

export const updateOrderStatus = async (id, status) => {
  const res = await api.patch(`/orders/${id}/status`, { status });
  return res.data;
};

export const updateOrderPayment = async (id, data) => {
  const res = await api.patch(`/orders/${id}/payment`, data);
  return res.data;
};

export const deleteOrder = async (id) => {
  const res = await api.delete(`/orders/${id}`);
  return res.data;
};

// ── Notifications ──────────────────────────────────────────
export const getNotifications = async (limit = 10) => {
  // Always fetch fresh for notifications
  const res = await api.get('/notifications', { params: { limit } });
  return res.data;
};

export const markNotificationAsRead = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsAsRead = async () => {
  const res = await api.patch('/notifications/read-all');
  return res.data;
};

export const clearAllNotifications = async () => {
  const res = await api.delete('/notifications/clear-all');
  return res.data;
};

export default api;
