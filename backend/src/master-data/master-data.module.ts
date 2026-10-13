import { Module } from '@nestjs/common';
import { MasterDataController } from './master-data.controller.js';
import { MasterDataService } from './master-data.service.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  controllers: [MasterDataController],
  providers: [MasterDataService, PrismaService],
  exports: [MasterDataService],
})
export class MasterDataModule {}
