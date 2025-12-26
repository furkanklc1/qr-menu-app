import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  // Değerlendirme oluşturma
  async create(createReviewDto: CreateReviewDto) {
    const newReview = await this.prisma.review.create({
      data: {
        foodRating: createReviewDto.foodRating,
        waiterRating: createReviewDto.waiterRating,
        comment: createReviewDto.comment || null,
        tableId: createReviewDto.tableId || null,
      },
      include: {
        table: true,
      },
    });

    // Socket ile yeni review bildirimi gönder
    this.eventsGateway.server.emit('new_review', newReview);

    return newReview;
  }

  // Tüm değerlendirmeleri getirme (admin için)
  findAll() {
    return this.prisma.review.findMany({
      include: {
        table: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // İstatistikler
  getStats() {
    return this.prisma.review.aggregate({
      _avg: {
        foodRating: true,
        waiterRating: true,
      },
      _count: {
        id: true,
      },
    });
  }
}

