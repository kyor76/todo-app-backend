import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  // Nama panggilan atau identitas pengguna yang akan ditampilkan di aplikasi
  @IsString()
  @IsNotEmpty()
  username: string;

  // Alamat email yang valid dan unik untuk keperluan akses login
  @IsEmail()
  @IsNotEmpty()
  email: string;
}