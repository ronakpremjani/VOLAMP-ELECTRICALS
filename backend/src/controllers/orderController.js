const prisma = require('../config/db');
const { calculateOrderTotals } = require('../utils/orderCalculations');
const socket = require('../socket');

// Helper to generate unique order number like VOL-2026-0001
async function generateOrderNumber() {
  const currentYear = new Date().getFullYear();
  const count = await prisma.order.count();
  const paddedIndex = String(count + 1).padStart(4, '0');
  return `VOL-${currentYear}-${paddedIndex}`;
}

// GET /api/orders/next-number - Fetch next sequential order ID
const getNextOrderNumber = async (req, res) => {
  try {
    const orderNumber = await generateOrderNumber();
    res.json({ success: true, orderNumber });
  } catch (error) {
    console.error('Error getting next order number:', error);
    res.status(500).json({ success: false, message: 'Failed to generate next order number' });
  }
};

// GET /api/orders - List orders with search & filtering
const getOrders = async (req, res) => {
  try {
    const { search, orderStatus, paymentStatus, startDate, endDate, date } = req.query;

    const where = {};

    if (orderStatus && orderStatus !== 'All') {
      where.orderStatus = orderStatus;
    }

    if (paymentStatus && paymentStatus !== 'All') {
      where.paymentStatus = paymentStatus;
    }

    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      where.orderDate = { gte: startOfDay, lte: endOfDay };
    } else if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.orderDate.lte = end;
      }
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { companyName: { contains: search } } },
        { customer: { mobile: { contains: search } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { orderDate: 'desc' },
    });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching orders' });
  }
};

// GET /api/orders/:id - Single order details
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching order details' });
  }
};

// POST /api/orders - Create new order
const createOrder = async (req, res) => {
  try {
    const { orderNumber: customOrderNumber, customerId, items, discount = 0, gstRate = 18, amountReceived = 0, salesperson, notes } = req.body;

    if (!customerId) {
      return res.status(400).json({ success: false, message: 'Customer selection is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one product item is required' });
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Selected customer does not exist' });
    }

    // Verify products and validate stock
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (dbProducts.length !== productIds.length) {
      return res.status(400).json({ success: false, message: 'One or more selected products are invalid' });
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Check stock for each item
    for (const item of items) {
      const product = productMap.get(item.productId);
      const requestedQty = parseInt(item.quantity, 10) || 1;
      if (product.stock < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'. Available: ${product.stock} ${product.unit}, Requested: ${requestedQty} ${product.unit}`,
        });
      }
    }

    // Calculate totals using central business logic utility
    const totals = calculateOrderTotals({
      items: items.map((item) => ({
        productId: item.productId,
        quantity: parseInt(item.quantity, 10),
        unitPrice: item.unitPrice !== undefined ? parseFloat(item.unitPrice) : productMap.get(item.productId).price,
      })),
      discount,
      gstRate,
      amountReceived,
    });

    const finalOrderNumber = customOrderNumber?.trim() || (await generateOrderNumber());

    // Run order creation and stock deduction in a database transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const order = await tx.order.create({
        data: {
          orderNumber: finalOrderNumber,
          customerId,
          subtotal: totals.subtotal,
          discount: totals.discount,
          gstRate: totals.gstRate,
          gstAmount: totals.gstAmount,
          grandTotal: totals.grandTotal,
          amountReceived: totals.amountReceived,
          balanceAmount: totals.balanceAmount,
          paymentStatus: totals.paymentStatus,
          orderStatus: 'Pending',
          salesperson: salesperson ? salesperson.trim() : 'Store Admin',
          notes: notes ? notes.trim() : null,
          items: {
            create: totals.processedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount,
            })),
          },
        },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      });

      // 2. Deduct inventory stock for each product
      for (const item of totals.processedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      await tx.notification.create({
        data: {
          title: 'New Order Received',
          message: `Order ${order.orderNumber} created for ${customer.companyName || customer.name}.`,
          type: 'ORDER',
          relatedId: order.id,
        }
      });

      return order;
    });

    socket.getIO().emit('data_changed', { type: 'order_created', id: newOrder.id });
    res.status(201).json({
      success: true,
      message: `Order #${newOrder.orderNumber} created successfully`,
      data: newOrder,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error while creating order' });
  }
};

// PATCH /api/orders/:id/status or PUT /api/orders/:id
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, status } = req.body;
    const targetStatus = orderStatus || status;

    const allowedStatuses = ['Pending', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'];
    if (!allowedStatuses.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const wasCancelled = existing.orderStatus === 'Cancelled';
    const isNowCancelled = targetStatus === 'Cancelled';

    const updated = await prisma.$transaction(async (tx) => {
      // If cancelling an active order, return stock to inventory
      if (!wasCancelled && isNowCancelled) {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // If re-activating a cancelled order, re-deduct stock
      if (wasCancelled && !isNowCancelled) {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      const order = await tx.order.update({
        where: { id },
        data: { orderStatus: targetStatus },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      });

      await tx.notification.create({
        data: {
          title: 'Order Status Updated',
          message: `Order ${order.orderNumber} is now ${targetStatus}.`,
          type: 'ORDER',
          relatedId: order.id,
        }
      });

      return order;
    });

    socket.getIO().emit('data_changed', { type: 'order_updated', id: updated.id });
    res.json({
      success: true,
      message: `Order status updated to '${targetStatus}'`,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Server error while updating order status' });
  }
};

// PATCH /api/orders/:id/payment - Record payment & update balance
const updateOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amountReceived } = req.body;

    if (amountReceived === undefined || isNaN(amountReceived)) {
      return res.status(400).json({ success: false, message: 'Valid amountReceived is required' });
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const newAmountReceived = Math.max(0, parseFloat(amountReceived));
    const balanceAmount = Number(Math.max(0, existing.grandTotal - newAmountReceived).toFixed(2));

    let paymentStatus = 'Pending';
    if (newAmountReceived >= existing.grandTotal && existing.grandTotal > 0) {
      paymentStatus = 'Paid';
    } else if (newAmountReceived > 0) {
      paymentStatus = 'Partially Paid';
    }

    const result = await prisma.$transaction(async (tx) => {
        const order = await tx.order.update({
          where: { id },
          data: {
            amountReceived: newAmountReceived,
            balanceAmount,
            paymentStatus,
          },
          include: {
            customer: true,
            items: { include: { product: true } },
          },
        });

        await tx.notification.create({
          data: {
            title: 'Payment Received',
            message: `Payment of ₹${newAmountReceived} recorded for Order ${order.orderNumber}. New status: ${paymentStatus}.`,
            type: 'PAYMENT',
            relatedId: order.id,
          }
        });

        return order;
    });

    socket.getIO().emit('data_changed', { type: 'order_payment_updated', id: result.id });
    res.json({
      success: true,
      message: `Payment updated. Balance remaining: ₹${balanceAmount.toLocaleString('en-IN')}`,
      data: result,
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ success: false, message: 'Server error while updating payment' });
  }
};

// DELETE /api/orders/:id - Delete order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await prisma.$transaction(async (tx) => {
      // If not cancelled, restore inventory on deletion
      if (existing.orderStatus !== 'Cancelled') {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.order.delete({ where: { id } });
    });

    socket.getIO().emit('data_changed', { type: 'order_deleted', id: id });
    res.json({ success: true, message: `Order #${existing.orderNumber} deleted successfully` });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting order' });
  }
};

module.exports = {
  getNextOrderNumber,
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrderPayment,
  deleteOrder,
};
