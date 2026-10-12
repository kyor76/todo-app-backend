import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
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
    private jwtService: JwtService,
  ) {}

  // Fitur untuk registrasi
  async register(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;
    // untuk encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      username,
    });

    return await newUser.save();
  }

  // fitur untuk login
  async login(user: any) {
    // Ambil ID dari objek user yang ada
    let rawId =
      user?._id || user?.id || (user?.toObject ? user.toObject()._id : null);

    // Jika _id masih tidak ada tapi email tersedia, cari langsung ke database untuk memastikan ID-nya didapat
    if (!rawId && user?.email) {
      const dbUser = await this.userModel.findOne({ email: user.email }).exec();
      if (dbUser) {
        rawId = dbUser._id;
      }
    }

    const userId = rawId ? rawId.toString() : null;

    const payload = {
      email: user?.email,
      sub: userId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      username: user.username,
      email: user.email,
    };
  }
}