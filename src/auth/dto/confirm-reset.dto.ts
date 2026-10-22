import { IsNotEmpty, IsString, Matches } from "class-validator";


export class ConfirmResetDto {
    @IsNotEmpty({ message: 'Token tidak boleh kosong'})
    @IsString()
    token: string;

    @IsNotEmpty({ message: 'Password baru tidak boleh kosong! '})
    @Matches(/^(?=.*\d)(?=.*[@$!%*?&\-_])[A-Za-z\d@$!%*?&\-_]{8,}$/, {
        message: 'Password minimal 8 karakter dan harus mendukung setidaknya satu angka dan satu karakter spesial (@$!%*?&-_).'
    })
    newPassword: string;

}