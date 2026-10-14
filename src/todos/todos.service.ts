import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from './todo.schema.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';

@Injectable()
export class TodosService {
    // Memasukkan TodoSchema ke dalam Service agar bisa digunakan
    constructor(@InjectModel(Todo.name) private todoModel: Model<Todo>) {}

    // 1. CREATE untuk menambahkan tugas baru + userId pemiliknya
    async create(userId: string, createTodoDto: CreateTodoDto) {
  const newTodo = new this.todoModel({
    ...createTodoDto,
    userId: userId,
  });
  return await newTodo.save();
}

    // 2  Ambil Todo PERSONAL login
    async findAll(userId: string){
        return this.todoModel.find({ 
            userId: userId,
            groupId: {$exists:false}
         }).exec();
    }

    // ambil todo grup
    async getTodosByGroup(groupId: string) {
    return this.todoModel.find({ groupId }).exec();
    }

    // 3, UPDATE Memperbarui data Kanban (misal: geser kartu dari 'To Do' ke 'In Progress')
    async update(id:string, userId: string, updateData: any): Promise<Todo> {
        const updatedTodo = await this.todoModel.findByIdAndUpdate(
            {_id: id, userId: userId },
            updateData,
            { new: true },
        ).exec(); 

        if (!updatedTodo) {
            throw new NotFoundException('Tugas tidak ditemukan atau Anda tidak memiliki akses!');
        }
        return updatedTodo;
    }

    // 4. DELETE untuk menghapus tugas dan memastikan juga milik user yang benar
    async remove(id:string, userId: string): Promise<any> {
        const deletedTodo = await this.todoModel.findByIdAndDelete({ _id: id, userId: userId }).exec();


        if (!deletedTodo) {
            throw new NotFoundException('Tugas tidak ditemukan atau Anda tidak memiliki akses!');
        }
        return { message: 'Tugas berhasil dihapus' };
    }
}
