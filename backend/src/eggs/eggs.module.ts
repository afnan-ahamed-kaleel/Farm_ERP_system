import { Module } from '@nestjs/common';
import { EggsController } from './eggs.controller.js';
import { DailyEggService } from './daily-egg.service.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  controllers: [EggsController],
  providers: [DailyEggService, PrismaService],
})
export class EggsModule {}
