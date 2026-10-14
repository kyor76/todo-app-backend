import { IsDateString, IsOptional, IsString, IsBoolean } from "class-validator";

export class UpdateTodoDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    priority?: string;

    @IsDateString()
    @IsOptional()
    dueDate?: Date;

    @IsString()
    @IsOptional()
    columnId?: string;

    @IsBoolean()
    @IsOptional()
    isCompleted?: boolean;
}