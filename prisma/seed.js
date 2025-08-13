// JS seed wrapper (PowerShell friendly)
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.menuItem.count();
  if (count > 0) {
    console.log('Menu already seeded');
    return;
  }
  await prisma.menuItem.createMany({
    data: [
      { name: 'Nasi Goreng', description: 'Nasi goreng spesial', price: 25000, category: 'Makanan' },
      { name: 'Mie Ayam', description: 'Mie ayam gurih', price: 20000, category: 'Makanan' },
      { name: 'Es Teh Manis', description: 'Teh manis dingin', price: 8000, category: 'Minuman' },
      { name: 'Kopi Hitam', description: 'Kopi hitam panas', price: 12000, category: 'Minuman' },
    ]
  });
  console.log('Seed data inserted');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
