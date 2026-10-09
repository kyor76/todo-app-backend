import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Column } from './columns.schema.js';

@Injectable()
export class ColumnsService {

    constructor(@InjectModel(Column.name) private columnModel: Model<Column>) {}
     async create(name: string, userId: string, order: number) {
        const newColumn = new this.columnModel({ name, userId, order });
        return await newColumn.save();
     }

     async findAll(userId: string) {
        return await this.columnModel.find({ userId }). sort({ order: 1}).exec();

     }

     async update(id: string, userId: string, updateData: any){
        return await this.columnModel.findOneAndUpdate(
            { _id: id, userId: userId},
            updateData,
            { new: true }
        ).exec();
     }

     async delete(id: string, userId: string){
        return await this.columnModel.findOneAndDelete({ _id: id, userId: userId }).exec();
     }
}
