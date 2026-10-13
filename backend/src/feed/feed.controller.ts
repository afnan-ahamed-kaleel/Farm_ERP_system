import { Controller, Post, Get, Body } from '@nestjs/common';
import { FormulaService } from './formula.service.js';
import { FeedProductionService } from './feed-production.service.js';
import { FeedConsumptionService } from './feed-consumption.service.js';
import { CreateFormulaDto, CreateProductionDto, IssueFeedDto, ConsumeFeedDto } from './dto/feed.dto.js';

@Controller('api/v1/feed')
export class FeedController {
  constructor(
    private readonly formulaService: FormulaService,
    private readonly productionService: FeedProductionService,
    private readonly consumptionService: FeedConsumptionService
  ) {}

  @Post('formula')
  async createFormula(@Body() dto: CreateFormulaDto) {
    return this.formulaService.createFormula(dto);
  }

  @Get('formula')
  async getFormulas() {
    return this.formulaService.getAllFormulas();
  }

  @Post('production')
  async executeProduction(@Body() dto: CreateProductionDto) {
    return this.productionService.executeProductionRun(dto);
  }

  @Post('issue')
  async issueFeed(@Body() dto: IssueFeedDto) {
    return this.consumptionService.issueFeedToHouse(dto);
  }

  @Post('consume')
  async consumeFeed(@Body() dto: ConsumeFeedDto) {
    return this.consumptionService.consumeFeed(dto);
  }
}
