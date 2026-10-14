import { Controller, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from '../columns/dto/register.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {

        return this.authService.register(registerDto);
    }

    @Post('login')
  async login(@Body() body: any) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email dan password tidak boleh kosong!');
    }
    return this.authService.login(body.email, body.password);
  }

    @Post('reset-password')
    async resetPassword(@Body('email') email: string){
        if (!email){
            throw new BadRequestException('Kolom email tidak boleh kosong!');
        }
        return this.authService.resetPassword(email);
    }

    @Post('confirm-reset')
    async confirmResetPassword(@Body() body: { token: string; newPassword: string }) {
        if (!body.token || !body.newPassword) {
        throw new BadRequestException('Token dan Password Baru tidak boleh kosong!');
        }
        return this.authService.confirmResetPassword(body.token, body.newPassword);
    }

    @UseGuards(JwtAuthGuard)
    @Post('profile/upload')
    @UseInterceptors(FileInterceptor('file',{
        storage: diskStorage({
            destination: '.uploads/profiles',
            filename: (req: any, file, cb) => {

                // Ambil ID user untuk dijadikan nama file agar tidak bentrok
                const userId = req.user.sub || req.user.id || req.user._id;

                //Buat nama file unik: avatar-idUser-angkaRandom.ekstensi
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);

                cb(null, `avatar-${userId}-${uniqueSuffix}${ext}`);

            }
        })
    }))
    uploadAvatar(@Request() req: any, @UploadedFile() file: Express.Multer.File){

        // mengambil id dari token jwt
        const userId = req.user.sub || req.user.id || req.user._id;

        // mengirim id dan nama file yg baru dibuat ke AuthService
        return this.authService.updateProfilePicture(userId, file.filename);
    }
}