import { Controller, Get, Query } from '@nestjs/common';
import { TraceabilityService } from './traceability.service.js';

@Controller('api/v1/traceability')
export class TraceabilityController {
  constructor(private readonly traceabilityService: TraceabilityService) {}

  @Get('backward')
  async traceBackward(@Query('eggBatchNumber') eggBatchNumber: string) {
    return this.traceabilityService.traceBackward(eggBatchNumber);
  }

  @Get('forward')
  async traceForward(@Query('rmBatchNumber') rmBatchNumber: string) {
    return this.traceabilityService.traceForward(rmBatchNumber);
  }
}
