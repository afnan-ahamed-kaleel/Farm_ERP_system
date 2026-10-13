import { Controller, Post, Body } from '@nestjs/common';
import { DailyEggService } from './daily-egg.service.js';
import { DailyEggCollectionDto } from './dto/eggs.dto.js';

@Controller('api/v1/eggs')
export class EggsController {
  constructor(private readonly eggService: DailyEggService) {}

  @Post('daily-collection')
  async logCollection(@Body() dto: DailyEggCollectionDto) {
    return this.eggService.logDailyCollection(dto);
  }
}
