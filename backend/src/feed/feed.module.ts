import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller.js';
import { FormulaService } from './formula.service.js';
import { FeedProductionService } from './feed-production.service.js';
import { FeedConsumptionService } from './feed-consumption.service.js';
import { PrismaService } from '../prisma.service.js';
import { InventoryModule } from '../inventory/inventory.module.js';

@Module({
  imports: [InventoryModule],
  controllers: [FeedController],
  providers: [FormulaService, FeedProductionService, FeedConsumptionService, PrismaService],
})
export class FeedModule {}
