import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller.js';
import { InventoryLedgerService } from './inventory-ledger.service.js';
import { StockTransactionService } from './stock-transaction.service.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  controllers: [InventoryController],
  providers: [InventoryLedgerService, StockTransactionService, PrismaService],
  exports: [InventoryLedgerService],
})
export class InventoryModule {}
