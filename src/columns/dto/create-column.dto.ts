import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateColumnDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsOptional()
    order?: number;
}