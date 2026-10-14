import { IsNotEmpty, IsNumber, IsOptional, IsString, IsMongoId } from "class-validator";

export class CreateColumnDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsOptional()
    order?: number;

    @IsOptional()
    @IsMongoId()
    groupId: string;
}