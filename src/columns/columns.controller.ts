import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Req } from "@nestjs/common";
import { ColumnsService } from "./columns.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { CreateColumnDto } from "./dto/create-column.dto.js";
import { UpdateColumnDto } from "./dto/update-column.dto.js";

@UseGuards(JwtAuthGuard)
@Controller('columns')
export class ColumnsController {
    constructor(private readonly columnsService: ColumnsService) {}

    @Post()
    create(@Request() req: any, @Body() body: CreateColumnDto) {

        return this.columnsService.create(body.name, req.user.sub, body.order || 0);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.columnsService.findAll(req.user.sub);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Request() req: any, @Body() body: UpdateColumnDto) {
        return this.columnsService.update(id, req.user.sub, body);
    }

    @Delete(':id')
    delete(@Param('id') id: string, @Request() req: any) {
        return this.columnsService.delete(id, req.user.sub);
    }

}