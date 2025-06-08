import { Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { CreateUserRateDto } from './dto/create-user-rate.dto';
import { UpdateUserRateDto } from './dto/update-user-rate.dto';
import { GetAllUserRatesDto } from './dto/get-all-user-rates.dto';
import { checkPagination, GlobalPaginationDto } from '../../shared/global-dto';
import { UserType } from '../auth/dto';

const prisma = new PrismaClient();

export const createUserRate = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as CreateUserRateDto;

		const user = await prisma.user.findUnique({ where: { id: req.user.id } });
		if (!user) return next(new Error('User not found'));

		const product = await prisma.product.findUnique({ where: { id: dto.product_id } });
		if (!product) return next(new Error('Product not found'));

		const exists = await prisma.user_rate.findFirst({ where: { user_id: user.id, product_id: product.id } });
		if (exists) return next(new Error('User already rated this product'));

		const userRateData: Prisma.user_rateCreateManyArgs['data'] = {
			user_id: user.id,
			product_id: product.id,
			rate: dto.rate,
			rate_text: dto.rate_text ? dto.rate_text : null,
		};
		const userRate = await prisma.user_rate.create({ data: userRateData });

		res.status(201).json({ success: true, data: userRate });
	} catch (err) {
		next(err);
	}
};

export const getAllUserRates = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.query as GetAllUserRatesDto;
		const pagination = req.query as GlobalPaginationDto;
		const where: any = { deleted: false };

		if (dto.user_id) {
			where.user_id = dto.user_id;
			if (req.user.id !== dto.user_id && req.user.type === UserType.USER)
				return next(new Error('You are not authorized to access this resource'));
		}

		if (dto.product_id) where.product_id = dto.product_id;

		const userRates = await prisma.user_rate.findMany({ where, ...checkPagination(pagination) });

		const total = await prisma.user_rate.count({ where });
		res.status(200).json({ success: true, count: total, data: userRates });
	} catch (err) {
		next(err);
	}
};

export const getUserRateById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = Number(req.params.id);
		const userRate = await prisma.user_rate.findUnique({ where: { id, deleted: false } });
		if (!userRate) return next(new Error('User rate not found'));
		res.status(200).json({ success: true, data: userRate });
	} catch (err) {
		next(err);
	}
};

export const updateUserRate = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = Number(req.params.id);
		const userRate = await prisma.user_rate.findUnique({ where: { id, deleted: false } });
		if (!userRate) return next(new Error('User rate not found'));
		const dto = req.body as UpdateUserRateDto;
		const userRateData: Prisma.user_rateUpdateInput = {
			...(dto.rate && { rate: dto.rate }),
			...(dto.rate_text && { rate_text: dto.rate_text }),
		};

		const updatedUserRate = await prisma.user_rate.update({ where: { id }, data: userRateData });
		res.status(200).json({ success: true, data: updatedUserRate });
	} catch (err) {
		next(err);
	}
};

export const deleteUserRate = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = Number(req.params.id);
		const userRate = await prisma.user_rate.findUnique({ where: { id, deleted: false } });
		if (!userRate) return next(new Error('User rate not found'));
		if (userRate.user_id !== req.user.id) return next(new Error('You are not authorized to access this resource'));
		await prisma.user_rate.update({ where: { id }, data: { deleted: true } });
		res.status(200).json({ success: true, message: 'User rate deleted successfully' });
	} catch (err) {
		next(err);
	}
};
