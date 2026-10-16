import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Mengambil token dari header request (Authorization: Bearer <token>)
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token tidak ditemukan! Silakan login terlebih dahulu.');
    }

    try {
      // Memverifikasi validitas dan masa berlaku token menggunakan secret key dari .env
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Menyematkan payload data pengguna ke dalam objek request agar dapat diakses oleh endpoint
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token tidak valid atau sudah kedaluwarsa!');
    }
    
    return true;
  }

  // Fungsi bantuan untuk memisahkan token JWT dari prefix 'Bearer'
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}