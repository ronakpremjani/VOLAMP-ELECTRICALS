import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ProfilePage from './components/layout/ProfilePage';
import DashboardView from './components/dashboard/DashboardView';
import CustomerListView from './components/customers/CustomerListView';
import CustomerModal from './components/customers/CustomerModal';
import CustomerDetailsModal from './components/customers/CustomerDetailsModal';
import ProductListView from './components/products/ProductListView';
import ProductModal from './components/products/ProductModal';
import OrderListView from './components/orders/OrderListView';
import CreateOrderModal from './components/orders/CreateOrderModal';
import OrderDetailsModal from './components/orders/OrderDetailsModal';
import InvoiceModal from './components/orders/InvoiceModal';

import {
  getDashboardStats,
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  createOrder,
  updateOrderStatus,
  updateOrderPayment,
  deleteOrder,
  clearCache,
} from './services/api';

export default function App() {
  // ── Auth ────────────────────────────────────────
  const [authUser, setAuthUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('volamp_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const handleLogin = (user) => {
    setAuthUser(user);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('volamp_token');
    sessionStorage.removeItem('volamp_user');
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('volamp_cache_')) sessionStorage.removeItem(key);
      });
    } catch (e) {}
    setAuthUser(null);
  };

  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data States
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [productFilters, setProductFilters] = useState({ categories: [], brands: [] });
  const [orders, setOrders] = useState([]);

  // Loading States
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Search & Filter States
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerCity, setCustomerCity] = useState('All');
  const [customerHasBalance, setCustomerHasBalance] = useState('All');
  const [customerSortBy, setCustomerSortBy] = useState('recent');
  const [customerFilters, setCustomerFilters] = useState({ cities: [] });

  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('All');
  const [productBrand, setProductBrand] = useState('All');
  const [productLowStock, setProductLowStock] = useState('All');
  const [productSortBy, setProductSortBy] = useState('name_asc');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('All');
  const [orderDate, setOrderDate] = useState('');

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState(null);
  const [selectedCustomerIdForDetails, setSelectedCustomerIdForDetails] = useState(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);

  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [dashboardDate, setDashboardDate] = useState('');

  // Callbacks
  const loadDashboardStats = useCallback(async (showToast = false) => {
    try {
      const res = await getDashboardStats(dashboardDate);
      setStats(res.data);
      if (showToast) toast.success('Dashboard updated');
    } catch (err) {
      if (showToast) toast.error('Failed to load dashboard');
    }
  }, [dashboardDate]);

  const loadCustomers = useCallback(async (showToast = false) => {
    try {
      setLoadingCustomers(true);
      const params = { search: customerSearch };
      if (customerCity !== 'All') params.city = customerCity;
      if (customerHasBalance === 'Yes') params.hasBalance = 'true';
      
      const res = await getCustomers(params);
      setCustomers(res.data || []);
      setCustomerFilters(res.filters || { cities: [] });
      if (showToast) toast.success('Customers updated');
    } catch (err) {
      if (showToast) toast.error('Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  }, [customerSearch, customerCity, customerHasBalance]);

  const loadProducts = useCallback(async (showToast = false) => {
    try {
      setLoadingProducts(true);
      const params = { search: productSearch, category: productCategory, brand: productBrand };
      if (productLowStock === 'Yes') params.lowStock = 'true';
      const res = await getProducts(params);
      setProducts(res.data || []);
      
      const cats = new Set(res.data?.map(p => p.category).filter(Boolean));
      const brnds = new Set(res.data?.map(p => p.brand).filter(Boolean));
      setProductFilters({ categories: Array.from(cats), brands: Array.from(brnds) });

      if (showToast) toast.success('Products updated');
    } catch (err) {
      if (showToast) toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  }, [productSearch, productCategory, productBrand, productLowStock]);

  const loadOrders = useCallback(async (showToast = false) => {
    try {
      setLoadingOrders(true);
      const res = await getOrders({ search: orderSearch, status: orderStatusFilter, payment: orderPaymentFilter, date: orderDate });
      setOrders(res.data || []);
      if (showToast) toast.success('Orders updated');
    } catch (err) {
      if (showToast) toast.error('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  }, [orderSearch, orderStatusFilter, orderPaymentFilter, orderDate]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    clearCache();
    await Promise.allSettled([
      loadDashboardStats(),
      loadCustomers(),
      loadProducts(),
      loadOrders(),
    ]);
    toast.success('All data refreshed from server');
    setIsRefreshing(false);
  };

  // Socket setup
  const loadFns = useRef({ loadDashboardStats, loadCustomers, loadProducts, loadOrders });
  useEffect(() => {
    loadFns.current = { loadDashboardStats, loadCustomers, loadProducts, loadOrders };
  });

  useEffect(() => {
    if (!authUser) return; // don't connect socket if not logged in

    const socket = io('http://localhost:5000', {
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
    });
    
    let timeoutId;
    socket.on('data_updated', (data) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const { entity } = data;
        const fns = loadFns.current;
        if (entity === 'customer') { fns.loadCustomers(); fns.loadDashboardStats(); }
        else if (entity === 'product') { fns.loadProducts(); fns.loadDashboardStats(); }
        else if (entity === 'order') { fns.loadOrders(); fns.loadDashboardStats(); }
        else {
          fns.loadDashboardStats();
          fns.loadCustomers();
          fns.loadProducts();
          fns.loadOrders();
        }
      }, 500);
    });

    return () => {
      socket.disconnect();
      clearTimeout(timeoutId);
    };
  }, []); // empty array ensures socket only connects once on mount

  // Initial Load + reload data when user logs in
  useEffect(() => {
    if (!authUser) return; // only load data when authenticated
    loadDashboardStats();
    loadCustomers();
    loadProducts();
    loadOrders();
  }, [authUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync route data on navigation
  useEffect(() => {
    if (currentPath === '/dashboard' || currentPath === '/') loadDashboardStats();
    if (currentPath === '/customers') loadCustomers();
    if (currentPath === '/products') loadProducts();
    if (currentPath === '/orders') loadOrders();
  }, [currentPath, loadDashboardStats, loadCustomers, loadProducts, loadOrders]);

  // Customer Handlers
  const handleSaveCustomer = async (data) => {
    if (selectedCustomerForEdit) {
      await updateCustomer(selectedCustomerForEdit.id, data);
      toast.success('Customer updated successfully');
    } else {
      await createCustomer(data);
      toast.success('Customer registered');
    }
    loadCustomers();
    loadDashboardStats();
  };

  const handleDeleteCustomer = async (cust) => {
    try {
      await deleteCustomer(cust.id);
      toast.success('Customer deleted');
      loadCustomers();
      loadDashboardStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  // Product Handlers
  const handleSaveProduct = async (data) => {
    if (selectedProductForEdit) {
      await updateProduct(selectedProductForEdit.id, data);
      toast.success('Product updated');
    } else {
      await createProduct(data);
      toast.success('Product added to catalog');
    }
    loadProducts();
    loadDashboardStats();
  };

  const handleDeleteProduct = async (prod) => {
    try {
      await deleteProduct(prod.id);
      toast.success('Product removed');
      loadProducts();
      loadDashboardStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // Order Handlers
  const handleSaveOrder = async (data) => {
    try {
      const res = await createOrder(data);
      toast.success(`Order #${res.data?.orderNumber || ''} created successfully`);
      loadOrders();
      loadProducts();
      loadDashboardStats();
      loadCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      loadOrders();
      loadProducts();
      loadDashboardStats();
      if (selectedOrderForDetails && selectedOrderForDetails.id === orderId) {
        setSelectedOrderForDetails(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleUpdateOrderPayment = async (orderId, amountReceived) => {
    try {
      const res = await updateOrderPayment(orderId, amountReceived);
      toast.success(res.message || 'Payment recorded successfully');
      loadOrders();
      loadDashboardStats();
      if (selectedOrderForDetails && selectedOrderForDetails.id === orderId) {
        setSelectedOrderForDetails(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleDeleteOrder = async (ord) => {
    try {
      await deleteOrder(ord.id);
      toast.success(`Order #${ord.orderNumber} deleted`);
      loadOrders();
      loadProducts();
      loadDashboardStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete order');
    }
  };

  if (!authUser) {
    return (
      <>
        <Toaster position="top-right" />
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="app-container">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#0d2233',
            border: '1px solid #e4e6ea',
            boxShadow: '0 10px 25px -5px rgba(13,34,51,0.12)',
            fontSize: '0.86rem',
            fontWeight: 600,
          },
        }}
      />

      <Sidebar stats={stats} />

      <div className="main-content">
        <Header
          currentTab={currentPath.replace('/', '') || 'dashboard'}
          authUser={authUser}
          onLogout={handleLogout}
          onOpenCreateOrder={() => {
            loadCustomers();
            loadProducts();
            setIsCreateOrderModalOpen(true);
          }}
        />

        <main className="content-body">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={
              <DashboardView
                stats={stats}
                selectedDate={dashboardDate}
                setSelectedDate={setDashboardDate}
                onNavigate={(path) => navigate('/' + path)}
                onViewOrder={(order) => setSelectedOrderForDetails(order)}
                onOpenCreateOrder={() => {
                  loadCustomers();
                  loadProducts();
                  setIsCreateOrderModalOpen(true);
                }}
              />
            } />

            <Route path="/orders" element={
              <OrderListView
                orders={orders}
                loading={loadingOrders}
                searchTerm={orderSearch}
                setSearchTerm={setOrderSearch}
                statusFilter={orderStatusFilter}
                setStatusFilter={setOrderStatusFilter}
                paymentFilter={orderPaymentFilter}
                setPaymentFilter={setOrderPaymentFilter}
                selectedDate={orderDate}
                setSelectedDate={setOrderDate}
                onOpenCreateModal={() => {
                  loadCustomers();
                  loadProducts();
                  setIsCreateOrderModalOpen(true);
                }}
                onViewOrder={(order) => setSelectedOrderForDetails(order)}
                onOpenInvoice={(order) => setSelectedOrderForInvoice(order)}
                onUpdateStatus={handleUpdateOrderStatus}
                onDeleteOrder={handleDeleteOrder}
              />
            } />

            <Route path="/customers" element={
              <CustomerListView
                customers={customers}
                loading={loadingCustomers}
                filters={customerFilters}
                searchTerm={customerSearch}
                setSearchTerm={setCustomerSearch}
                selectedCity={customerCity}
                setSelectedCity={setCustomerCity}
                hasBalance={customerHasBalance}
                setHasBalance={setCustomerHasBalance}
                onOpenAddModal={() => {
                  setSelectedCustomerForEdit(null);
                  setIsCustomerModalOpen(true);
                }}
                onOpenEditModal={(cust) => {
                  setSelectedCustomerForEdit(cust);
                  setIsCustomerModalOpen(true);
                }}
                onOpenDetailsModal={(cust) => {
                  setSelectedCustomerIdForDetails(cust.id);
                }}
                onDeleteCustomer={handleDeleteCustomer}
              />
            } />

            <Route path="/products" element={
              <ProductListView
                products={products}
                loading={loadingProducts}
                filters={productFilters}
                searchTerm={productSearch}
                setSearchTerm={setProductSearch}
                selectedCategory={productCategory}
                setSelectedCategory={setProductCategory}
                selectedBrand={productBrand}
                setSelectedBrand={setProductBrand}
                lowStock={productLowStock}
                setLowStock={setProductLowStock}
                onOpenAddModal={() => {
                  setSelectedProductForEdit(null);
                  setIsProductModalOpen(true);
                }}
                onOpenEditModal={(prod) => {
                  setSelectedProductForEdit(prod);
                  setIsProductModalOpen(true);
                }}
                onDeleteProduct={handleDeleteProduct}
              />
            } />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
        initialData={selectedCustomerForEdit}
      />

      <CustomerDetailsModal
        isOpen={!!selectedCustomerIdForDetails}
        customerId={selectedCustomerIdForDetails}
        onClose={() => setSelectedCustomerIdForDetails(null)}
        onViewOrder={(order) => {
          setSelectedCustomerIdForDetails(null);
          setSelectedOrderForDetails(order);
        }}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={selectedProductForEdit}
      />

      <CreateOrderModal
        isOpen={isCreateOrderModalOpen}
        onClose={() => setIsCreateOrderModalOpen(false)}
        customers={customers}
        products={products}
        onSave={handleSaveOrder}
      />

      <OrderDetailsModal
        isOpen={!!selectedOrderForDetails}
        onClose={() => setSelectedOrderForDetails(null)}
        order={selectedOrderForDetails}
        onUpdateStatus={handleUpdateOrderStatus}
        onUpdatePayment={handleUpdateOrderPayment}
        onOpenInvoice={(ord) => {
          setSelectedOrderForDetails(null);
          setSelectedOrderForInvoice(ord);
        }}
      />

      <InvoiceModal
        isOpen={!!selectedOrderForInvoice}
        onClose={() => setSelectedOrderForInvoice(null)}
        order={selectedOrderForInvoice}
      />

    </div>
  );
}
