import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";


export class LoginDto {

    @ApiProperty({ example: 'riko123@gmail.com', description: 'Email user yang  terdaftar'})
    @IsEmail({}, { message: 'Format email tidak falid!' })
    @IsNotEmpty({ message: 'Emalin tidak boleh kosong'})
    email: string;

    @ApiProperty({ example: 'Riko-123-', description: 'Password yang user daftarkan' })
    @IsString()
    @IsNotEmpty({ message: 'Password tidak boleh kosong! '})
    password: string;

}