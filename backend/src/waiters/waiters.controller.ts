import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { WaitersService } from './waiters.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('waiters')
export class WaitersController {
  constructor(private readonly waitersService: WaitersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.waitersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('performance')
  getPerformance(@Query('range') range: 'daily' | 'weekly' | 'monthly') {
    return this.waitersService.getAllPerformance(range);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.waitersService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/performance')
  getWaiterPerformance(
    @Param('id') id: string,
    @Query('range') range: 'daily' | 'weekly' | 'monthly',
  ) {
    return this.waitersService.getPerformance(+id, range);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: { name: string }) {
    return this.waitersService.create(body.name);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'AVAILABLE' | 'BUSY' | 'ON_BREAK' },
  ) {
    return this.waitersService.updateStatus(+id, body.status);
  }
}

