import { Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { GetAllFavoritesDto } from './dto/get-all-favorites.dto';
import { checkPagination, GlobalPaginationDto, IdentifierDto } from '../../shared/global-dto';

const prisma = new PrismaClient();

const favoriteSelect = {
	id: true,
	user_id: true,
	product_id: true,
	product: {
		select: {
			id: true,
			name: true,
		},
	},
};

export const createFavorite = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as CreateFavoriteDto;
		const product = await prisma.product.findUnique({ where: { id: dto.product_id, deleted: false } });
		if (!product) return next(new Error('Product not found'));

		// Only one favorite per user/product
		const exists = await prisma.favorite.findFirst({ where: { user_id: req.user.id, product_id: product.id, deleted: false } });
		if (exists) return next(new Error('Already favorited'));

		const favoriteData: Prisma.favoriteCreateManyArgs['data'] = {
			user_id: req.user.id,
			product_id: product.id,
		};
		await prisma.favorite.create({ data: favoriteData });

		const favorites = await prisma.favorite.findMany({ where: { user_id: req.user.id, deleted: false }, select: favoriteSelect });
		res.status(201).json({ success: true, message: 'Favorite created successfully', data: favorites });
	} catch (err) {
		next(err);
	}
};

export const getAllFavorites = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// const dto = req.query as GetAllFavoritesDto;
		// const pagination = req.query as GlobalPaginationDto;
		const where: any = { deleted: false, user_id: req.user.id };
		// if (dto.user_id) {
		// 	where.user_id = dto.user_id;
		// 	if (req.user.id !== dto.user_id) return next(new Error('You are not authorized to access this resource'));
		// }
		const favorites = await prisma.favorite.findMany({ where, select: favoriteSelect });
		res.status(200).json({ success: true, data: favorites });
	} catch (err) {
		next(err);
	}
};

export const clearFavorites = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await prisma.favorite.updateMany({ where: { user_id: req.user.id, deleted: false }, data: { deleted: true } });
		const favorites = await prisma.favorite.findMany({ where: { user_id: req.user.id, deleted: false }, select: favoriteSelect });
		res.status(200).json({ success: true, message: 'Favorites cleared successfully', data: favorites });
	} catch (err) {
		next(err);
	}
};


export const deleteFavorite = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const params = req.params as unknown as IdentifierDto;
		const favorite = await prisma.favorite.findFirst({ where: { product_id: params.id, deleted: false, user_id: req.user.id } });
		if (!favorite) return next(new Error('Favorite not found'));
		
		await prisma.favorite.update({ where: { id: favorite.id }, data: { deleted: true } });
		const favorites = await prisma.favorite.findMany({ where: { user_id: req.user.id, deleted: false }, select: favoriteSelect });
		res.status(200).json({ success: true, message: 'Favorite deleted successfully', data: favorites });
	} catch (err) {
		next(err);
	}
};
