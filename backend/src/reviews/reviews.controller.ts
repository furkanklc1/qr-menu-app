import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats() {
    return this.reviewsService.getStats();
  }
}

