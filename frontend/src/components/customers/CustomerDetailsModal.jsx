import React, { useEffect, useState } from 'react';
import { X, Building2, Phone, Mail, MapPin, FileText, DollarSign, Calendar, MessageCircle, Eye, Printer } from 'lucide-react';
import { getCustomerById, recordCustomerPayment } from '../../services/api';
import OrderStatusBadge from '../orders/OrderStatusBadge';
import PaymentStatusBadge from '../orders/PaymentStatusBadge';
import CustomDropdown from '../common/CustomDropdown';
import { openWhatsApp } from '../../utils/whatsapp';

export default function CustomerDetailsModal({ isOpen, onClose, customerId, onViewOrder }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'ledger'
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [recording, setRecording] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const fetchCustomer = () => {
    if (customerId) {
      setLoading(true);
      getCustomerById(customerId)
        .then((res) => {
          setCustomer(res.data);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomer();
      setActiveTab('orders');
      setPaymentAmount('');
      setPaymentError('');
    }
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(paymentAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setPaymentError('Enter a valid positive amount.');
      return;
    }

    try {
      setRecording(true);
      setPaymentError('');
      await recordCustomerPayment(customerId, {
        amount: parsed,
        method: paymentMethod,
        notes: paymentNotes,
      });
      setPaymentAmount('');
      setPaymentNotes('');
      fetchCustomer();
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Error recording payment');
    } finally {
      setRecording(false);
    }
  };

  const handleSendStatementOnWhatsApp = () => {
    if (!customer) return;
    const unpaidOrders = (customer.orders || [])
      .filter((o) => o.orderStatus !== 'Cancelled' && o.balanceAmount > 0)
      .map((o) => `  • ${o.orderNumber} — Due: ₹${o.balanceAmount.toFixed(2)}`)
      .join('\n');

    const msg = [
      `⚡ *VOLAMP ELECTRICALS — ACCOUNT STATEMENT*`,
      `══════════════════════════`,
      `Customer: *${customer.name}*`,
      customer.companyName ? `Company: ${customer.companyName}` : '',
      `Total Orders: ${customer.totalOrders || 0}`,
      `Total Billed Value: ₹${(customer.totalOrderValue || 0).toFixed(2)}`,
      `Total Paid: ₹${(customer.totalAmountPaid || 0).toFixed(2)}`,
      `🔴 *Outstanding Balance: ₹${(customer.totalBalanceDue || 0).toFixed(2)}*`,
      ``,
      unpaidOrders ? `*Pending Bills:*\n${unpaidOrders}\n` : '✅ All accounts clear!\n',
      `══════════════════════════`,
      `Thank you for your valued business.`,
    ]
      .filter(Boolean)
      .join('\n');

    openWhatsApp(customer.mobile, msg);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '880px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Customer Ledger & Account Statement</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--text-main)' }}
              onClick={handleSendStatementOnWhatsApp}
              title="Share Ledger Statement on WhatsApp"
            >
              <MessageCircle size={14} />
              <span>WhatsApp Statement</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {loading || !customer ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Loading profile details...
            </div>
          ) : (
            <div>
              {/* Header Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{customer.name}</h3>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>
                    {customer.companyName || 'Individual Customer'}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={13} style={{ color: 'var(--text-light)' }} />
                      <span>{customer.mobile}</span>
                    </div>
                    {customer.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={13} style={{ color: 'var(--text-light)' }} />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} style={{ color: 'var(--text-light)' }} />
                      <span>{customer.city}, {customer.state}</span>
                    </div>
                    {customer.gstNumber && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={13} style={{ color: 'var(--text-light)' }} />
                        <span>GST: <strong>{customer.gstNumber}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    OUTSTANDING DUE
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
                    ₹{(customer.totalBalanceDue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Billed: ₹{(customer.totalOrderValue || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTab === 'orders' ? 'var(--primary)' : 'transparent',
                    color: activeTab === 'orders' ? 'var(--text-main)' : 'var(--text-muted)',
                  }}
                >
                  Order History ({customer.orders?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ledger')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTab === 'ledger' ? 'var(--primary)' : 'transparent',
                    color: activeTab === 'ledger' ? 'var(--text-main)' : 'var(--text-muted)',
                  }}
                >
                  Payment Ledger & Deposit
                </button>
              </div>

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th style={{ textAlign: 'right' }}>Total Value</th>
                        <th style={{ textAlign: 'center' }}>Order Status</th>
                        <th style={{ textAlign: 'center' }}>Payment</th>
                        <th style={{ textAlign: 'right' }}>Balance Due</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!customer.orders || customer.orders.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No orders placed by this customer yet.
                          </td>
                        </tr>
                      ) : (
                        customer.orders.map((ord) => (
                          <tr key={ord.id}>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                              {ord.orderNumber}
                            </td>
                            <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                              {new Date(ord.orderDate || ord.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                              {ord.items?.length || 0} item(s)
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                              ₹{(ord.grandTotal || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <OrderStatusBadge status={ord.orderStatus} />
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <PaymentStatusBadge status={ord.paymentStatus} balanceAmount={ord.balanceAmount} />
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                              ₹{(ord.balanceAmount || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  onClose();
                                  onViewOrder(ord);
                                }}
                              >
                                <Eye size={13} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Ledger Tab */}
              {activeTab === 'ledger' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
                  <div className="table-container">
                    <div style={{ padding: '10px 14px', fontWeight: 700, fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-subtle)' }}>
                      Past Payment Receipts
                    </div>
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Method</th>
                          <th>Notes</th>
                          <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!customer.paymentHistory || customer.paymentHistory.length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                              No standalone ledger payments recorded yet.
                            </td>
                          </tr>
                        ) : (
                          customer.paymentHistory.map((p) => (
                            <tr key={p.id}>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {new Date(p.date).toLocaleDateString('en-IN')}
                              </td>
                              <td>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px' }}>
                                  {p.method}
                                </span>
                              </td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {p.notes || '—'}
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-main)' }}>
                                +₹{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Record Payment Form */}
                  <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                      Receive Direct Customer Payment
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Deposit payment directly against customer ledger account.
                    </p>

                    {paymentError && (
                      <div style={{ background: 'var(--bg-subtle)', color: 'var(--text-main)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.78rem', marginBottom: '0.75rem', border: '1px solid var(--border-color)' }}>
                        {paymentError}
                      </div>
                    )}

                    <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Amount (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="1"
                          placeholder="0.00"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="form-input"
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Payment Method</label>
                        <CustomDropdown
                          options={[
                            { value: 'UPI', label: 'UPI / QR Code' },
                            { value: 'Bank Transfer', label: 'NEFT / RTGS / IMPS' },
                            { value: 'Cash', label: 'Cash Receipt' },
                            { value: 'Cheque', label: 'Cheque Deposit' },
                          ]}
                          value={paymentMethod}
                          onChange={setPaymentMethod}
                          placeholder="Select payment method"
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Reference Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. UTR #, Cheque #, Bank deposit..."
                          value={paymentNotes}
                          onChange={(e) => setPaymentNotes(e.target.value)}
                          className="form-input"
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ marginTop: '0.5rem', background: 'var(--text-main)', color: 'var(--bg-card)' }}
                        disabled={recording}
                      >
                        {recording ? 'Saving...' : 'Record Payment to Ledger'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
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
