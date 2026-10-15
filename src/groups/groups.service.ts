import { Injectable, NotFoundException, UnauthorizedException, BadGatewayException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types} from 'mongoose';
import { Group } from './schemas/group.schema.js';
import { Invitation } from './schemas/invitation.schema.js';
import * as crypto from 'crypto';
import { waitForDebugger } from 'inspector';
import strict from 'assert/strict';
import { UnsubscriptionError } from 'rxjs';

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

    // 5. untuk fitur Bergabung ke grup dengan token
    async joinGroupByToken(token: string, userId: string){

        // mencari undangan berdasarkan token
        const invitation = await this.invitationModel.findOne({token});
        if (!invitation){
            throw new NotFoundException('Link undangan tidak falid atau tidak ditemukan.');
        }

        // untuk cek status aktif, kadaluarsa, dan kuota
        if (invitation.isRevoked){
            throw new BadGatewayException('Link undangan ini sudah dinonaktifkan oleh pembuat grup.');
        }
        if (invitation.expireAt < new Date()){
            throw new BadGatewayException('Masa berlaku link undangan sudah habis.');
        }
        if (invitation.currentUses >= invitation.maxUses){
            throw new BadGatewayException('Kuota grup sudah penuh.');
        }

        // untuk mencari grup yang terkait dengan undangan ini
        const group = await this.groupModel.findById(invitation.groupId) as any;
        if (!group){
            throw new NotFoundException('Grup tidak ditemukan.');
        }
        if (!group.members){
            group.members = [];
        }

        // untuk mengecek apakah user sudah ada di grup, untuk mencegah duplikat
        const isAlreadyMember = group.members.some((memberId: any) => memberId.toString() === userId);
        if (isAlreadyMember){
            throw new BadRequestException('Anda sudah tergabung dalam grup ini.');
        }

        // untuk menambahkan daftar anggota di grup dan menambah angka pengguna link
        group.members.push(new Types.ObjectId(userId));
        invitation.currentUses += 1;

        // untuk menyimpan perubahan ke db
        await group.save();
        await invitation.save();

        return {
            message: `Berhasil bergabung dengan grup: ${group.name}`,
            groupId: group._id
        };
    }

    // 6 untuk mengambil daftar grup yg dimiliki/diikuti user
    async getUserGroups(userId: string){
      return await this.groupModel.find({
        $or: [
          {owner: new Types.ObjectId(userId)},
          {member: new Types.ObjectId(userId)},
          {members: new Types.ObjectId(userId)}
        ]
      }).exec();
    }

    // 7. fitur untuk keluar dari grup
    async leaveGroup(groupId: string, userId: string){
        const group = await this.groupModel.findById(groupId) as any;
        if (!group) throw new NotFoundException('Grup tidak ditemukan.');

        // untuk cegah owner grup keluar dari grup
        if (group.owner.toString() === userId ){
            throw new BadRequestException('Pembuat grup tidak bisa keluar. Silahkan hapus grup jika ingin membubarkannya');
        }

        // untuk hapus user dari array members
        group.members = group.members.filter((id: any) => id.toString() !== userId);
        
        if (group.member){
            group.member = group.member.filter((id: any) => id.toString() !== userId);
        }

        await group.save();
            return {message: ' Berhasil keluar dari grup.'};
    }

    // 8. fitur untuk mengeluarkan anggota
    async kickMember(groupId: string, memberId: string, ownerId: string){
        const group = await this.groupModel.findById(groupId) as any;
        if (!group) throw new NotFoundException('Grup ini tidak ditemukan.');

        // hanya pembuat grup yg bisa mengeluarkan
        if (group.owner.toString() !== ownerId){
            throw new UnauthorizedException('Hanya pembuat grup yang bisa mengeluarkan anggota');
        }

        // mencegah owner tidak sengaja mengeluarkan dirinya
        if (memberId === ownerId){
            throw new BadRequestException('Anda tidak bisa mengeluarkan diri sendiri dari grup');
        }

        // filter member yg dikeluarkan (Hanya dieksekusi jika array-nya ada)
        if (group.members){
            group.members = group.members.filter((id: any) => id.toString() !== memberId);
        }
        if (group.member){
            group.member = group.member.filter((id: any) => id.toString() !== memberId);
        }

        await group.save();
        return {message: 'Anggota berhasil dikeluarkan dari grup.'};
    }

    // 9. fitur untuk hapus grup permanen
    async deleteGroup(groupId: string, ownerId: string){
        const group = await this.groupModel.findById(groupId);
        if (!group) throw new NotFoundException('Grup ini tidak ditemukan');

        // hanya owner yg bisa hapus grup
        if (group.owner.toString() !== ownerId){
            throw new UnauthorizedException('Hanya pembuat grup yang bisa menghapus grup.');
        }

        // hapus grup dari database
        await this.groupModel.findByIdAndDelete(groupId);

        // hapus juga semua link undangan yg terikat dgn grup ini
        await this.invitationModel.deleteMany({ groupId: groupId});
        return {message: 'Grup beserta link undangannya berhasil dihapus secara permanen.'};

    }
}

