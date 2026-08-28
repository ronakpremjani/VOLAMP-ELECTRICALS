import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import CustomDropdown from '../common/CustomDropdown';

export default function ProductModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Wires & Cables',
    brand: 'Polycab',
    sku: '',
    unit: 'Piece',
    price: '',
    stock: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Wires & Cables',
    'Switchgear & MCBs',
    'Switches & Sockets',
    'Lighting Products',
    'Conduit & Fittings',
    'Industrial Accessories',
    'Electrical Appliances',
  ];

  const units = ['Piece', 'Meter', 'Box', 'Pack', 'Reel', 'Set'];

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || 'Wires & Cables',
        brand: initialData.brand || '',
        sku: initialData.sku || '',
        unit: initialData.unit || 'Piece',
        price: initialData.price !== undefined ? initialData.price : '',
        stock: initialData.stock !== undefined ? initialData.stock : '',
      });
    } else {
      setFormData({
        name: '',
        category: 'Wires & Cables',
        brand: 'Polycab',
        sku: '',
        unit: 'Piece',
        price: '',
        stock: '',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.brand.trim() || !formData.sku.trim() || formData.price === '' || formData.stock === '') {
      setError('Please fill in all product master fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSave({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {initialData ? 'Edit Electrical Product' : 'Add New Electrical Product'}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ background: 'var(--bg-subtle)', color: 'var(--text-main)', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.2rem', fontSize: '0.85rem', border: '1px solid var(--border-color)' }}>
                {error}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group col-span-2">
                <label className="form-label">Product Name / Description *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Polycab Flame Retardant 2.5 sq mm Copper Wire (90m Reel)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <CustomDropdown
                  options={categories}
                  value={formData.category}
                  onChange={(category) => setFormData({ ...formData, category })}
                  placeholder="Select category"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brand / Manufacturer *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Polycab, Havells, Schneider, Legrand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">SKU / Product Code *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. WIR-PLY-25-RED"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit of Measure *</label>
                <CustomDropdown
                  options={units}
                  value={formData.unit}
                  onChange={(unit) => setFormData({ ...formData, unit })}
                  placeholder="Select unit"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Selling Price (₹ per unit) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Available Inventory Stock *</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : initialData ? 'Update Product' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
