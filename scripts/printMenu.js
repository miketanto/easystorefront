// Helper script to print menu items
(async () => {
  const { PrismaClient } = require('../src/generated/prisma');
  const prisma = new PrismaClient();
  const items = await prisma.menuItem.findMany();
  console.log(items);
  await prisma.$disconnect();
})();
