const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateOrderTotals } = require('../src/utils/orderCalculations');

test('calculateOrderTotals computes subtotal, discount, GST, grand total, balance, and partial payment status', () => {
  const result = calculateOrderTotals({
    items: [
      { productId: 'wire-1', quantity: 2, unitPrice: 100 },
      { productId: 'mcb-1', quantity: 3, unitPrice: 50 },
    ],
    discount: 25,
    gstRate: 18,
    amountReceived: 100,
  });

  assert.deepEqual(result.processedItems, [
    { productId: 'wire-1', quantity: 2, unitPrice: 100, amount: 200 },
    { productId: 'mcb-1', quantity: 3, unitPrice: 50, amount: 150 },
  ]);
  assert.equal(result.subtotal, 350);
  assert.equal(result.discount, 25);
  assert.equal(result.gstAmount, 58.5);
  assert.equal(result.grandTotal, 383.5);
  assert.equal(result.amountReceived, 100);
  assert.equal(result.balanceAmount, 283.5);
  assert.equal(result.paymentStatus, 'Partially Paid');
});

test('calculateOrderTotals clamps unsafe inputs to production-safe values', () => {
  const result = calculateOrderTotals({
    items: [
      { productId: 'fan-1', quantity: -4, unitPrice: -300 },
      { productId: 'light-1', quantity: '2', unitPrice: '250.25' },
    ],
    discount: 999999,
    gstRate: null,
    amountReceived: -50,
  });

  assert.deepEqual(result.processedItems, [
    { productId: 'fan-1', quantity: 1, unitPrice: 0, amount: 0 },
    { productId: 'light-1', quantity: 2, unitPrice: 250.25, amount: 500.5 },
  ]);
  assert.equal(result.subtotal, 500.5);
  assert.equal(result.discount, 500.5);
  assert.equal(result.gstRate, 18);
  assert.equal(result.gstAmount, 0);
  assert.equal(result.grandTotal, 0);
  assert.equal(result.amountReceived, 0);
  assert.equal(result.paymentStatus, 'Pending');
});

test('calculateOrderTotals marks fully paid orders as paid', () => {
  const result = calculateOrderTotals({
    items: [{ productId: 'switch-1', quantity: 1, unitPrice: 100 }],
    gstRate: 18,
    amountReceived: 118,
  });

  assert.equal(result.grandTotal, 118);
  assert.equal(result.balanceAmount, 0);
  assert.equal(result.paymentStatus, 'Paid');
});
