import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCommentDto{

    // Isi teks atau pesan komentar yang akan ditambahkan pada sebuah tugas (Todo)
    @ApiProperty({ example: 'tugas ui/ux sudah selesai', description: 'Komentar yang dibuat user didalam todo group' })
    @IsNotEmpty()
    @IsString()
    content: string;
}