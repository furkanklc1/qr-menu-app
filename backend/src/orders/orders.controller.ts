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

  // --- EKSİK OLAN KISIM BURASIYDI! ---
  // Tek bir siparişin detayını (ve durumunu) getiren endpoint
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }
  // -----------------------------------

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: any) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Patch(':id/assign-waiter')
  assignWaiter(@Param('id') id: string, @Body() body: { waiterId: number }) {
    return this.ordersService.assignWaiter(+id, body.waiterId);
  }

  @Patch(':id/priority')
  setPriority(@Param('id') id: string, @Body() body: { priority: 'LOW' | 'NORMAL' | 'HIGH' | 'VIP' }) {
    return this.ordersService.setPriority(+id, body.priority);
  }

  @Post('call-waiter')
  callWaiter(@Body() body: { tableId: number }) {
    return this.ordersService.callWaiter(body.tableId);
  }

  @Delete('reset')
  resetData() {
    return this.ordersService.resetData();
  }
}