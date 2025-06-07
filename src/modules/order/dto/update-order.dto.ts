import { IsOptional, IsEnum } from 'class-validator';
import { order_status } from '@prisma/client';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(order_status)
  status?: order_status;
}
