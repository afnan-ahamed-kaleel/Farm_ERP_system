import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const items = await prisma.item.findMany();
    console.log("Items:", items);

    for (const item of items) {
        const incoming = await prisma.stockTransaction.aggregate({
            _sum: { quantity: true },
            where: {
                toLocationId: undefined,
                itemId: item.id,
                batchId: undefined,
                status: 'POSTED',
            },
        });
        const outgoing = await prisma.stockTransaction.aggregate({
            _sum: { quantity: true },
            where: {
                fromLocationId: undefined,
                itemId: item.id,
                batchId: undefined,
                status: 'POSTED',
            },
        });
        console.log(`Item ${item.name} Incoming:`, incoming);
        console.log(`Item ${item.name} Outgoing:`, outgoing);
    }
}
main().finally(() => prisma.$disconnect());
