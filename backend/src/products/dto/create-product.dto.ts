export class CreateProductDto {
  name: string;
  
  // Soru işareti (?) ekleyerek bu alanı 'isteğe bağlı' yaptık.
  // Artık boş gönderilse bile hata vermeyecek.
  description?: string; 

  price: number;
  
  categoryId: number; 
  
  image?: string; 
}