import { IsInt, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { order_status } from '@prisma/client';

export class CreateOrderDto {
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  user_id: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  product_id: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  address_id: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  quantity: number;

  @IsEnum(order_status)
  status: order_status;
}
