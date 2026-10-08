import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TodosService } from './todos.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {

    // memeasukkan service
    constructor(private readonly todosService: TodosService) {}

    // 1. CREATE untuk menerima request POST untuk menambahkan tugas baru
    @Post()
    create(@Request() req: any, @Body() body: any) {
        // req.user.sub berisi ID User yang diambil dari Token JWT
        const userId = req.user.sub;
        return this.todosService.create(userId, body);
    }

    // 2. READ untuk menerima request GET untuk menampilkan semua tugas
    @Get()
    findAll(@Request() req: any) {
        const userId = req.user.sub;
        return this.todosService.findAll(userId);
    } 

    // 3. UPDATE untuk menerima request PATCH untuk mengubah status tugas
    @Patch(':id')
    update (
        @Param('id') id: string,
        @Request() req: any,
        @Body() body: any,
    ){
        const userId = req.user.sub;
        return this.todosService.update(id, userId, body); // body bisa berisi { status: 'In Progress' }
    }

    // 4. DELETE untuk menerima request DELETE untuk menghapus tugas
    @Delete(':id')
    remove(@Param("id") id: string, @Request() req: any) {
        const userId = req.user.sub;
        return this.todosService.remove(id, userId);
    }
}
