import { Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { GetAllFavoritesDto } from './dto/get-all-favorites.dto';
import { checkPagination, GlobalPaginationDto } from '../../shared/global-dto';

const prisma = new PrismaClient();

export const createFavorite = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as CreateFavoriteDto;
		const user = await prisma.user.findUnique({ where: { id: req.user.id } });
		if (!user) return next(new Error('User not found'));
		const product = await prisma.product.findUnique({ where: { id: dto.product_id } });
		if (!product) return next(new Error('Product not found'));

		// Only one favorite per user/product
		const exists = await prisma.favorite.findFirst({ where: { user_id: user.id, product_id: product.id } });
		if (exists) return next(new Error('Already favorited'));

		const favoriteData: Prisma.favoriteCreateManyArgs['data'] = {
			user_id: user.id,
			product_id: product.id,
		};
		const favorite = await prisma.favorite.create({ data: favoriteData });
		res.status(201).json({ success: true, data: favorite });
	} catch (err) {
		next(err);
	}
};

export const getAllFavorites = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.query as GetAllFavoritesDto;
		const pagination = req.query as GlobalPaginationDto;
		const where: any = { deleted: false };
		if (dto.user_id) {
			where.user_id = dto.user_id;
			if (req.user.id !== dto.user_id) return next(new Error('You are not authorized to access this resource'));
		}
		const favorites = await prisma.favorite.findMany({ where, ...checkPagination(pagination) });
		const total = await prisma.favorite.count({ where });
		res.status(200).json({ success: true, count: total, data: favorites });
	} catch (err) {
		next(err);
	}
};

export const deleteFavorite = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = Number(req.params.id);
		const favorite = await prisma.favorite.findUnique({ where: { id, deleted: false } });
		if (!favorite) return next(new Error('Favorite not found'));
		if (favorite.user_id !== req.user.id) return next(new Error('You are not authorized to access this resource'));
		await prisma.favorite.update({ where: { id }, data: { deleted: true } });
		res.status(200).json({ success: true, message: 'Favorite deleted successfully' });
	} catch (err) {
		next(err);
	}
};
