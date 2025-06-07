import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { UserType } from './dto/auth.dto';

const prisma = new PrismaClient();

interface JwtPayload {
	id: number;
	type: UserType;
}

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: number;
				type: UserType;
			};
		}
	}
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// 1) Get token from header
		const authHeader = req.headers.authorization;
		console.log(authHeader);
		if (!authHeader?.startsWith('Bearer ')) {
			res.status(401).json({ success: false, message: 'Not authorized' });
			return;
		}

		const token = authHeader.split(' ')[1];

		// 2) Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;

		// 3) Check if user still exists
		let user;
		console.log(decoded);
		switch (decoded.type) {
			case UserType.ADMIN:
				user = await prisma.admin.findFirst({
					where: { id: decoded.id, deleted: false },
				});
				break;
			case UserType.USER:
				user = await prisma.user.findFirst({
					where: { id: decoded.id, deleted: false },
				});
				break;
		}

		if (!user) {
			res.status(401).json({ success: false, message: 'User no longer exists' });
			return;
		}

		delete user.password;
		delete user.deleted;
		delete user.createdAt;
		delete user.updatedAt;

		// 4) Set user in request
		req.user = {
			...user,
			type: decoded.type,
		};

		next();
	} catch (error) {
		console.log(error);
		res.status(401).json({ success: false, message: 'Not authorized' });
	}
};

export const restrictTo = (...userTypes: UserType[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			res.status(401).json({ success: false, message: 'Not authorized' });
			return;
		}
		if (!userTypes.includes(req.user.type)) {
			res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
			return;
		}

		next();
	};
};
