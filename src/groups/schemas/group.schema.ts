import { Type } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { stripTypeScriptTypes } from "module";
import { Document, Types  } from "mongoose";

@Schema({timestamps: true})
export class Group extends Document{
    @Prop({ required: true })
    name: string;

    // untuk membuat grup
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    owner: Types.ObjectId;

    // daftar anggota grup
    @Prop({ type: [{type: Types.ObjectId, ref: 'User'}] })
    members: Types.ObjectId[];

    // untuk batas maksimal jumlah anggota dalam grup
    @Prop({ required: true })
    maxMembers: number;
}

export const GroupSchema = SchemaFactory.createForClass(Group);