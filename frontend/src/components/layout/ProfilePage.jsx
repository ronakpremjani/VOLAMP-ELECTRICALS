import React, { useState } from 'react';
import {
  User, Building2, Phone, Mail, MapPin, ShieldCheck,
  Save, CheckCircle2, Zap, FileText, ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage({ onBack }) {
  const [profile, setProfile] = useState({
    name: 'Store Admin',
    email: 'admin@volamp.com',
    company: 'Volamp Electricals Wholesale',
    gstin: '27AABCV8910Q1ZS',
    phone: '+91 22 2840 9900',
    address: 'Plot 120, Electrical Market Complex, Andheri East, Mumbai 400093',
    website: 'volampelektrikals.com',
    bankName: 'State Bank of India',
    accountNo: '1234567890',
    ifsc: 'SBIN0001234',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      toast.success('Company profile updated successfully');
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 900);
  };

  const Field = ({ label, children }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* ── Page Header ─────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        marginBottom: '1.75rem',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 'var(--radius-md)',
          background: 'var(--primary)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff',
          boxShadow: '0 4px 14px rgba(255,119,0,0.35)',
        }}>
          <Building2 size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Company Profile
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Manage your enterprise details, GST information, and banking credentials
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          {/* ── Section: Company Information ──────── */}
          <div className="card">
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              marginBottom: '1.1rem', paddingBottom: '0.85rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 'var(--radius-sm)',
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Building2 size={15} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  Company Information
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Displayed on all generated invoices
                </div>
              </div>
            </div>

            <div className="form-grid">
              <Field label="Administrator Name">
                <input
                  type="text"
                  className="form-input"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </Field>

              <Field label="Enterprise / Trade Name">
                <input
                  type="text"
                  className="form-input"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  required
                />
              </Field>

              <Field label="Official Email">
                <input
                  type="email"
                  className="form-input"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </Field>

              <Field label="Contact Phone">
                <input
                  type="text"
                  className="form-input"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </Field>

              <Field label="Website">
                <input
                  type="text"
                  className="form-input"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="example.com"
                />
              </Field>

              <div className="form-group col-span-2" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Factory / Store Address</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* ── Section: Tax & Compliance ─────────── */}
          <div className="card">
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              marginBottom: '1.1rem', paddingBottom: '0.85rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 'var(--radius-sm)',
                background: 'var(--color-emerald-bg)', color: 'var(--color-emerald)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShieldCheck size={15} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  Tax &amp; Compliance
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  GSTIN and tax registration details
                </div>
              </div>
            </div>

            <div className="form-grid">
              <Field label="GSTIN / Tax Registration Number">
                <input
                  type="text"
                  className="form-input"
                  value={profile.gstin}
                  onChange={(e) => setProfile({ ...profile, gstin: e.target.value.toUpperCase() })}
                  placeholder="27AABCV8910Q1ZS"
                  style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}
                />
              </Field>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <div style={{
                  flex: 1, padding: '0.7rem 0.85rem',
                  background: profile.gstin.length === 15
                    ? 'var(--color-emerald-bg)' : 'var(--bg-subtle)',
                  border: `1px solid ${profile.gstin.length === 15
                    ? 'var(--color-emerald-border)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <CheckCircle2
                    size={16}
                    color={profile.gstin.length === 15 ? 'var(--color-emerald)' : 'var(--text-light)'}
                  />
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 600,
                    color: profile.gstin.length === 15 ? 'var(--color-emerald)' : 'var(--text-muted)',
                  }}>
                    {profile.gstin.length === 15 ? 'GSTIN format valid' : `${profile.gstin.length}/15 characters`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section: Banking Details ───────────── */}
          <div className="card">
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              marginBottom: '1.1rem', paddingBottom: '0.85rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 'var(--radius-sm)',
                background: 'var(--color-blue-bg)', color: 'var(--color-blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileText size={15} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  Banking Details
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Printed on invoices for payment reference
                </div>
              </div>
            </div>

            <div className="form-grid">
              <Field label="Bank Name">
                <input
                  type="text"
                  className="form-input"
                  value={profile.bankName}
                  onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                />
              </Field>

              <Field label="IFSC Code">
                <input
                  type="text"
                  className="form-input"
                  value={profile.ifsc}
                  onChange={(e) => setProfile({ ...profile, ifsc: e.target.value.toUpperCase() })}
                  style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}
                />
              </Field>

              <Field label="Account Number">
                <input
                  type="text"
                  className="form-input"
                  value={profile.accountNo}
                  onChange={(e) => setProfile({ ...profile, accountNo: e.target.value })}
                  style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}
                />
              </Field>
            </div>
          </div>

          {/* ── Save Button ───────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingBottom: '1rem' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={isSaving}>
              {saved
                ? <><CheckCircle2 size={17} /> Saved!</>
                : isSaving
                  ? 'Saving...'
                  : <><Save size={17} /> Save Profile</>
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
