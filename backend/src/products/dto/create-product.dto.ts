export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  categoryId: number; // Hangi kategoride olduğu
  image?: string;     // Resim opsiyonel
}