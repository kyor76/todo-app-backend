import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { privateDecrypt } from 'crypto';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configSertvice: ConfigService
    
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // mengambil token dari header request
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token tidak ditemukan! Silahkan login terlebih dahulu');
        }

        try {

            // memferifikasi apakah token asli dan belum kadaluarsa
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configSertvice.get<string>('JWT_SECRET') // membaca dari .env 
            });

            // jika bisa, kita tempelkan data user ke dalam request
            request['user'] = payload;
        } catch {
            throw new UnauthorizedException('Token tidak falid atau sudah kadaluarsa!');
        }
        return true;
    
    }

    // fungsi bantuan untuk mengekstrak token 
    private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}