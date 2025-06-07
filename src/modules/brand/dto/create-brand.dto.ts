import { IsString, IsOptional } from 'class-validator';

export class CreateBrandDto {
    @IsString()
    name: string;

    @IsString()
    qrcode: string;

    @IsOptional()
    @IsString()
    brand_image_url?: string;
}
