import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { TodosService } from './todos.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {

    // memeasukkan service
    constructor(private readonly todosService: TodosService) {}

    // 1. CREATE untuk menerima request POST untuk menambahkan tugas baru
    @Post()
    create(@Request() req: any, @Body() body: CreateTodoDto) {
        // req.user.sub berisi ID User yang diambil dari Token JWT
        const userId = req.user.id || req.user._id || req.user.sub;
        return this.todosService.create(userId, body);
    }

    // endpoint jadwal gabungan
    @Get('schedule/combined')
    async getCombinedSchedule(@Request() req: any, @Query('groupIds') groupIdsStr: string){
        const userId = req.user.sub || req.user.id;
        const groupIds = groupIdsStr? groupIdsStr.split(','): [];
        return this.todosService.getCombinedSchedule(userId, groupIds);
    }

    // 2. READ untuk menerima request GET untuk menampilkan semua tugas
    @Get()
    findAll(@Request() req: any) {
        const userId = req.user.id || req.user._id || req.user.sub;
        return this.todosService.findAll(userId);
    } 

    // 3. UPDATE untuk menerima request PATCH untuk mengubah status tugas
    @Patch(':id')
    update (
        @Param('id') id: string,
        @Request() req: any,
        @Body() body: any,
    ){
        const userId = req.user.id || req.user._id || req.user.sub;
        return this.todosService.update(id, userId, body); // body bisa berisi { status: 'In Progress' }
    }

    // 4. DELETE untuk menerima request DELETE untuk menghapus tugas
    @Delete(':id')
    remove(@Param("id") id: string, @Request() req: any) {
        const userId = req.user.id || req.user._id || req.user.sub;
        return this.todosService.remove(id, userId);
    }

    @Get('group/:groupId')
    async getTodosByGroup(@Param('groupId') groupId: string) {
        return this.todosService.getTodosByGroup(groupId);
    }

    @Post(':id/comments')
    async addComment(
        @Param('id') todoId: string,
        @Body() CreateCommentDto: CreateCommentDto,
        @Request() req: any,
    ){
        const userId = req.user.sub || req.user.id;
        return this.todosService.addComment(todoId, userId, CreateCommentDto);
    }

}
