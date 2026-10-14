import { Injectable, NotFoundException, UnauthorizedException, BadGatewayException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types} from 'mongoose';
import { Group } from './schemas/group.schema.js';
import { Invitation } from './schemas/invitation.schema.js';
import * as crypto from 'crypto';

@Injectable()
export class GroupsService {
    constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
    @InjectModel(Invitation.name) private invitationModel: Model<Invitation>,
    ){}

    // 1. buat fitur create grup
    async createGroup(name: string, ownerId: string){
        const newGroup = new this.groupModel({
            name,
            owner: new Types.ObjectId(ownerId),
            member: [new Types.ObjectId(ownerId)],
        });
        return await newGroup.save();
    }

    // 2. fitur create link undangan
    async createInvitation(groupId: string, ownerId: string, maxUses: number, expiresInDays: number){
        const group = await this.groupModel.findById(groupId);
        if (!group) throw new NotFoundException('Grup tidak ditemukan');

        // memastikan hanya pembuat grup yg bisa bikin link
        if (group.owner.toString() !== ownerId){
            throw new UnauthorizedException('Hanya pembuat grup yang bisa membuat link undangan');
        }

        // untuk generate token unik
        const token = crypto.randomUUID();

        // untuk hitung tanggal kadaluarsa berdasarkan input hari
        const expireAt = new Date();
        expireAt.setDate(expireAt.getDate() + expiresInDays);

        const newInvitation = new this.invitationModel({
            groupId: group._id,
            token,
            expireAt,
            maxUses,
        });
        await newInvitation.save();

        // untuk kembalikan response URL utuh yang bisa disalin oleh frontend
        return {
            message: 'Link undangan berhasil dibuat',
            inviteLink: `http://localhost:3000/groups/join?token=${token}`,
            token,
            expireAt,
            maxUses
        };
    }

    // 3. fitur untuk edit batas jumlah user (maxUses)
    async updateMaxUses(invitationId: string, ownerId: string, newMaxUses: number){
        const invitation = await this.invitationModel.findById(invitationId).populate('groupId');
        if (!invitation) throw new NotFoundException ('Undangan tidak ditemukan');

        const group = invitation.groupId as any;
        if (group.owner.toString() !== ownerId){
            throw new BadRequestException(`Tidak bisa mengubah kuota menjadi ${newMaxUses}, karena sudah ada ${invitation.currentUses} orang yang bergabung.`);

        }

        invitation.maxUses = newMaxUses;
        await invitation.save();
        return { Message:`Batas maksimal anggota berhasil diubah menjadi ${newMaxUses}`};
    }

    // 4. untuk fitur cabut undangan
    async revokeInvitation(invitationId: string, ownerId: string){
        const invitation = await this.invitationModel.findById(invitationId).populate('groupId');
        if (!invitation) throw new NotFoundException('Undangan tidak ditemukan');

        const group = invitation.groupId as any;
        if (group.owner.toString() !== ownerId){
            throw new UnauthorizedException ('Hanya pembuat grup yang bisa mencabut undangan');
        }

        invitation.isRevoked = true;
        await invitation.save();
        return{ message:'Link undangan berhasil dinonaktifkan (dicabut paksa).' };
    }
}

