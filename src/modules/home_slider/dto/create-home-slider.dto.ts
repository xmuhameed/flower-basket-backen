import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateHomeSliderDto {
    @IsString()
    name: string;

    @IsInt()
    sort: number;

    @IsString()
    qrcode: string;

    @IsOptional()
    @IsString()
    slider_image_url?: string;

    @IsOptional()
    @IsString()
    button_text?: string;

    @IsOptional()
    @IsString()
    button_url?: string;
}
