import { Controller, Post, Body, Param, Get, Query, ValidationPipe, UsePipes } from '@nestjs/common';
import { BirdMovementService } from './bird-movement.service.js';
import { BirdBalanceService } from './bird-balance.service.js';
import { CreateMovementDto } from './dto/create-movement.dto.js';

@Controller('api/v1/bird-tracking')
export class BirdMovementController {
  constructor(
    private readonly movementService: BirdMovementService,
    private readonly balanceService: BirdBalanceService,
  ) {}

  @Post('movements')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createDraft(@Body() createMovementDto: CreateMovementDto) {
    return this.movementService.createDraft(createMovementDto);
  }

  @Post('movements/:id/post')
  async postMovement(
    @Param('id') id: string,
    @Body('approvedBy') approvedBy: string,
  ) {
    return this.movementService.postMovement(id, approvedBy);
  }

  @Get('balance')
  async getBalance(
    @Query('flockId') flockId: string,
    @Query('locationId') locationId: string,
  ) {
    const liveBalance = await this.balanceService.calculateLiveBalance(flockId, locationId);
    return { liveBalance };
  }

  @Get('flocks')
  async getFlocks() {
    return this.movementService.getFlocks();
  }

  @Get('locations')
  async getLocations() {
    return this.movementService.getLocations();
  }

  @Get('stats/dashboard')
  async getDashboardStats() {
    return this.balanceService.getDashboardStats();
  }
}

