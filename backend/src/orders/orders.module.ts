import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway'; // <--- Import

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, EventsGateway], // <--- Ekle
})
export class OrdersModule {}