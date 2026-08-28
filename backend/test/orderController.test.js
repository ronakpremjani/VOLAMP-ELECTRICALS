const test = require('node:test');
const assert = require('node:assert/strict');

const dbModulePath = require.resolve('../src/config/db');
const socketModulePath = require.resolve('../src/socket');
const controllerPath = require.resolve('../src/controllers/orderController');

function loadController(prisma) {
  delete require.cache[controllerPath];
  require.cache[dbModulePath] = { exports: prisma };
  require.cache[socketModulePath] = {
    exports: {
      getIO: () => ({ emit: () => {} }),
    },
  };
  return require('../src/controllers/orderController');
}

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test.afterEach(() => {
  delete require.cache[controllerPath];
  delete require.cache[dbModulePath];
  delete require.cache[socketModulePath];
});

test('getNextOrderNumber returns the current frontend-compatible response shape', async () => {
  const { getNextOrderNumber } = loadController({
    order: {
      findFirst: async () => ({ orderNumber: 'VOL-2026-0041' }),
    },
  });
  const res = createResponse();

  await getNextOrderNumber({ params: {}, query: {} }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.match(res.body.orderNumber, /^VOL-\d{4}-0042$/);
  assert.equal(res.body.data.nextOrderNumber, res.body.orderNumber);
});

test('createOrder rejects invalid quantities before stock or transaction work', async () => {
  const calls = [];
  const { createOrder } = loadController({
    customer: {
      findUnique: async () => ({ id: 'customer-1', name: 'Asha Retail' }),
    },
    product: {
      findMany: async () => {
        calls.push('product.findMany');
        return [];
      },
    },
    order: {
      findUnique: async () => null,
    },
    $transaction: async () => {
      calls.push('transaction');
    },
  });
  const res = createResponse();

  await createOrder({
    body: {
      customerId: 'customer-1',
      items: [{ productId: 'product-1', quantity: -2, unitPrice: 100 }],
    },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /positive quantity/);
  assert.deepEqual(calls, []);
});

test('createOrder validates duplicate product lines against aggregate stock', async () => {
  const { createOrder } = loadController({
    customer: {
      findUnique: async () => ({ id: 'customer-1', name: 'Asha Retail' }),
    },
    product: {
      findMany: async ({ where }) => {
        assert.deepEqual(where.id.in, ['product-1']);
        return [{ id: 'product-1', name: 'Copper Wire', price: 100, stock: 4, unit: 'Reel' }];
      },
    },
    order: {
      findUnique: async () => null,
    },
    $transaction: async () => {
      throw new Error('Transaction should not start when aggregate stock is insufficient');
    },
  });
  const res = createResponse();

  await createOrder({
    body: {
      customerId: 'customer-1',
      items: [
        { productId: 'product-1', quantity: 2, unitPrice: 100 },
        { productId: 'product-1', quantity: 3, unitPrice: 100 },
      ],
    },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /Insufficient stock/);
});

test('createOrder deducts duplicate product stock once with the aggregate quantity and stores notification relation', async () => {
  const updateManyCalls = [];
  const notificationCreates = [];
  const orderCreates = [];
  const tx = {
    order: {
      create: async ({ data }) => {
        orderCreates.push(data);
        return {
          id: 'order-1',
          orderNumber: data.orderNumber,
          customer: { id: data.customerId },
          items: [],
        };
      },
    },
    product: {
      updateMany: async (args) => {
        updateManyCalls.push(args);
        return { count: 1 };
      },
    },
    notification: {
      create: async ({ data }) => {
        notificationCreates.push(data);
        return { id: 'notification-1', ...data };
      },
    },
  };
  const { createOrder } = loadController({
    customer: {
      findUnique: async () => ({ id: 'customer-1', name: 'Asha Retail', companyName: null }),
    },
    product: {
      findMany: async () => [{ id: 'product-1', name: 'Copper Wire', price: 100, stock: 5, unit: 'Reel' }],
    },
    order: {
      findUnique: async () => null,
    },
    $transaction: async (callback) => callback(tx),
  });
  const res = createResponse();

  await createOrder({
    body: {
      orderNumber: 'VOL-2026-0099',
      customerId: 'customer-1',
      items: [
        { productId: 'product-1', quantity: 2, unitPrice: 100 },
        { productId: 'product-1', quantity: 3, unitPrice: 100 },
      ],
      amountReceived: 100,
    },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(orderCreates[0].subtotal, 500);
  assert.equal(updateManyCalls.length, 1);
  assert.deepEqual(updateManyCalls[0], {
    where: { id: 'product-1', stock: { gte: 5 } },
    data: { stock: { decrement: 5 } },
  });
  assert.equal(notificationCreates[0].relatedId, 'order-1');
});

test('updateOrderStatus blocks cancelled-order reactivation when stock is no longer available', async () => {
  const originalConsoleError = console.error;
  console.error = () => {};
  const tx = {
    product: {
      updateMany: async () => ({ count: 0 }),
    },
  };
  const { updateOrderStatus } = loadController({
    order: {
      findUnique: async () => ({
        id: 'order-1',
        orderStatus: 'Cancelled',
        items: [{ productId: 'product-1', quantity: 5 }],
      }),
    },
    $transaction: async (callback) => callback(tx),
  });
  const res = createResponse();

  try {
    await updateOrderStatus({
      params: { id: 'order-1' },
      body: { status: 'Confirmed' },
    }, res);
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /Insufficient stock/);
});
