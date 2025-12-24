import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        categoryId: data.categoryId,
        trackStock: data.trackStock === 'true' || data.trackStock === true,
        stock: data.stock ?? 0,
        minStock: data.minStock ?? 5,
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: { category: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.product.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async updateStock(id: number, stock: number, minStock?: number) {
    const updateData: any = { stock };
    if (minStock !== undefined) {
      updateData.minStock = minStock;
    }
    return this.prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });
  }

  async getLowStockProducts() {
    // Sadece stok takibi yapılan ürünleri getir
    const trackedProducts = await this.prisma.product.findMany({
      where: {
        trackStock: true,
      },
      include: { category: true },
    });
    
    // Düşük stoklu ürünleri filtrele (stock <= minStock)
    const lowStockProducts = trackedProducts.filter(
      (product) => product.stock <= product.minStock
    );
    
    return lowStockProducts.sort((a, b) => a.stock - b.stock);
  }

  // Stok takibi yapılan tüm ürünleri getir
  async getStockTrackedProducts() {
    return this.prisma.product.findMany({
      where: {
        trackStock: true,
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  // En çok satılan ürünleri getir
  async getPopularProducts(limit: number = 6) {
    // Son 30 gün içindeki siparişlerden en çok satılan ürünleri bul
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const topProductsRaw = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: { not: 'CANCELLED' }
        }
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    // Ürün detaylarını getir
    const popularProducts = await Promise.all(
      topProductsRaw.map(async (item) => {
        const product = await this.prisma.product.findUnique({ 
          where: { id: item.productId },
          include: { category: true }
        });
        
        if (!product) return null;
        
        return {
          ...product,
          salesCount: item._sum.quantity || 0,
        };
      })
    );

    // null değerleri filtrele ve sadece aktif ürünleri döndür
    return popularProducts
      .filter((p): p is NonNullable<typeof p> => p !== null && p.isAvailable)
      .slice(0, limit);
  }
}