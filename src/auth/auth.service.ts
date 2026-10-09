import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema.js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from '../columns/dto/register.dto.js';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService
    ) {}

    // Fitur untuk registrasi
    async register(registerDto: RegisterDto) {
        const { email, password, username } = registerDto;
        // untuk encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new this.userModel ({
            email,
            password: hashedPassword,
            username,
        });

        return await newUser.save();
    }


    // fitur untuk login
    async login( user: any ) {
        const payload = {
            sub: user._id,
            email:user.email,
            username: user.username,
        };
         return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
         };
        }
    }
