import { IsString, IsOptional, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCollectionDto {
    @IsString()
    name: string;

    @Transform(({ value }) => parseInt(value))
    @IsInt()
    sort: number;

    @IsString()
    qrcode: string;

    @IsOptional()
    @IsString()
    collection_image_url?: string;
}
