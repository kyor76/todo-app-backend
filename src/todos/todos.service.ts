import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from './todo.schema.js';

@Injectable()
export class TodosService {
    // Memasukkan TodoSchema ke dalam Service agar bisa digunakan
    constructor(@InjectModel(Todo.name) private todoModel: Model<Todo>) {}

    // 1. CREATE untuk menambahkan tugas baru + userId pemiliknya
    async create(userId: string, createDate: any): Promise<Todo>{
        const newTodo = new this.todoModel({
            ...createDate,
            userId: userId, // untuk menempelkan id pembuat tugas
        });
        return newTodo.save(); 
    }

    // 2 READ Hanya mengambil daftar tugas yang userId-nya cocok dengan user yang sedang login
    async findAll(userId: string): Promise<Todo[]> {
        return this.todoModel.find({ userId: userId }).exec();
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
