import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches } from "class-validator";


export class ConfirmResetDto {

    @ApiProperty({ example: 'd913dde2777f1c34e25453f59243cdc0289a723dd4645efd6f0ffa72936efbc1', description: 'Token yang dibuat sistem' })
    @IsNotEmpty({ message: 'Token tidak boleh kosong'})
    @IsString()
    token: string;

    @ApiProperty({ example: '@Riko123-', description: 'Memaksa user agar menggunakan password kuat' })
    @IsNotEmpty({ message: 'Password baru tidak boleh kosong! '})
    @Matches(/^(?=.*\d)(?=.*[@$!%*?&\-_])[A-Za-z\d@$!%*?&\-_]{8,}$/, {
        message: 'Password minimal 8 karakter dan harus mendukung setidaknya satu angka dan satu karakter spesial (@$!%*?&-_).'
    })
    newPassword: string;

}