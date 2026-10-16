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

  // Membuat kolom baru berdasarkan user yang sedang login
  @Post()
  async create(@Request() req: any, @Body() body: CreateColumnDto) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id || req.user?._id;
    return this.columnsService.create(body, userId);
  }

  // untuk mengambil semua kolom user yg login
  @Get()
  findAll(@Request() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.columnsService.findAll(userId);
  }

  // untuk mengambil daftar kolom berdasrkan id grup
  @Get('group/:groupId')
  async getColumnsByGroup(@Param('groupId') groupId: string){
    return this.columnsService.getColumnsByGroup(groupId);
  }

  // untuk memperbarui data kolom
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: UpdateColumnDto,
  ) {
    const userId = req.user.id || req.user._id || req.user.sub;
    return this.columnsService.update(id, req.user.sub, body);
  }

  // untuk menghapus kolom
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.columnsService.delete(id, req.user.sub);
  }

  // untuk memperbarui urutan tampilan kolom
  @Patch(':id/order')
  async updateOrder(@Param('id') id: string, @Body('order') order: number) {
    return this.columnsService.updateOrder(id, order);
  }
}