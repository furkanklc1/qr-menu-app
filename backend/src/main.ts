// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // API Prefix (Tüm endpointler /api ile başlar: /api/products)
  app.setGlobalPrefix('api'); 

  // CORS Configuration
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
  
  app.enableCors({
    origin: (origin, callback) => {
      // Postman veya Server-to-Server istekleri için origin undefined olabilir, izin veriyoruz.
      if (!origin || origin === frontendUrl || origin === 'http://localhost:3000') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true, 
      transform: true, 
      transformOptions: {
        enableImplicitConversion: true, 
      },
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 Backend server is running on http://localhost:${port}/api`);
}
bootstrap();