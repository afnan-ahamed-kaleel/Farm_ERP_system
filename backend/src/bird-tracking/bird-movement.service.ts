import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { BirdBalanceService } from './bird-balance.service.js';
import { CreateMovementDto } from './dto/create-movement.dto.js';

@Injectable()
export class BirdMovementService {
  constructor(
    private prisma: PrismaService,
    private balanceService: BirdBalanceService,
  ) {}

  async createDraft(dto: CreateMovementDto) {
    return this.prisma.birdMovement.create({
      data: {
        date: new Date(dto.date),
        flockId: dto.flockId,
        sourceLocationId: dto.sourceLocationId,
        targetLocationId: dto.targetLocationId,
        pathway: dto.pathway as any,
        quantity: dto.quantity,
        status: 'DRAFT',
        createdBy: dto.createdBy,
      },
    });
  }

  async postMovement(movementId: string, approvedBy: string) {
    // Wrap in an interactive transaction
    return this.prisma.$transaction(async (tx: any) => {
      // 1. Fetch the draft movement
      const movement = await tx.birdMovement.findUnique({
        where: { id: movementId },
      });

      if (!movement) throw new BadRequestException('Movement not found');
      if (movement.status === 'POSTED') throw new BadRequestException('Already posted');

      // 2. Re-calculate live balance of source location dynamically within TX
      if (movement.pathway !== 'INTAKE' as any) {
        const liveBalance = await this.balanceService.calculateLiveBalance(
          movement.flockId,
          movement.sourceLocationId,
          tx,
        );

        // 3. Validation
        if (movement.quantity > liveBalance) {
          throw new BadRequestException(
            `Insufficient birds. Requested: ${movement.quantity}, Available: ${liveBalance}`,
          );
        }
      }

      // 4. Update status to POSTED
      return tx.birdMovement.update({
        where: { id: movementId },
        data: {
          status: 'POSTED',
          approvedBy,
          postedAt: new Date(),
        },
      });
    });
  }

  async getFlocks() {
    return this.prisma.flock.findMany({ orderBy: { hatchDate: 'desc' } });
  }

  async getLocations() {
    return this.prisma.location.findMany({ orderBy: { name: 'asc' } });
  }
}

