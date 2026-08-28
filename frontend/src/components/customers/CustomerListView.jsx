import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, Building2, Phone, MapPin, X, FileSpreadsheet, User, Filter } from 'lucide-react';

export default function CustomerListView({
  customers = [],
  loading = false,
  filters = { cities: [] },
  searchTerm,
  setSearchTerm,
  selectedCity,
  setSelectedCity,
  hasBalance,
  setHasBalance,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDetailsModal,
  onDeleteCustomer,
}) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div>
      {/* Search & Actions Bar */}
      <div className="toolbar">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Customer Directory & Accounts
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Manage client profiles, GST registration, order statements, and payment ledgers
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="search-input-wrap" style={{ minWidth: '280px' }}>
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search customer name, company, mobile, GST..."
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

          <div style={{ position: 'relative' }}>
            <button 
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={15} />
              <span>Filters</span>
              {(selectedCity !== 'All' || hasBalance !== 'All') && (
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: showFilters ? '#fff' : 'var(--primary)', marginLeft: 2 }}></div>
              )}
            </button>

            {showFilters && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                minWidth: '240px',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ 
                  fontWeight: 700, 
                  fontSize: '0.85rem', 
                  borderBottom: '1px solid var(--border-color)', 
                  paddingBottom: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Filter Customers</span>
                  <button onClick={() => setShowFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
                    <X size={14} />
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">By City</label>
                  <select
                    className="form-select"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    <option value="All">All Cities</option>
                    {(filters?.cities || []).map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">By Payment Status</label>
                  <select
                    className="form-select"
                    value={hasBalance}
                    onChange={(e) => setHasBalance(e.target.value)}
                  >
                    <option value="All">All Balances</option>
                    <option value="Yes">Has Balance Due</option>
                  </select>
                </div>

                { (selectedCity !== 'All' || hasBalance !== 'All') && (
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => { setSelectedCity('All'); setHasBalance('All'); }}
                    style={{ marginTop: '0.25rem', width: '100%', justifyContent: 'center' }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Company / Business</th>
              <th>Contact Phone</th>
              <th>GSTIN</th>
              <th>Location</th>
              <th style={{ textAlign: 'center' }}>Orders</th>
              <th style={{ textAlign: 'right' }}>Total Billed (₹)</th>
              <th style={{ textAlign: 'right' }}>Balance Due (₹)</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading customer database...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                  No customers found. Click "Add Customer" to create an account.
                </td>
              </tr>
            ) : (
              customers.map((c) => {
                const hasDue = (c.totalBalanceDue || 0) > 0;
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '10px',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                          }}
                        >
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.name}</div>
                          {c.email && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{c.email}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                        <Building2 size={13} style={{ color: 'var(--text-light)' }} />
                        <span style={{ fontWeight: 600 }}>{c.companyName || 'Individual Client'}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}>
                        <Phone size={13} style={{ color: 'var(--text-light)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{c.mobile}</span>
                      </div>
                    </td>

                    <td>
                      {c.gstNumber ? (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            background: 'var(--bg-subtle)',
                            border: '1px solid var(--border-color)',
                            padding: '2px 7px',
                            borderRadius: '6px',
                          }}
                        >
                          {c.gstNumber}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.76rem' }}>Unregistered</span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <MapPin size={13} style={{ color: 'var(--text-light)' }} />
                        <span>{c.city}, {c.state}</span>
                      </div>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          padding: '3px 10px',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {c.totalOrders || 0}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                      ₹{(c.totalOrderValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)', color: hasDue ? '#d97706' : '#10b981' }}>
                      ₹{(c.totalBalanceDue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          onClick={() => onOpenDetailsModal(c)}
                          title="View Ledger Statement & Orders"
                        >
                          <FileSpreadsheet size={13} />
                          <span>Ledger</span>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 7px' }}
                          onClick={() => onOpenEditModal(c)}
                          title="Edit Customer Details"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 7px' }}
                          onClick={() => onDeleteCustomer(c)}
                          title="Delete Customer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
