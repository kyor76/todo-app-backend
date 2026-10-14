import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema.js';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from '../columns/dto/register.dto.js';
import { ConfigService } from '@nestjs/config';
import { PassThrough } from 'stream';


@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    
  ) {}

  // 1. Fungsi bantuan pembuat password format DD-MM-YYYY
  private generateDatePassword(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    return `${day}-${month}-${year}`;
  }

  // 2. Fitur untuk registrasi
  async register(registerDto: RegisterDto) {
    const { email, username } = registerDto;
    
    const existingUser = await this.userModel.findOne({email});
    if (existingUser){
      throw new ConflictException('Email sudah terdaftar!');
    }

    // Generate password otomatis berupa tanggal hari ini
    const generatedPassword = this.generateDatePassword();

    // Enkripsi (hash) password otomatis tersebut
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      username,
    });

    await newUser.save();
    // untuk kirim email secara asinkron
    await this.sendWelcomeEmail(email, username, generatedPassword);

    // respon
    return{
      message: 'Registrasi berhasil! Password sementara telah dikirim ke email.',
      user:{
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
    }
  };
}

// 3. Fungsi Pengiriman Email menggunakan Nodemailer

private async sendWelcomeEmail(to: string, username: string, password:string) {
  try {

    // mengambil data dari .env menggunakan ConfigService NestJS
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPass = this.configService.get<string>('EMAIL_PASS');

    // untuk menegcek kalau .env kosong
    if (!emailUser || !emailPass){
      console.error('ERROR: Kredensial EMAIL_USER atau EMAIL_PASS di .env kosong/tidak terbaca!');
        return;
    }


    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth:{
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: `"Admin Kanban" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Selamat Datang! Informasi Akun & Password Anda',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Halo, ${username}!</h2>
            <p>Terima kasih telah mendaftar di Aplikasi Kanban To-Do kami.</p>
            <p>Akun Anda telah berhasil dibuat. Berikut adalah informasi login Anda:</p>
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
              <p><b>Email:</b> ${to}</p>
              <p><b>Password Sementara:</b> <span style="color: #d9534f; font-size: 18px; font-weight: bold;">${password}</span></p>
            </div>
            <p>Silakan login menggunakan password di atas. Kami sangat menyarankan Anda untuk segera mengubah password ini melalui pengaturan akun nantinya.</p>
          </div>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email berhasil terkirim ke ${to} (MessageID: ${info.messageId})`);
    } catch (error){
      console.error('Gagal mengirim email pendaftaran:', error);
    }
  }


  // 4. fitur untuk login
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

  // 5. Fitur untuk Update Foto Profil
  async updateProfilePicture(userId: string, filename: string){
    const updateUser = await this.userModel.findByIdAndUpdate(
      userId,
      {profilePicture: filename},
      {returnDocument: 'after'}
    );

    if (!updateUser){
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return {
      message: 'Foto profil berhasil diperbarui!',
      profilePicture: updateUser.profilePicture,

      // URL yang dipakai di tag <img> frontend
      url: `http://localhost:3000/uploads/profiles/${filename}`

    };
  }
}