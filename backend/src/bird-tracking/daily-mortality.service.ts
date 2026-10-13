import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { BirdBalanceService } from './bird-balance.service.js';
import { CreateMortalityDto } from './dto/create-mortality.dto.js';

@Injectable()
export class DailyMortalityService {
  constructor(
    private prisma: PrismaService,
    private balanceService: BirdBalanceService,
  ) {}

  async logMortality(dto: CreateMortalityDto) {
    return this.prisma.$transaction(async (tx: any) => {
      // 1. Calculate live balance dynamically within TX
      const liveBalance = await this.balanceService.calculateLiveBalance(
        dto.flockId,
        dto.locationId,
        tx,
      );

      const totalLoss = dto.mortalityCount + dto.cullingCount;

      // 2. Validation
      if (totalLoss > liveBalance) {
        throw new BadRequestException(
          `Loss exceeds available birds. Total loss: ${totalLoss}, Available: ${liveBalance}`,
        );
      }

      // 3. Persist
      return tx.dailyMortality.create({
        data: {
          date: new Date(dto.date),
          flockId: dto.flockId,
          locationId: dto.locationId,
          mortalityCount: dto.mortalityCount,
          cullingCount: dto.cullingCount,
          cause: dto.cause,
          remarks: dto.remarks,
          operatorId: dto.operatorId,
        },
      });
    });
  }
}
