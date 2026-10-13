const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding inventory...");

  // Create some Items
  const item1 = await prisma.item.upsert({
    where: { code: 'FEED-BROODER-01' },
    update: {},
    create: {
      code: 'FEED-BROODER-01',
      name: 'Brooder Starter Feed',
      category: 'FEED',
      primaryUom: 'KG',
    }
  });

  const item2 = await prisma.item.upsert({
    where: { code: 'RM-CORN-01' },
    update: {},
    create: {
      code: 'RM-CORN-01',
      name: 'Whole Yellow Corn',
      category: 'RAW_MATERIAL',
      primaryUom: 'KG',
    }
  });

  // Get a location
  const location = await prisma.location.findFirst();
  if (!location) {
      console.log("No locations found! Cannot seed transactions.");
      return;
  }

  // Add initial PURCHASE transactions to give them some stock
  await prisma.stockTransaction.create({
    data: {
      date: new Date(),
      itemId: item1.id,
      toLocationId: location.id,
      quantity: 5000,
      uom: 'KG',
      transactionType: 'PURCHASE',
      status: 'POSTED',
      createdBy: 'System Seed'
    }
  });

  await prisma.stockTransaction.create({
    data: {
      date: new Date(),
      itemId: item2.id,
      toLocationId: location.id,
      quantity: 15000,
      uom: 'KG',
      transactionType: 'PURCHASE',
      status: 'POSTED',
      createdBy: 'System Seed'
    }
  });

  console.log("Inventory seeded successfully!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
