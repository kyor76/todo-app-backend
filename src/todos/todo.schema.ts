import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, Types } from 'mongoose';

@Schema({ timestamps: true })  // timestamps akan otomatis buat createdAt dan updatedAt
export class Todo extends Document {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId; // sbg penghubung ke koleksi user

    @Prop({ type: Types.ObjectId, ref: 'Column', required: true })
    columnId: Types.ObjectId;

    // tugas wajib ada judul
    @Prop({ required: true})
    title: string;

    // bagian deskripsi tugas
    @Prop()
    description: string;

    // status kanban: todo, in progress, done
    @Prop()
    status: string; 
    
    // prioritas: low, med, high
    @Prop()
    priority: string; 

    // tenggat waktu tugas
    @Prop()
    dueDate: Date;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);