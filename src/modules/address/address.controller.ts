import { NextFunction, Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { CreateAddressDto, GetAllAddressesDto, UpdateAddressDto } from './dto';
import { checkPagination, GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';

const prisma = new PrismaClient();

export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as CreateAddressDto;

		const user = await prisma.user.findUnique({
			where: { id: dto.user_id },
		});
		if (!user) {
			return next(new Error('User not found'));
		}


		const addressData: Prisma.addressCreateManyArgs['data'] = {
			user_id: dto.user_id,
			address: dto.address,
			city: dto.city,
			country: dto.country,
			address_details: dto.address_details,
			zip_code: dto.zip_code,
			recipient_name: dto.recipient_name,
			recipient_phone: dto.recipient_phone,
			location_url: dto.location_url,
			shipping_fee: 5,
		};

		const address = await prisma.address.create({
			data: addressData,
		});
		res.status(201).json({ success: true, data: address });
	} catch (err) {
		next(err);
	}
};

export const getAllAddresses = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.query as GetAllAddressesDto;
		const pagination = req.query as GlobalPaginationDto;
		const search = req.query as GlobalSearchDto;

		if (dto.user_id) {
			const user = await prisma.user.findUnique({
				where: { id: Number(dto.user_id), deleted: false },
			});
			if (!user) {
				return next(new Error('User not found'));
			}
		}

		const whereObj: Prisma.addressWhereInput = {
			deleted: false,
			...(dto.user_id && {
				user_id: dto.user_id,
			}),
		};

		if (search.search) {
			whereObj.OR = [
				{
					address: {
						contains: search.search,
					},
				},
				{
					city: {
						contains: search.search,
					},
				},
				{
					address_details: {
						contains: search.search,
					},
				},
				{
					zip_code: {
						contains: search.search,
					},
				},
				{
					recipient_name: {
						contains: search.search,
					},
				},
				{
					recipient_phone: {
						contains: search.search,
					},
				},
			];
		}

		const addresses = await prisma.address.findMany({
			where: whereObj,
			...checkPagination(pagination),
		});
		const totalAddresses = await prisma.address.count({
			where: whereObj,
		});

		res.status(200).json({ success: true, count: totalAddresses, data: addresses });
	} catch (err) {
		next(err);
	}
};

export const getAddressById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.params as any as IdentifierDto;
		const address = await prisma.address.findUnique({
			where: {
				id: dto.id,
				deleted: false,
			},
		});
		if (!address) {
			return next(new Error('Address not found'));
		}
		res.status(200).json({ success: true, data: address });
	} catch (err) {
		next(err);
	}
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as UpdateAddressDto;
		const identifier = req.params as any as IdentifierDto;
		const address = await prisma.address.findUnique({
			where: {
				id: identifier.id,
				deleted: false,
			},
		});
		if (!address) {
			return next(new Error('Address not found'));
		}

		const addressData: Prisma.addressUpdateInput = {
			...(dto.address && { address: dto.address }),
			...(dto.city && { city: dto.city }),
			...(dto.country && { country: dto.country }),
			...(dto.address_details && { address_details: dto.address_details }),
			...(dto.zip_code && { zip_code: dto.zip_code }),
			...(dto.recipient_name && { recipient_name: dto.recipient_name }),
			...(dto.recipient_phone && { recipient_phone: dto.recipient_phone }),
			...(dto.location_url && { location_url: dto.location_url }),
		};
		const updatedAddress = await prisma.address.update({
			where: { id: Number(identifier.id) },
			data: addressData,
		});
		res.status(200).json({ success: true, data: updatedAddress });
	} catch (err) {
		next(err);
	}
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.params as any as IdentifierDto;
		const address = await prisma.address.findUnique({
			where: {
				id: dto.id,
				deleted: false,
			},
		});
		if (!address) {
			return next(new Error('Address not found'));
		}
		await prisma.address.update({
			where: {
				id: dto.id,
				deleted: false,
			},
			data: {
				deleted: true,
			},
		});
		res.status(200).json({ success: true, message: 'Address deleted successfully' });
	} catch (err) {
		next(err);
	}
};
