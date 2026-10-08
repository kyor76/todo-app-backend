import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, Types } from 'mongoose';

@Schema({ timestamps: true })  // timestamps akan otomatis buat createdAt dan updatedAt
export class Todo extends Document {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId; // sbg penghubung ke koleksi user

    // tugas wajib ada judul
    @Prop({ required: true})
    title: string;

    // bagian deskripsi tugas
    @Prop({ default: '' })
    description: string;

    // status kanban: todo, in progress, done
    @Prop({ default: 'To Do' })
    status: string; 
    
    // prioritas: low, med, high
    @Prop({ default: 'Medium' })
    priority: string; 

    // tenggat waktu tugas
    @Prop({ type: Date, default: null })
    dueDate: Date;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);