const prisma = require('../config/db');

// GET /api/dashboard/stats - Dynamically calculated metrics from database
const getDashboardStats = async (req, res) => {
  try {
    const { date } = req.query;

    let orderWhere = {};
    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      orderWhere.orderDate = { gte: startOfDay, lte: endOfDay };
    }

    const allOrders = await prisma.order.findMany({
      where: orderWhere,
      include: {
        customer: true,
        items: { include: { product: true } },
      },
      orderBy: { orderDate: 'desc' },
    });

    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter((o) => o.orderStatus === 'Pending').length;
    const confirmedOrders = allOrders.filter((o) => o.orderStatus === 'Confirmed').length;
    const processingOrders = allOrders.filter((o) => o.orderStatus === 'Processing').length;
    const dispatchedOrders = allOrders.filter((o) => o.orderStatus === 'Dispatched').length;
    const deliveredOrders = allOrders.filter((o) => o.orderStatus === 'Delivered').length;
    const cancelledOrders = allOrders.filter((o) => o.orderStatus === 'Cancelled').length;

    // Active (non-cancelled) total order revenue
    const activeOrders = allOrders.filter((o) => o.orderStatus !== 'Cancelled');
    const totalOrderValue = activeOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const totalAmountReceived = activeOrders.reduce((sum, o) => sum + (o.amountReceived || 0), 0);
    const totalBalanceOutstanding = activeOrders.reduce((sum, o) => sum + (o.balanceAmount || 0), 0);

    // Counts for customer and product inventory
    const totalCustomers = await prisma.customer.count();
    const totalProducts = await prisma.product.count();
    const lowStockProducts = await prisma.product.count({
      where: { stock: { lte: 10 } },
    });

    // Recent 10 orders for activity list
    const recentOrders = allOrders.slice(0, 10);

    res.json({
      success: true,
      data: {
        kpis: {
          totalOrders,
          pendingOrders,
          confirmedOrders,
          processingOrders,
          dispatchedOrders,
          deliveredOrders,
          cancelledOrders,
          totalOrderValue: Number(totalOrderValue.toFixed(2)),
          totalAmountReceived: Number(totalAmountReceived.toFixed(2)),
          totalBalanceOutstanding: Number(totalBalanceOutstanding.toFixed(2)),
        },
        inventory: {
          totalCustomers,
          totalProducts,
          lowStockProducts,
        },
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ success: false, message: 'Server error while calculating dashboard stats' });
  }
};

module.exports = {
  getDashboardStats,
};
