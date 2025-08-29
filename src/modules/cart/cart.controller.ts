import { Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { CreateCartDto } from './dto/create-cart.dto';
import { IdentifierDto, IdentifiersDto } from '../../shared/global-dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';

const prisma = new PrismaClient();

const cartSelect = {
	id: true,
	quantity: true,
	product: {
		select: {
			id: true,
			name: true,
		},
	},
}

export const getUserCart = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const where: any = { deleted: false, user_id: req.user.id };

		const carts = await prisma.cart.findMany({
			where,
			select: cartSelect,
		});
		res.status(200).json({ success: true, data: carts });
	} catch (err) {
		next(err);
	}
};

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as CreateCartDto;
		let quantities = [...dto.quantities];
		let productIds = [...dto.product_ids];

		if (quantities.length !== productIds.length)
			return next(new Error('Quantities and product ids must be of the same length'));

		const products = await prisma.product.findMany({ where: { id: { in: productIds }, deleted: false } });
		if (products.length !== productIds.length) return next(new Error('Some products not found'));

		const existingCartItems = await prisma.cart.findMany({
			where: { user_id: req.user.id, deleted: false },
		});

		if (existingCartItems.length > 0) {
			existingCartItems.forEach(async (cart) => {
				if (productIds.includes(cart.product_id)) {
					const productIndex = productIds.indexOf(cart.product_id);
					const newQuantity = cart.quantity + quantities[productIndex];
					productIds.splice(productIndex, 1);
					quantities.splice(productIndex, 1);
					await prisma.cart.update({
						where: { id: cart.id },
						data: { quantity: newQuantity },
					});
				}
			});
		}

		const cartData: Prisma.cartCreateManyArgs['data'] = [];
		productIds.forEach((productId, index) => {
				cartData.push({
					user_id: req.user.id,
					product_id: productId,
					quantity: quantities[index],
				});
		});

		const addedCarts = await prisma.cart.createMany({ data: cartData });
		if (addedCarts.count !== cartData.length) return next(new Error('Failed to add products to cart'));

		const userCart = await prisma.cart.findMany({ where: { user_id: req.user.id, deleted: false }, select: cartSelect });
		res.status(201).json({ success: true, data: userCart });
	} catch (err) {
		next(err);
	}
};

export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const params = req.params as unknown as IdentifierDto;
		const dto = req.body as UpdateCartItemDto;

		const cartItem = await prisma.cart.findFirst({ where: { product_id: params.id, user_id: req.user.id, deleted: false } });
		if (!cartItem) return next(new Error('Product not in cart'));

		await prisma.cart.update({ where: { id: cartItem.id }, data: { quantity: dto.quantity } });

		const userCart = await prisma.cart.findMany({ where: { user_id: req.user.id, deleted: false }, select: cartSelect });
		res.status(200).json({ success: true, message: 'Cart item updated successfully', data: userCart });
	} catch (err) {
		next(err);
	}
};
export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const params = req.params as unknown as IdentifiersDto;

		const carts = await prisma.cart.findMany({
			where: { product_id: { in: params.ids }, user_id: req.user.id, deleted: false },
		});
		if (carts.length !== params.ids.length) return next(new Error('Some cart items not found'));

		await prisma.cart.updateMany({ where: { product_id: { in: params.ids }, user_id: req.user.id, deleted: false }, data: { deleted: true } });

		const userCart = await prisma.cart.findMany({ where: { user_id: req.user.id, deleted: false }, select: cartSelect });
		res.status(200).json({ success: true, message: 'Cart items deleted successfully', data: userCart });
	} catch (err) {
		next(err);
	}
};

export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await prisma.cart.updateMany({ where: { user_id: req.user.id, deleted: false }, data: { deleted: true } });
		const userCart = await prisma.cart.findMany({ where: { user_id: req.user.id, deleted: false }, select: cartSelect });
		res.status(200).json({ success: true, message: 'Cart items cleared successfully', data: userCart });
	} catch (err) {
		next(err);
	}
};
