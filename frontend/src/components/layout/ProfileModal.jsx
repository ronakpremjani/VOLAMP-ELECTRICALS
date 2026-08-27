import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Building2, FileText, Phone, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfileModal({ isOpen, onClose }) {
  const [profile, setProfile] = useState({
    name: 'Store Admin',
    email: 'admin@volamp.com',
    company: 'Volamp Electricals Wholesale',
    gstin: '27AABCV8910Q1ZS',
    phone: '+91 22 2840 9900',
    address: 'Plot 120, Electrical Market Complex, Andheri East, Mumbai 400093',
  });

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate network delay for live feel
    setTimeout(() => {
      toast.success('Company profile updated');
      setIsSaving(false);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="modal-content"
        style={{ maxWidth: '520px', borderRadius: '20px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Enterprise & Staff Profile</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Store administration and GST parameters</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Administrator Name</label>
              <input
                type="text"
                className="form-input"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Enterprise Name (on Invoices)</label>
              <input
                type="text"
                className="form-input"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">GSTIN / Tax ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.gstin}
                  onChange={(e) => setProfile({ ...profile, gstin: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Official Email</label>
              <input
                type="email"
                className="form-input"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Factory / Store Premises Address</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
