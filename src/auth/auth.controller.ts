import { Controller, Post, Put, Body, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from '../columns/dto/register.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // Mendaftarkan pengguna baru
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {

        return this.authService.register(registerDto);
    }

    // Proses login pengguna dan pengembalian token JWT
    @Post('login')
  async login(@Body() body: any) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email dan password tidak boleh kosong!');
    }
    return this.authService.login(body.email, body.password);
  }

    // Meminta tautan atau token reset password ke email
    @Post('reset-password')
    async resetPassword(@Body('email') email: string){
        if (!email){
            throw new BadRequestException('Kolom email tidak boleh kosong!');
        }
        return this.authService.resetPassword(email);
    }

    // Mengonfirmasi dan mengubah password menggunakan token
    @Post('confirm-reset')
    async confirmResetPassword(@Body() body: { token: string; newPassword: string }) {
        if (!body.token || !body.newPassword) {
        throw new BadRequestException('Token dan Password Baru tidak boleh kosong!');
        }
        return this.authService.confirmResetPassword(body.token, body.newPassword);
    }

    // Rute untuk upload foto profil
    @UseGuards(JwtAuthGuard)
    @Post('profile/upload')
    @UseInterceptors(FileInterceptor('file',{
        storage: diskStorage({
            destination: 'uploads/profiles', // pastikan tanpa titik di depan agar seragam dengan serve-static
            filename: (req: any, file, cb) => {
                const userId = req.user.sub || req.user.id || req.user._id;
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                cb(null, `avatar-${userId}-${uniqueSuffix}${ext}`);
            }
        })
    }))
    uploadAvatar(
        @Request() req: any, 
        @UploadedFile() file: Express.Multer.File,
    ){
        const userId = req.user.sub || req.user.id || req.user._id;
        return this.authService.updateProfilePicture(userId, file.filename);
    }

    // Rute PUT khusus untuk update teks profil username
    @UseGuards(JwtAuthGuard)
    @Put('profile')
    async updateProfile(
        @Request() req: any,
        @Body('username') newUsername: string,
    ) {
        if (!newUsername || newUsername.trim() === '') {
            throw new BadRequestException('Username tidak boleh kosong!');
        }
        const userId = req.user.sub || req.user.id || req.user._id;
        return this.authService.updateProfile(userId, newUsername);
    }
}