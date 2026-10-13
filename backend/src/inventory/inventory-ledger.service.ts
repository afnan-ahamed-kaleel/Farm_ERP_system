import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class InventoryLedgerService {
  constructor(private prisma: PrismaService) {}

  async calculateLiveStock(locationId?: string, itemId?: string, batchId?: string): Promise<number> {
    const incoming = await this.prisma.stockTransaction.aggregate({
      _sum: { quantity: true },
      where: {
        toLocationId: locationId ? locationId : { not: null },
        itemId,
        batchId,
        status: 'POSTED',
      },
    });

    const outgoing = await this.prisma.stockTransaction.aggregate({
      _sum: { quantity: true },
      where: {
        fromLocationId: locationId ? locationId : { not: null },
        itemId,
        batchId,
        status: 'POSTED',
      },
    });

    const totalIncoming = incoming._sum.quantity || 0;
    const totalOutgoing = outgoing._sum.quantity || 0;

    return totalIncoming - totalOutgoing;
  }

  async getBalances() {
    const items = await this.prisma.item.findMany({
      include: { batches: true }
    });
    
    const balances = [];
    
    for (const item of items) {
       const balance = await this.calculateLiveStock(undefined, item.id);
       if (balance > 0) {
           balances.push({
               item,
               totalBalance: balance,
           });
       }
    }
    
    return balances;
  }
}
