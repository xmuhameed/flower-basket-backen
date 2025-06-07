import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetAllOrdersDto } from './dto/get-all-orders.dto';
import { checkPagination, GlobalPaginationDto } from '../../shared/global-dto';

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = req.body as CreateOrderDto;
    const order = await prisma.order.create({ data: dto });
    res.status(201).json({ success: true, data: order });
  } catch (err) { next(err); }
};

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = req.query as GetAllOrdersDto;
    const pagination = req.query as GlobalPaginationDto;
    const where: any = { deleted: false };
    if (dto.user_id) where.user_id = dto.user_id;
    if (dto.product_id) where.product_id = dto.product_id;
    if (dto.address_id) where.address_id = dto.address_id;
    if (dto.status) where.status = dto.status;
    const orders = await prisma.order.findMany({ where, ...checkPagination(pagination) });
    const total = await prisma.order.count({ where });
    res.status(200).json({ success: true, count: total, data: orders });
  } catch (err) { next(err); }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({ where: { id, deleted: false } });
    if (!order) return next(new Error('Order not found'));
    res.status(200).json({ success: true, data: order });
  } catch (err) { next(err); }
};

export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const dto = req.body as UpdateOrderDto;
    const order = await prisma.order.update({ where: { id }, data: dto });
    res.status(200).json({ success: true, data: order });
  } catch (err) { next(err); }
};

export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await prisma.order.update({ where: { id }, data: { deleted: true } });
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (err) { next(err); }
};
