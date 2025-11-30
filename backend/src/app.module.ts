import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config'; // 
import { join } from 'path';

import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CategoriesModule } from './categories/categories.module';
import { TablesModule } from './tables/tables.module';
import { AiModule } from './ai/ai.module';

import { PrismaService } from './prisma.service';
import { EventsGateway } from './events/events.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    ProductsModule,
    OrdersModule,
    CategoriesModule,
    TablesModule,
    AiModule,
  ],
  controllers: [],
  providers: [PrismaService, EventsGateway],
})
export class AppModule {}