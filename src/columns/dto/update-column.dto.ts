import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateColumnDto {
  // Nama kolom baru jika pengguna ingin mengubah namanya
  @IsString()
  @IsOptional()
  name?: string;

  // Perubahan posisi atau urutan kolom pada papan Kanban
  @IsNumber()
  @IsOptional()
  order?: number;

  // Perubahan kode warna untuk kustomisasi tampilan kolom
  @IsString()
  @IsOptional()
  color?: string;
}