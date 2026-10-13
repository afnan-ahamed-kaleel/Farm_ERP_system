import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const items = await prisma.item.findMany();
    for (const item of items) {
        const incoming = await prisma.stockTransaction.aggregate({
            _sum: { quantity: true },
            where: {
                toLocationId: { not: null },
                itemId: item.id,
                status: 'POSTED',
            },
        });
        const outgoing = await prisma.stockTransaction.aggregate({
            _sum: { quantity: true },
            where: {
                fromLocationId: { not: null },
                itemId: item.id,
                status: 'POSTED',
            },
        });
        console.log(`Item ${item.name} Incoming:`, incoming._sum.quantity || 0);
        console.log(`Item ${item.name} Outgoing:`, outgoing._sum.quantity || 0);
        console.log(`Item ${item.name} Balance:`, (incoming._sum.quantity || 0) - (outgoing._sum.quantity || 0));
    }
}
main().finally(() => prisma.$disconnect());
