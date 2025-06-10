import { user, cart } from './../../../node_modules/.prisma/client/index.d';
import { Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetAllOrdersDto } from './dto/get-all-orders.dto';
import { checkPagination, GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { UserType } from '../auth/dto';
import { nanoid } from 'nanoid/async';

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as CreateOrderDto;
		const user = await prisma.user.findUnique({ where: { id: req.user.id } });
		if (!user) return next(new Error('User not found'));

		if (dto.cart_user_id && dto.product_id) return next(new Error('You can only order one of cart or product'));

		let cart: any;
		if (dto.cart_user_id) {
			cart = await prisma.cart.findMany({
				where: { user_id: dto.cart_user_id, deleted: false },
				select: { product_id: true, quantity: true },
			});
			if (!cart || cart.length === 0) return next(new Error('Cart not found'));
		}

		let product: any;
		if (dto.product_id) {
			product = await prisma.product.findUnique({ where: { id: dto.product_id } });
			if (!product) return next(new Error('Product not found'));
		}

		const address = await prisma.address.findUnique({ where: { id: dto.address_id } });
		if (!address) return next(new Error('Address not found'));

		const orderData: Prisma.orderCreateManyArgs['data'] = {
			user_id: user.id,
			address_id: address.id,
		};

		const order = await prisma.order.create({ data: orderData });

		const orderItemsData: Prisma.order_itemCreateManyInput[] = [];

		if (cart) {
			for (const item of cart) {
				orderItemsData.push({
					order_id: order.id,
					product_id: item.product_id,
					quantity: item.quantity,
				});
			}
		}

		if (product) {
			orderItemsData.push({
				order_id: order.id,
				product_id: product.id,
				quantity: dto.quantity,
			});
		}

		const orderItems = await prisma.order_item.createMany({ data: orderItemsData });

		await prisma.cart.updateMany({ where: { user_id: dto.cart_user_id }, data: { deleted: true } });

		res.status(201).json({ success: true, data: orderItems });
	} catch (err) {
		next(err);
	}
};

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userType = req.user.type as UserType;
		const dto = req.query as unknown as GetAllOrdersDto;
		const pagination = req.query as GlobalPaginationDto;
		const search = req.query as GlobalSearchDto;
		const where: any = { deleted: false };
		if (dto.user_id) {
			if (userType === UserType.USER && dto.user_id !== req.user.id) {
				return next(new Error('You are not authorized to access this resource'));
			}
			const user = await prisma.user.findUnique({ where: { id: dto.user_id } });
			if (!user) return next(new Error('User not found'));
			where.user_id = user.id;
		}
		if (dto.product_id) {
			const product = await prisma.product.findUnique({ where: { id: dto.product_id } });
			if (!product) return next(new Error('Product not found'));
			where.product_id = product.id;
		}
		if (dto.address_id) {
			const address = await prisma.address.findUnique({ where: { id: dto.address_id } });
			if (!address) return next(new Error('Address not found'));
			where.address_id = address.id;
		}
		if (dto.status) where.status = dto.status;

		if (dto.order_serial) where.order_serial = dto.order_serial;

		if (search.search) {
			where.OR = [
				{
					order_item: {
						product: {
							name: {
								contains: search.search,
							},
						},
					},
				},
				{
					address: {
						recipient_name: {
							contains: search.search,
						},
					},
				},
				{
					address: {
						recipient_phone: {
							contains: search.search,
						},
					},
				},
				{
					address: {
						address: {
							contains: search.search,
						},
					},
				},
				{
					address: {
						city: {
							contains: search.search,
						},
					},
				},
				{
					address: {
						zip_code: {
							contains: search.search,
						},
					},
				},
				{
					address: {
						address_details: {
							contains: search.search,
						},
					},
				},
				{
					status: {
						contains: search.search,
					},
				},
				{
					user: {
						email: {
							contains: search.search,
						},
					},
				},
				{
					user: {
						fullname: {
							contains: search.search,
						},
					},
				},
				{
					user: {
						phone: {
							contains: search.search,
						},
					},
				},
			];
		}

		const orders = await prisma.order.findMany({
			where,
			select: {
				id: true,
				user_id: true,
				user: true,
				address_id: true,
				address: true,
				status: true,
				createdAt: true,
				updatedAt: true,
				order_item: {
					select: {
						id: true,
						product: true,
						product_id: true,
						quantity: true,
					},
				},
			},
			...checkPagination(pagination),
		});
		const total = await prisma.order.count({ where });

		res.status(200).json({ success: true, count: total, data: orders });
	} catch (err) {
		next(err);
	}
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userType = req.user.type as UserType;
		const params = req.params as unknown as IdentifierDto;

		const order = await prisma.order.findUnique({
			where: { id: params.id },
			select: {
				id: true,
				user_id: true,
				user: true,
				address_id: true,
				address: true,
				status: true,
				order_item: {
					select: {
						product: true,
						product_id: true,
						quantity: true,
					},
				},
			},
		});

		if (!order) return next(new Error('Order not found'));

		if (userType === UserType.USER && order.user_id !== req.user.id) {
			return next(new Error('You are not authorized to access this resource'));
		}

		res.status(200).json({ success: true, data: order });
	} catch (err) {
		next(err);
	}
};

export const changeOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const params = req.params as unknown as IdentifierDto;
		const userType = req.user.type as UserType;
		const dto = req.body as UpdateOrderDto;

		const order = await prisma.order.findUnique({ where: { id: params.id } });
		if (!order) return next(new Error('Order not found'));

		if (userType === UserType.USER && order.user_id !== req.user.id) {
			return next(new Error('You are not authorized to access this resource'));
		}

		if (
			userType === UserType.USER &&
			(dto.status !== 'cancelled' || (order.status !== 'pending' && order.status !== 'processing'))
		) {
			return next(new Error('The order is not in a valid state to be cancelled'));
		}

		const updatedOrder = await prisma.order.update({
			where: { id: params.id },
			data: {
				status: dto.status,
			},
		});
		res.status(200).json({ success: true, data: updatedOrder });
	} catch (err) {
		next(err);
	}
};
