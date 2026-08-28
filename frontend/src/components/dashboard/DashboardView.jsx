import React from 'react';
import MetricCard from '../layout/MetricCard';
import OrderStatusBadge from '../orders/OrderStatusBadge';
import PaymentStatusBadge from '../orders/PaymentStatusBadge';
import DatePicker from '../common/DatePicker';
import {
  ShoppingCart, Clock, CheckCircle2, Truck, PackageCheck,
  XCircle, Users, Package, AlertTriangle,
  ArrowRight, Eye, TrendingUp, Zap, Plus,
} from 'lucide-react';

export default function DashboardView({ stats, onNavigate, onViewOrder, onOpenCreateOrder, selectedDate, setSelectedDate }) {
  const kpis = stats?.kpis || {};
  const inventory = stats?.inventory || {};
  const recentOrders = stats?.recentOrders || [];

  const collectedPct = kpis.totalOrderValue > 0
    ? Math.round((kpis.totalAmountReceived / kpis.totalOrderValue) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Header row with date filter ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Overview</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {selectedDate ? `Showing data for selected date` : 'Showing all-time data'}
          </div>
        </div>
        <div style={{ width: '200px' }}>
          <DatePicker value={selectedDate} onChange={setSelectedDate} placeholder="Filter by date..." />
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────── */}
      <div className="kpi-grid">
        <MetricCard label="Total Orders"   value={kpis.totalOrders     || 0} icon={ShoppingCart}  color="blue"    />
        <MetricCard label="Pending"        value={kpis.pendingOrders   || 0} icon={Clock}          color="amber"   />
        <MetricCard label="Confirmed"      value={kpis.confirmedOrders || 0} icon={CheckCircle2}   color="blue"    />
        <MetricCard label="Dispatched"     value={kpis.dispatchedOrders|| 0} icon={Truck}          color="cyan"    />
        <MetricCard label="Delivered"      value={kpis.deliveredOrders || 0} icon={PackageCheck}   color="emerald" />
        <MetricCard label="Cancelled"      value={kpis.cancelledOrders || 0} icon={XCircle}        color="rose"    />
      </div>

      {/* ── Secondary Row ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>

        {/* Payment Realization */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                Payment Realization
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-light)', marginTop: '2px' }}>
                Collected vs. outstanding
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'var(--color-emerald-bg)', color: 'var(--color-emerald)',
              border: '1px solid var(--color-emerald-border)',
              borderRadius: '999px', padding: '3px 10px',
              fontSize: '0.7rem', fontWeight: 700,
            }}>
              <TrendingUp size={11} />
              {collectedPct}% Collected
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: '5px', background: 'var(--bg-subtle)', borderRadius: '99px', marginBottom: '1rem', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${collectedPct}%`,
              background: 'linear-gradient(90deg, var(--color-emerald), #34d399)',
              borderRadius: '99px',
              transition: 'width 0.6s ease',
            }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Amount Received', value: kpis.totalAmountReceived || 0, accent: 'var(--color-emerald)' },
              { label: 'Outstanding Balance', value: kpis.totalBalanceOutstanding || 0, accent: 'var(--color-amber)' },
            ].map(({ label, value, accent }) => (
              <div key={label} style={{
                background: 'var(--bg-subtle)', padding: '0.85rem',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {label}
                </div>
                <div style={{
                  fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
                  color: accent, marginTop: '4px', letterSpacing: '-0.02em',
                }}>
                  ₹{value.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('orders')}>
              View Orders <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Inventory Health */}
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              Warehouse &amp; Roster
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-light)', marginTop: '2px' }}>
              Customers, catalog &amp; stock health
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
            {[
              { label: 'Customers', value: inventory.totalCustomers || 0, icon: Users, color: 'var(--color-blue)', bg: 'var(--color-blue-bg)', nav: 'customers' },
              { label: 'Products', value: inventory.totalProducts || 0, icon: Package, color: 'var(--primary)', bg: 'var(--primary-light)', nav: 'products' },
              { label: 'Low Stock', value: inventory.lowStockProducts || 0, icon: AlertTriangle, color: 'var(--color-amber)', bg: 'var(--color-amber-bg)', nav: 'products' },
            ].map(({ label, value, icon: Icon, color, bg, nav }) => (
              <button
                key={label}
                onClick={() => onNavigate(nav)}
                style={{
                  background: 'var(--bg-subtle)', padding: '0.85rem 0.65rem',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)',
                  textAlign: 'center', cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = bg; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-subtle)'; }}
              >
                <div style={{ width: 30, height: 30, borderRadius: 'var(--radius-xs)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                  <Icon size={14} />
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em' }}>
                  {value}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {label}
                </div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => onNavigate('products')}>
              Manage Catalog
            </button>
            <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={onOpenCreateOrder}>
              <Plus size={13} /> New Order
            </button>
          </div>
        </div>
      </div>

      {/* ── Recent Orders ───────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.35rem', borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              Recent Orders
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-light)', marginTop: '1px' }}>
              Last {Math.min(recentOrders.length, 10)} transactions
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('orders')}>
            View All <ArrowRight size={12} />
          </button>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th style={{ textAlign: 'center' }}>Items</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Payment</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Zap size={28} strokeWidth={1.5} style={{ opacity: 0.3 }} />
                      <div>No orders yet. Create your first order to get started.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.82rem',
                        color: 'var(--primary)', background: 'var(--primary-light)',
                        border: '1px solid var(--primary-border)',
                        padding: '2px 8px', borderRadius: '999px',
                      }}>
                        {order.orderNumber}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>{order.customer?.name}</div>
                      {order.customer?.companyName && (
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{order.customer.companyName}</div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {order.items?.length || 0}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                      ₹{(order.grandTotal || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <PaymentStatusBadge status={order.paymentStatus} balanceAmount={order.balanceAmount} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onViewOrder(order)}
                        title="View order details"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
