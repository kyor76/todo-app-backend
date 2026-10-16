import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema.js';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from '../columns/dto/register.dto.js';
import { ConfigService } from '@nestjs/config';
import { PassThrough } from 'stream';
import { from } from 'rxjs';


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
  async login(email: string, pass: string) {
      // untuk Cari user berdasarkan email
      const user = await this.userModel.findOne({ email });
      
      // untuk Proteksi jika user tidak ditemukan (Ini yang mencegah error 'undefined' tadi!)
      if (!user) {
        throw new UnauthorizedException('Email tidak terdaftar!');
      }

      // untuk Cek kecocokan password
      const isMatch = await bcrypt.compare(pass, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Password salah!');
      }

      // untuk Buat JWT Token jika semua aman
      const payload = { username: user.username, sub: user._id };
      return {
        access_token: this.jwtService.sign(payload),
        message: 'Login berhasil!'
      };
    }
    
  // 5. Fitur untuk Update Foto Profil
  async updateProfilePicture(userId: string, filename: string, newUsername?: string){
    const updateData: any = { profilePicture: filename };
    if (newUsername){
      updateData.username = newUsername;
    }

    const updateUser = await this.userModel.findByIdAndUpdate(
      userId,
      updateData,
      {returnDocument: 'after'}
    ).exec();

    if (!updateUser){
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return {
      message: 'Foto profil berhasil diperbarui!',
      profilePicture: updateUser.profilePicture,
      username: updateUser.username,

      // URL yang dipakai di tag <img> frontend
      url: `http://localhost:3000/uploads/profiles/${filename}`

    };
  }

  // 6. Fungsi Pengiriman Email Link Reset Password
  private async sendResetEmailLink(to: string, username: string, resetToken: string) {
    try {
      const emailUser = this.configService.get<string>('EMAIL_USER');
      const emailPass = this.configService.get<string>('EMAIL_PASS');

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
      const resetLink = `http://localhost:3000/auth/confirm-reset?token=${resetToken}`;

      const mailOptions = {
        from: `"Admin Kanban" <${emailUser}>`,
        to: to,
        subject: 'Permintaan Reset Password Akun Anda',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Halo, ${username}!</h2>
            <p>Kami menerima permintaan untuk melakukan reset password pada akun Kanban To-Do Anda.</p>
            <p>Silakan klik link atau salin URL di bawah ini untuk membuat password baru. Link ini hanya berlaku selama <strong>1 jam</strong>.</p>
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; word-wrap: break-word;">
              <a href="${resetLink}" style="color: #007bff; font-weight: bold; text-decoration: none;">${resetLink}</a>
            </div>
            <p>Jika Anda tidak pernah meminta reset password, abaikan email ini dan akun Anda akan tetap aman.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email Link Reset Password berhasil dikirim ke ${to}`);
    } catch (error) {
      console.error('Gagal mengirim email link reset password:', error);
    }
  }

  // 7. Fitur Request Reset Password (Menghasilkan Token)
  async resetPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('Email tidak terdaftar di sistem kami!');
    }

    // Buat token unik acak sepanjang 32 karakter
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set waktu kedaluwarsa token (1 jam dari sekarang)
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 1);

    // Simpan token dan batas waktu ke database user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expireDate;
    await user.save(); 

    // Kirim email berisi link token
    await this.sendResetEmailLink(user.email, user.username, resetToken);

    return {
      message: 'Link reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam.'
    };
  }

  // 8. Fitur Konfirmasi Reset Password (Input Password Baru)
  async confirmResetPassword(token: string, newPassword: string) {
    // Cari user berdasarkan token yang cocok DAN waktunya belum expired
    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, //$gt = greater than (sekarang belum melebihi batas expire)
    });

    if (!user) {
      throw new UnauthorizedException('Token reset password tidak valid atau sudah kedaluwarsa!');
    }

    // Hash password baru yang dikirimkan user
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password, dan HAPUS token agar tidak bisa dipakai 2 kali
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return {
      message: 'Password Anda berhasil diubah! Silakan login dengan password baru Anda.'
    };
  }

}