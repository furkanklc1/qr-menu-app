import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // CORS Configuration
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000'],
    credentials: true,
  }); 

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO'da tanımlı olmayan property'leri otomatik siler
      forbidNonWhitelisted: true, // DTO'da tanımlı olmayan property varsa hata verir
      transform: true, // Gelen verileri otomatik olarak DTO tipine dönüştürür
      transformOptions: {
        enableImplicitConversion: true, // String'leri number'a otomatik çevirir
      },
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 Backend server is running on http://localhost:${port}`);
}
bootstrap();