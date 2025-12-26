import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty({ message: 'Yemek puanı boş olamaz' })
  @IsNumber({}, { message: 'Yemek puanı sayı olmalıdır' })
  @Min(1, { message: 'Yemek puanı en az 1 olmalıdır' })
  @Max(5, { message: 'Yemek puanı en fazla 5 olabilir' })
  foodRating: number;

  @IsNotEmpty({ message: 'Garson puanı boş olamaz' })
  @IsNumber({}, { message: 'Garson puanı sayı olmalıdır' })
  @Min(1, { message: 'Garson puanı en az 1 olmalıdır' })
  @Max(5, { message: 'Garson puanı en fazla 5 olabilir' })
  waiterRating: number;

  @IsOptional()
  @IsString({ message: 'Yorum string olmalıdır' })
  comment?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Masa ID sayı olmalıdır' })
  tableId?: number;
}

