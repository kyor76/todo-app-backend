import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Column } from './columns.schema.js';
import { CreateColumnDto } from './dto/create-column.dto.js';

@Injectable()
export class ColumnsService {
  constructor(@InjectModel(Column.name) private columnModel: Model<Column>) {}

  // Membuat kolom baru untuk pengguna (personal) atau grup
  async create(createColumnDto: CreateColumnDto, userId: string) {
    const { name, order, groupId } = createColumnDto;
    const newColumn = new this.columnModel({
      name,
      userId, 
      order: order || 0,
      groupId,
    });
    return await newColumn.save();
  }

  // Mengambil daftar kolom personal pengguna (tidak terikat grup) dan diurutkan
  async findAll(userId: string) {
    return await this.columnModel.find({ 
      userId: userId,
      groupId: { $exists: false } 
    }).sort({ order: 1 }).exec();
  }

  // Mengambil daftar kolom khusus untuk sebuah grup dan diurutkan
  async getColumnsByGroup(groupId: string){
    return this.columnModel.find({ groupId }).sort ({ order: 1 }).exec();
  }

  // Memperbarui informasi kolom (seperti mengganti nama)
  async update(id: string, userId: string, updateData: any) {
    const updateColumn = await this.columnModel.findOneAndUpdate({
      _id: id,
      userId: userId,}, 
      updateData, { returnDocument: 'after' }
    ).exec();
    if (!updateColumn){
      throw new NotFoundException('Kolom tidak ditemukan atau Anda tidak memiliki akses!');
    }
    return updateColumn;
  }

  // Menghapus kolom secara permanen dari database
  async delete(id: string, userId: string) {
    return await this.columnModel
      .findOneAndDelete({ _id: id, userId: userId })
      .exec();
  }

  // Memperbarui posisi urutan (order) kolom pada papan Kanban
  async updateOrder(id: string, order: number) {
    const updatedColumn = await this.columnModel
      .findByIdAndUpdate(id, { order }, { new: true })
      .exec();
    if (!updatedColumn) {
      throw new NotFoundException('Column tidak ditemukan');
    }
    return { message: 'Urutan berhasil diperbarui', updatedColumn };
  }
}