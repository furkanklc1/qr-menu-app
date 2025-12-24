import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats(@Query('range') range: 'daily' | 'weekly' | 'monthly') {
    return this.ordersService.getStats(range);
  }


  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: any) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/assign-waiter')
  assignWaiter(@Param('id') id: string, @Body() body: { waiterId: number }) {
    return this.ordersService.assignWaiter(+id, body.waiterId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/priority')
  setPriority(@Param('id') id: string, @Body() body: { priority: 'LOW' | 'NORMAL' | 'HIGH' | 'VIP' }) {
    return this.ordersService.setPriority(+id, body.priority);
  }

  @Public()
  @Post('call-waiter')
  callWaiter(@Body() body: { tableId: number }) {
    return this.ordersService.callWaiter(body.tableId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('reset')
  resetData() {
    return this.ordersService.resetData();
  }
}