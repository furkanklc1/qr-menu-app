import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Kullanıcı adı boş olamaz' })
  @IsString({ message: 'Kullanıcı adı string olmalıdır' })
  username: string;

  @IsNotEmpty({ message: 'Şifre boş olamaz' })
  @IsString({ message: 'Şifre string olmalıdır' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  password: string;
}

