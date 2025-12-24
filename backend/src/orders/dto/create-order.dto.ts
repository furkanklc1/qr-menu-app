import { IsNotEmpty, IsNumber, IsArray, ValidateNested, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNotEmpty({ message: 'Ürün ID boş olamaz' })
  @IsNumber({}, { message: 'Ürün ID sayı olmalıdır' })
  @IsPositive({ message: 'Ürün ID pozitif bir sayı olmalıdır' })
  productId: number;

  @IsNotEmpty({ message: 'Miktar boş olamaz' })
  @IsNumber({}, { message: 'Miktar sayı olmalıdır' })
  @IsPositive({ message: 'Miktar pozitif bir sayı olmalıdır' })
  @Min(1, { message: 'Miktar en az 1 olmalıdır' })
  quantity: number;

  @IsNotEmpty({ message: 'Fiyat boş olamaz' })
  @IsNumber({}, { message: 'Fiyat sayı olmalıdır' })
  @IsPositive({ message: 'Fiyat pozitif bir sayı olmalıdır' })
  @Min(0.01, { message: 'Fiyat en az 0.01 olmalıdır' })
  price: number; // O anki fiyatı da kaydedelim ki zam gelirse eski sipariş bozulmasın
}

export class CreateOrderDto {
  @IsNotEmpty({ message: 'Masa ID boş olamaz' })
  @IsNumber({}, { message: 'Masa ID sayı olmalıdır' })
  @IsPositive({ message: 'Masa ID pozitif bir sayı olmalıdır' })
  tableId: number;

  @IsNotEmpty({ message: 'Sipariş öğeleri boş olamaz' })
  @IsArray({ message: 'Sipariş öğeleri array olmalıdır' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}