import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  UseInterceptors, UploadedFile, BadRequestException, UseGuards
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

// İzin verilen dosya tipleri
const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const maxFileSize = 5 * 1024 * 1024; // 5MB

// Dosya tipi kontrolü
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (!file) {
    return cb(null, true); // Dosya yoksa devam et (opsiyonel)
  }
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new BadRequestException(
        'Sadece resim dosyaları yüklenebilir! (JPG, JPEG, PNG, WEBP)'
      ),
      false
    );
  }
  
  cb(null, true);
};

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
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', { 
    storage,
    fileFilter,
    limits: { fileSize: maxFileSize }
  })) // 'file' adında dosya bekler
  create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    // Dosya boyutu kontrolü
    if (file && file.size > maxFileSize) {
      throw new BadRequestException('Dosya boyutu 5MB\'dan büyük olamaz!');
    }

    // Form-data'dan sayılar string olarak gelir, onları sayıya çevirelim
    const createProductDto = {
      ...body,
      price: Number(body.price),
      categoryId: Number(body.categoryId),
      // Açıklama boş string ise null yap (isteğe bağlı alan)
      description: body.description === '' ? null : body.description,
      image: file ? `/uploads/${file.filename}` : null, // Resim yolunu oluştur
    };
    return this.productsService.create(createProductDto);
  }

  // --- DÜZENLEME (Resimli) ---
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', { 
    storage,
    fileFilter,
    limits: { fileSize: maxFileSize }
  }))
  update(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    // Dosya boyutu kontrolü
    if (file && file.size > maxFileSize) {
      throw new BadRequestException('Dosya boyutu 5MB\'dan büyük olamaz!');
    }
    const updateProductDto: any = {
      ...body,
      // Eğer sayısal değerler geldiyse çevir
      price: body.price ? Number(body.price) : undefined,
      categoryId: body.categoryId ? Number(body.categoryId) : undefined,
    };

    // Açıklama boş string ise null yap (isteğe bağlı alan)
    if (body.description !== undefined) {
      updateProductDto.description = body.description === '' ? null : body.description;
    }

    // trackStock boolean'a çevir
    if (body.trackStock !== undefined) {
      updateProductDto.trackStock = body.trackStock === 'true' || body.trackStock === true;
    }

    // Eğer yeni resim yüklendiyse, resim yolunu güncelle
    if (file) {
      updateProductDto.image = `/uploads/${file.filename}`;
    }

    return this.productsService.update(+id, updateProductDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  // Stok güncelleme
  @UseGuards(JwtAuthGuard)
  @Patch(':id/stock')
  updateStock(@Param('id') id: string, @Body() body: { stock: number; minStock?: number }) {
    return this.productsService.updateStock(+id, body.stock, body.minStock);
  }

  // Düşük stoklu ürünleri getir
  @UseGuards(JwtAuthGuard)
  @Get('stock/low')
  getLowStockProducts() {
    return this.productsService.getLowStockProducts();
  }

  // Stok takibi yapılan ürünleri getir
  @UseGuards(JwtAuthGuard)
  @Get('stock/tracked')
  getStockTrackedProducts() {
    return this.productsService.getStockTrackedProducts();
  }

  // En çok satılan ürünleri getir
  @Public()
  @Get('popular')
  getPopularProducts(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 6;
    return this.productsService.getPopularProducts(limitNum);
  }
}