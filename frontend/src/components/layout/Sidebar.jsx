import React from 'react';
import { LayoutDashboard, ShoppingCart, Users, Package, Zap } from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, stats }) {
  const navItems = [
    { id: 'dashboard',  label: 'Dashboard',          icon: LayoutDashboard },
    { id: 'orders',     label: 'Orders & Billing',    icon: ShoppingCart,   count: stats?.kpis?.totalOrders },
    { id: 'customers',  label: 'Customers',           icon: Users,          count: stats?.inventory?.totalCustomers },
    { id: 'products',   label: 'Product Catalog',     icon: Package,        count: stats?.inventory?.totalProducts },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Zap size={20} />
        </div>
        <div className="brand-info">
          <h2>Volamp</h2>
          <span>Electricals OMS</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '1px 7px',
                    borderRadius: '999px',
                    background: isActive ? 'rgba(255,119,0,0.18)' : 'var(--bg-subtle)',
                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 700,
                    border: isActive ? '1px solid var(--primary-border)' : '1px solid var(--border-color)',
                  }}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 600, fontSize: '0.76rem', color: 'var(--color-emerald)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-emerald)', flexShrink: 0 }} />
          System Online
        </div>
        <div style={{ marginTop: '3px', fontSize: '0.7rem', color: 'var(--text-light)' }}>
          v1.0 · Volamp Electricals
        </div>
      </div>
    </aside>
  );
}
