import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { PrismaService } from '../prisma.service'; // <--- 1. ADIM: Dosyayı içeri çağır (Import)

@Module({
  controllers: [TablesController],
  
  // 2. ADIM: Servislerin çalışması için buraya ekle
  providers: [TablesService, PrismaService], 
})
export class TablesModule {}