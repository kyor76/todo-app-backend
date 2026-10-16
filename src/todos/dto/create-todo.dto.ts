import { IsDateString, IsNotEmpty, IsOptional, IsString, IsMongoId } from "class-validator";

export class CreateTodoDto {

    // Judul atau nama tugas yang akan dikerjakan
    @IsString()
    @IsNotEmpty()
    title: string;

    // Catatan atau penjelasan detail mengenai tugas tersebut
    @IsString()
    @IsOptional()
    description?: string;

    // Tingkat prioritas tugas 
    @IsString()
    @IsOptional()
    priority?: string;

    // Tenggat waktu
    @IsDateString()
    @IsOptional()
    dueDate?: Date;

    // ID dari kolom tempat tugas ini diletakkan
    @IsString()
    @IsNotEmpty()
    columnId: string;

    // ID Grup jika tugas ini merupakan tugas kolaborasi
    @IsOptional()
    @IsMongoId()
    groupId?: string;
}