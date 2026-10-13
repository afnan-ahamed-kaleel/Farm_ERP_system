import { Controller, Post, Body, ValidationPipe, UsePipes } from '@nestjs/common';
import { DailyMortalityService } from './daily-mortality.service.js';
import { CreateMortalityDto } from './dto/create-mortality.dto.js';

@Controller('api/v1/bird-tracking')
export class DailyMortalityController {
  constructor(private readonly mortalityService: DailyMortalityService) {}

  @Post('mortality')
  @UsePipes(new ValidationPipe({ transform: true }))
  async logMortality(@Body() createMortalityDto: CreateMortalityDto) {
    return this.mortalityService.logMortality(createMortalityDto);
  }
}
