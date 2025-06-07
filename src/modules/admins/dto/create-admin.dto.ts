import { gender } from '.prisma/client';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsEmail, IsNumber, IsEnum, IsOptional } from 'class-validator';
export class CreateAdminDto {
	@IsString()
	@IsNotEmpty()
	fullname: string;

	@IsString()
	@IsOptional()
	gender: gender;

	@IsString()
	@IsOptional()
	birth_date: string;

	@IsString()
	@IsOptional()
	profile_image_url: string;

	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsOptional()
	phone_number: string;

	@IsString()
	@IsNotEmpty()
	password: string;

	@IsString()
	@IsOptional()
	phone: string;
}
