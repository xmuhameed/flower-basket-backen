import { IsOptional, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCartDto {
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	quantity?: number;
}
