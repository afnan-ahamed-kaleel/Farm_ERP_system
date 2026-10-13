import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { InventoryLedgerService } from './inventory-ledger.service.js';
import { PostTransactionDto } from './dto/transaction.dto.js';

@Injectable()
export class StockTransactionService {
  constructor(
    private prisma: PrismaService,
    private ledgerService: InventoryLedgerService,
  ) {}

  async postTransaction(dto: PostTransactionDto) {
    return await this.prisma.$transaction(async (tx: any) => {
      if (dto.fromLocationId) {
        const liveStock = await this.ledgerService.calculateLiveStock(
          dto.fromLocationId,
          dto.itemId,
          dto.batchId,
        );

        if (dto.quantity > liveStock) {
          throw new BadRequestException(
            `Insufficient stock. Requested: ${dto.quantity}, Available: ${liveStock}`,
          );
        }
      }

      let resolvedBatchId = dto.batchId;
      if (!resolvedBatchId && dto.batchNumber) {
        let batch = await tx.batch.findUnique({ where: { batchNumber: dto.batchNumber } });
        if (!batch) {
          batch = await tx.batch.create({
            data: {
              batchNumber: dto.batchNumber,
              itemId: dto.itemId,
              manufactureDate: new Date(dto.date),
            },
          });
        }
        resolvedBatchId = batch.id;
      }

      const transaction = await tx.stockTransaction.create({
        data: {
          date: new Date(dto.date),
          itemId: dto.itemId,
          batchId: resolvedBatchId,
          fromLocationId: dto.fromLocationId,
          toLocationId: dto.toLocationId,
          quantity: dto.quantity,
          uom: dto.uom,
          transactionType: dto.transactionType,
          referenceId: dto.referenceId,
          createdBy: dto.createdBy,
          status: 'POSTED',
        },
      });

      return transaction;

    });
  }
}
