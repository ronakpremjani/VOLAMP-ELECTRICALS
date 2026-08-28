const prisma = require('../config/db');
const socket = require('../socket');

function normalizeRequiredString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseNonNegativeNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseNonNegativeInteger(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

// GET /api/products - List products with optional search and category filters
const getProducts = async (req, res) => {
  try {
    const { search, category, brand, lowStock } = req.query;

    const where = {};

    if (category && category !== 'All') {
      where.category = category;
    }

    if (brand && brand !== 'All') {
      where.brand = brand;
    }

    if (lowStock === 'true') {
      where.stock = { lte: 10 };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { brand: { contains: search } },
        { category: { contains: search } },
      ];
    }

    let orderBy = { name: 'asc' }; // default
    if (req.query.sortBy === 'price_desc') orderBy = { price: 'desc' };
    else if (req.query.sortBy === 'price_asc') orderBy = { price: 'asc' };
    else if (req.query.sortBy === 'stock_desc') orderBy = { stock: 'desc' };
    else if (req.query.sortBy === 'stock_asc') orderBy = { stock: 'asc' };

    const products = await prisma.product.findMany({
      where,
      orderBy,
    });

    // Extract unique categories and brands for filter dropdowns
    const allProducts = await prisma.product.findMany({
      select: { category: true, brand: true },
    });
    const categories = Array.from(new Set(allProducts.map((p) => p.category))).sort();
    const brands = Array.from(new Set(allProducts.map((p) => p.brand))).sort();

    res.json({
      success: true,
      count: products.length,
      data: products,
      filters: { categories, brands },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching products' });
  }
};

// GET /api/products/:id - Single product
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: {
          take: 5,
          orderBy: { id: 'desc' },
          include: { order: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching product' });
  }
};

// POST /api/products - Create Product
const createProduct = async (req, res) => {
  try {
    const { name, category, brand, sku, unit, price, stock } = req.body;

    const cleanName = normalizeRequiredString(name);
    const cleanCategory = normalizeRequiredString(category);
    const cleanBrand = normalizeRequiredString(brand);
    const cleanSku = normalizeRequiredString(sku).toUpperCase();
    const cleanUnit = normalizeRequiredString(unit);
    const parsedPrice = parseNonNegativeNumber(price);
    const parsedStock = parseNonNegativeInteger(stock);

    if (!cleanName || !cleanCategory || !cleanBrand || !cleanSku || !cleanUnit || parsedPrice === null || parsedStock === null) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required. Price and stock must be non-negative numbers.',
      });
    }

    const existingSku = await prisma.product.findUnique({
      where: { sku: cleanSku },
    });

    if (existingSku) {
      return res.status(400).json({
        success: false,
        message: `Product SKU '${sku}' already exists`,
      });
    }

    const product = await prisma.product.create({
      data: {
        name: cleanName,
        category: cleanCategory,
        brand: cleanBrand,
        sku: cleanSku,
        unit: cleanUnit,
        price: parsedPrice,
        stock: parsedStock,
      },
    });

    socket.getIO().emit('data_changed', { type: 'product_created', id: product.id });
    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Server error while creating product' });
  }
};

// PUT /api/products/:id - Update Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, brand, sku, unit, price, stock } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const cleanSku = sku !== undefined ? normalizeRequiredString(sku).toUpperCase() : existing.sku;
    if (sku !== undefined && !cleanSku) {
      return res.status(400).json({ success: false, message: 'SKU cannot be blank' });
    }

    if (cleanSku !== existing.sku) {
      const duplicateSku = await prisma.product.findUnique({
        where: { sku: cleanSku },
      });
      if (duplicateSku) {
        return res.status(400).json({
          success: false,
          message: `SKU '${sku}' is already taken by another product`,
        });
      }
    }

    const cleanName = name !== undefined ? normalizeRequiredString(name) : existing.name;
    const cleanCategory = category !== undefined ? normalizeRequiredString(category) : existing.category;
    const cleanBrand = brand !== undefined ? normalizeRequiredString(brand) : existing.brand;
    const cleanUnit = unit !== undefined ? normalizeRequiredString(unit) : existing.unit;
    const parsedPrice = price !== undefined ? parseNonNegativeNumber(price) : existing.price;
    const parsedStock = stock !== undefined ? parseNonNegativeInteger(stock) : existing.stock;

    if (!cleanName || !cleanCategory || !cleanBrand || !cleanUnit || parsedPrice === null || parsedStock === null) {
      return res.status(400).json({
        success: false,
        message: 'Product fields cannot be blank. Price and stock must be non-negative numbers.',
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: cleanName,
        category: cleanCategory,
        brand: cleanBrand,
        sku: cleanSku,
        unit: cleanUnit,
        price: parsedPrice,
        stock: parsedStock,
      },
    });

    socket.getIO().emit('data_changed', { type: 'product_updated', id: updated.id });
    res.json({ success: true, message: 'Product updated successfully', data: updated });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Server error while updating product' });
  }
};

// DELETE /api/products/:id - Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (existing.orderItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete product '${existing.name}' because it exists in ${existing.orderItems.length} order(s).`,
      });
    }

    await prisma.product.delete({ where: { id } });
    socket.getIO().emit('data_changed', { type: 'product_deleted', id });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting product' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
