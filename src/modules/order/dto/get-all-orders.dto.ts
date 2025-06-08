import { IsOptional, IsInt, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { order_status } from '@prisma/client';

export class GetAllOrdersDto {
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	user_id?: number;

	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	product_id?: number;

	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	address_id?: number;

	@IsOptional()
	@IsEnum(order_status)
	status?: order_status;

	@IsOptional()
	@IsString()
	order_serial?: string;
}
