/**
 * WhatsApp Bill & Reminder Utilities for Volamp Electricals
 */

export function sanitizePhone(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d+]/g, '');
  cleaned = cleaned.replace(/^\+/, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

export function generateBillMessage(order, customerName, companyName) {
  const date = new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const items = (order.items || [])
    .map(
      (item, i) =>
        `  ${i + 1}. ${item.product?.name || item.name || 'Electrical Item'} — ${item.quantity} ${item.product?.unit || 'Units'} × ₹${(item.unitPrice || item.price || 0).toFixed(2)} = ₹${(item.amount || item.quantity * item.unitPrice).toFixed(2)}`
    )
    .join('\n');

  let paymentSection = '';
  if (order.paymentStatus === 'Paid') {
    paymentSection = `✅ *Payment: PAID IN FULL*`;
  } else if (order.paymentStatus === 'Partially Paid' || order.paymentStatus === 'Partial') {
    paymentSection = [
      `💰 *Paid:* ₹${(order.amountReceived || order.amountPaid || 0).toFixed(2)}`,
      `⏳ *Balance Due:* ₹${(order.balanceAmount || order.amountLeft || 0).toFixed(2)}`,
    ].join('\n');
  } else {
    paymentSection = `⚠️ *Payment: UNPAID / PENDING*`;
  }

  const header = `⚡ *VOLAMP ELECTRICALS*`;

  return [
    header,
    `══════════════════════════`,
    `📄 *TAX INVOICE — ${order.orderNumber}*`,
    ``,
    `📅 Date: ${date}`,
    `👤 Customer: ${customerName} ${companyName ? `(${companyName})` : ''}`,
    `📦 Status: ${order.orderStatus || order.status}`,
    ``,
    `📋 *Items & Materials:*`,
    items || '  (No items)',
    ``,
    `══════════════════════════`,
    `Subtotal: ₹${(order.subtotal || 0).toFixed(2)}`,
    order.discount > 0 ? `Discount: -₹${(order.discount || 0).toFixed(2)}` : '',
    `GST (18%): +₹${(order.gstAmount || 0).toFixed(2)}`,
    `💵 *Grand Total: ₹${(order.grandTotal || order.totalAmount || 0).toFixed(2)}*`,
    paymentSection,
    `══════════════════════════`,
    ``,
    `Thank you for doing business with Volamp Electricals! ⚡`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function openWhatsApp(phone, message) {
  const cleanPhone = sanitizePhone(phone);
  const encodedMessage = encodeURIComponent(message);

  if (cleanPhone) {
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
  } else {
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  }
}

export function shareOrderOnWhatsApp(order, customerName, customerPhone, companyName) {
  const message = generateBillMessage(order, customerName, companyName);
  openWhatsApp(customerPhone, message);
}
