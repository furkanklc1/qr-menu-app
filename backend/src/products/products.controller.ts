import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  UseInterceptors, UploadedFile, BadRequestException, UseGuards
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // GEREKSİZ: Global Guard var zaten
import { Public } from '../auth/decorators/public.decorator';

// --- DOSYA YÜKLEME AYARLARI ---
const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const maxFileSize = 5 * 1024 * 1024; // 5MB

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (!file) return cb(null, true);
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new BadRequestException('Sadece resim dosyaları yüklenebilir!'), false);
  }
  cb(null, true);
};

const storage = diskStorage({
  destination: './uploads', 
  filename: (req, file, cb) => {
    const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
    cb(null, `${randomName}${extname(file.originalname)}`);
  },
});

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // =================================================================
  // 🔓 PUBLIC ENDPOINTS (Müşteriler Görebilir)
  // =================================================================

  @Public() // Müşteri tüm ürünleri görebilmeli
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // DİKKAT: Statik rotalar (popular, stock/low) dinamik olan (:id) rotasından ÖNCE gelmeli!
  
  @Public() // Müşteri popüler ürünleri görebilmeli
  @Get('popular')
  getPopularProducts(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 6;
    return this.productsService.getPopularProducts(limitNum);
  }

  // =================================================================
  // 🔒 ADMIN ENDPOINTS (Sadece Giriş Yapanlar)
  // Not: App.module'de Global Guard olduğu için buraya ekstra @UseGuards yazmana gerek yok.
  // @Public() yazmadığımız her yer otomatik korumalıdır.
  // =================================================================

  @Get('stock/low') // Admin düşük stokları görür
  getLowStockProducts() {
    return this.productsService.getLowStockProducts();
  }

  @Get('stock/tracked') // Admin stok takibindekileri görür
  getStockTrackedProducts() {
    return this.productsService.getStockTrackedProducts();
  }

  // --- ŞİMDİ PARAMETRELİ GET METODU GELEBİLİR ---
  
  @Public() // Müşteri ürün detayına tıkladığında görebilmeli
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  // =================================================================
  // 📝 YÖNETİM İŞLEMLERİ (Create, Update, Delete) - Otomatik Korumalı
  // =================================================================

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage, fileFilter, limits: { fileSize: maxFileSize } }))
  create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    if (file && file.size > maxFileSize) {
      throw new BadRequestException('Dosya boyutu 5MB\'dan büyük olamaz!');
    }
    const createProductDto = {
      ...body,
      price: Number(body.price),
      categoryId: Number(body.categoryId),
      description: body.description === '' ? null : body.description,
      image: file ? `/uploads/${file.filename}` : null,
    };
    return this.productsService.create(createProductDto);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', { storage, fileFilter, limits: { fileSize: maxFileSize } }))
  update(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const updateProductDto: any = {
      ...body,
      price: body.price ? Number(body.price) : undefined,
      categoryId: body.categoryId ? Number(body.categoryId) : undefined,
    };

    if (body.description !== undefined) {
      updateProductDto.description = body.description === '' ? null : body.description;
    }

    if (body.trackStock !== undefined) {
      updateProductDto.trackStock = body.trackStock === 'true' || body.trackStock === true;
    }

    if (file) {
      updateProductDto.image = `/uploads/${file.filename}`;
    }

    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  @Patch(':id/stock')
  updateStock(@Param('id') id: string, @Body() body: { stock: number; minStock?: number }) {
    return this.productsService.updateStock(+id, body.stock, body.minStock);
  }
}