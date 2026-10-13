import { Module } from '@nestjs/common';
import { BirdMovementController } from './bird-movement.controller.js';
import { DailyMortalityController } from './daily-mortality.controller.js';
import { BirdMovementService } from './bird-movement.service.js';
import { DailyMortalityService } from './daily-mortality.service.js';
import { BirdBalanceService } from './bird-balance.service.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  controllers: [BirdMovementController, DailyMortalityController],
  providers: [
    BirdMovementService,
    DailyMortalityService,
    BirdBalanceService,
    PrismaService,
  ],
})
export class BirdTrackingModule {}
