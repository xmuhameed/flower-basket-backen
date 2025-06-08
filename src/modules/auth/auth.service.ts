import { PrismaClient } from '@prisma/client';
import { LoginDto, RegisterDto, UserType } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid/async';

const prisma = new PrismaClient();

export const hashPassword = async (password: string): Promise<string> => {
	return bcrypt.hash(password, 10);
};

const comparePasswords = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
	return bcrypt.compare(plainPassword, hashedPassword);
};
export class AuthService {
	private generateToken(userId: number, userType: UserType): string {
		return jwt.sign(
			{
				id: userId,
				type: userType,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: '30d',
			},
		);
	}

	async login(dto: LoginDto) {
		let user;

		if (dto.email.toLocaleLowerCase().includes('@admin.com')) {
			// Try to find user in each table
			const adminData = await prisma.admin.findFirst({
				where: { email: dto.email, deleted: false },
			});

			if (adminData) {
				user = adminData;
			}
		} else {
			const userData = await prisma.user.findFirst({
				where: { email: dto.email, deleted: false },
			});

			if (userData) {
				user = userData;
			}
		}

		if (!user) {
			throw new Error('Invalid credentials');
		}

		const isPasswordValid = await comparePasswords(dto.password, user.password ?? '');
		if (!isPasswordValid) {
			throw new Error('Invalid credentials');
		}

		const token = this.generateToken(
			user.id,
			dto.email.toLocaleLowerCase().includes('@admin.com') ? UserType.ADMIN : UserType.USER,
		);

		return {
			token,
			user: {
				id: user.id,
				email: user.email,
				fullname: user.fullname,
				user_type: dto.email.toLocaleLowerCase().includes('@admin.com') ? UserType.ADMIN : UserType.USER,
			},
		};
	}

	async register(dto: RegisterDto) {
		// Check if email exists in any table
		const existingAdmin = await prisma.admin.findFirst({ where: { email: dto.email } });
		const existingUser = await prisma.user.findFirst({ where: { email: dto.email } });

		if (existingAdmin || existingUser) {
			throw new Error('Email already exists');
		}

		const hashedPassword = await hashPassword(dto.password);
		const uniqueCode = await nanoid(10);

		let user;
		if (dto.email.toLocaleLowerCase().includes('@admin.com')) {
			if (dto.hiddenPassword !== process.env.ADMIN_PASSWORD) {
				throw new Error('Invalid credentials');
			}
			user = await prisma.admin.create({
				data: {
					email: dto.email,
					password: hashedPassword,
					fullname: dto.fullname,
					qrcode: uniqueCode,
				},
			});
		} else {
			user = await prisma.user.create({
				data: {
					email: dto.email,
					password: hashedPassword,
					fullname: dto.fullname,
					qrcode: uniqueCode,
				},
			});
		}

		const token = this.generateToken(
			user.id,
			dto.email.toLocaleLowerCase().includes('@admin.com') ? UserType.ADMIN : UserType.USER,
		);

		return {
			token,
			user: {
				id: user.id,
				email: user.email,
				fullname: user.fullname,
				user_type: dto.email.toLocaleLowerCase().includes('@admin.com') ? UserType.ADMIN : UserType.USER,
			},
		};
	}
}
