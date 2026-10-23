import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  // Nama panggilan atau identitas pengguna yang akan ditampilkan di aplikasi
  @ApiProperty({ example: 'Riko', description: 'Username yang di input user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  // Alamat email yang valid dan unik untuk keperluan akses login
  @ApiProperty({ example: 'riko123@gmail.com', description: 'Email yang di input user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}