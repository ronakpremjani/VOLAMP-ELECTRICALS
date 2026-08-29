import React, { useState, useRef, useEffect } from 'react';
import { Plus, RefreshCw, Bell, LogOut, User } from 'lucide-react';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead, clearAllNotifications } from '../../services/api';
import { formatDateTime } from '../../utils/date';

export default function Header({
  currentTab,
  authUser,
  onLogout,
}) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const titles = {
    dashboard: { title: 'Business & Sales Dashboard', subtitle: 'Live overview of sales, orders, and electrical product movement' },
    orders: { title: 'Order Management', subtitle: 'Manage orders, fulfillment workflows, and payment balances' },
    customers: { title: 'Customers Directory', subtitle: 'Manage customer accounts, billing history, and ledger balances' },
    products: { title: 'Product Master Catalog', subtitle: 'Manage electrical products, brands, SKU codes, and stock levels' },
    profile: { title: 'Company Profile', subtitle: 'Manage enterprise details, GST information, and banking credentials' },
  };

  const current = titles[currentTab] || { title: 'Order Management System', subtitle: 'Volamp Electricals' };

  const loadNotifications = () => {
    getNotifications()
      .then((res) => {
        if (res.success) {
          setNotifications(res.data || []);
          setUnreadCount(res.unreadCount || 0);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    }
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen]);

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    loadNotifications();
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    loadNotifications();
  };

  return (
    <header className="top-header">
      <div className="header-title-wrap">
        <h1>{current.title}</h1>
        <p>{current.subtitle}</p>
      </div>

      <div className="header-actions">
        {/* Notifications Button & Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              if (!isNotificationsOpen) loadNotifications();
            }}
            title="Notifications"
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--text-main)',
                }}
              />
            )}
          </button>

          {isNotificationsOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: '360px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 9999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-subtle)',
                }}
              >
                <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>Notifications</span>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Read all
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '6px' }}>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    <Bell size={24} style={{ margin: '0 auto 6px', opacity: 0.3 }} />
                    <p>No new notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        marginBottom: '4px',
                        background: n.isRead ? 'transparent' : 'var(--bg-subtle)',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                      onClick={() => markNotificationAsRead(n.id).then(loadNotifications)}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{n.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{n.message}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '4px' }}>
                        {formatDateTime(n.createdAt)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User badge + Logout */}
        {authUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={onLogout}
              title="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
