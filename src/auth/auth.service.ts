import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema.js';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto.js';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    
  ) {}

  // 1. Fungsi pembuat password otomatis format DD-MM-YYYY
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

    // Generate token reset password langsung saat registrasi
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 24);

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      username,
      resetPasswordToken: resetToken,
      resetPasswordExpires: expireDate,
    });

    await newUser.save();
    // untuk kirim email secara asinkron
    await this.sendWelcomeEmail(email, username, generatedPassword, resetToken);

    return {
      message: 'Registrasi berhasil! Password sementara dan tombol pengaturan password telah dikirim ke email.',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      }
    };
  }

// 3. Fungsi Pengiriman Email Welcome dengan Tombol Reset
  private async sendWelcomeEmail(to: string, username: string, password: string, resetToken: string) {
    try {
      const emailUser = this.configService.get<string>('EMAIL_USER');
      const emailPass = this.configService.get<string>('EMAIL_PASS');

      if (!emailUser || !emailPass){
        console.error('ERROR: Kredensial EMAIL_USER atau EMAIL_PASS di .env kosong/tidak terbaca!');
        return;
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      // Menggunakan parameter 'resetToken' yang dikirim dari fungsi register
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      const resetLink = `${frontendUrl}/auth/confirm-reset?token=${resetToken}`;

      const mailOptions = {
        from: `"Admin Kanban" <${emailUser}>`,
        to: to,
        subject: 'Selamat Datang! Informasi Akun & Pengaturan Password',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #333;">Halo, ${username}! 🎉</h2>
            <p>Terima kasih telah mendaftar di Aplikasi Kanban To-Do kami.</p>
            <p>Akun Anda telah berhasil dibuat. Secara default, sistem telah membuatkan password sementara untuk Anda:</p>
            
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 0;"><b>Email:</b> ${to}</p>
              <p style="margin: 5px 0 0 0;"><b>Password Sementara:</b> <span style="color: #d9534f; font-size: 18px; font-weight: bold;">${password}</span></p>
            </div>
            
            <p>Untuk keamanan maksimal, <b>kami sangat menyarankan Anda untuk segera mengubah password sementara tersebut.</b> Klik tombol di bawah ini untuk membuat password baru Anda:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Ubah Password Sekarang</a>
            </div>
            
            <p style="font-size: 12px; color: #777; line-height: 1.5;">* Tombol ubah password ini berlaku selama 24 jam ke depan. Jika Anda melewati batas waktu tersebut, Anda tetap bisa login menggunakan password sementara dan mengubahnya nanti di dalam aplikasi.</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Email berhasil terkirim ke ${to} (MessageID: ${info.messageId})`);
    } catch (error) {
      console.error('Gagal mengirim email pendaftaran:', error);
    }
  }


  // 4. Login mengembalikan URL foto yang dinamis dari .env
  async login(email: string, pass: string) {
      const user = await this.userModel.findOne({ email });
      if (!user) { throw new UnauthorizedException('Email tidak terdaftar!'); }

      const isMatch = await bcrypt.compare(pass, user.password);
      if (!isMatch) { throw new UnauthorizedException('Password salah!'); }

      // Ambil API_URL dari env (fallback ke localhost jika tidak ada)
      const apiUrl = this.configService.get<string>('API_URL') || 'http://localhost:3000';

      const payload = { username: user.username, sub: user._id };
      return {
        message: 'Login berhasil!',
        access_token: this.jwtService.sign(payload),
        username: user.username,
        profilePicture: user.profilePicture ? `${apiUrl}/uploads/profiles/${user.profilePicture}` : '',
        isUsingTemporaryPassword: user.isUsingTemporaryPassword,
      };
    }
    
  // 5. Fungsi untuk update foto, URL dinamis.
  async updateProfilePicture(userId: string, filename: string){
    const updateUser = await this.userModel.findByIdAndUpdate(
      userId,
      { profilePicture: filename },
      { returnDocument: 'after' }
    ).exec();

    if (!updateUser){
      throw new UnauthorizedException('User tidak ditemukan');
    }

    const apiUrl = this.configService.get<string>('API_URL') || 'http://localhost:3000';

    return {
      message: 'Foto profil berhasil diperbarui!',
      profilePicture: updateUser.profilePicture,
      url: `${apiUrl}/uploads/profiles/${filename}`
    };
  }

  // 6. fungsi untuk update username 
  async updateProfile(userId: string, newUsername: string) {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { username: newUsername },
      { returnDocument: 'after' },
    ).exec();

    if (!updatedUser) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return {
      message: 'Profil berhasil diperbarui!',
      username: updatedUser.username,
    };
  }

  // 7. Link Reset Password di email menggunakan variabel FRONTEND_URL
  private async sendResetEmailLink(to: string, username: string, resetToken: string) {
    try {
      const emailUser = this.configService.get<string>('EMAIL_USER');
      const emailPass = this.configService.get<string>('EMAIL_PASS');
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: emailUser, pass: emailPass },
      });
      const resetLink = `${frontendUrl}/auth/confirm-reset?token=${resetToken}`;

      const mailOptions = {
        from: `"Admin Kanban" <${emailUser}>`,
        to: to,
        subject: 'Permintaan Reset Password Akun Anda',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Halo, ${username}!</h2>
            <p>Silakan klik link di bawah ini untuk membuat password baru. Link berlaku <strong>1 jam</strong>.</p>
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; word-wrap: break-word; text-align: center;">
              <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Ubah Password Sekarang</a>
            </div>
            <p>Jika Anda tidak pernah meminta reset password, abaikan email ini.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Gagal mengirim email link reset password:', error);
    }
  }

  // 8. Fitur Request Reset Password (Menghasilkan Token)
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

  // 9. Fitur Konfirmasi Reset Password (Input Password Baru)
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
    user.isUsingTemporaryPassword = false;
    await user.save();

    return {
      message: 'Password Anda berhasil diubah! Silakan login dengan password baru Anda.'
    };
  }

}