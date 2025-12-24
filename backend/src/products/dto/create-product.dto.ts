import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Ürün adı boş olamaz' })
  @IsString({ message: 'Ürün adı string olmalıdır' })
  name: string;
  
  @IsOptional()
  @IsString({ message: 'Açıklama string olmalıdır' })
  description?: string; 

  @IsNotEmpty({ message: 'Fiyat boş olamaz' })
  @IsNumber({}, { message: 'Fiyat sayı olmalıdır' })
  @IsPositive({ message: 'Fiyat pozitif bir sayı olmalıdır' })
  @Min(0.01, { message: 'Fiyat en az 0.01 olmalıdır' })
  price: number;
  
  @IsNotEmpty({ message: 'Kategori ID boş olamaz' })
  @IsNumber({}, { message: 'Kategori ID sayı olmalıdır' })
  @IsPositive({ message: 'Kategori ID pozitif bir sayı olmalıdır' })
  categoryId: number; 
  
  @IsOptional()
  @IsString({ message: 'Resim yolu string olmalıdır' })
  image?: string; 
}