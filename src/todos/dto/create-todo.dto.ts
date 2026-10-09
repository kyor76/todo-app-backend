import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTodoDto {
    @IsString()
    @IsOptional()
    titel: string;

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