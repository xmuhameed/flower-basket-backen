import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { GetAllCartsDto } from './dto/get-all-carts.dto';
import { checkPagination, GlobalPaginationDto } from '../../shared/global-dto';

const prisma = new PrismaClient();

export const createCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = req.body as CreateCartDto;
    // Only one cart entry per user/product
    const exists = await prisma.cart.findFirst({ where: { user_id: dto.user_id, product_id: dto.product_id, deleted: false } });
    if (exists) return next(new Error('Product already in cart'));
    const cart = await prisma.cart.create({ data: dto });
    res.status(201).json({ success: true, data: cart });
  } catch (err) { next(err); }
};

export const getAllCarts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = req.query as GetAllCartsDto;
    const pagination = req.query as GlobalPaginationDto;
    const where: any = { deleted: false };
    if (dto.user_id) where.user_id = dto.user_id;
    if (dto.product_id) where.product_id = dto.product_id;
    const carts = await prisma.cart.findMany({ where, ...checkPagination(pagination) });
    const total = await prisma.cart.count({ where });
    res.status(200).json({ success: true, count: total, data: carts });
  } catch (err) { next(err); }
};

export const getCartById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const cart = await prisma.cart.findUnique({ where: { id, deleted: false } });
    if (!cart) return next(new Error('Cart not found'));
    res.status(200).json({ success: true, data: cart });
  } catch (err) { next(err); }
};

export const updateCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const dto = req.body as UpdateCartDto;
    const cart = await prisma.cart.update({ where: { id }, data: dto });
    res.status(200).json({ success: true, data: cart });
  } catch (err) { next(err); }
};

export const deleteCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await prisma.cart.update({ where: { id }, data: { deleted: true } });
    res.status(200).json({ success: true, message: 'Cart deleted successfully' });
  } catch (err) { next(err); }
};
