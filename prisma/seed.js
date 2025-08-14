// JS seed wrapper (PowerShell friendly)
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  await prisma.menuItem.deleteMany();
  await prisma.menuItem.createMany({ data: [
    { name: 'Nasi Goreng Spesial', description: 'Dengan ayam, telur, dan sayur', price: 28000, category: 'Makanan' },
    { name: 'Mie Goreng Jawa', description: 'Mie goreng tradisional', price: 26000, category: 'Makanan' },
    { name: 'Sate Ayam', description: '10 tusuk + lontong', price: 30000, category: 'Makanan' },
    { name: 'Ayam Bakar Madu', description: 'Paha + nasi + sambal', price: 35000, category: 'Makanan' },
    { name: 'Es Teh Manis', description: 'Dingin menyegarkan', price: 6000, category: 'Minuman' },
    { name: 'Es Jeruk', description: 'Jeruk peras segar', price: 8000, category: 'Minuman' },
    { name: 'Jus Alpukat', description: 'Dengan cokelat & susu', price: 15000, category: 'Minuman' },
    { name: 'Kopi Tubruk', description: 'Kopi panas tradisional', price: 12000, category: 'Minuman' },
    { name: 'Pisang Goreng', description: '5 potong, kriuk', price: 10000, category: 'Cemilan' },
    { name: 'Tahu Krispi', description: 'Tahu goreng tepung', price: 9000, category: 'Cemilan' },
    { name: 'Tempe Mendoan', description: 'Tempe goreng lembut', price: 11000, category: 'Cemilan' },
    { name: 'Sambal Terasi Botol', description: 'Homemade 150ml', price: 18000, category: 'Produk' },
  ]});
  console.log('Seeded menu items');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
