import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TodosModule } from './todos/todos.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ColumnsModule } from './columns/columns.module.js';
import { GroupsModule } from './groups/groups.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports:[
    // agar bisa baca file .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // menyambungkan nestjs ke mongodb pake alamat dari .env
    MongooseModule.forRoot(process.env.MONGO_URI as string),

    // Konfigurasi untuk menyajikan folder gambar secara publik
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads/',
      serveStaticOptions: {
        fallthrough: true, // Mencegah server crash jika folder uploads belum ada
      },
    }),
    TodosModule,
    AuthModule,
    ColumnsModule,
    GroupsModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
