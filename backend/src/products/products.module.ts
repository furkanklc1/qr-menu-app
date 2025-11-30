import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../prisma.service'; // <-- Servisimizi çağırdık

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService], // <-- Buraya ekledik
})
export class ProductsModule {}