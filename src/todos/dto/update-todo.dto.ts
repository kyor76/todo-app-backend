import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString, IsBoolean } from "class-validator";

export class UpdateTodoDto {

    @ApiProperty({ example: 'New Work', description: 'Nama tugas baru yang akan dikerjakan' })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({ example: 'deskripsi baru.', description: 'Isi deskripsi baru dari tugas yang akan dikerjakan' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 'Low', description: 'Tingkat prioritas baru dari tugas yang akan dikerjakan' })
    @IsString()
    @IsOptional()
    priority?: string;

    @ApiPropertyOptional({ example: '2026-10-31T23:59:59Z', description: 'Tenggat waktu tugas' })
    @IsDateString()
    @IsOptional()
    dueDate?: Date;

    @ApiPropertyOptional({ example: '6ad847e1595b950be6d116f9', description: 'ID kolom baru jika tugas dipindahkan' })
    @IsString()
    @IsOptional()
    columnId?: string;

    @ApiPropertyOptional({ type: Boolean, example: true, default: false, description: 'Status penyelesaian task (true kalau sudah selesai)' })
    @IsBoolean()
    @IsOptional()
    isCompleted?: boolean;
}