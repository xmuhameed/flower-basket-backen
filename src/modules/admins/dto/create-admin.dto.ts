import { gender } from '.prisma/client';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
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
	profile_image: string;

	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	password: string;

	@IsString()
	@IsOptional()
	phone: string;
}
