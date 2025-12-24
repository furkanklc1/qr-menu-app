import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    ConfigModule, // (AppModule'da isGlobal:true yaptıysan şart değil ama kalsın)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>(
          'JWT_SECRET',
          'your-secret-key-change-in-production',
        );

        // ✅ expiresIn artık number (saniye)
        // .env: JWT_EXPIRES_IN_SECONDS=86400 gibi kullan
        const expiresInSeconds = Number(
          configService.get<string>('JWT_EXPIRES_IN_SECONDS', '86400'),
        );

        return {
          secret,
          signOptions: { expiresIn: expiresInSeconds },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
