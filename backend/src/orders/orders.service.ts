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
    // 1. Toplam tutarı hesapla
    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // 2. Transaction Başlat: Hem siparişi oluştur hem stoğu düş
    // Eğer stok düşerken hata olursa (örn: stok yetersizse), sipariş de oluşmaz.
    const newOrder = await this.prisma.$transaction(async (tx) => {
      
      // A) Siparişi Kaydet
      const order = await tx.order.create({
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

      // B) Stokları Düş (Kritik Ekleme)
      for (const item of createOrderDto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity } // Eski stoktan adedi düş
          }
        });
      }

      return order;
    });

    // 3. Socket bildirimi gönder
    this.eventsGateway.server.emit('new_order', newOrder);
    return newOrder;
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { 
        table: true, 
        items: { include: { product: true } },
        waiter: true
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { 
        table: true, 
        items: { include: { product: true } },
        waiter: true
      }
    });
  }

  async update(id: number, updateOrderDto: any) {
    const updateData: any = { ...updateOrderDto };
    
    // READY durumuna geçtiğinde readyAt'i kaydet
    if (updateOrderDto.status === 'READY' && !updateOrderDto.readyAt) {
      updateData.readyAt = new Date();
    }
    
    // SERVED durumuna geçtiğinde servedAt'i kaydet
    if (updateOrderDto.status === 'SERVED' && !updateOrderDto.servedAt) {
      updateData.servedAt = new Date();
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: { 
        table: true, 
        items: { include: { product: true } },
        waiter: true
      }
    });
    this.eventsGateway.server.emit('order_updated', updatedOrder);
    return updatedOrder;
  }

  async assignWaiter(orderId: number, waiterId: number) {
    return this.update(orderId, { waiterId });
  }

  async setPriority(orderId: number, priority: 'LOW' | 'NORMAL' | 'HIGH' | 'VIP') {
    return this.update(orderId, { priority });
  }

  remove(id: number) { return `This action removes a #${id} order`; }

  async callWaiter(tableId: number) {
    this.eventsGateway.server.emit('waiter_called', { 
      tableId, 
      time: new Date().toISOString() 
    });
    return { success: true, message: 'Garsona haber verildi.' };
  }

  // --- İSTATİSTİK SERVİSİ (Saat Aralığı Güncellemesi) ---
  async getStats(range: 'daily' | 'weekly' | 'monthly' = 'weekly') {
    const now = new Date();
    const startDate = new Date();
    const chartData: { name: string; value: number }[] = [];

    if (range === 'daily') {
      startDate.setHours(0, 0, 0, 0);
      // RESTORAN ÇALIŞMA SAATLERİ: 08:00 - 00:00
      // Döngüyü 0 yerine 8'den başlatıyoruz
      for (let i = 8; i < 24; i++) {
        // Mevcut saat: "08.00"
        const startHour = i.toString().padStart(2, '0') + '.00';
        // Bitiş saati: "09.00" (Eğer 23 ise 00 olur)
        const endHour = ((i + 1) % 24).toString().padStart(2, '0') + '.00';
        
        // Etiket: "08.00-09.00"
        const label = `${startHour}-${endHour}`;
        
        chartData.push({ name: label, value: 0 });
      }
    } else if (range === 'weekly') {
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0,0,0,0);
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' }); 
        chartData.push({ name: dayName, value: 0 });
      }
    } else if (range === 'monthly') {
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0,0,0,0);
      for (let i = 0; i < 30; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dayStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        chartData.push({ name: dayStr, value: 0 });
      }
    }

    const ordersInRange = await this.prisma.order.findMany({
      where: { 
        createdAt: { gte: startDate }, 
        status: { not: 'CANCELLED' } 
      },
    });

    ordersInRange.forEach(order => {
      const date = new Date(order.createdAt);
      let key = '';

      if (range === 'daily') {
        const h = date.getHours();
        // Eğer sipariş saati çalışma saatleri dışındaysa (örn: 07:00), grafiğe dahil edilmeyecek
        const startH = h.toString().padStart(2, '0') + '.00';
        const endH = ((h + 1) % 24).toString().padStart(2, '0') + '.00';
        key = `${startH}-${endH}`;
      } 
      else if (range === 'weekly') key = date.toLocaleDateString('tr-TR', { weekday: 'short' });
      else key = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

      const foundIndex = chartData.findIndex(c => c.name === key);
      if (foundIndex !== -1) chartData[foundIndex].value += Number(order.totalAmount);
    });

    const totalRevenue = ordersInRange.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const totalOrders = ordersInRange.length;
    const activeOrders = await this.prisma.order.count({ where: { status: { not: 'SERVED' } } });

    const topProductsRaw = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: startDate },
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

    return { totalRevenue, totalOrders, activeOrders, salesTrend: chartData, topProducts };
  }

  async resetData() {
    await this.prisma.orderItem.deleteMany({});
    await this.prisma.payment.deleteMany({});
    await this.prisma.order.deleteMany({});
    return { message: "Veritabanı temizlendi." };
  }
}