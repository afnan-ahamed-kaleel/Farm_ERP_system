import { Module } from '@nestjs/common';
import { TraceabilityController } from './traceability.controller.js';
import { TraceabilityService } from './traceability.service.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  controllers: [TraceabilityController],
  providers: [TraceabilityService, PrismaService],
})
export class TraceabilityModule {}
