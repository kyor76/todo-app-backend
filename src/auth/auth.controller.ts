import { Controller, Post, Put, Body, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { LoginDto } from './dto/login.dto.js';
import { ConfirmResetDto } from './dto/confirm-reset.dto.js';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // Mendaftarkan pengguna baru
    @ApiOperation({ summary: 'Mendaftarkan pengguna baru' })
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {

        return this.authService.register(registerDto);
    }

    // Proses login pengguna dan pengembalian token JWT
    @ApiOperation({ summary: 'Proses login pengguna dan mendapatkan token' })
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

    // Meminta tautan atau token reset password ke email
    @ApiOperation({ summary: 'Meminta tautan token reset password ke email' })
    @ApiBody({
        schema: { 
            type: 'object', 
            properties: { 
                email: { type: 'string', example: 'user@email.com' } 
            },
            required: ['email'] 
        }
    })
    @Post('reset-password')
    async resetPassword(@Body('email') email: string){
        if (!email){
            throw new BadRequestException('Kolom email tidak boleh kosong!');
        }
        return this.authService.resetPassword(email);
    }

    // Mengonfirmasi dan mengubah password menggunakan token
    @ApiOperation({summary: 'Mengonfirmasi dan mengubah password menggunakan token'})
    @Post('confirm-reset')
    async confirmResetPassword(@Body() confirmResetDto: ConfirmResetDto) {
        return this.authService.confirmResetPassword(confirmResetDto.token, confirmResetDto.newPassword);
    }

    // Rute untuk upload foto profil
    @ApiBearerAuth()
    @ApiOperation({summary: 'Upload foto profil (Maks 2MB, JPG/PNG)'})
    @ApiConsumes('multipart/form-data')
    @ApiBody({schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } }})
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
        }),
        // Membatasi ukuran file maksimal 2 MB
        limits: {
            fileSize: 2 * 1024 * 1024, 
        },
        // Memfilter hanya file berekstensi/mimetype gambar yang diizinkan masuk
        fileFilter: (req: any, file, cb) => {
            if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                cb(null, true); // File diizinkan
            } else {
                cb(new BadRequestException('Format file ditolak! Hanya izinkan JPG/PNG.'), false); // File ditolak
            }
        }
    }))
    uploadAvatar(
        @Request() req: any, 
        @UploadedFile() file: Express.Multer.File,
    ){
        // Validasi kalau user menekan 'Send' tanpa memasukkan file sama sekali
        if (!file) {
            throw new BadRequestException('File gambar tidak ditemukan!');
        }
        const userId = req.user.sub || req.user.id || req.user._id;
        return this.authService.updateProfilePicture(userId, file.filename);
    }

    // Rute PUT khusus untuk update teks profil username
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mengubah username profil' })
    @ApiBody({
        schema: { 
            type: 'object', 
            properties: { 
                username: { type: 'string', example: 'RikoBaru' } 
            },
            required: ['username'] // <-- Wajib diubah menjadi username
        }
    })
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