import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Ruhunu Farms Database...');

  // 1. Create Base Locations (Houses)
  const brooderHouse = await prisma.location.create({
    data: { name: 'Brooder House 1', type: 'HOUSE' },
  });
  
  const growerHouse = await prisma.location.create({
    data: { name: 'Grower House A', type: 'HOUSE' },
  });

  const layerHouse = await prisma.location.create({
    data: { name: 'Layer House Alpha', type: 'HOUSE' },
  });

  // 2. Create Active Flocks
  const flock1 = await prisma.flock.create({
    data: {
      batchNumber: 'BATCH-2026-A-COBB',
      hatchDate: new Date('2026-09-15T00:00:00Z'),
      breed: 'Cobb 500',
    },
  });

  const flock2 = await prisma.flock.create({
    data: {
      batchNumber: 'BATCH-2026-B-ROSS',
      hatchDate: new Date('2026-09-01T00:00:00Z'),
      breed: 'Ross 308',
    },
  });

  // 3. Initial Intake (Simulating 15,000 birds arriving at the Brooder House)
  await prisma.birdMovement.create({
    data: {
      date: new Date(),
      flockId: flock1.id,
      sourceLocationId: brooderHouse.id, // Usually an external supplier, but keeping it simple
      targetLocationId: brooderHouse.id,
      pathway: 'BROODER_TO_GROWER',
      quantity: 15000,
      status: 'POSTED',
      createdBy: 'SYSTEM_INTAKE',
    },
  });

  console.log('Database seeded successfully with dynamic Flocks and Locations!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
