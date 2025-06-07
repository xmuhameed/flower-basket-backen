import { IsOptional, IsInt, IsString } from 'class-validator';

export class GetAllGiftForDto {
    @IsOptional()
    @IsInt()
    id?: number;

    @IsOptional()
    @IsString()
    name?: string;
}
