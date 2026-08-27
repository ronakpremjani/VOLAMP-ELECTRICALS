import React from 'react';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function PaymentStatusBadge({ status, balanceAmount }) {
  if (status === 'Paid') {
    return (
      <span className="badge badge-paid">
        <CheckCircle2 size={12} />
        <span>Paid</span>
      </span>
    );
  }

  if (status === 'Partially Paid') {
    return (
      <span className="badge badge-partially-paid">
        <AlertTriangle size={12} />
        <span>Partially Paid</span>
      </span>
    );
  }

  return (
    <span className="badge badge-pending">
      <Clock size={12} />
      <span>Pending</span>
    </span>
  );
}
