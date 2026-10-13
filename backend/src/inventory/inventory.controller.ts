import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InventoryLedgerService } from './inventory-ledger.service.js';
import { StockTransactionService } from './stock-transaction.service.js';
import { PostTransactionDto } from './dto/transaction.dto.js';

@Controller('api/v1/inventory')
export class InventoryController {
  constructor(
    private readonly ledgerService: InventoryLedgerService,
    private readonly transactionService: StockTransactionService,
  ) {}

  @Get('balance')
  async getBalance(
    @Query('locationId') locationId?: string,
    @Query('itemId') itemId?: string,
    @Query('batchId') batchId?: string,
  ) {
    if (locationId || itemId || batchId) {
      const balance = await this.ledgerService.calculateLiveStock(locationId, itemId, batchId);
      return { balance };
    }
    
    return await this.ledgerService.getBalances();
  }

  @Post('transaction')
  async postTransaction(@Body() dto: PostTransactionDto) {
    return await this.transactionService.postTransaction(dto);
  }
}
