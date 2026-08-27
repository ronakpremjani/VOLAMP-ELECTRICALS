const prisma = require('../config/db');

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

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
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

    if (!name || !category || !brand || !sku || !unit || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, category, brand, sku, unit, price, stock) are required',
      });
    }

    const existingSku = await prisma.product.findUnique({
      where: { sku: sku.trim().toUpperCase() },
    });

    if (existingSku) {
      return res.status(400).json({
        success: false,
        message: `Product SKU '${sku}' already exists`,
      });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        brand: brand.trim(),
        sku: sku.trim().toUpperCase(),
        unit: unit.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10),
      },
    });

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

    if (sku && sku.trim().toUpperCase() !== existing.sku) {
      const duplicateSku = await prisma.product.findUnique({
        where: { sku: sku.trim().toUpperCase() },
      });
      if (duplicateSku) {
        return res.status(400).json({
          success: false,
          message: `SKU '${sku}' is already taken by another product`,
        });
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        category: category !== undefined ? category.trim() : existing.category,
        brand: brand !== undefined ? brand.trim() : existing.brand,
        sku: sku !== undefined ? sku.trim().toUpperCase() : existing.sku,
        unit: unit !== undefined ? unit.trim() : existing.unit,
        price: price !== undefined ? parseFloat(price) : existing.price,
        stock: stock !== undefined ? parseInt(stock, 10) : existing.stock,
      },
    });

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
