import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, X, Package, Tag, Layers, Filter } from 'lucide-react';

export default function ProductListView({
  products = [],
  loading = false,
  filters,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  lowStock,
  setLowStock,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteProduct,
}) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div>
      {/* Header & Filter Toolbar */}
      <div className="toolbar">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Product Master & Warehouse Stock
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Manage electrical catalog, SKU codes, pricing, and live inventory thresholds
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input-wrap" style={{ minWidth: '240px' }}>
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search product name, SKU, brand..."
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
              {(selectedCategory !== 'All' || selectedBrand !== 'All' || lowStock !== 'All') && (
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
                  <span>Filter Catalog</span>
                  <button onClick={() => setShowFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
                    <X size={14} />
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    {(filters?.categories || []).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <select
                    className="form-select"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  >
                    <option value="All">All Brands</option>
                    {(filters?.brands || []).map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Level</label>
                  <select
                    className="form-select"
                    value={lowStock}
                    onChange={(e) => setLowStock(e.target.value)}
                  >
                    <option value="All">All Stock Levels</option>
                    <option value="Yes">Low Stock / Out of Stock</option>
                  </select>
                </div>

                { (selectedCategory !== 'All' || selectedBrand !== 'All' || lowStock !== 'All') && (
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => { setSelectedCategory('All'); setSelectedBrand('All'); setLowStock('All'); }}
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
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Electrical Product / Description</th>
              <th>Category</th>
              <th>Brand</th>
              <th>SKU Code</th>
              <th>Unit</th>
              <th style={{ textAlign: 'right' }}>Unit Price (₹)</th>
              <th style={{ textAlign: 'center' }}>Warehouse Stock</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading product catalog...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                  No electrical products found matching criteria.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isLowStock = p.stock <= 10 && p.stock > 0;
                const isOutOfStock = p.stock <= 0;

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.name}</div>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          color: 'var(--text-muted)',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border-color)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: 600,
                        }}
                      >
                        {p.category}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.brand}</span>
                    </td>

                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          fontWeight: 700,
                          background: 'var(--bg-subtle)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        {p.sku}
                      </span>
                    </td>

                    <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{p.unit}</td>

                    <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                      ₹{p.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      {isOutOfStock ? (
                        <span className="badge badge-cancelled">
                          <AlertTriangle size={11} />
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="badge badge-pending">
                          <AlertTriangle size={11} />
                          {p.stock} (Low)
                        </span>
                      ) : (
                        <span className="badge badge-delivered">
                          <CheckCircle2 size={11} />
                          {p.stock} In Stock
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 7px' }}
                          onClick={() => onOpenEditModal(p)}
                          title="Edit Product Details"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 7px' }}
                          onClick={() => onDeleteProduct(p)}
                          title="Delete Product"
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
