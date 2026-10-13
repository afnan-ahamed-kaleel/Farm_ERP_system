import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { InventoryLedgerService } from '../inventory/inventory-ledger.service.js';
import { CreateProductionDto } from './dto/feed.dto.js';
// We don't have date-fns in backend, use native date formatting

@Injectable()
export class FeedProductionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: InventoryLedgerService
  ) {}

  async executeProductionRun(dto: CreateProductionDto) {
    return await this.prisma.$transaction(async (tx: any) => {
      const version = await tx.feedFormulaVersion.findUnique({
        where: { id: dto.formulaVersionId },
        include: { ingredients: true, formula: true }
      });
      if (!version) throw new BadRequestException('Formula version not found');

      const ratio = dto.targetQuantityKg / version.baseQuantityKg;
      const usageRecords = [];
      const warehouseLocation =
        (await tx.location.findFirst({ where: { name: { contains: 'Warehouse', mode: 'insensitive' } } })) ||
        (await tx.location.findFirst());

      for (const ing of version.ingredients) {
        const requiredKg = ing.inclusionKg * ratio;
        
        const incoming = await tx.stockTransaction.aggregate({
          _sum: { quantity: true },
          where: { toLocationId: { not: null }, itemId: ing.rawMaterialItemId, status: 'POSTED' }
        });
        const outgoing = await tx.stockTransaction.aggregate({
          _sum: { quantity: true },
          where: { fromLocationId: { not: null }, itemId: ing.rawMaterialItemId, status: 'POSTED' }
        });
        const stock = (incoming._sum.quantity || 0) - (outgoing._sum.quantity || 0);

        if (stock < requiredKg) {
           const item = await tx.item.findUnique({ where: { id: ing.rawMaterialItemId }});
           throw new BadRequestException(`Insufficient stock for ${item?.name}. Needed: ${requiredKg}kg, Available: ${stock}kg`);
        }
        
        const firstBatch = await tx.batch.findFirst({ where: { itemId: ing.rawMaterialItemId }});
        if (!firstBatch) throw new BadRequestException('No batch found for RM');

        usageRecords.push({
           rawMaterialItemId: ing.rawMaterialItemId,
           rawMaterialBatchId: firstBatch.id,
           quantityUsedKg: requiredKg
        });
      }

      let feedItem = await tx.item.findFirst({ where: { category: 'FEED' } });
      if (!feedItem) {
        feedItem = await tx.item.create({
          data: {
            code: `FEED-${version.formula.code}`,
            name: `${version.formula.name} Finished Feed`,
            category: 'FEED',
            primaryUom: 'KG',
          },
        });
      }
      const yyMMdd = new Date().toISOString().slice(2,10).replace(/-/g,'');
      const batchCode = `FDB-${yyMMdd}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const feedBatch = await tx.batch.create({
        data: {
            batchNumber: batchCode,
            itemId: feedItem.id,
            manufactureDate: new Date()
        }
      });

      const run = await tx.feedProductionRun.create({
        data: {
          productionNumber: `PRD-${Date.now()}`,
          date: new Date(),
          formulaVersionId: version.id,
          producedBatchId: feedBatch.id,
          outputQuantityKg: dto.targetQuantityKg,
          status: 'COMPLETED',
          operatorId: dto.operatorId,
          ingredientUsages: {
            create: usageRecords
          }
        }
      });

      for (const usage of usageRecords) {
        await tx.stockTransaction.create({
          data: {
            date: new Date(),
            itemId: usage.rawMaterialItemId,
            batchId: usage.rawMaterialBatchId,
            fromLocationId: warehouseLocation?.id,
            quantity: usage.quantityUsedKg,
            uom: 'KG',
            transactionType: 'CONSUMPTION',
            status: 'POSTED',
            createdBy: dto.operatorId
          }
        });
      }

      await tx.stockTransaction.create({
        data: {
          date: new Date(),
          itemId: feedItem.id,
          batchId: feedBatch.id,
          toLocationId: warehouseLocation?.id,
          quantity: dto.targetQuantityKg,
          uom: 'KG',
          transactionType: 'PRODUCTION',
          status: 'POSTED',
          createdBy: dto.operatorId
        }
      });

      return run;
    });
  }
}
