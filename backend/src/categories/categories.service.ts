import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Kategori Ekleme
  create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  // Tüm Kategorileri Getirme
  findAll() {
    return this.prisma.category.findMany({
      orderBy: { id: 'asc' }, // ID sırasına göre getir
    });
  }

  // Diğerleri şimdilik boş kalabilir veya silebilirsin
  findOne(id: number) { return `This action returns a #${id} category`; }
  update(id: number, updateCategoryDto: any) { return `This action updates a #${id} category`; }
  remove(id: number) { return `This action removes a #${id} category`; }
}