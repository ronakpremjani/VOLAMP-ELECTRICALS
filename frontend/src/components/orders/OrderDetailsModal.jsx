import React, { useState } from 'react';
import { X, Printer, IndianRupee, Truck, CheckCircle2, User, Building2, MapPin, Phone, Calendar, Clock, DollarSign } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
  onUpdatePayment,
  onOpenInvoice,
}) {
  const [paymentInput, setPaymentInput] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  if (!isOpen || !order) return null;

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const additional = parseFloat(paymentInput);
    if (isNaN(additional) || additional <= 0) {
      setPaymentError('Please enter a valid positive payment amount.');
      return;
    }

    try {
      setSavingPayment(true);
      setPaymentError('');
      const newTotalReceived = (order.amountReceived || 0) + additional;
      await onUpdatePayment(order.id, newTotalReceived);
      setPaymentInput('');
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Error recording payment');
    } finally {
      setSavingPayment(false);
    }
  };

  const statusWorkflow = ['Pending', 'Confirmed', 'Processing', 'Dispatched', 'Delivered'];
  const currentIndex = statusWorkflow.indexOf(order.orderStatus);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '880px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-title">
              Order Details — <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{order.orderNumber}</span>
            </div>
            <OrderStatusBadge status={order.orderStatus} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => onOpenInvoice(order)}>
              <Printer size={14} />
              <span>Tax Invoice</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Order Lifecycle Progression Stepper */}
          {order.orderStatus !== 'Cancelled' && (
            <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                Fulfillment Workflow Progress
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                {statusWorkflow.map((st, idx) => {
                  const isDone = currentIndex >= idx;
                  const isCurrent = currentIndex === idx;

                  return (
                    <div
                      key={st}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        zIndex: 2,
                      }}
                      onClick={() => onUpdateStatus(order.id, st)}
                      title={`Click to set status to ${st}`}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isDone ? 'var(--primary)' : 'var(--bg-input)',
                          color: isDone ? 'var(--text-main)' : 'var(--text-muted)',
                          border: isDone ? 'none' : '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          boxShadow: isCurrent ? '0 0 0 4px rgba(37,99,235,0.25)' : 'none',
                        }}
                      >
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {st}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customer & Order Metadata Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Customer & Delivery Information
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{order.customer?.name}</div>
              {order.customer?.companyName && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{order.customer?.companyName}</div>
              )}
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                <div>📍 {order.customer?.address}, {order.customer?.city}, {order.customer?.state}</div>
                <div>📞 {order.customer?.mobile} | ✉️ {order.customer?.email || 'N/A'}</div>
                {order.customer?.gstNumber && (
                  <div style={{ marginTop: '2px', fontWeight: 600, color: 'var(--text-main)' }}>GSTIN: {order.customer?.gstNumber}</div>
                )}
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Order Metadata
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Order Date:</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {new Date(order.orderDate || order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Sales Representative:</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{order.salesperson || 'Store Admin'}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Notes / Instructions:</span>
                  <div style={{ fontWeight: 500, color: 'var(--text-main)', fontStyle: order.notes ? 'normal' : 'italic' }}>
                    {order.notes || 'No special notes recorded.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Items Table */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Ordered Items & Rates
            </div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Item / Description</th>
                    <th>SKU Code</th>
                    <th style={{ textAlign: 'center' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Rate (₹)</th>
                    <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.product?.name || 'Electrical Item'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Category: {item.product?.category} | Brand: {item.product?.brand}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {item.product?.sku || 'SKU'}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>
                        {item.quantity} {item.product?.unit || 'Units'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        ₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-main)' }}>
                        ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals and Payment Recording */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
            {/* Quick Payment Entry Form */}
            <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                <DollarSign size={16} color="var(--text-main)" />
                <span>Receive / Collect Payment</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Record incoming bank transfer, cash, or UPI payment against this order.
              </p>

              {paymentError && (
                <div style={{ background: 'var(--bg-subtle)', color: 'var(--text-main)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.78rem', marginBottom: '0.5rem', border: '1px solid var(--border-color)' }}>
                  {paymentError}
                </div>
              )}

              <form onSubmit={handleRecordPayment} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={order.balanceAmount > 0 ? order.balanceAmount : undefined}
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder={`Max ₹${(order.balanceAmount || 0).toLocaleString('en-IN')}`}
                  value={paymentInput}
                  onChange={(e) => setPaymentInput(e.target.value)}
                  disabled={order.balanceAmount <= 0}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--text-main)' }}
                  disabled={savingPayment || order.balanceAmount <= 0}
                >
                  {savingPayment ? 'Saving...' : 'Record'}
                </button>
              </form>
              {order.balanceAmount <= 0 && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 700, marginTop: '6px' }}>
                  ✅ This order is fully paid.
                </div>
              )}
            </div>

            {/* Financial Summary Breakdown */}
            <div className="order-summary-box" style={{ marginTop: 0 }}>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{(order.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-row" style={{ color: 'var(--text-main)' }}>
                <span>Discount:</span>
                <span>-₹{(order.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-row">
                <span>GST ({order.gstRate || 18}%):</span>
                <span>+₹{(order.gstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-row total">
                <span>Grand Total:</span>
                <span style={{ color: 'var(--primary)' }}>₹{(order.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-row" style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed var(--border-color)' }}>
                <span>Amount Received:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>₹{(order.amountReceived || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-row" style={{ fontWeight: 800 }}>
                <span>Balance Due:</span>
                <span style={{ color: 'var(--text-main)' }}>
                  ₹{(order.balanceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
