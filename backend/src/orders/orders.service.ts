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
      include: { table: true, items: { include: { product: true } } }, 
    });

    this.eventsGateway.server.emit('new_order', newOrder);
    return newOrder;
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { table: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) { return `This action returns a #${id} order`; }

  async update(id: number, updateOrderDto: any) {
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: { table: true, items: { include: { product: true } } }
    });
    this.eventsGateway.server.emit('order_updated', updatedOrder);
    return updatedOrder;
  }

  remove(id: number) { return `This action removes a #${id} order`; }

  async callWaiter(tableId: number) {
    this.eventsGateway.server.emit('waiter_called', { 
      tableId, 
      time: new Date().toISOString() 
    });
    return { success: true, message: 'Garsona haber verildi.' };
  }

  async getStats(range: 'daily' | 'weekly' | 'monthly' = 'weekly') {
    const now = new Date();
    let startDate = new Date();

    if (range === 'daily') startDate.setHours(0, 0, 0, 0);
    else if (range === 'weekly') startDate.setDate(now.getDate() - 7);
    else if (range === 'monthly') startDate.setMonth(now.getMonth() - 1);

    const totalStats = await this.prisma.order.aggregate({
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    const activeOrders = await this.prisma.order.count({ where: { status: { not: 'SERVED' } } });

    const ordersInRange = await this.prisma.order.findMany({
      where: { createdAt: { gte: startDate }, status: { not: 'CANCELLED' } },
      orderBy: { createdAt: 'asc' }
    });

    const trendMap = new Map<string, number>();
    ordersInRange.forEach(order => {
      let dateKey;
      if (range === 'daily') dateKey = order.createdAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      else dateKey = order.createdAt.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
      
      const currentTotal = trendMap.get(dateKey) || 0;
      trendMap.set(dateKey, currentTotal + Number(order.totalAmount));
    });

    const salesTrend = Array.from(trendMap, ([name, value]) => ({ name, value }));

    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const enrichedTopProducts = await Promise.all(
      topProducts.map(async (item) => {
        const product = await this.prisma.product.findUnique({ where: { id: item.productId }, include: { category: true } });
        return { name: product?.name, categoryName: product?.category?.name || 'Diğer', count: item._sum.quantity };
      })
    );

    return {
      totalRevenue: totalStats._sum.totalAmount || 0,
      totalOrders: totalStats._count.id || 0,
      activeOrders,
      salesTrend,
      topProducts: enrichedTopProducts,
    };
  }

  // --- YENİ EKLENEN: SIFIRLAMA ---
  async resetData() {
    await this.prisma.orderItem.deleteMany({});
    await this.prisma.order.deleteMany({});
    return { message: "Veritabanı temizlendi." };
  }
}