import { Module } from '@nestjs/common';
import { WaitersService } from './waiters.service';
import { WaitersController } from './waiters.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [WaitersController],
  providers: [WaitersService, PrismaService],
  exports: [WaitersService],
})
export class WaitersModule {}

