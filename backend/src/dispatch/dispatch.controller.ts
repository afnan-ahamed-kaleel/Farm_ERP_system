import { Controller, Post, Body } from '@nestjs/common';
import { DispatchService } from './dispatch.service.js';
import { DispatchEggDto } from './dto/dispatch.dto.js';

@Controller('api/v1/dispatch')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post()
  async dispatchEggs(@Body() dto: DispatchEggDto) {
    return this.dispatchService.dispatchEggs(dto);
  }
}
