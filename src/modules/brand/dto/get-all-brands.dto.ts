import { IsOptional, IsInt, IsString } from 'class-validator';

export class GetAllBrandsDto {
    @IsOptional()
    @IsInt()
    id?: number;

    @IsOptional()
    @IsString()
    name?: string;
}
