import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, IndianRupee, AlertCircle, ShoppingBag, User, Building, Receipt, Percent } from 'lucide-react';
import CustomDropdown from '../common/CustomDropdown';
import { getNextOrderNumber } from '../../services/api';

export default function CreateOrderModal({ isOpen, onClose, customers = [], products = [], onSave }) {
  const [orderNumber, setOrderNumber] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [gstRate, setGstRate] = useState(18);
  const [paymentStatus, setPaymentStatus] = useState('Unpaid'); // 'Unpaid', 'Paid', 'Partial'
  const [amountReceived, setAmountReceived] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Fetch sequential next order number
      getNextOrderNumber()
        .then((res) => {
          if (res.success) setOrderNumber(res.orderNumber || res.data?.nextOrderNumber || '');
        })
        .catch(() => setOrderNumber('VOL-2026-0001'));

      setSelectedCustomerId('');
      setItems([{ productId: '', quantity: 1, unitPrice: 0, amount: 0 }]);
      setDiscount(0);
      setGstRate(18);
      setPaymentStatus('Unpaid');
      setAmountReceived(0);
      setNotes('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Compute live financials
  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const discountVal = Math.min(Number(discount) || 0, subtotal);
  const taxableAmount = Math.max(0, subtotal - discountVal);
  const gstAmount = Number(((taxableAmount * (Number(gstRate) || 18)) / 100).toFixed(2));
  const grandTotal = Number((taxableAmount + gstAmount).toFixed(2));

  let actualReceived = 0;
  if (paymentStatus === 'Paid') {
    actualReceived = grandTotal;
  } else if (paymentStatus === 'Partial') {
    actualReceived = Math.min(Number(amountReceived) || 0, grandTotal);
  }
  const balanceDue = Number(Math.max(0, grandTotal - actualReceived).toFixed(2));

  // Customer dropdown items normalization
  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: c.name,
    sublabel: `${c.companyName ? c.companyName + ' • ' : ''}${c.mobile} (${c.city})`,
  }));

  // Product dropdown items normalization
  const productOptions = products.map((p) => ({
    value: p.id,
    label: p.name,
    sublabel: `${p.brand} • SKU: ${p.sku} • In Stock: ${p.stock} ${p.unit} • ₹${p.price.toLocaleString('en-IN')}`,
    price: p.price,
    stock: p.stock,
    unit: p.unit,
  }));

  // Line item handlers
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    const current = { ...updated[index] };

    if (field === 'productId') {
      current.productId = value;
      const foundProduct = products.find((p) => p.id === value);
      if (foundProduct) {
        current.unitPrice = foundProduct.price;
        current.amount = Number((foundProduct.price * (current.quantity || 1)).toFixed(2));
      }
    } else if (field === 'quantity') {
      const q = Math.max(1, parseInt(value, 10) || 1);
      current.quantity = q;
      current.amount = Number(((current.unitPrice || 0) * q).toFixed(2));
    } else if (field === 'unitPrice') {
      const p = Math.max(0, parseFloat(value) || 0);
      current.unitPrice = p;
      current.amount = Number((p * (current.quantity || 1)).toFixed(2));
    }

    updated[index] = current;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }

    const validItems = items.filter((it) => it.productId && it.quantity > 0);
    if (validItems.length === 0) {
      setError('Please select at least one valid product line.');
      return;
    }

    // Check inventory stock limits
    for (const line of validItems) {
      const prod = products.find((p) => p.id === line.productId);
      if (prod && line.quantity > prod.stock) {
        setError(`Ordered quantity for "${prod.name}" (${line.quantity}) exceeds warehouse stock (${prod.stock}).`);
        return;
      }
    }

    try {
      setSubmitting(true);
      setError('');

      await onSave({
        orderNumber,
        customerId: selectedCustomerId,
        items: validItems.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
        discount: discountVal,
        gstRate: Number(gstRate) || 18,
        amountReceived: actualReceived,
        notes: notes.trim(),
      });

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="modal-content"
        style={{ maxWidth: '920px', borderRadius: '20px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-icon" style={{ width: 34, height: 34 }}>
              <Receipt size={17} />
            </div>
            <div>
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Create New Order</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    color: 'var(--primary)',
                    background: 'var(--primary-light)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--primary-border)',
                  }}
                >
                  {orderNumber || 'VOL-2026-XXXX'}
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Volamp Electricals Tax Billing & Inventory Deduction</p>
            </div>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {error && (
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-main)',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  marginBottom: '1.25rem',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Customer Picker */}
            <div style={{ background: 'var(--bg-subtle)', padding: '1.15rem', borderRadius: '14px', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
              <label className="form-label" style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="var(--primary)" />
                <span>Select Customer / Billing Account *</span>
              </label>

              <CustomDropdown
                options={customerOptions}
                value={selectedCustomerId}
                onChange={(val) => setSelectedCustomerId(val)}
                placeholder="Search and select customer name or company..."
                searchable={true}
                searchPlaceholder="Type customer name, company, mobile, or city..."
              />

              {selectedCustomer && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px' }}>
                  <div>📍 <strong>Address:</strong> {selectedCustomer.address}, {selectedCustomer.city}</div>
                  <div>📞 <strong>Phone:</strong> {selectedCustomer.mobile}</div>
                  <div>🏢 <strong>GSTIN:</strong> {selectedCustomer.gstNumber || 'Unregistered'}</div>
                </div>
              )}
            </div>

            {/* Products Line Basket */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShoppingBag size={14} color="var(--primary)" />
                  <span>Ordered Line Items & Warehouse Stock *</span>
                </label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddItem}
                  style={{ padding: '3px 10px', fontSize: '0.78rem' }}
                >
                  <Plus size={13} />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((line, idx) => {
                  const selectedProd = products.find((p) => p.id === line.productId);
                  const isStockExceeded = selectedProd && line.quantity > selectedProd.stock;

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '3fr 1fr 1.2fr 1.2fr 40px',
                        gap: '8px',
                        alignItems: 'center',
                        background: 'var(--bg-card)',
                        padding: '10px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {/* Product Selector */}
                      <div>
                        <CustomDropdown
                          options={productOptions}
                          value={line.productId}
                          onChange={(val) => handleItemChange(idx, 'productId', val)}
                          placeholder="Select electrical product..."
                          searchable={true}
                        />
                        {selectedProd && (
                          <div style={{ fontSize: '0.72rem', color: isStockExceeded ? 'var(--text-main)' : 'var(--text-light)', marginTop: '2px', fontWeight: 600 }}>
                            Stock: {selectedProd.stock} {selectedProd.unit} {isStockExceeded && '⚠️ (Exceeds stock!)'}
                          </div>
                        )}
                      </div>

                      {/* Quantity */}
                      <div>
                        <input
                          type="number"
                          min="1"
                          max={selectedProd?.stock || 9999}
                          value={line.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="form-input"
                          style={{ textAlign: 'center', fontWeight: 700 }}
                          placeholder="Qty"
                        />
                      </div>

                      {/* Unit Price */}
                      <div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="form-input"
                          style={{ textAlign: 'right', fontWeight: 700 }}
                          placeholder="Rate ₹"
                        />
                      </div>

                      {/* Line Total */}
                      <div style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        ₹{(line.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>

                      {/* Remove Button */}
                      <div style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length <= 1}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: items.length <= 1 ? 'var(--border-color)' : 'var(--text-main)',
                            cursor: items.length <= 1 ? 'not-allowed' : 'pointer',
                            padding: '4px',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Calculations & Payment Terms */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.25rem', alignItems: 'start' }}>
              {/* Payment Settings Card */}
              <div style={{ background: 'var(--bg-subtle)', padding: '1.15rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Payment Terms</label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '1rem' }}>
                  {['Unpaid', 'Partial', 'Paid'].map((st) => {
                    const isSelected = paymentStatus === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setPaymentStatus(st)}
                        style={{
                          padding: '7px 0',
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

                {paymentStatus === 'Partial' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Advance / Partial Received (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max={grandTotal}
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      className="form-input"
                      placeholder="0.00"
                    />
                  </div>
                )}

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Dispatch / Delivery Notes</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    placeholder="Special instructions, site contact, transport details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Order Math Breakdown */}
              <div className="order-summary-box" style={{ marginTop: 0 }}>
                <div className="summary-row">
                  <span>Gross Subtotal:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="summary-row" style={{ alignItems: 'center' }}>
                  <span>Special Discount (₹):</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={subtotal}
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="form-input"
                    style={{ width: '100px', padding: '3px 8px', fontSize: '0.82rem', textAlign: 'right', fontWeight: 700 }}
                  />
                </div>

                <div className="summary-row" style={{ alignItems: 'center' }}>
                  <span>GST Rate:</span>
                  <div style={{ width: '120px' }}>
                    <CustomDropdown
                      options={[
                        { value: '18', label: '18% Std' },
                        { value: '12', label: '12%' },
                        { value: '5', label: '5%' },
                        { value: '0', label: '0%' },
                      ]}
                      value={String(gstRate)}
                      onChange={setGstRate}
                      placeholder="GST"
                    />
                  </div>
                </div>

                <div className="summary-row">
                  <span>GST Tax Amount:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>+₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="summary-row total">
                  <span>Grand Total:</span>
                  <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="summary-row" style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed var(--border-color)' }}>
                  <span>Payment Collected:</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    ₹{actualReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="summary-row" style={{ fontWeight: 800 }}>
                  <span>Remaining Balance Due:</span>
                  <span style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                    ₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Generating Order...' : 'Generate & Confirm Order'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
