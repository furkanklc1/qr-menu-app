import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('stats')
  getStats(@Query('range') range: 'daily' | 'weekly' | 'monthly') {
    return this.ordersService.getStats(range);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: any) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Post('call-waiter')
  callWaiter(@Body() body: { tableId: number }) {
    return this.ordersService.callWaiter(body.tableId);
  }

  // --- YENİ EKLENEN: DELETE /reset ---
  @Delete('reset')
  resetData() {
    return this.ordersService.resetData();
  }
}