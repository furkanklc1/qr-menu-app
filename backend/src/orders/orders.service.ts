import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway, 
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const newOrder = await this.prisma.order.create({
      data: {
        tableId: createOrderDto.tableId,
        totalAmount: totalAmount,
        status: 'PENDING',
        items: {
          create: createOrderDto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { 
        table: true,
        items: { include: { product: true } } 
      }, 
    });

    this.eventsGateway.server.emit('new_order', newOrder);
    return newOrder;
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { 
        table: true, 
        items: { include: { product: true } } 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  async update(id: number, updateOrderDto: any) {
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: { 
        table: true, 
        items: { include: { product: true } } 
      }
    });

    this.eventsGateway.server.emit('order_updated', updatedOrder);
    return updatedOrder;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  async callWaiter(tableId: number) {
    this.eventsGateway.server.emit('waiter_called', { 
      tableId, 
      time: new Date().toISOString() 
    });
    return { success: true, message: 'Garsona haber verildi.' };
  }

  // --- İSTATİSTİK RAPORU (GÜNCELLENDİ) ---
  async getStats() {
    // 1. Toplam Ciro ve Toplam Sipariş
    const totalStats = await this.prisma.order.aggregate({
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    // 2. YENİ: Anlık Bekleyen (Aktif) Sipariş Sayısı
    // Status'ü 'SERVED' (Tamamlandı) OLMAYAN her şeyi say
    const activeOrders = await this.prisma.order.count({
      where: { status: { not: 'SERVED' } }
    });

    // 3. En Çok Satan 5 Ürün
    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const enrichedTopProducts = await Promise.all(
      topProducts.map(async (item) => {
        const product = await this.prisma.product.findUnique({ 
            where: { id: item.productId },
            include: { category: true }
        });
        return { 
            name: product?.name, 
            categoryName: product?.category?.name || 'Diğer',
            count: item._sum.quantity 
        };
      })
    );

    return {
      totalRevenue: totalStats._sum.totalAmount || 0,
      totalOrders: totalStats._count.id || 0,
      activeOrders, // <--- Pakete ekledik
      topProducts: enrichedTopProducts,
    };
  }
}