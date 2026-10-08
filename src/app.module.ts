import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TodosModule } from './todos/todos.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports:[
    // agar bisa baca file .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // menyambungkan nestjs ke mongodb pake alamat dari .env
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    TodosModule,
    AuthModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
