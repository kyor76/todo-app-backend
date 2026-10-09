import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from '../columns/dto/register.dto.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {

        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() body: any) {
        return this.authService.login(body); 
    }
}