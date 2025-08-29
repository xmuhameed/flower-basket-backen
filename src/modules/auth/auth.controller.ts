import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, UserType } from './dto';
import axios from 'axios';
import { nanoid } from 'nanoid/async';
import { saveFile } from '../../../src/shared/middleware/save-file.middleware';
import { Prisma } from '.prisma/client';
import { productSelect } from '../product/product.controller';

const authService = new AuthService();

export const login = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as LoginDto;
		const result = await authService.login(dto);
		res.status(200).json({ success: true, ...result });
	} catch (error) {
		next(error);
	}
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as RegisterDto;
		const result = await authService.register(dto);
		res.status(201).json({ success: true, data: result });
	} catch (error) {
		next(error);
	}
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
	const user = req.user as any;
	if (user.type === UserType.USER) {
		const User = await prisma.user.findUnique({
			where: {
				id: req.user.id,
				deleted: false,
			},
			select: {
				id: true,
				fullname: true,
				email: true,
				phone: true,
				qrcode: true,
				profile_image_url: true,
				gender: true,
				birth_date: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!User) {
			return next(new Error('User not found'));
		}
		res.status(200).json({ success: true, data: { ...User, type: user.type } });
	} else if (user.type === UserType.ADMIN) {
		const admin = await prisma.admin.findUnique({
			where: {
				id: req.user.id,
				deleted: false,
			},
			select: {
				id: true,
				fullname: true,
				email: true,
				phone: true,
				qrcode: true,
				profile_image_url: true,
				gender: true,
				birth_date: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!admin) {
			return next(new Error('Admin not found'));
		}
		res.status(200).json({ success: true, data: { ...admin, type: user.type } });
	} else {
		return next(new Error('User not found'));
	}
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { code } = req.query;
		const tokenRes = await axios.post(`https://oauth2.googleapis.com/token`, {
			code,
			client_id: process.env.GOOGLE_CLIENT_ID,
			client_secret: process.env.GOOGLE_CLIENT_SECRET,
			redirect_uri: 'http://localhost:3000/auth/callback',
			grant_type: 'authorization_code',
		});

		const { access_token, id_token } = tokenRes.data;

		const userRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
			headers: {
				Authorization: `Bearer ${access_token}`,
			},
		});

		const user = userRes.data;

		let userData = await prisma.user.findUnique({
			where: {
				email: user.email,
			},
		});

		let newUserData: Prisma.userCreateInput;
		let newUser;
		if (!userData) {
			const uniqueCode = await nanoid(10);
			newUserData = {
				email: user.email,
				fullname: user.given_name + ' ' + user.family_name,
				qrcode: uniqueCode,
			};

			if (user.picture) {
				const imageResponse = await axios.get(user.picture, { responseType: 'arraybuffer' });
				const imageBuffer = Buffer.from(imageResponse.data);
				const imageFile = {
					data: imageBuffer,
					name: 'profile.jpg',
					mimetype: 'image/jpeg',
					size: imageBuffer.length,
				};

				const nestedFolder = `users/user-${uniqueCode}`;

				if (imageResponse.status === 200) {
					const result = await saveFile(nestedFolder, imageFile as any, {
						prefix: 'profile-',
						allowedExtensions: ['.jpg', '.png', '.jpeg'],
					});
					newUserData.profile_image_url = result.relativePath;
				}
			}
			newUser = await prisma.user.create({
				data: newUserData,
			});
		}

		const token = authService.generateToken(userData ? userData.id : newUser.id, UserType.USER);

		res.status(200).json({ success: true, token });
	} catch (error) {
		next(error);
	}
};

export const categorizations = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const productTypes = await prisma.product_type.findMany({
			where: {
				deleted: false,
			},
			select: {
				id: true,
				name: true,
				name_ar: true,
				qrcode: true,
				product_type_image_url: true,
				// product: {

				// }
			},
			orderBy: {
				sort: 'desc',
			},
		});

		const collections = await prisma.collection.findMany({
			where: {
				deleted: false,
			},
			select: {
				id: true,
				name: true,
				name_ar: true,
				qrcode: true,
				collection_image_url: true,
				product: {
					where: {
						deleted: false,
					},
					select: productSelect,
					orderBy: {
						collection_index: 'desc',
					},
					take: 6,
				},
			},
			orderBy: {
				sort: 'desc',
			},
		});
		const homeSliders = await prisma.home_slider.findMany({
			where: {
				deleted: false,
			},
			select: {
				id: true,
				name: true,
				name_ar: true,
				qrcode: true,
				button_text: true,
				button_url: true,
				slider_image_url: true,
			},
			orderBy: {
				sort: 'desc',
			},
		});

		const brands = await prisma.brand.findMany({
			where: {
				deleted: false,
			},
			select: {
				id: true,
				name: true,
				name_ar: true,
				qrcode: true,
				brand_image_url: true,
			},
		});

		const categories = await prisma.category.findMany({
			where: {
				deleted: false,
			},
			select: {
				id: true,
				name: true,
				name_ar: true,
				qrcode: true,
				category_image_url: true,
			},
			orderBy: {
				sort: 'desc',
			},
		});

		const giftFor = await prisma.gift_for.findMany({
			where: {
				deleted: false,
			},
			select: {
				id: true,
				name: true,
				name_ar: true,
				qrcode: true,
				gift_for_image_url: true,
			},
			orderBy: {
				sort: 'desc',
			},
		});

		res.status(200).json({
			success: true,
			data: {
				productTypes,
				collections,
				homeSliders,
				brands,
				categories,
				giftFor,
			},
		});
	} catch (error) {
		next(error);
	}
};
