import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { WaitersService } from './waiters.service';

@Controller('waiters')
export class WaitersController {
  constructor(private readonly waitersService: WaitersService) {}

  @Get()
  findAll() {
    return this.waitersService.findAll();
  }

  @Get('performance')
  getPerformance(@Query('range') range: 'daily' | 'weekly' | 'monthly') {
    return this.waitersService.getAllPerformance(range);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.waitersService.findOne(+id);
  }

  @Get(':id/performance')
  getWaiterPerformance(
    @Param('id') id: string,
    @Query('range') range: 'daily' | 'weekly' | 'monthly',
  ) {
    return this.waitersService.getPerformance(+id, range);
  }

  @Post()
  create(@Body() body: { name: string }) {
    return this.waitersService.create(body.name);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'AVAILABLE' | 'BUSY' | 'ON_BREAK' },
  ) {
    return this.waitersService.updateStatus(+id, body.status);
  }
}

