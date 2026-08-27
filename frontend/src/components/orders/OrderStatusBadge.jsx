import React from 'react';
import { Clock, CheckCircle2, Truck, PackageCheck, AlertCircle, XCircle } from 'lucide-react';

export default function OrderStatusBadge({ status }) {
  const getBadgeConfig = (st) => {
    switch (st) {
      case 'Pending':
        return { className: 'badge-pending', icon: Clock, label: 'Pending' };
      case 'Confirmed':
        return { className: 'badge-confirmed', icon: CheckCircle2, label: 'Confirmed' };
      case 'Processing':
        return { className: 'badge-processing', icon: PackageCheck, label: 'Processing' };
      case 'Dispatched':
        return { className: 'badge-dispatched', icon: Truck, label: 'Dispatched' };
      case 'Delivered':
        return { className: 'badge-delivered', icon: CheckCircle2, label: 'Delivered' };
      case 'Cancelled':
        return { className: 'badge-cancelled', icon: XCircle, label: 'Cancelled' };
      default:
        return { className: 'badge-pending', icon: Clock, label: st || 'Unknown' };
    }
  };

  const config = getBadgeConfig(status);
  const Icon = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      <Icon size={12} />
      <span>{config.label}</span>
    </span>
  );
}
