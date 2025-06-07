import { Request } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
const storage = multer.diskStorage({
	destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
		const userId = uuidv4();
		cb(null, path.join(process.cwd(), 'uploads', 'profile_images', userId));
	},
	filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + path.extname(file.originalname));
	},
});

export const uploadImage = multer({
	storage,
	limits: { fileSize: 2 * 1024 * 1024 }, // الحد الأقصى لحجم الملف: 2 ميجابايت
	fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
		const fileTypes = /jpeg|jpg|png/;
		const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
		const mimetype = fileTypes.test(file.mimetype);

		if (extname && mimetype) {
			return cb(null, true);
		} else {
			cb(new Error('Only images (jpeg, jpg, png) are allowed'));
		}
	},
});
