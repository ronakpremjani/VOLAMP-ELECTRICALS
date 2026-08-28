const prisma = require('../config/db');
const socket = require('../socket');

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// GET /api/customers - List all customers with computed Total Orders and Total Order Value
const getCustomers = async (req, res) => {
  try {
    const { search, city, hasBalance } = req.query;

    const where = {};
    
    if (city && city !== 'All') {
      where.city = city;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { companyName: { contains: search } },
        { mobile: { contains: search } },
        { city: { contains: search } },
        { gstNumber: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        orders: {
          select: {
            id: true,
            grandTotal: true,
            amountReceived: true,
            balanceAmount: true,
            orderStatus: true,
            paymentStatus: true,
          },
        },
        paymentHistory: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute aggregated metrics for each customer
    const computedCustomers = customers.map((c) => {
      const activeOrders = c.orders.filter((o) => o.orderStatus !== 'Cancelled');
      const totalOrders = c.orders.length;
      const totalOrderValue = activeOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
      const totalAmountPaid = activeOrders.reduce((sum, o) => sum + (o.amountReceived || 0), 0);
      const totalBalanceDue = activeOrders.reduce((sum, o) => sum + (o.balanceAmount || 0), 0);

      return {
        ...c,
        totalOrders,
        totalOrderValue: Number(totalOrderValue.toFixed(2)),
        totalAmountPaid: Number(totalAmountPaid.toFixed(2)),
        totalBalanceDue: Number(totalBalanceDue.toFixed(2)),
      };
    });

    let finalCustomers = computedCustomers;
    if (hasBalance === 'true') {
      finalCustomers = finalCustomers.filter(c => c.totalBalanceDue > 0);
    }

    if (req.query.sortBy === 'name_asc') {
      finalCustomers.sort((a, b) => a.name.localeCompare(b.name));
    } else if (req.query.sortBy === 'billed_desc') {
      finalCustomers.sort((a, b) => b.totalOrderValue - a.totalOrderValue);
    } else if (req.query.sortBy === 'balance_desc') {
      finalCustomers.sort((a, b) => b.totalBalanceDue - a.totalBalanceDue);
    }
    
    // Extract unique cities for the frontend filter
    const allCustomers = await prisma.customer.findMany({ select: { city: true } });
    const cities = Array.from(new Set(allCustomers.map(c => c.city).filter(Boolean))).sort();

    res.json({ success: true, count: finalCustomers.length, data: finalCustomers, filters: { cities } });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching customers' });
  }
};

// GET /api/customers/:id - Get single customer with order history & payment ledger
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: {
              include: { product: true },
            },
          },
          orderBy: { orderDate: 'desc' },
        },
        paymentHistory: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const activeOrders = customer.orders.filter((o) => o.orderStatus !== 'Cancelled');
    const totalOrders = customer.orders.length;
    const totalOrderValue = activeOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const totalAmountPaid = activeOrders.reduce((sum, o) => sum + (o.amountReceived || 0), 0);
    const totalBalanceDue = activeOrders.reduce((sum, o) => sum + (o.balanceAmount || 0), 0);

    res.json({
      success: true,
      data: {
        ...customer,
        totalOrders,
        totalOrderValue: Number(totalOrderValue.toFixed(2)),
        totalAmountPaid: Number(totalAmountPaid.toFixed(2)),
        totalBalanceDue: Number(totalBalanceDue.toFixed(2)),
      },
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching customer details' });
  }
};

// POST /api/customers - Add Customer
const createCustomer = async (req, res) => {
  try {
    const { name, companyName, mobile, email, address, gstNumber, city, state } = req.body;

    const cleanName = cleanString(name);
    const cleanMobile = cleanString(mobile);
    const cleanAddress = cleanString(address);

    if (!cleanName || !cleanMobile || !cleanAddress) {
      return res.status(400).json({
        success: false,
        message: 'Name, Mobile, and Address are required fields',
      });
    }

    const customer = await prisma.customer.create({
      data: {
        name: cleanName,
        companyName: cleanString(companyName) || null,
        mobile: cleanMobile,
        email: cleanString(email) || null,
        address: cleanAddress,
        gstNumber: cleanString(gstNumber).toUpperCase() || null,
        city: cleanString(city) || 'Mumbai',
        state: cleanString(state) || 'Maharashtra',
      },
    });

    socket.getIO().emit('data_changed', { type: 'customer_created', id: customer.id });
    res.status(201).json({ success: true, message: 'Customer created successfully', data: customer });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ success: false, message: 'Server error while creating customer' });
  }
};

// POST /api/customers/:id/payments - Record standalone payment
const recordCustomerPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method = 'Cash', notes } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const payment = await prisma.payment.create({
      data: {
        customerId: id,
        amount: parsedAmount,
        method,
        notes: notes ? notes.trim() : null,
      },
    });

    await prisma.customer.update({
      where: { id },
      data: {
        totalPaid: { increment: parsedAmount },
      },
    });

    res.status(201).json({ success: true, message: 'Payment recorded to ledger', data: payment });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ success: false, message: 'Server error while recording payment' });
  }
};

// PUT /api/customers/:id - Update Customer
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, companyName, mobile, email, address, gstNumber, city, state } = req.body;

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const cleanName = name !== undefined ? cleanString(name) : existing.name;
    const cleanMobile = mobile !== undefined ? cleanString(mobile) : existing.mobile;
    const cleanAddress = address !== undefined ? cleanString(address) : existing.address;

    if (!cleanName || !cleanMobile || !cleanAddress) {
      return res.status(400).json({
        success: false,
        message: 'Name, Mobile, and Address are required fields',
      });
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        name: cleanName,
        companyName: companyName !== undefined ? cleanString(companyName) || null : existing.companyName,
        mobile: cleanMobile,
        email: email !== undefined ? cleanString(email) || null : existing.email,
        address: cleanAddress,
        gstNumber: gstNumber !== undefined ? cleanString(gstNumber).toUpperCase() || null : existing.gstNumber,
        city: city !== undefined ? cleanString(city) || existing.city : existing.city,
        state: state !== undefined ? cleanString(state) || existing.state : existing.state,
      },
    });

    socket.getIO().emit('data_changed', { type: 'customer_updated', id: updated.id });
    res.json({ success: true, message: 'Customer updated successfully', data: updated });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ success: false, message: 'Server error while updating customer' });
  }
};

// DELETE /api/customers/:id - Delete Customer
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.customer.findUnique({
      where: { id },
      include: { orders: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (existing.orders.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete customer with ${existing.orders.length} associated order(s). Cancel or delete orders first.`,
      });
    }

    await prisma.customer.delete({ where: { id } });
    socket.getIO().emit('data_changed', { type: 'customer_deleted', id });
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting customer' });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  recordCustomerPayment,
  updateCustomer,
  deleteCustomer,
};
