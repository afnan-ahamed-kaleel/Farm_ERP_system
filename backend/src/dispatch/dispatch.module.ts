import { Module } from '@nestjs/common';
import { DispatchController } from './dispatch.controller.js';
import { DispatchService } from './dispatch.service.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  controllers: [DispatchController],
  providers: [DispatchService, PrismaService],
})
export class DispatchModule {}
