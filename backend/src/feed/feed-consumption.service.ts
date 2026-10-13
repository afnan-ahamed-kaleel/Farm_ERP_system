import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { ConsumeFeedDto, IssueFeedDto } from './dto/feed.dto.js';

@Injectable()
export class FeedConsumptionService {
  constructor(private readonly prisma: PrismaService) {}

  async issueFeedToHouse(dto: IssueFeedDto) {
    return await this.prisma.$transaction(async (tx: any) => {
        const feedBatch = await tx.batch.findUnique({ where: { id: dto.feedBatchId }});
        if (!feedBatch) throw new BadRequestException('Batch not found');
        
        const mainStore =
          (await tx.location.findFirst({ where: { name: { contains: 'Warehouse', mode: 'insensitive' } } })) ||
          (await tx.location.findFirst());
        
        return await tx.stockTransaction.create({
            data: {
                date: new Date(),
                itemId: feedBatch.itemId,
                batchId: dto.feedBatchId,
                fromLocationId: mainStore?.id,
                toLocationId: dto.targetHouseId,
                quantity: dto.quantityKg,
                uom: 'KG',
                transactionType: 'TRANSFER',
                status: 'POSTED',
                createdBy: dto.operatorId
            }
        });
    });
  }

  async consumeFeed(dto: ConsumeFeedDto) {
    return await this.prisma.$transaction(async (tx: any) => {
      const feedBatch = await tx.batch.findUnique({ where: { id: dto.feedBatchId } });
      if (!feedBatch) throw new BadRequestException('Batch not found');

      const consumption = await tx.feedConsumption.create({
        data: {
          date: new Date(),
          flockId: dto.flockId,
          houseLocationId: dto.houseLocationId,
          feedBatchId: dto.feedBatchId,
          quantityConsumedKg: dto.quantityConsumedKg,
          operatorId: dto.operatorId
        }
      });

      await tx.stockTransaction.create({
          data: {
              date: new Date(),
              itemId: feedBatch.itemId,
              batchId: dto.feedBatchId,
              fromLocationId: dto.houseLocationId,
              quantity: dto.quantityConsumedKg,
              uom: 'KG',
              transactionType: 'CONSUMPTION',
              status: 'POSTED',
              createdBy: dto.operatorId
          }
      });
      return consumption;
    });
  }
}
