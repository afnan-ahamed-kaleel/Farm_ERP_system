import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class TraceabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async traceBackward(eggBatchNumber: string) {
    const eggBatch = await this.prisma.batch.findUnique({
      where: { batchNumber: eggBatchNumber },
      include: {
        eggProductionLogs: {
          include: {
            flock: {
              include: {
                feedConsumptions: {
                  include: {
                    feedBatch: {
                      include: {
                        productionRun: {
                          include: {
                            formulaVersion: {
                              include: { formula: true }
                            },
                            ingredientUsages: {
                              include: {
                                rawMaterialBatch: true,
                                rawMaterialItem: true
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            houseLocation: true
          }
        },
        dispatchRecords: {
          include: { customer: true }
        }
      }
    });

    if (!eggBatch) throw new NotFoundException('Egg Batch not found');
    return eggBatch;
  }

  async traceForward(rmBatchNumber: string) {
    const rmBatch = await this.prisma.batch.findUnique({
      where: { batchNumber: rmBatchNumber },
      include: {
        ingredientUsages: {
          include: {
            productionRun: {
              include: {
                producedBatch: {
                  include: {
                    consumptions: {
                      include: {
                        flock: {
                          include: {
                            eggProductionLogs: {
                              include: {
                                eggBatch: {
                                  include: {
                                    dispatchRecords: {
                                      include: { customer: true }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!rmBatch) throw new NotFoundException('Raw Material Batch not found');
    return rmBatch;
  }
}
