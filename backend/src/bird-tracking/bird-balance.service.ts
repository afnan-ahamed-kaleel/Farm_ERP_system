import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class BirdBalanceService {
  constructor(private prisma: PrismaService) {}

  async calculateLiveBalance(flockId: string, locationId: string, tx?: any): Promise<number> {
    const db = tx || this.prisma;

    // 1. Incoming Birds (Movements where this location is the target)
    const incomingMovements = await db.birdMovement.aggregate({
      where: {
        targetLocationId: locationId,
        flockId: flockId,
        status: 'POSTED',
      },
      _sum: {
        quantity: true,
      },
    });

    const incoming = incomingMovements._sum.quantity || 0;

    // 2. Outgoing Birds (Movements where this location is the source)
    const outgoingMovements = await db.birdMovement.aggregate({
      where: {
        sourceLocationId: locationId,
        flockId: flockId,
        status: 'POSTED',
        pathway: { not: 'INTAKE' as any },
      },
      _sum: {
        quantity: true,
      },
    });

    const outgoing = outgoingMovements._sum.quantity || 0;

    // 3. Losses (Mortality + Culling)
    const losses = await db.dailyMortality.aggregate({
      where: {
        locationId: locationId,
        flockId: flockId,
      },
      _sum: {
        mortalityCount: true,
        cullingCount: true,
      },
    });

    const totalLosses = (losses._sum.mortalityCount || 0) + (losses._sum.cullingCount || 0);

    const netBalance = incoming - outgoing - totalLosses;
    return Math.max(0, netBalance);
  }

  async getDashboardStats() {
    const totalIncoming = await this.prisma.birdMovement.aggregate({
      where: { status: 'POSTED' },
      _sum: { quantity: true },
    });
    const incoming = totalIncoming._sum.quantity || 0;

    const totalOutgoing = await this.prisma.birdMovement.aggregate({
      where: { status: 'POSTED', pathway: { not: 'INTAKE' as any } },
      _sum: { quantity: true },
    });
    const outgoing = totalOutgoing._sum.quantity || 0;

    const mortalities = await this.prisma.dailyMortality.aggregate({
      _sum: { mortalityCount: true, cullingCount: true },
    });
    const totalMortality = (mortalities._sum.mortalityCount || 0) + (mortalities._sum.cullingCount || 0);

    const totalLiveBirds = incoming - outgoing - totalMortality;

    const activeFlocksCount = await this.prisma.flock.count();

    return {
      totalLiveBirds: Math.max(0, totalLiveBirds),
      todayMortality: totalMortality,
      activeFlocks: activeFlocksCount,
    };
  }
}
