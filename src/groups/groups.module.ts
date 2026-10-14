import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller.js';
import { GroupsService } from './groups.service.js';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schemas/group.schema.js';
import { Invitation, InvitationSchema } from './schemas/invitation.schema.js';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name: Group.name, schema: GroupSchema},
      { name: Invitation.name, schema: InvitationSchema},
    ]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
