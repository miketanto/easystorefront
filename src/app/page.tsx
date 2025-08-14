import { prisma } from '@/lib/prisma';
import MenuWithCategories from '@/app/_components/MenuWithCategories';
import SessionGuard from '@/app/_components/SessionGuard';

export default async function Home() {
  const items = await prisma.menuItem.findMany({ where: { isAvailable: true }, orderBy: [{ category: 'asc' }, { name: 'asc' }] });
  return (
    <SessionGuard>
      <MenuWithCategories items={items} />
    </SessionGuard>
  );
}
