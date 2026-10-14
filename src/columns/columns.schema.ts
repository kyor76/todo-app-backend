import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { timestamp } from 'rxjs';

@Schema({ timestamps: true })
export class Column extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ default: 0 })
    order: number;

    @Prop({ type: Types.ObjectId, ref: 'Group', required: false })
    groupId: Types.ObjectId;
}

export const ColumnSchema = SchemaFactory.createForClass(Column);