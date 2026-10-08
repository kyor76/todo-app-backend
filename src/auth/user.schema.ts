import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // timestamps akan otomatis buat createdAt dan updatedAt
export class User extends Document {
    @Prop({ required: true, unique: true }) // agar email wajib diisi dan email tidak duplikat
    email: string;

    @Prop({ required:true }) // agar password wajib diisi
    password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);