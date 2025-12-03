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

  // --- GÜNCELLENMİŞ VE FİLTRELİ İSTATİSTİK SERVİSİ ---
  async getStats(range: 'daily' | 'weekly' | 'monthly' = 'weekly') {
    const now = new Date();
    const startDate = new Date();
    
    // 1. Grafik için Boş Şablon Oluştur (Zaman Serisi Doldurma)
    const chartData: { name: string; value: number }[] = [];

    if (range === 'daily') {
      // GÜNLÜK: 00:00 - 23:00 arası saatler
      startDate.setHours(0, 0, 0, 0);
      for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0') + ':00';
        chartData.push({ name: hour, value: 0 });
      }

    } else if (range === 'weekly') {
      // HAFTALIK: Son 7 gün (Pzt, Sal...)
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0,0,0,0);
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' }); 
        chartData.push({ name: dayName, value: 0 });
      }

    } else if (range === 'monthly') {
      // AYLIK: Son 30 gün (1 Nis, 2 Nis...)
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0,0,0,0);
      for (let i = 0; i < 30; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dayStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        chartData.push({ name: dayStr, value: 0 });
      }
    }

    // 2. Seçili Aralıktaki Siparişleri Çek
    const ordersInRange = await this.prisma.order.findMany({
      where: { 
        createdAt: { gte: startDate }, 
        status: { not: 'CANCELLED' } 
      },
    });

    // 3. Grafik Verilerini Eşle
    ordersInRange.forEach(order => {
      const date = new Date(order.createdAt);
      let key = '';

      if (range === 'daily') {
        key = date.getHours().toString().padStart(2, '0') + ':00';
      } else if (range === 'weekly') {
        key = date.toLocaleDateString('tr-TR', { weekday: 'short' });
      } else {
        key = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      }

      const foundIndex = chartData.findIndex(c => c.name === key);
      if (foundIndex !== -1) {
        chartData[foundIndex].value += Number(order.totalAmount);
      }
    });

    // --- DİĞER İSTATİSTİKLER ---
    
    const totalRevenue = ordersInRange.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const totalOrders = ordersInRange.length;

    const activeOrders = await this.prisma.order.count({ 
      where: { status: { not: 'SERVED' } } 
    });

    // --- 4. EN ÇOK SATILANLAR (KRİTİK DÜZELTME BURADA) ---
    // groupBy kullanırken 'where' ekleyerek sadece bu tarih aralığındaki siparişlere (order) ait kalemleri sayıyoruz.
    const topProductsRaw = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: startDate }, // <--- ARTIK TARİHE GÖRE FİLTRELİYOR
          status: { not: 'CANCELLED' }
        }
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topProducts = await Promise.all(
      topProductsRaw.map(async (item) => {
        const product = await this.prisma.product.findUnique({ 
          where: { id: item.productId }, 
          include: { category: true } 
        });
        return { 
          name: product?.name || 'Silinmiş Ürün', 
          categoryName: product?.category?.name || 'Diğer', 
          count: item._sum.quantity 
        };
      })
    );

    return {
      totalRevenue,
      totalOrders,
      activeOrders,
      salesTrend: chartData,
      topProducts,
    };
  }

  async resetData() {
    await this.prisma.orderItem.deleteMany({});
    await this.prisma.payment.deleteMany({});
    await this.prisma.order.deleteMany({});
    return { message: "Veritabanı temizlendi." };
  }
}