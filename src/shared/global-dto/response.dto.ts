import { IsNotEmpty, IsObject, Matches } from 'class-validator';

export class SuccessfulResponseDto {
	@IsNotEmpty()
	@Matches(/success/)
	status: string;

	@IsNotEmpty()
	@IsObject()
	data: object;
}

export class ErrorResponseDto {
	@IsNotEmpty()
	message: string;

	@IsNotEmpty()
	error: string;

	@IsNotEmpty()
	statusCode: number;
}
