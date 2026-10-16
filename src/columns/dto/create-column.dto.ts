import { IsNotEmpty, IsNumber, IsOptional, IsString, IsMongoId } from "class-validator";

export class CreateColumnDto {

    // nama kolom
    @IsString()
    @IsNotEmpty()
    name: string;

    // urutan posisi kolom pada kanban
    @IsNumber()
    @IsOptional()
    order?: number;

    // ID Grup jika kolom ini spesifik untuk grup tertentu (kosongkan untuk personal)
    @IsOptional()
    @IsMongoId()
    groupId: string;

    // Kode warna untuk kustomisasi tampilan kolom di frontend (UI)
    @IsOptional()
    @IsString()
    color?: string;
}