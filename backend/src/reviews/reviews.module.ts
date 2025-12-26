import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, PrismaService, EventsGateway],
})
export class ReviewsModule {}

