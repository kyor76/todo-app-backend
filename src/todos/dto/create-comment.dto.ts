import { IsNotEmpty, IsString } from "class-validator";

export class CreateCommentDto{

    // Isi teks atau pesan komentar yang akan ditambahkan pada sebuah tugas (Todo)
    @IsNotEmpty()
    @IsString()
    content: string;
}