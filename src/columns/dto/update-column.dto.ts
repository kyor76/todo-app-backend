import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateColumnDto {
  // Nama kolom baru jika pengguna ingin mengubah namanya
  @ApiProperty({ example: 'Nama Baru', description: 'Nama kolom untuk papan kanban'})
  @IsString()
  @IsOptional()
  name?: string;

  // Perubahan posisi atau urutan kolom pada papan Kanban
  @ApiPropertyOptional({ example: 2, description: 'Urutan posisi kolom (opsional)'})
  @IsNumber()
  @IsOptional()
  order?: number;

  // Perubahan kode warna untuk kustomisasi tampilan kolom
  @ApiPropertyOptional({ example: '#ff0000', description: 'Kode warna heksadesimal untuk kustomisasi UI' })
  @IsString()
  @IsOptional()
  color?: string;
}