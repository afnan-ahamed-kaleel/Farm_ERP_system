import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateFormulaDto } from './dto/feed.dto.js';

@Injectable()
export class FormulaService {
  constructor(private readonly prisma: PrismaService) {}

  async createFormula(dto: CreateFormulaDto) {
    const totalInclusion = dto.ingredients.reduce((sum, item) => sum + item.inclusionKg, 0);
    if (Math.abs(totalInclusion - dto.baseQuantityKg) > 0.1) {
      throw new BadRequestException(`Ingredients sum (${totalInclusion}kg) must equal base quantity (${dto.baseQuantityKg}kg)`);
    }

    return await this.prisma.$transaction(async (tx: any) => {
      let formula = await tx.feedFormula.findUnique({ where: { code: dto.code } });
      let nextVersionNumber = 1;
      
      if (!formula) {
        formula = await tx.feedFormula.create({
          data: {
            code: dto.code,
            name: dto.name,
            targetStage: dto.targetStage,
          }
        });
      } else {
        const lastVersion = await tx.feedFormulaVersion.findFirst({
            where: { formulaId: formula.id },
            orderBy: { versionNumber: 'desc' }
        });
        if (lastVersion) nextVersionNumber = lastVersion.versionNumber + 1;
      }

      await tx.feedFormulaVersion.create({
        data: {
          formulaId: formula.id,
          versionNumber: nextVersionNumber,
          baseQuantityKg: dto.baseQuantityKg,
          effectiveDate: new Date(),
          isLocked: true,
          ingredients: {
            create: dto.ingredients.map((ing: any) => ({
              rawMaterialItemId: ing.rawMaterialItemId,
              inclusionKg: ing.inclusionKg,
              inclusionPercentage: (ing.inclusionKg / dto.baseQuantityKg) * 100
            }))
          }
        }
      });

      return await tx.feedFormula.findUnique({
        where: { id: formula.id },
        include: { versions: { include: { ingredients: true }, orderBy: { versionNumber: 'desc' } } },
      });
    });
  }


  async getAllFormulas() {
    return this.prisma.feedFormula.findMany({
      include: {
        versions: {
          include: {
            ingredients: {
              include: { rawMaterialItem: true }
            }
          },
          orderBy: { versionNumber: 'desc' }
        }
      }
    });
  }
}
