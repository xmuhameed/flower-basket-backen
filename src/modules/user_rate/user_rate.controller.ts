import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateUserRateDto } from './dto/create-user-rate.dto';
import { UpdateUserRateDto } from './dto/update-user-rate.dto';
import { GetAllUserRatesDto } from './dto/get-all-user-rates.dto';
import { checkPagination, GlobalPaginationDto } from '../../shared/global-dto';

const prisma = new PrismaClient();

export const createUserRate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = req.body as CreateUserRateDto;
    // Only one rate per user/product
    const exists = await prisma.user_rate.findFirst({ where: { user_id: dto.user_id, product_id: dto.product_id } });
    if (exists) return next(new Error('User already rated this product'));
    const userRate = await prisma.user_rate.create({ data: dto });
    res.status(201).json({ success: true, data: userRate });
  } catch (err) { next(err); }
};

export const getAllUserRates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = req.query as GetAllUserRatesDto;
    const pagination = req.query as GlobalPaginationDto;
    const where: any = { deleted: false };
    if (dto.user_id) where.user_id = dto.user_id;
    if (dto.product_id) where.product_id = dto.product_id;
    const userRates = await prisma.user_rate.findMany({ where, ...checkPagination(pagination) });
    const total = await prisma.user_rate.count({ where });
    res.status(200).json({ success: true, count: total, data: userRates });
  } catch (err) { next(err); }
};

export const getUserRateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const userRate = await prisma.user_rate.findUnique({ where: { id, deleted: false } });
    if (!userRate) return next(new Error('User rate not found'));
    res.status(200).json({ success: true, data: userRate });
  } catch (err) { next(err); }
};

export const updateUserRate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const dto = req.body as UpdateUserRateDto;
    const userRate = await prisma.user_rate.update({ where: { id }, data: dto });
    res.status(200).json({ success: true, data: userRate });
  } catch (err) { next(err); }
};

export const deleteUserRate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await prisma.user_rate.update({ where: { id }, data: { deleted: true } });
    res.status(200).json({ success: true, message: 'User rate deleted successfully' });
  } catch (err) { next(err); }
};
