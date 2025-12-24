import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Kategori adı boş olamaz' })
  @IsString({ message: 'Kategori adı string olmalıdır' })
  name: string;
  
  @IsOptional()
  @IsString({ message: 'Resim yolu string olmalıdır' })
  image?: string; 
}