import { Controller, Post, Body, Param, Request, UseGuards, Patch, BadGatewayException, BadRequestException } from '@nestjs/common';
import { GroupsService } from './groups.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Invitation } from './schemas/invitation.schema.js';

@Controller('groups')
// untuk memastikan semua endpoint grup hanya bisa diakses oleh yang sudah login
@UseGuards(JwtAuthGuard)
export class GroupsController {
    constructor(private readonly groupsService: GroupsService){}

    // 1. endpoint untuk create grup
    @Post()
    async createGroup(@Body('name') name: string, @Request() req: any){
        const ownerId = req.user.sub || req.user.id;
        return this.groupsService.createGroup(name, ownerId);
    }

    // 2. endpoint untuk update kuota anggota
    @Post(':groupId/invitations')
    async createInvitation(
        @Param('groupId') groupId: string,
        @Body('maxUses') maxUses: number,
        @Body('expiresInDays') expiresInDays: number,
        @Request()req: any
    ){
        const ownerId = req.user.sub || req.user.id;
        return this.groupsService.createInvitation(groupId, ownerId ,maxUses, expiresInDays);
    }
    // 3. Endpoint untuk mengedit kuota
  @Patch('invitations/:invitationId/max-uses')
  async updateMaxUses(
    @Param('invitationId') invitationId: string,
    @Body('newMaxUses') newMaxUses: number,
    @Request() req: any
  ) {
    const ownerId = req.user.sub || req.user.id;
    return this.groupsService.updateMaxUses(invitationId, ownerId, newMaxUses);
  }

  // 4. Endpoint untuk mencabut link secara manual
  @Patch('invitations/:invitationId/revoke')
  async revokeInvitation(
    @Param('invitationId') invitationId: string,
    @Request() req: any
  ) {
    const ownerId = req.user.sub || req.user.id;
    return this.groupsService.revokeInvitation(invitationId, ownerId);
  }

  // 5. Endpoint untuk join ke grup pake token
  @Post('join')
  async joinGroup(
    @Body('token') token: string,
    @Request() req: any
  ){
    if (!token){
        throw new BadRequestException('Token undangan tidak bokeh kosong.');
    }
    const userId = req.user.sub || req.user.id;
    return this.groupsService.joinGroupByToken(token, userId);
  }

}
