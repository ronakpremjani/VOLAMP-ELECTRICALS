import React from 'react';
import { LayoutDashboard, ShoppingCart, Users, Package, Zap, UserCircle2, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ stats, isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard',       icon: LayoutDashboard },
    { path: '/orders',    label: 'Orders & Billing', icon: ShoppingCart,  count: stats?.kpis?.totalOrders },
    { path: '/customers', label: 'Customers',        icon: Users,         count: stats?.inventory?.totalCustomers },
    { path: '/products',  label: 'Product Catalog',  icon: Package,       count: stats?.inventory?.totalProducts },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, display: 'none' }}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-icon">
              <Zap size={20} />
            </div>
            <div className="brand-info">
              <h2>Volamp</h2>
              <span>Electricals OMS</span>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button 
            className="mobile-close-btn" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'none' }}
          >
            <X size={20} />
          </button>
        </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath.startsWith(item.path);
          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '1px 7px',
                    borderRadius: '999px',
                    background: isActive ? 'rgba(255,119,0,0.25)' : 'rgba(255,255,255,0.10)',
                    color: isActive ? '#FF7700' : 'rgba(255,255,255,0.55)',
                    fontWeight: 700,
                    border: isActive ? '1px solid rgba(255,119,0,0.35)' : '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile — pinned to bottom above footer */}
      <div style={{ padding: '0 0.75rem 0.5rem' }}>
        <button
          className={`nav-item ${currentPath.startsWith('/profile') ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
          style={{ width: '100%' }}
        >
          <UserCircle2 size={17} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, textAlign: 'left' }}>Company Profile</span>
        </button>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 600, fontSize: '0.76rem', color: '#4ade80' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
          System Online
        </div>
        <div style={{ marginTop: '3px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
          v1.0 · Volamp Electricals
        </div>
      </div>
    </aside>
    </>
  );
}

