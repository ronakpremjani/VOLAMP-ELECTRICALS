/**
 * Business Logic Utility for Volamp Electricals Order Calculations
 * Handles Subtotal, Discounts, GST (18% standard for electrical goods), Grand Total & Balance calculations.
 */

function calculateOrderTotals({ items, discount = 0, gstRate = 18, amountReceived = 0 }) {
  const parsedDiscount = Math.max(0, parseFloat(discount) || 0);
  const parsedGstRate = Math.max(0, parseFloat(gstRate) !== undefined ? parseFloat(gstRate) : 18);
  const parsedAmountReceived = Math.max(0, parseFloat(amountReceived) || 0);

  // Calculate items and subtotal
  let subtotal = 0;
  const processedItems = (items || []).map((item) => {
    const qty = parseInt(item.quantity, 10) || 1;
    const price = parseFloat(item.unitPrice) || 0;
    const amount = Number((qty * price).toFixed(2));
    subtotal += amount;

    return {
      productId: item.productId,
      quantity: qty,
      unitPrice: price,
      amount: amount,
    };
  });

  subtotal = Number(subtotal.toFixed(2));

  // Calculate taxable amount after discount
  const taxableAmount = Math.max(0, Number((subtotal - parsedDiscount).toFixed(2)));

  // GST Calculation (18% for Electrical materials & equipment)
  const gstAmount = Number(((taxableAmount * parsedGstRate) / 100).toFixed(2));

  // Grand Total
  const grandTotal = Number((taxableAmount + gstAmount).toFixed(2));

  // Balance & Payment Status
  const balanceAmount = Number(Math.max(0, grandTotal - parsedAmountReceived).toFixed(2));

  let paymentStatus = 'Pending';
  if (parsedAmountReceived >= grandTotal && grandTotal > 0) {
    paymentStatus = 'Paid';
  } else if (parsedAmountReceived > 0) {
    paymentStatus = 'Partially Paid';
  } else {
    paymentStatus = 'Pending';
  }

  return {
    processedItems,
    subtotal,
    discount: parsedDiscount,
    gstRate: parsedGstRate,
    gstAmount,
    grandTotal,
    amountReceived: parsedAmountReceived,
    balanceAmount,
    paymentStatus,
  };
}

module.exports = {
  calculateOrderTotals,
};
