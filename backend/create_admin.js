const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@volamp.com';
  const password = 'Volamp@2026';
  const name = 'Admin';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('✅ Admin user already exists:', existing.email);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: 'admin' },
  });

  console.log('✅ Admin user created successfully!');
  console.log('   Email   :', user.email);
  console.log('   Password: Volamp@2026');
  console.log('   Role    :', user.role);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

