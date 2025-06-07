import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, UserType } from './dto';

const authService = new AuthService();

export const login = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as LoginDto;
		const result = await authService.login(dto);
		res.status(200).json({ success: true, data: result });
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
		const user = await prisma.user.findUnique({
			where: {
				id: req.user.id,
				deleted: false,
			},
			select: {
				id: true,
				fullname: true,
				gender: true,
				birth_date: true,
				email: true,
				phone: true,
				qrcode: true,
				profile_image_url: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!user) {
			return next(new Error('User not found'));
		}
		res.status(200).json({ success: true, data: user });
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
		res.status(200).json({ success: true, data: admin });
	} else {
		return next(new Error('User not found'));
	}
};
