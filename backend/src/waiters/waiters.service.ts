import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WaitersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const waiters = await this.prisma.waiter.findMany({
      include: {
        orders: {
          where: { status: { not: 'SERVED' } },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Eğer hiç garson yoksa varsayılan garsonları oluştur
    if (waiters.length === 0) {
      await this.prisma.waiter.createMany({
        data: [
          { name: 'Garson 1', status: 'AVAILABLE' },
          { name: 'Garson 2', status: 'AVAILABLE' },
          { name: 'Garson 3', status: 'AVAILABLE' },
        ],
      });
      return this.prisma.waiter.findMany({
        include: {
          orders: {
            where: { status: { not: 'SERVED' } },
          },
        },
        orderBy: { name: 'asc' },
      });
    }

    return waiters;
  }

  async findOne(id: number) {
    return this.prisma.waiter.findUnique({
      where: { id },
      include: {
        orders: {
          include: { table: true, items: { include: { product: true } } },
        },
      },
    });
  }

  async create(name: string) {
    return this.prisma.waiter.create({
      data: { name },
    });
  }

  async updateStatus(id: number, status: 'AVAILABLE' | 'BUSY' | 'ON_BREAK') {
    return this.prisma.waiter.update({
      where: { id },
      data: { status },
    });
  }

  async getPerformance(waiterId: number, range: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const now = new Date();
    const startDate = new Date();

    if (range === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'weekly') {
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'monthly') {
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    }

    const orders = await this.prisma.order.findMany({
      where: {
        waiterId,
        status: 'SERVED',
        servedAt: { gte: startDate },
      },
      include: {
        table: true,
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    // Ortalama servis süresi hesapla
    const serviceTimes = orders
      .filter((o) => o.readyAt && o.servedAt)
      .map((o) => {
        const ready = new Date(o.readyAt!).getTime();
        const served = new Date(o.servedAt!).getTime();
        return (served - ready) / 1000 / 60; // dakika cinsinden
      });

    const avgServiceTime =
      serviceTimes.length > 0
        ? serviceTimes.reduce((sum, time) => sum + time, 0) / serviceTimes.length
        : 0;

    return {
      waiterId,
      totalOrders,
      totalRevenue,
      avgServiceTime: Math.round(avgServiceTime * 10) / 10,
      orders,
    };
  }

  async getAllPerformance(range: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const waiters = await this.findAll();
    const performances = await Promise.all(
      waiters.map((waiter) => this.getPerformance(waiter.id, range)),
    );

    return performances.sort((a, b) => b.totalOrders - a.totalOrders);
  }
}

