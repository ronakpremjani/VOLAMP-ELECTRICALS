const { PrismaClient } = require('@prisma/client');
const { calculateOrderTotals } = require('../src/utils/orderCalculations');

const prisma = new PrismaClient();

async function main() {
  console.log('⚡ Starting database seed for Volamp Electricals...');

  // 1. Clean existing records in reverse dependency order
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});

  console.log('🧹 Cleaned existing records.');

  // 2. Seed Electrical Customers
  const customersData = [
    {
      name: 'Rajesh Sharma',
      companyName: 'Apex Infra & Electrical Contractors',
      mobile: '+91 98201 23456',
      email: 'rajesh@apexinfra.in',
      address: 'Plot 42, MIDC Industrial Area, Andheri East',
      gstNumber: '27AABCA1234F1Z8',
      city: 'Mumbai',
      state: 'Maharashtra',
    },
    {
      name: 'Amit Patel',
      companyName: 'Surat Power Solutions Ltd',
      mobile: '+91 98795 67890',
      email: 'amit@suratpower.com',
      address: '104, Ring Road Commercial Complex',
      gstNumber: '24AACCP5678J1Z2',
      city: 'Surat',
      state: 'Gujarat',
    },
    {
      name: 'Vikram Sundaram',
      companyName: 'Sundaram Electricals & Lighting',
      mobile: '+91 94440 98765',
      email: 'vikram@sundaramelec.com',
      address: '77, Mount Road, T. Nagar',
      gstNumber: '33AAECS9012K1Z5',
      city: 'Chennai',
      state: 'Tamil Nadu',
    },
    {
      name: 'Sunil Verma',
      companyName: 'Verma Smart Home Systems',
      mobile: '+91 98110 54321',
      email: 'sunil@vermasmarthomes.com',
      address: 'B-12, Sector 62, Electronic City',
      gstNumber: '07AAECV3456L1Z4',
      city: 'Noida',
      state: 'Uttar Pradesh',
    },
    {
      name: 'Pooja Reddy',
      companyName: 'Deccan Grid Engineering',
      mobile: '+91 99890 11223',
      email: 'pooja@deccangrid.com',
      address: 'Survey No 88, HITEC City Main Rd',
      gstNumber: '36AAECD7890M1Z9',
      city: 'Hyderabad',
      state: 'Telangana',
    },
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const customer = await prisma.customer.create({ data: c });
    createdCustomers.push(customer);
  }
  console.log(`✅ Seeded ${createdCustomers.length} Customers.`);

  // 3. Seed 18 Electrical Products (Wires, MCBs, Switches, Lighting, Accessories)
  const productsData = [
    {
      name: 'Polycab Flame Retardant 2.5 sq mm Copper Wire (90m Reel)',
      category: 'Wires & Cables',
      brand: 'Polycab',
      sku: 'WIR-PLY-25-RED',
      unit: 'Reel',
      price: 2450.0,
      stock: 45,
    },
    {
      name: 'Polycab 4.0 sq mm Multi-strand Copper Industrial Wire',
      category: 'Wires & Cables',
      brand: 'Polycab',
      sku: 'WIR-PLY-40-BLU',
      unit: 'Reel',
      price: 3890.0,
      stock: 30,
    },
    {
      name: 'Finolex 1.5 sq mm 3-Core Submersible Cable',
      category: 'Wires & Cables',
      brand: 'Finolex',
      sku: 'CAB-FIN-15-SUB',
      unit: 'Meter',
      price: 68.0,
      stock: 650,
    },
    {
      name: 'Havells 32A Double Pole (DP) C-Curve MCB',
      category: 'Switchgear & MCBs',
      brand: 'Havells',
      sku: 'MCB-HAV-32A-DP',
      unit: 'Piece',
      price: 640.0,
      stock: 60,
    },
    {
      name: 'Schneider Electric Acti9 63A 4-Pole RCCB 30mA',
      category: 'Switchgear & MCBs',
      brand: 'Schneider Electric',
      sku: 'RCCB-SCH-63A-4P',
      unit: 'Piece',
      price: 2950.0,
      stock: 18,
    },
    {
      name: 'Legrand RX3 16A Single Pole (SP) MCB',
      category: 'Switchgear & MCBs',
      brand: 'Legrand',
      sku: 'MCB-LEG-16A-SP',
      unit: 'Piece',
      price: 185.0,
      stock: 120,
    },
    {
      name: 'Anchor Roma Classic 6A 1-Way Modular Switch (Box of 20)',
      category: 'Switches & Sockets',
      brand: 'Anchor by Panasonic',
      sku: 'SW-ANC-ROM-6A',
      unit: 'Box',
      price: 720.0,
      stock: 40,
    },
    {
      name: 'Anchor Roma 16A 3-Pin Modular Power Socket (Box of 10)',
      category: 'Switches & Sockets',
      brand: 'Anchor by Panasonic',
      sku: 'SOC-ANC-ROM-16A',
      unit: 'Box',
      price: 890.0,
      stock: 35,
    },
    {
      name: 'Schneider Arteor 8-Module Grid Plate with Cover (Anthracite)',
      category: 'Switches & Sockets',
      brand: 'Schneider Electric',
      sku: 'PLT-SCH-ART-8M',
      unit: 'Piece',
      price: 340.0,
      stock: 50,
    },
    {
      name: 'Havells 20W Cool Day White LED Batten Tube Light (Pack of 4)',
      category: 'Lighting Products',
      brand: 'Havells',
      sku: 'LGT-HAV-20W-BAT',
      unit: 'Pack',
      price: 860.0,
      stock: 25,
    },
    {
      name: 'Philips SmartBright 15W Slim LED Recessed Downlight Panel',
      category: 'Lighting Products',
      brand: 'Philips',
      sku: 'LGT-PHI-15W-PNL',
      unit: 'Piece',
      price: 495.0,
      stock: 80,
    },
    {
      name: 'Crompton 50W High Lumen LED Outdoor Flood Light IP66',
      category: 'Lighting Products',
      brand: 'Crompton',
      sku: 'LGT-CRP-50W-FLD',
      unit: 'Piece',
      price: 1450.0,
      stock: 14,
    },
    {
      name: 'Precision 25mm Heavy Duty PVC Conduit Pipe (3m length)',
      category: 'Conduit & Fittings',
      brand: 'Precision',
      sku: 'CND-PRC-25M-HD',
      unit: 'Piece',
      price: 85.0,
      stock: 300,
    },
    {
      name: 'Sudhakar 25mm 4-Way Deep PVC Junction Box',
      category: 'Conduit & Fittings',
      brand: 'Sudhakar',
      sku: 'JNC-SUD-25M-4W',
      unit: 'Box',
      price: 320.0,
      stock: 55,
    },
    {
      name: 'L&T 8-Way SPN Double Door MCB Distribution Board IP42',
      category: 'Industrial Accessories',
      brand: 'Larsen & Toubro',
      sku: 'DB-LNT-8WAY-SPN',
      unit: 'Piece',
      price: 1820.0,
      stock: 12,
    },
    {
      name: 'Anchor High Voltage PVC Electrical Insulation Tape (Pack of 10)',
      category: 'Industrial Accessories',
      brand: 'Anchor by Panasonic',
      sku: 'ACC-ANC-INS-TP',
      unit: 'Pack',
      price: 140.0,
      stock: 150,
    },
    {
      name: 'Dowells Copper Heavy Duty Cable Lugs 50 sq mm (Pack of 50)',
      category: 'Industrial Accessories',
      brand: 'Dowells',
      sku: 'ACC-DOW-LUG-50',
      unit: 'Pack',
      price: 950.0,
      stock: 22,
    },
    {
      name: 'Atomberg Renesa 1200mm Smart BLDC Ceiling Fan',
      category: 'Electrical Appliances',
      brand: 'Atomberg',
      sku: 'FAN-ATM-REN-12',
      unit: 'Piece',
      price: 3690.0,
      stock: 9, // Low stock indicator test
    },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const product = await prisma.product.create({ data: p });
    createdProducts.push(product);
  }
  console.log(`✅ Seeded ${createdProducts.length} Electrical Products.`);

  // 4. Seed Initial Orders across different statuses (Pending, Confirmed, Processing, Dispatched, Delivered, Cancelled)
  const ordersBlueprint = [
    {
      customerIndex: 0,
      orderNumber: 'VOL-2026-0001',
      orderStatus: 'Delivered',
      discount: 500,
      salesperson: 'Rahul Mehta (Sr. Exec)',
      notes: 'Delivered to Andheri factory site via express transport.',
      items: [
        { productIndex: 0, quantity: 10 }, // Polycab 2.5 sq mm
        { productIndex: 3, quantity: 8 },  // Havells 32A MCB
        { productIndex: 6, quantity: 5 },  // Anchor Roma Switches Box
      ],
      amountReceived: 38700, // Fully paid
      daysAgo: 12,
    },
    {
      customerIndex: 1,
      orderNumber: 'VOL-2026-0002',
      orderStatus: 'Dispatched',
      discount: 1000,
      salesperson: 'Kavita Nair',
      notes: 'Dispatched via V-Trans consignment #889241.',
      items: [
        { productIndex: 1, quantity: 6 },  // Polycab 4.0 sq mm
        { productIndex: 4, quantity: 4 },  // Schneider RCCB 63A
        { productIndex: 10, quantity: 20 }, // Philips LED Panel
      ],
      amountReceived: 35000, // Partially paid
      daysAgo: 5,
    },
    {
      customerIndex: 2,
      orderNumber: 'VOL-2026-0003',
      orderStatus: 'Processing',
      discount: 0,
      salesperson: 'Rahul Mehta (Sr. Exec)',
      notes: 'Stock allocated in warehouse bay 3. Packing in progress.',
      items: [
        { productIndex: 9, quantity: 15 }, // Havells Batten Light
        { productIndex: 11, quantity: 6 }, // Crompton Flood Light
      ],
      amountReceived: 10000, // Partially paid
      daysAgo: 2,
    },
    {
      customerIndex: 3,
      orderNumber: 'VOL-2026-0004',
      orderStatus: 'Confirmed',
      discount: 250,
      salesperson: 'Anil Gupta',
      notes: 'Customer PO confirmed over email. Awaiting advance dispatch approval.',
      items: [
        { productIndex: 7, quantity: 10 }, // Anchor 16A Sockets
        { productIndex: 8, quantity: 15 }, // Schneider Cover plates
        { productIndex: 14, quantity: 4 },  // L&T DB
      ],
      amountReceived: 0, // Pending
      daysAgo: 1,
    },
    {
      customerIndex: 4,
      orderNumber: 'VOL-2026-0005',
      orderStatus: 'Pending',
      discount: 0,
      salesperson: 'Kavita Nair',
      notes: 'New project estimation submitted by client.',
      items: [
        { productIndex: 2, quantity: 100 }, // Finolex 1.5 submersible cable
        { productIndex: 12, quantity: 50 },  // Precision conduit pipes
      ],
      amountReceived: 0, // Pending
      daysAgo: 0,
    },
    {
      customerIndex: 0,
      orderNumber: 'VOL-2026-0006',
      orderStatus: 'Cancelled',
      discount: 0,
      salesperson: 'Store Admin',
      notes: 'Customer requested cancellation due to revised architectural layout.',
      items: [
        { productIndex: 17, quantity: 5 }, // Atomberg BLDC Fans
      ],
      amountReceived: 0,
      daysAgo: 8,
    },
  ];

  for (const blueprint of ordersBlueprint) {
    const customer = createdCustomers[blueprint.customerIndex];
    const items = blueprint.items.map((it) => {
      const prod = createdProducts[it.productIndex];
      return {
        productId: prod.id,
        quantity: it.quantity,
        unitPrice: prod.price,
      };
    });

    const totals = calculateOrderTotals({
      items,
      discount: blueprint.discount,
      gstRate: 18,
      amountReceived: blueprint.amountReceived,
    });

    const date = new Date();
    date.setDate(date.getDate() - blueprint.daysAgo);

    await prisma.order.create({
      data: {
        orderNumber: blueprint.orderNumber,
        customerId: customer.id,
        subtotal: totals.subtotal,
        discount: totals.discount,
        gstRate: totals.gstRate,
        gstAmount: totals.gstAmount,
        grandTotal: totals.grandTotal,
        amountReceived: totals.amountReceived,
        balanceAmount: totals.balanceAmount,
        paymentStatus: totals.paymentStatus,
        orderStatus: blueprint.orderStatus,
        salesperson: blueprint.salesperson,
        notes: blueprint.notes,
        orderDate: date,
        items: {
          create: totals.processedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
          })),
        },
      },
    });
  }

  console.log(`✅ Seeded ${ordersBlueprint.length} sample Orders across all workflow statuses.`);
  console.log('⚡ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
