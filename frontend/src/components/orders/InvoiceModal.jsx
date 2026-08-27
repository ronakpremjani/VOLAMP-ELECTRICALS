import React from 'react';
import { X, Printer, Zap } from 'lucide-react';

export default function InvoiceModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '850px', background: 'var(--bg-card)' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header no-print">
          <div className="modal-title">Tax Invoice Preview</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={14} />
              <span>Print Invoice</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Content */}
        <div className="modal-body" style={{ padding: '2.5rem', color: 'var(--text-main)' }}>
          {/* Invoice Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--text-main)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 32, height: 32, background: 'var(--text-main)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-card)' }}>
                  <Zap size={20} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                  VOLAMP ELECTRICALS
                </h2>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.4 }}>
                Wholesale Distributors of Wires, Cables, Switchgear & Industrial Lighting<br />
                Plot 120, Electrical Market Complex, Andheri East, Mumbai 400093<br />
                <strong>GSTIN: 27AABCV8910Q1ZS</strong> | Email: sales@volamp.com | Phone: +91 22 2840 9900
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>TAX INVOICE</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                {order.orderNumber}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Invoice Date: {new Date(order.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Status: <strong>{order.orderStatus}</strong>
              </div>
            </div>
          </div>

          {/* Billed To / Shipped To */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem', background: 'var(--bg-subtle)', padding: '1.2rem', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Billed To (Customer Details)
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>{order.customer?.name}</div>
              {order.customer?.companyName && (
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>{order.customer?.companyName}</div>
              )}
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {order.customer?.address}<br />
                {order.customer?.city}, {order.customer?.state}<br />
                Phone: {order.customer?.mobile}
              </div>
              {order.customer?.gstNumber && (
                <div style={{ fontSize: '0.82rem', fontWeight: 700, marginTop: '4px' }}>
                  Customer GSTIN: {order.customer?.gstNumber}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Dispatch & Payment Terms
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                <div><strong>Sales Representative:</strong> {order.salesperson || 'Store Admin'}</div>
                <div><strong>Payment Status:</strong> {order.paymentStatus}</div>
                <div><strong>Delivery Notes:</strong> {order.notes || 'Standard dispatch'}</div>
              </div>
            </div>
          </div>

          {/* Product Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '8px 10px' }}>#</th>
                <th style={{ textAlign: 'left', padding: '8px 10px' }}>Item Description</th>
                <th style={{ textAlign: 'left', padding: '8px 10px' }}>SKU</th>
                <th style={{ textAlign: 'center', padding: '8px 10px' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '8px 10px' }}>Rate (₹)</th>
                <th style={{ textAlign: 'right', padding: '8px 10px' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ fontWeight: 600 }}>{item.product?.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Brand: {item.product?.brand}</div>
                  </td>
                  <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {item.product?.sku}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600 }}>
                    {item.quantity} {item.product?.unit}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                    ₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>
                    ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
            <div style={{ width: '320px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>₹{(order.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'var(--text-main)' }}>
                <span>Discount:</span>
                <span>-₹{(order.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>GST ({order.gstRate || 18}%):</span>
                <span style={{ fontWeight: 600 }}>+₹{(order.gstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid var(--text-main)', borderBottom: '2px solid var(--text-main)', margin: '6px 0', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                <span>Grand Total:</span>
                <span>₹{(order.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount Received:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>₹{(order.amountReceived || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontWeight: 700 }}>
                <span>Balance Due:</span>
                <span style={{ color: 'var(--text-main)' }}>
                  ₹{(order.balanceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Footer */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div>
              <strong>Terms & Conditions:</strong><br />
              1. Goods once sold will not be returned unless manufacturing defect.<br />
              2. Subject to Mumbai Jurisdiction only.
            </div>
            <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
              <strong>For VOLAMP ELECTRICALS</strong><br />
              <div style={{ height: '35px' }}></div>
              <span>Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
