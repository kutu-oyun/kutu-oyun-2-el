import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Strateji Oyunları', slug: 'strateji', icon: 'chess' },
  { name: 'Aile Oyunları', slug: 'aile', icon: 'users' },
  { name: 'Parti Oyunları', slug: 'parti', icon: 'party-popper' },
  { name: 'Kart Oyunları', slug: 'kart', icon: 'cards' },
  { name: 'Çocuk Oyunları', slug: 'cocuk', icon: 'baby' },
  { name: 'Kooperatif Oyunları', slug: 'kooperatif', icon: 'handshake' },
  { name: 'Savaş Oyunları', slug: 'savas', icon: 'swords' },
  { name: 'Ekonomi Oyunları', slug: 'ekonomi', icon: 'coins' },
  { name: 'Bulmaca Oyunları', slug: 'bulmaca', icon: 'puzzle' },
  { name: 'Roll & Write', slug: 'roll-write', icon: 'dice-5' },
  { name: 'Deck Building', slug: 'deck-building', icon: 'layers' },
  { name: 'Worker Placement', slug: 'worker-placement', icon: 'users-cog' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categories seeded');
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
