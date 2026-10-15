import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment extends Document{
    // untuk siapa yg menulis komentar
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    // untuk isi pesan komentar
    @Prop({ required: true })
    content: string;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);