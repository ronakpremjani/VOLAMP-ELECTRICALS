import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Printer,
  Trash2,
  Calendar,
  X,
  MessageCircle,
  IndianRupee,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderStatusBadge from './OrderStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';
import CustomDropdown from '../common/CustomDropdown';
import DatePicker from '../common/DatePicker';
import ConfirmModal from '../common/ConfirmModal';
import { shareOrderOnWhatsApp } from '../../utils/whatsapp';
import { formatDateTime, getTodayDateString, getYesterdayDateString } from '../../utils/date';

export default function OrderListView({
  orders = [],
  loading = false,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  paymentFilter,
  setPaymentFilter,
  selectedDate,
  setSelectedDate,
  onOpenCreateModal,
  onViewOrder,
  onOpenInvoice,
  onUpdateStatus,
  onDeleteOrder,
}) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [newSelectedStatus, setNewSelectedStatus] = useState('');
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState(null);

  const statusOptions = ['All', 'Pending', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'];
  const paymentOptions = ['All', 'Unpaid', 'Partial', 'Paid'];

  const quickDates = [
    { label: 'All Time', value: '' },
    { label: 'Today', value: getTodayDateString() },
    { label: 'Yesterday', value: getYesterdayDateString() },
  ];

  // Active filters count badge
  const activeFiltersCount = (statusFilter !== 'All' ? 1 : 0) + (paymentFilter !== 'All' ? 1 : 0) + (selectedDate ? 1 : 0);

  // Financial aggregates
  const totalOrdersCount = orders.length;
  const grossValue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const amountCollected = orders.reduce((sum, o) => sum + (o.amountReceived || 0), 0);
  const balanceOutstanding = orders.reduce((sum, o) => sum + (o.balanceAmount || 0), 0);

  const collectedPercent = grossValue > 0 ? Math.round((amountCollected / grossValue) * 100) : 0;
  const balancePercent = grossValue > 0 ? Math.round((balanceOutstanding / grossValue) * 100) : 0;

  const handleOpenStatusModal = (order, e) => {
    e.stopPropagation();
    setStatusModalOrder(order);
    setNewSelectedStatus(order.orderStatus);
  };

  const handleConfirmStatusChange = async () => {
    if (statusModalOrder && newSelectedStatus) {
      await onUpdateStatus(statusModalOrder.id, newSelectedStatus);
      setStatusModalOrder(null);
    }
  };

  return (
    <div>
      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.15rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            TOTAL ORDERS
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{totalOrdersCount}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600 }}>
              {selectedDate === getTodayDateString() ? 'Today' : selectedDate === getYesterdayDateString() ? 'Yesterday' : 'All Time'}
            </span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.15rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            GROSS VALUE
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              ₹{grossValue.toLocaleString('en-IN')}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600 }}>100% Gross</span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.15rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            AMOUNT COLLECTED
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
              ₹{amountCollected.toLocaleString('en-IN')}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>{collectedPercent}% Paid</span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.15rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            OUTSTANDING BALANCE
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
              ₹{balanceOutstanding.toLocaleString('en-IN')}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>{balancePercent}% Due</span>
          </div>
        </div>
      </div>

      {/* Date Quick Filter Bar & Action Suite */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {/* Quick Date Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          {quickDates.map((qd) => {
            const isSelected = selectedDate === qd.value;
            return (
              <button
                key={qd.label}
                type="button"
                onClick={() => setSelectedDate(qd.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 800 : 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--primary)' : 'transparent',
                  color: isSelected ? 'var(--primary-text)' : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                {qd.label}
              </button>
            );
          })}

          <div style={{ width: '130px', marginLeft: '4px' }}>
            <DatePicker
              value={selectedDate}
              onChange={(val) => setSelectedDate(val)}
              placeholder="Custom Date"
            />
          </div>
        </div>

        {/* Search & Modals */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '300px', maxWidth: '600px' }}>
          <div className="search-input-wrap">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search Order #, Customer, Company, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-light)',
                  cursor: 'pointer',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsFilterModalOpen(true)}
            style={{ position: 'relative', height: '38px', padding: '0 12px' }}
          >
            <Filter size={14} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span
                style={{
                  background: 'var(--primary)',
                  color: 'var(--primary-text)',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  borderRadius: '999px',
                  padding: '1px 6px',
                  marginLeft: '4px',
                }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button className="btn btn-primary btn-sm" onClick={onOpenCreateModal} style={{ height: '38px', whiteSpace: 'nowrap' }}>
            <Plus size={15} />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date & Time</th>
              <th>Customer & Company</th>
              <th style={{ textAlign: 'center' }}>Items</th>
              <th style={{ textAlign: 'right' }}>Total (₹)</th>
              <th style={{ textAlign: 'center' }}>Order Status</th>
              <th style={{ textAlign: 'center' }}>Payment</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading order database...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                  No orders found matching the filter criteria.
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr key={ord.id}>
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        fontSize: '0.84rem',
                        color: 'var(--primary)',
                        background: 'var(--primary-light)',
                        border: '1px solid var(--primary-border)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {ord.orderNumber}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {new Date(ord.orderDate || ord.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                      {new Date(ord.orderDate || ord.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ord.customer?.name}</div>
                    {ord.customer?.companyName && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.customer?.companyName}</div>
                    )}
                  </td>

                  <td style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ord.items?.length || 0}</span> item(s)
                  </td>

                  <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                    ₹{(ord.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <div onClick={(e) => handleOpenStatusModal(ord, e)} style={{ cursor: 'pointer', display: 'inline-block' }} title="Click to change order status">
                      <OrderStatusBadge status={ord.orderStatus} />
                    </div>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <PaymentStatusBadge status={ord.paymentStatus} balanceAmount={ord.balanceAmount} />
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 7px' }}
                        onClick={() => shareOrderOnWhatsApp(ord)}
                        title="Send Tax Invoice via WhatsApp"
                      >
                        <MessageCircle size={13} />
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 7px' }}
                        onClick={() => onOpenInvoice(ord)}
                        title="Print GST Tax Invoice"
                      >
                        <Printer size={13} />
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 7px' }}
                        onClick={() => onViewOrder(ord)}
                        title="View full order breakdown"
                      >
                        <Eye size={13} />
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 7px' }}
                        onClick={() => setDeleteConfirmOrder(ord)}
                        title="Delete Order"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Advanced Filter Modal Popup */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="modal-overlay" onClick={() => setIsFilterModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="modal-content"
              style={{ maxWidth: '460px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title">Filter Order Ledger</div>
                <button className="btn btn-secondary btn-sm" onClick={() => setIsFilterModalOpen(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Workflow Status Filter */}
                <div>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Fulfillment Status</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {statusOptions.map((st) => {
                      const isSelected = statusFilter === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatusFilter(st)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? 800 : 600,
                            border: '1px solid ' + (isSelected ? 'var(--primary)' : 'var(--border-color)'),
                            background: isSelected ? 'var(--primary-light)' : 'var(--bg-input)',
                            color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                            cursor: 'pointer',
                          }}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Status Filter */}
                <div>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Payment Status</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {paymentOptions.map((pt) => {
                      const isSelected = paymentFilter === pt;
                      return (
                        <button
                          key={pt}
                          type="button"
                          onClick={() => setPaymentFilter(pt)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? 800 : 600,
                            border: '1px solid ' + (isSelected ? 'var(--primary)' : 'var(--border-color)'),
                            background: isSelected ? 'var(--primary-light)' : 'var(--bg-input)',
                            color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                            cursor: 'pointer',
                          }}
                        >
                          {pt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date Picker Filter */}
                <div>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Specific Date</label>
                  <DatePicker
                    value={selectedDate}
                    onChange={(val) => setSelectedDate(val)}
                    placeholder="Select Date"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setStatusFilter('All');
                    setPaymentFilter('All');
                    setSelectedDate('');
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Reset All</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsFilterModalOpen(false)}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Status Transition Modal */}
      <AnimatePresence>
        {statusModalOrder && (
          <div className="modal-overlay" onClick={() => setStatusModalOrder(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="modal-content"
              style={{ maxWidth: '420px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title">
                  Update Status — <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{statusModalOrder.orderNumber}</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setStatusModalOrder(null)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body">
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Select the new fulfillment stage for this customer order:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Pending', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'].map((st) => {
                    const isSelected = newSelectedStatus === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setNewSelectedStatus(st)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid ' + (isSelected ? 'var(--primary)' : 'var(--border-color)'),
                          background: isSelected ? 'var(--primary-light)' : 'var(--bg-input)',
                          color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                          fontSize: '0.86rem',
                          fontWeight: isSelected ? 800 : 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <OrderStatusBadge status={st} />
                        </div>
                        {isSelected && <span style={{ color: 'var(--primary)', fontWeight: 800 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setStatusModalOrder(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleConfirmStatusChange}>
                  Save Status
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmOrder}
        onClose={() => setDeleteConfirmOrder(null)}
        onConfirm={() => {
          if (deleteConfirmOrder) {
            onDeleteOrder(deleteConfirmOrder);
            setDeleteConfirmOrder(null);
          }
        }}
        title="Delete Order Record"
        message={`Are you sure you want to delete order #${deleteConfirmOrder?.orderNumber}? This will permanently remove the invoice and restore product quantities to available warehouse stock.`}
        confirmText="Yes, Delete Order"
      />
    </div>
  );
}
