import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config'; // 
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';

import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CategoriesModule } from './categories/categories.module';
import { TablesModule } from './tables/tables.module';
import { AiModule } from './ai/ai.module';
import { WaitersModule } from './waiters/waiters.module';
import { AuthModule } from './auth/auth.module';

import { PrismaService } from './prisma.service';
import { EventsGateway } from './events/events.gateway';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    AuthModule,
    ProductsModule,
    OrdersModule,
    CategoriesModule,
    TablesModule,
    AiModule,
    WaitersModule,
  ],
  controllers: [],
  providers: [
    PrismaService, 
    EventsGateway,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}