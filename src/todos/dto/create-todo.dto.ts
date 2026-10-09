import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTodoDto {
    @IsString()
    @IsNotEmpty()
    title: string;

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
    @IsNotEmpty()
    columnId: string;
}