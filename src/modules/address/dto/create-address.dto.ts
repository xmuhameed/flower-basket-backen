import { IsString, IsOptional, IsInt } from 'class-validator';
import { country } from '@prisma/client';

export class CreateAddressDto {
    @IsInt()
    user_id: number;

    @IsString()
    @IsOptional()
    location_url?: string;

    @IsString()
    @IsOptional()
    recipient_name?: string;

    @IsString()
    @IsOptional()
    recipient_phone?: string;

    @IsString()
    address: string;

    @IsString()
    city: string;

    @IsString()
    country: country;

    @IsString()
    @IsOptional()
    address_details?: string;

    @IsString()
    @IsOptional()
    zip_code?: string;
}
