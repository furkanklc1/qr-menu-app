// backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config'; 
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';

import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CategoriesModule } from './categories/categories.module';
import { TablesModule } from './tables/tables.module';
import { AiModule } from './ai/ai.module';
import { WaitersModule } from './waiters/waiters.module';
import { AuthModule } from './auth/auth.module';
import { ReviewsModule } from './reviews/reviews.module';

import { PrismaService } from './prisma.service';
import { EventsGateway } from './events/events.gateway';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    // Uploads klasörünü dışarıya açar: http://localhost:3000/uploads/resim.jpg
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'), // __dirname yerine process.cwd() daha güvenilirdir (Proje kök dizini)
      serveRoot: '/uploads',
    }),

    AuthModule,
    ProductsModule,
    OrdersModule,
    CategoriesModule,
    TablesModule,
    AiModule,
    WaitersModule,
    ReviewsModule,
  ],
  controllers: [],
  providers: [
    PrismaService, 
    EventsGateway,
    // DİKKAT: Bu guard tüm route'ları korur. 
    // Müşterilerin erişeceği route'lara controller içinde @Public() eklemeyi UNUTMA!
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}