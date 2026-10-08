import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    async register(@Body('email') email: string, @Body('password') pass: string) {
        return this.authService.register(email, pass);
    }

    @Post('login')
    async login(@Body('email') email: string, @Body('password') pass: string) {
        return this.authService.login(email, pass); 
    }
}