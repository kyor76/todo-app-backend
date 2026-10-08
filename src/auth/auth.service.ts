import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema.js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService
    ) {}

    // Fitur untuk registrasi
    async register(email: string, pass: string): Promise<User> {
        const existingUser = await this.userModel.findOne({ email }).exec();
        if (existingUser) {
            throw new ConflictException('Email sudah terdaftar!');
        }

    // untuk mengacak password menggunakan bcrypt
    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUser = new this.userModel({ email, password: hashedPassword });
    return newUser.save();
    }

    // fitur untuk login
    async login(email: string, pass: string ): Promise<{access_token: string }> {
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            throw new UnauthorizedException('Email tidak ditemukan');
        }

        // mencocokkan teks password dengan password random di database
        const isPasswordValid = await bcrypt.compare(pass, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Password salah');
        }

        // buat jwt token kalo login berhasil
        const playload = { sub: user._id, email: user.email };
        return {
            access_token: await this.jwtService.signAsync(playload),
        };
    }
}