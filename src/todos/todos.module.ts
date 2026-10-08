import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TodosService } from './todos.service.js';
import { TodosController } from './todos.controller.js';
import { Todo, TodoSchema } from './todo.schema.js';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema}])
  ],
  providers: [TodosService],
  controllers: [TodosController]
})
export class TodosModule {}
