import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseInterceptors, UploadedFile 
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Dosya Kayıt Ayarları (Multer)
const storage = diskStorage({
  destination: './uploads', // Nereye kaydedilecek?
  filename: (req, file, cb) => {
    // Dosya ismini benzersiz yap (Örn: 123456789-urun.jpg)
    const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
    cb(null, `${randomName}${extname(file.originalname)}`);
  },
});

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // --- YENİ EKLEME (Resimli) ---
  @Post()
  @UseInterceptors(FileInterceptor('file', { storage })) // 'file' adında dosya bekler
  create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    // Form-data'dan sayılar string olarak gelir, onları sayıya çevirelim
    const createProductDto = {
      ...body,
      price: Number(body.price),
      categoryId: Number(body.categoryId),
      image: file ? `/uploads/${file.filename}` : null, // Resim yolunu oluştur
    };
    return this.productsService.create(createProductDto);
  }

  // --- DÜZENLEME (Resimli) ---
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', { storage }))
  update(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const updateProductDto = {
      ...body,
      // Eğer sayısal değerler geldiyse çevir
      price: body.price ? Number(body.price) : undefined,
      categoryId: body.categoryId ? Number(body.categoryId) : undefined,
    };

    // Eğer yeni resim yüklendiyse, resim yolunu güncelle
    if (file) {
      updateProductDto.image = `/uploads/${file.filename}`;
    }

    return this.productsService.update(+id, updateProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}