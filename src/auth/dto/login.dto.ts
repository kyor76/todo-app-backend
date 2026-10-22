import { IsEmail, IsNotEmpty, IsString } from "class-validator";


export class loginDto {

    @IsEmail({}, { message: 'Format email tidak falid!' })
    @IsNotEmpty({ message: 'Emalin tidak boleh kosong'})
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Password tidak boleh kosong! '})
    password: string;

}