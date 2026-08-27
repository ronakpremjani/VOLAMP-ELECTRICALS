import React, { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ProfileModal from './components/layout/ProfileModal';
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
} from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dark Mode State with LocalStorage Persistence
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('volamp-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('volamp-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('volamp-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

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
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('All');
  const [productBrand, setProductBrand] = useState('All');

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

  // Fetch Dashboard Stats
  const loadDashboardStats = useCallback(async () => {
    try {
      const res = await getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }
  }, []);

  // Fetch Customers
  const loadCustomers = useCallback(async () => {
    try {
      setLoadingCustomers(true);
      const res = await getCustomers(customerSearch);
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setLoadingCustomers(false);
    }
  }, [customerSearch]);

  // Fetch Products
  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const res = await getProducts({
        search: productSearch,
        category: productCategory,
        brand: productBrand,
      });
      if (res.success) {
        setProducts(res.data);
        if (res.filters) {
          setProductFilters(res.filters);
        }
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, [productSearch, productCategory, productBrand]);

  // Fetch Orders
  const loadOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const res = await getOrders({
        search: orderSearch,
        orderStatus: orderStatusFilter,
        paymentStatus: orderPaymentFilter,
        date: orderDate,
      });
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, [orderSearch, orderStatusFilter, orderPaymentFilter, orderDate]);

  // Global Refresh
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadDashboardStats(),
      loadCustomers(),
      loadProducts(),
      loadOrders(),
    ]);
    setIsRefreshing(false);
    toast.success('Database synchronized');
  };

  // Initial Load
  useEffect(() => {
    loadDashboardStats();
    loadCustomers();
    loadProducts();
    loadOrders();
  }, []);

  // Sync tab data on change
  useEffect(() => {
    if (currentTab === 'dashboard') loadDashboardStats();
    if (currentTab === 'customers') loadCustomers();
    if (currentTab === 'products') loadProducts();
    if (currentTab === 'orders') loadOrders();
  }, [currentTab, loadDashboardStats, loadCustomers, loadProducts, loadOrders]);

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
      toast.success('Product removed from catalog');
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

  return (
    <div className="app-container">
      {/* Toast Notification Container with Dark Mode styles */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: isDarkMode ? '#1e293b' : '#ffffff',
            color: isDarkMode ? '#f8fafc' : '#0f172a',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            boxShadow: isDarkMode ? '0 10px 25px -5px rgba(0,0,0,0.6)' : '0 10px 25px -5px rgba(0,0,0,0.1)',
            fontSize: '0.86rem',
            fontWeight: 600,
          },
        }}
      />

      {/* Navigation Sidebar */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} stats={stats} />

      {/* Main Content Area */}
      <div className="main-content">
        <Header
          currentTab={currentTab}
          onOpenCreateOrder={() => {
            loadCustomers();
            loadProducts();
            setIsCreateOrderModalOpen(true);
          }}
          onRefresh={handleRefreshAll}
          isRefreshing={isRefreshing}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        <main className="content-body">
          {currentTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              onNavigate={(tab) => setCurrentTab(tab)}
              onViewOrder={(order) => setSelectedOrderForDetails(order)}
              onOpenCreateOrder={() => {
                loadCustomers();
                loadProducts();
                setIsCreateOrderModalOpen(true);
              }}
            />
          )}

          {currentTab === 'orders' && (
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
          )}

          {currentTab === 'customers' && (
            <CustomerListView
              customers={customers}
              loading={loadingCustomers}
              searchTerm={customerSearch}
              setSearchTerm={setCustomerSearch}
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
          )}

          {currentTab === 'products' && (
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
          )}
        </main>
      </div>

      {/* Customer Modals */}
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

      {/* Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={selectedProductForEdit}
      />

      {/* Order Modals */}
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

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
