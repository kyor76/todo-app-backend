import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsMongoId } from "class-validator";

export class CreateColumnDto {

    // nama kolom
    @ApiProperty({ example: 'To Do', description: 'Nama kolom untuk papan kanban'})
    @IsString()
    @IsNotEmpty()
    name: string;

    // urutan posisi kolom pada kanban
    @ApiPropertyOptional({ example: 1, description: 'Urutan posisi kolom (opsional)'})
    @IsNumber()
    @IsOptional()
    order?: number;

    // ID Grup jika kolom ini spesifik untuk grup
    //  tertentu (kosongkan untuk personal)
    @ApiPropertyOptional({ example: '6ad84788595b950be6d116f8', description: 'ID Grup jika kolom khusus grup (kosong untuk personal)'})
    @IsOptional()
    @IsMongoId()
    groupId: string;

    // Kode warna untuk kustomisasi tampilan kolom di frontend (UI)
    @ApiPropertyOptional({ example: '#a0a0a0', description: 'Kode warna hex untuk kustom UI'})
    @IsOptional()
    @IsString()
    color?: string;
}