import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsMongoId } from "class-validator";

export class CreateTodoDto {

    // Judul atau nama tugas yang akan dikerjakan
    @ApiProperty({ example: 'Work', description: 'Nama tugas yang akan dikerjakan' })
    @IsString()
    @IsNotEmpty()
    title: string;

    // Catatan atau penjelasan detail mengenai tugas tersebut
    @ApiPropertyOptional({ example: 'Seperti biasa.', description: 'Isi deskripsi tugas yang akan dikerjakan' })
    @IsString()
    @IsOptional()
    description?: string;

    // Tingkat prioritas tugas 
    @ApiPropertyOptional({ example: 'High', description: 'Tingkat prioritas tugas yang akan dikerjakan' })
    @IsString()
    @IsOptional()
    priority?: string;

    // Tenggat waktu
    @ApiPropertyOptional({ type: String, format: 'date-time', example: '2026-10-31T23:59:59Z', description: 'Tenggat waktu penyelesaian tugas' })
    @IsDateString()
    @IsOptional()
    dueDate?: Date;

    // ID dari kolom tempat tugas ini diletakkan
    @ApiProperty({ example: '6ad847e1595b950be6d116f9', description: 'Id dari kolom tempat tugas diletakkan' })
    @IsString()
    @IsNotEmpty()
    columnId: string;

    // ID Grup jika tugas ini merupakan tugas kolaborasi
    @ApiPropertyOptional({  })
    @IsOptional()
    @IsMongoId()
    groupId?: string;
}