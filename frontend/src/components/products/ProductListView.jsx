import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, X, Package, Tag, Layers, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import CustomDropdown from '../common/CustomDropdown';

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
  sortBy,
  setSortBy,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteProduct,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedProducts = products.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset to page 1 whenever the product list changes (filter/sort)
  React.useEffect(() => { setCurrentPage(1); }, [products.length]);

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
              {(selectedCategory !== 'All' || selectedBrand !== 'All' || lowStock !== 'All' || sortBy !== 'name_asc') && (
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
                  <CustomDropdown
                    value={selectedCategory}
                    onChange={(val) => setSelectedCategory(val)}
                    options={[
                      { value: 'All', label: 'All Categories' },
                      ...(filters?.categories || []).map(cat => ({ value: cat, label: cat }))
                    ]}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <CustomDropdown
                    value={selectedBrand}
                    onChange={(val) => setSelectedBrand(val)}
                    options={[
                      { value: 'All', label: 'All Brands' },
                      ...(filters?.brands || []).map(brand => ({ value: brand, label: brand }))
                    ]}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Level</label>
                  <CustomDropdown
                    value={lowStock}
                    onChange={(val) => setLowStock(val)}
                    options={[
                      { value: 'All', label: 'All Stock Levels' },
                      { value: 'Yes', label: 'Low Stock / Out of Stock' }
                    ]}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sort By</label>
                  <CustomDropdown
                    value={sortBy}
                    onChange={(val) => setSortBy(val)}
                    options={[
                      { value: 'name_asc', label: 'Name (A-Z)' },
                      { value: 'price_desc', label: 'Price (High to Low)' },
                      { value: 'price_asc', label: 'Price (Low to High)' },
                      { value: 'stock_desc', label: 'Stock Level (High to Low)' },
                      { value: 'stock_asc', label: 'Stock Level (Low to High)' }
                    ]}
                  />
                </div>

                { (selectedCategory !== 'All' || selectedBrand !== 'All' || lowStock !== 'All' || sortBy !== 'name_asc') && (
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => { setSelectedCategory('All'); setSelectedBrand('All'); setLowStock('All'); setSortBy('name_asc'); }}
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
              pagedProducts.map((p) => {
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

      {/* Pagination Footer */}
      {!loading && products.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.9rem 1.25rem',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          borderRadius: '0 0 var(--radius-md) var(--radius-md)',
          marginTop: '-1px',
        }}>
          {/* Left: count info */}
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: 'var(--text-main)' }}>{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, products.length)}</strong> of <strong style={{ color: 'var(--text-main)' }}>{products.length}</strong> products
          </span>

          {/* Centre: page buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 8px' }}
              disabled={safePage === 1}
              onClick={() => setCurrentPage(safePage - 1)}
            >
              <ChevronLeft size={15} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(pg => pg === 1 || pg === totalPages || Math.abs(pg - safePage) <= 1)
              .reduce((acc, pg, idx, arr) => {
                if (idx > 0 && pg - arr[idx - 1] > 1) {
                  acc.push('...');
                }
                acc.push(pg);
                return acc;
              }, [])
              .map((pg, idx) =>
                pg === '...' ? (
                  <span key={`ellipsis-${idx}`} style={{ padding: '0 6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>…</span>
                ) : (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    style={{
                      minWidth: 32,
                      height: 32,
                      borderRadius: 'var(--radius-sm)',
                      border: pg === safePage ? 'none' : '1px solid var(--border-color)',
                      background: pg === safePage ? 'var(--primary)' : 'transparent',
                      color: pg === safePage ? '#fff' : 'var(--text-main)',
                      fontWeight: pg === safePage ? 700 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {pg}
                  </button>
                )
              )
            }

            <button
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 8px' }}
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage(safePage + 1)}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Right: rows per page hint */}
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Page <strong style={{ color: 'var(--text-main)' }}>{safePage}</strong> of <strong style={{ color: 'var(--text-main)' }}>{totalPages}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
