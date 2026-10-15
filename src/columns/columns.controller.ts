import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Req
} from '@nestjs/common';
import { ColumnsService } from './columns.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateColumnDto } from './dto/create-column.dto.js';
import { UpdateColumnDto } from './dto/update-column.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  async create(@Request() req: any, @Body() body: CreateColumnDto) {
    console.log('--- DEBUG REQ.USER ---', req.user);

    // Jika req.user hanya berisi email, kita bisa cari user-nya dulu di database berdasarkan email:
    // const dbUser = await this.userModel.findOne({ email: req.user.email });
    // const userId = dbUser?._id;

    // ATAU, jika di `req.user` sebenarnya ada properti lain tapi namanya beda (misal `id`, `_id`, atau `userId`):
    const userId =
      req.user?.sub || req.user?.userId || req.user?.id || req.user?._id;

    console.log('--- RESOLVED USER ID ---', userId);

    return this.columnsService.create(body, userId);
  }

  @Get()
  findAll(@Request() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.columnsService.findAll(userId);
  }

  @Get('group/:groupId')
  async getColumnsByGroup(@Param('groupId') groupId: string){
    return this.columnsService.getColumnsByGroup(groupId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: UpdateColumnDto,
  ) {
    const userId = req.user.id || req.user._id || req.user.sub;
    return this.columnsService.update(id, req.user.sub, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.columnsService.delete(id, req.user.sub);
  }

  @Patch(':id/order')
  async updateOrder(@Param('id') id: string, @Body('order') order: number) {
    return this.columnsService.updateOrder(id, order);
  }
}