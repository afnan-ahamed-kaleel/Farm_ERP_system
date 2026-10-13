import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { BirdTrackingModule } from './bird-tracking/bird-tracking.module.js';
import { InventoryModule } from './inventory/inventory.module.js';
import { FeedModule } from './feed/feed.module.js';
import { EggsModule } from './eggs/eggs.module.js';
import { DispatchModule } from './dispatch/dispatch.module.js';
import { TraceabilityModule } from './traceability/traceability.module.js';
import { MasterDataModule } from './master-data/master-data.module.js';

@Module({
  imports: [BirdTrackingModule, InventoryModule, FeedModule, EggsModule, DispatchModule, TraceabilityModule, MasterDataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

