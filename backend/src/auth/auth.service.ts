import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    // Admin kullanıcı bilgileri environment variable'dan alınacak
    const adminUsername = this.configService.get<string>('ADMIN_USERNAME', 'admin');
    const adminPasswordHash = this.configService.get<string>('ADMIN_PASSWORD_HASH');

    if (username !== adminUsername) {
      return null;
    }

    // Eğer hash yoksa, default şifreyi kontrol et (ilk kurulum için)
    if (!adminPasswordHash) {
      // İlk kurulumda default şifre: boss123
      if (password === 'boss123') {
        // Şifreyi hash'le ve environment variable'a ekle
        const hash = await bcrypt.hash(password, 10);
        console.warn('⚠️  İLK KURULUM: Lütfen ADMIN_PASSWORD_HASH environment variable\'ını .env dosyasına ekleyin:');
        console.warn(`ADMIN_PASSWORD_HASH=${hash}`);
        return { id: 1, username: adminUsername, role: 'admin' };
      }
      return null;
    }

    // Hash'lenmiş şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, adminPasswordHash);
    if (!isPasswordValid) {
      return null;
    }

    return { id: 1, username: adminUsername, role: 'admin' };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Hatalı kullanıcı adı veya şifre');
    }

    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Geçersiz token');
    }
  }
}

