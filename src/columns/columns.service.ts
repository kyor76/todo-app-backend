import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Column } from './columns.schema.js';
import { CreateColumnDto } from './dto/create-column.dto.js'; // Jangan lupa import DTO

@Injectable()
export class ColumnsService {
  constructor(@InjectModel(Column.name) private columnModel: Model<Column>) {}

  // Ubah parameter menjadi menerima DTO dan userId
  async create(createColumnDto: CreateColumnDto, userId: string) {
    const { name, order, groupId } = createColumnDto;
    const newColumn = new this.columnModel({
      name,
      userId, // Pastikan userId ini tidak undefined
      order: order || 0,
      groupId,
    });
    return await newColumn.save();
  }

  async findAll(userId: string) {
    return await this.columnModel.find({ 
      userId: userId,
      groupId: { $exists: false } 
    }).sort({ order: 1 }).exec();
  }

  async getColumnsByGroup(groupId: string){
    return this.columnModel.find({ groupId }).sort ({ order: 1 }).exec();
  }

  async update(id: string, userId: string, updateData: any) {
    return await this.columnModel
      .findOneAndUpdate({ _id: id, userId: userId }, updateData, { new: true })
      .exec();
  }

  async delete(id: string, userId: string) {
    return await this.columnModel
      .findOneAndDelete({ _id: id, userId: userId })
      .exec();
  }

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