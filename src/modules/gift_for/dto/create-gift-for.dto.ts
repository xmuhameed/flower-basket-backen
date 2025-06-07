import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateGiftForDto {
    @IsString()
    name: string;

    @IsInt()
    sort: number;

    @IsString()
    qrcode: string;

    @IsOptional()
    @IsString()
    gift_for_image_url?: string;
}
