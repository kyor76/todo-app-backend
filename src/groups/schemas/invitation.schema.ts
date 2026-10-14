import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true})
export class Invitation extends Document{
    @Prop({ type: Types.ObjectId, ref: 'Group', required: true})
    groupId: Types.ObjectId;

    // buat token unik untuk url
    @Prop({ required: true, unique: true })
    token: string;

    // masa berlaku linknya
    @Prop ({ required: true })
    expireAt: Date;

    // buat batas jumlah user dan bisa diedit
    @Prop({ required: true })
    maxUses: number;

    // untuk menghitung orang yg sudah pakai link ini
    @Prop ({ default: 0 })
    currentUses: number;

    // untuk cabut link oleh pemilik
    @Prop({ default: false })
    isRevoked: boolean;

}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);