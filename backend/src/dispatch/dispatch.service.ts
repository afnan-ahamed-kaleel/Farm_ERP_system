import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { DispatchEggDto } from './dto/dispatch.dto.js';

@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) {}

  async dispatchEggs(dto: DispatchEggDto) {
    return await this.prisma.$transaction(async (tx: any) => {
      const eggBatch = await tx.batch.findUnique({ where: { id: dto.eggBatchId } });
      if (!eggBatch) throw new BadRequestException('Egg batch not found');

      const incoming = await tx.stockTransaction.aggregate({
        _sum: { quantity: true },
        where: { toLocationId: { not: null }, batchId: dto.eggBatchId, status: 'POSTED' }
      });
      const outgoing = await tx.stockTransaction.aggregate({
        _sum: { quantity: true },
        where: { fromLocationId: { not: null }, batchId: dto.eggBatchId, status: 'POSTED' }
      });
      const currentStock = (incoming._sum.quantity || 0) - (outgoing._sum.quantity || 0);

      if (currentStock < dto.quantity) {
        throw new BadRequestException(`Insufficient stock. Available: ${currentStock}, Requested: ${dto.quantity}`);
      }

      const dispatchNumber = `DIS-${Date.now()}`;

      const dispatch = await tx.dispatchRecord.create({
        data: {
          dispatchNumber,
          date: new Date(),
          customerId: dto.customerId,
          eggBatchId: dto.eggBatchId,
          grade: dto.grade,
          quantity: dto.quantity,
          invoiceNumber: dto.invoiceNumber,
          dispatchedBy: dto.operatorId
        }
      });

      const warehouseLocation =
        (await tx.location.findFirst({ where: { name: { contains: 'Warehouse', mode: 'insensitive' } } })) ||
        (await tx.location.findFirst());
      await tx.stockTransaction.create({
        data: {
          date: new Date(),
          itemId: eggBatch.itemId,
          batchId: dto.eggBatchId,
          fromLocationId: warehouseLocation?.id,
          quantity: dto.quantity,
          uom: 'EA',
          transactionType: 'DISPATCH',
          status: 'POSTED',
          createdBy: dto.operatorId
        }
      });

      return dispatch;
    });
  }
}
