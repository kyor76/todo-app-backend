import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ColumnsService } from './columns.service.js';
import { ColumnsController } from './columns.controller.js';
import { Column, ColumnSchema } from './columns.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Column.name, schema: ColumnSchema }])
  ],
  providers: [ColumnsService],
  controllers: [ColumnsController]
})
export class ColumnsModule {}
