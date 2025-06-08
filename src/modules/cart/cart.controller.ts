import { Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { GetAllCartsDto } from './dto/get-all-carts.dto';
import { checkPagination, GlobalPaginationDto, IdentifierDto } from '../../shared/global-dto';

const prisma = new PrismaClient();

export const createCart = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as CreateCartDto;
		const user = await prisma.user.findUnique({ where: { id: req.user.id } });
		if (!user) return next(new Error('User not found'));

		const product = await prisma.product.findUnique({ where: { id: dto.product_id } });
		if (!product) return next(new Error('Product not found'));

		// Only one cart entry per user/product
		const exists = await prisma.cart.findFirst({
			where: { user_id: user.id, product_id: product.id, deleted: false },
		});
		if (exists) return next(new Error('Product already in cart, if you want to update quantity, use update cart'));

		const cartData: Prisma.cartCreateManyArgs['data'] = {
			user_id: user.id,
			product_id: product.id,
			quantity: dto.quantity,
		};

		const cart = await prisma.cart.create({ data: cartData });
		res.status(201).json({ success: true, data: cart });
	} catch (err) {
		next(err);
	}
};

export const getAllCarts = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.query as GetAllCartsDto;
		const pagination = req.query as GlobalPaginationDto;
		const where: any = { deleted: false };
		const user = await prisma.user.findUnique({ where: { id: req.user.id } });
		if (!user) return next(new Error('User not found'));

		where.user_id = user.id;
		if (dto.product_id) where.product_id = dto.product_id;

		const carts = await prisma.cart.findMany({ where, ...checkPagination(pagination) });
		const total = await prisma.cart.count({ where });
		res.status(200).json({ success: true, count: total, data: carts });
	} catch (err) {
		next(err);
	}
};

export const updateCart = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const params = req.params as unknown as IdentifierDto;
		const dto = req.body as UpdateCartDto;
		const user = await prisma.user.findUnique({ where: { id: req.user.id } });
		if (!user) return next(new Error('User not found'));

		const cart = await prisma.cart.findUnique({ where: { id: params.id, user_id: user.id } });
		if (!cart) return next(new Error('Cart not found'));

		if (cart.user_id !== user.id) return next(new Error('You are not authorized to access this resource'));

		const cartData: Prisma.cartUpdateInput = {
			...(dto.quantity && { quantity: dto.quantity }),
		};

		const updatedCart = await prisma.cart.update({ where: { id: params.id }, data: cartData });
		res.status(200).json({ success: true, data: updatedCart });
	} catch (err) {
		next(err);
	}
};

export const deleteCart = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const params = req.params as unknown as IdentifierDto;
		const user = await prisma.user.findUnique({ where: { id: req.user.id } });
		if (!user) return next(new Error('User not found'));

		const cart = await prisma.cart.findUnique({ where: { id: params.id, user_id: user.id } });
		if (!cart) return next(new Error('Cart not found'));

		if (cart.user_id !== user.id) return next(new Error('You are not authorized to access this resource'));

		await prisma.cart.update({ where: { id: params.id }, data: { deleted: true } });
		res.status(200).json({ success: true, message: 'Cart deleted successfully' });
	} catch (err) {
		next(err);
	}
};
