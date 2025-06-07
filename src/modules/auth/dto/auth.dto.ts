import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum UserType {
	ADMIN = 'admin',
	USER = 'user',
}

export class LoginDto {
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}

export class RegisterDto {
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	password: string;

	@IsString()
	@IsNotEmpty()
	fullname: string;

	@IsString()
	@IsNotEmpty()
	phone: string;

	@IsString()
	@IsOptional()
	hiddenPassword?: string;
}

export class AuthResponseDto {
	token: string;
	user: {
		id: number;
		email: string;
		fullname: string;
		phone: string;
		user_type: UserType;
	};
}
