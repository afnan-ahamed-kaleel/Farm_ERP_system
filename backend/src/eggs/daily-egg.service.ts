import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { DailyEggCollectionDto } from './dto/eggs.dto.js';

@Injectable()
export class DailyEggService {
  constructor(private readonly prisma: PrismaService) {}

  async logDailyCollection(dto: DailyEggCollectionDto) {
    return await this.prisma.$transaction(async (tx: any) => {
      let eggItem = await tx.item.findFirst({ where: { category: 'EGG' } });
      if (!eggItem) {
        eggItem = await tx.item.create({
          data: {
            code: 'ITEM-EGG-TABLE',
            name: 'Fresh Farm Table Eggs',
            category: 'EGG',
            primaryUom: 'EA',
          },
        });
      }

      const yyMMdd = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const batchCode = `EGG-${yyMMdd}-${dto.flockId.slice(0,4).toUpperCase()}`;

      let eggBatch = await tx.batch.findUnique({ where: { batchNumber: batchCode } });
      if (!eggBatch) {
        eggBatch = await tx.batch.create({
          data: {
            batchNumber: batchCode,
            itemId: eggItem.id,
            manufactureDate: new Date()
          }
        });
      }

      let totalQuantity = 0;
      const logsToCreate = dto.entries.map((entry: any) => {
        totalQuantity += entry.quantity;
        return {
          date: new Date(),
          flockId: dto.flockId,
          houseLocationId: dto.houseLocationId,
          eggBatchId: eggBatch.id,
          grade: entry.grade,
          condition: entry.condition,
          quantity: entry.quantity,
          recordedBy: dto.operatorId
        };
      });

      await tx.eggProductionLog.createMany({ data: logsToCreate });

      if (totalQuantity > 0) {
        await tx.stockTransaction.create({
          data: {
            date: new Date(),
            itemId: eggItem.id,
            batchId: eggBatch.id,
            toLocationId: dto.houseLocationId,
            quantity: totalQuantity,
            uom: 'EA', 
            transactionType: 'PRODUCTION',
            status: 'POSTED',
            createdBy: dto.operatorId
          }
        });
      }

      return { batch: eggBatch.batchNumber, eggBatchId: eggBatch.id, totalCollected: totalQuantity };
    });
  }
}

