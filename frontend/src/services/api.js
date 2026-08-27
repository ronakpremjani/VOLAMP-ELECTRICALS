import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard
export const getDashboardStats = async (params = {}) => {
  const res = await api.get('/dashboard/stats', { params });
  return res.data;
};

// Customers
export const getCustomers = async (search = '') => {
  const res = await api.get('/customers', { params: { search } });
  return res.data;
};

export const getCustomerById = async (id) => {
  const res = await api.get(`/customers/${id}`);
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

// Products
export const getProducts = async (params = {}) => {
  const res = await api.get('/products', { params });
  return res.data;
};

export const getProductById = async (id) => {
  const res = await api.get(`/products/${id}`);
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

// Orders
export const getNextOrderNumber = async () => {
  const res = await api.get('/orders/next-number');
  return res.data;
};

export const getOrders = async (params = {}) => {
  const res = await api.get('/orders', { params });
  return res.data;
};

export const getOrderById = async (id) => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

export const createOrder = async (data) => {
  const res = await api.post('/orders', data);
  return res.data;
};

export const updateOrderStatus = async (id, orderStatus) => {
  const res = await api.patch(`/orders/${id}/status`, { orderStatus });
  return res.data;
};

export const updateOrderPayment = async (id, amountReceived) => {
  const res = await api.patch(`/orders/${id}/payment`, { amountReceived });
  return res.data;
};

export const deleteOrder = async (id) => {
  const res = await api.delete(`/orders/${id}`);
  return res.data;
};

// Notifications
export const getNotifications = async () => {
  const res = await api.get('/notifications');
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
  const res = await api.delete('/notifications/clear');
  return res.data;
};

export default api;
