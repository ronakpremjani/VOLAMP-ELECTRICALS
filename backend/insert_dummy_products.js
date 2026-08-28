const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dummyProducts = [
  { name: 'V-Guard 1.5 Ton AC Stabilizer (VGA 400)', category: 'Electrical Appliances', brand: 'V-Guard', sku: 'APP-VGU-STB-1.5T', unit: 'Piece', price: 2150.0, stock: 42 },
  { name: 'Bajaj Flora 3L 3000W Instant Water Heater', category: 'Electrical Appliances', brand: 'Bajaj', sku: 'APP-BAJ-HTR-3L', unit: 'Piece', price: 2890.0, stock: 15 },
  { name: 'Orient Electric Apex-FX 1200mm Ceiling Fan (Brown)', category: 'Electrical Appliances', brand: 'Orient', sku: 'FAN-ORI-APX-12', unit: 'Piece', price: 1450.0, stock: 68 },
  { name: 'Syska 9W LED Bulb (Pack of 6, Cool Day Light)', category: 'Lighting Products', brand: 'Syska', sku: 'LGT-SYS-9W-PK6', unit: 'Pack', price: 499.0, stock: 120 },
  { name: 'Wipro Garnet 12W LED Round Panel Light', category: 'Lighting Products', brand: 'Wipro', sku: 'LGT-WIP-12W-RND', unit: 'Piece', price: 345.0, stock: 95 },
  { name: 'Finolex 2.5 sq mm 90m FR PVC Insulated Cable (Yellow)', category: 'Wires & Cables', brand: 'Finolex', sku: 'WIR-FIN-25-YEL', unit: 'Reel', price: 2340.0, stock: 40 },
  { name: 'RR Kabel 1.5 sq mm 90m Supex FR Wire (Green)', category: 'Wires & Cables', brand: 'RR Kabel', sku: 'WIR-RRK-15-GRN', unit: 'Reel', price: 1420.0, stock: 75 },
  { name: 'KEI 6.0 sq mm 90m HomeCab FR Wire (Black)', category: 'Wires & Cables', brand: 'KEI Industries', sku: 'WIR-KEI-60-BLK', unit: 'Reel', price: 5600.0, stock: 18 },
  { name: 'Schneider Electric Livia 6A 2-Way Switch', category: 'Switches & Sockets', brand: 'Schneider Electric', sku: 'SW-SCH-LIV-6A-2W', unit: 'Box', price: 1050.0, stock: 25 },
  { name: 'Legrand Mylinc 16A/6A Universal Socket (Box of 10)', category: 'Switches & Sockets', brand: 'Legrand', sku: 'SOC-LEG-MYL-UNI', unit: 'Box', price: 1250.0, stock: 32 },
  { name: 'Havells Reo 6A 5-Pin Socket (Box of 20)', category: 'Switches & Sockets', brand: 'Havells', sku: 'SOC-HAV-REO-5P', unit: 'Box', price: 1450.0, stock: 45 },
  { name: 'Anchor Penta 32A DP Switch with Indicator', category: 'Switchgear & MCBs', brand: 'Anchor by Panasonic', sku: 'SW-ANC-PNT-32A', unit: 'Piece', price: 185.0, stock: 110 },
  { name: 'L&T Tripper 40A 2-Pole C-Curve MCB', category: 'Switchgear & MCBs', brand: 'Larsen & Toubro', sku: 'MCB-LNT-40A-2P', unit: 'Piece', price: 780.0, stock: 30 },
  { name: 'Siemens Betagard 63A 3-Pole MCB C-Curve', category: 'Switchgear & MCBs', brand: 'Siemens', sku: 'MCB-SIE-63A-3P', unit: 'Piece', price: 2150.0, stock: 14 },
  { name: 'Crompton Greaves 1 HP Mini Centrifugal Water Pump', category: 'Industrial Accessories', brand: 'Crompton', sku: 'PMP-CRP-1HP-MIN', unit: 'Piece', price: 4250.0, stock: 8 },
  { name: 'Kirloskar Chotu 0.5 HP Domestic Water Motor Pump', category: 'Industrial Accessories', brand: 'Kirloskar', sku: 'PMP-KIR-0.5HP-DOM', unit: 'Piece', price: 3100.0, stock: 12 },
  { name: 'Precision 32mm Medium Duty PVC Conduit (3m length)', category: 'Conduit & Fittings', brand: 'Precision', sku: 'CND-PRC-32M-MD', unit: 'Piece', price: 115.0, stock: 250 },
  { name: 'AKG 20mm PVC Flexible Corrugated Pipe (25m Roll)', category: 'Conduit & Fittings', brand: 'AKG', sku: 'CND-AKG-20M-FLX', unit: 'Roll', price: 340.0, stock: 85 },
  { name: 'Grip Tape 18mm Electrical Insulation Tape (Box of 30)', category: 'Industrial Accessories', brand: 'Grip', sku: 'ACC-GRP-INS-TP', unit: 'Box', price: 420.0, stock: 55 },
  { name: 'HPL 100A 4-Pole Changeover Switch', category: 'Switchgear & MCBs', brand: 'HPL Electric', sku: 'SW-HPL-100A-COV', unit: 'Piece', price: 3850.0, stock: 10 }
];

async function main() {
  console.log('Inserting 20 dummy products...');
  let added = 0;
  for (const product of dummyProducts) {
    // avoid unique constraint failures on SKU by checking first
    const exists = await prisma.product.findUnique({ where: { sku: product.sku } });
    if (!exists) {
      await prisma.product.create({ data: product });
      added++;
      console.log(`+ Added: ${product.name}`);
    } else {
      console.log(`- Skipped (SKU exists): ${product.sku}`);
    }
  }
  console.log(`\nSuccessfully added ${added} new products.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

