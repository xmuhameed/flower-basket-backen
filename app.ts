import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xss = require('xss-clean');
import cookieParser from 'cookie-parser';
import { createServer } from 'http';

import prisma from './src/lib/prisma';

import fileUpload from 'express-fileupload';

import AppError from './utils/appError';
import errorController from './src/shared/controllers/errorController';
import { authRoutes } from './src/modules/auth/auth.routes';
import { adminRoutes } from './src/modules/admins/admins.routes';
import { addressRoutes } from './src/modules/address/address.routes';
import { brandRoutes } from './src/modules/brand/brand.routes';
import { collectionRoutes } from './src/modules/collection/collection.routes';
import { categoryRoutes } from './src/modules/category/category.routes';
import { giftForRoutes } from './src/modules/gift_for/gift_for.routes';
import { homeSliderRoutes } from './src/modules/home_slider/home_slider.routes';
import { orderRoutes } from './src/modules/order/order.routes';
import { productRoutes } from './src/modules/product/product.routes';
import { userRateRoutes } from './src/modules/user_rate/user_rate.routes';
import { favoriteRoutes } from './src/modules/favorite/favorite.routes';
import { cartRoutes } from './src/modules/cart/cart.routes';
import { userRoutes } from './src/modules/users/users.routes';

const app = express();

app.use(fileUpload());
const httpServer = createServer(app);

// to Add view engine and views uncomment this two lines
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

// Serve Static Files
app.use('/', express.static(path.join(__dirname, 'uploads')));

// Setting Security http headers
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Implement Rate Limiting
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000, // to limit the number of requests from the same IP in one hour
	message: 'to many requests from this IP, Please try again in one hour!',
});
app.use('/api', limiter);

// Get Data From body into req.body
app.use(express.json({ limit: '10kb' })); // to limit the size of the body
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // to limit the size of the body
app.use(cookieParser());

// Data sanitization (XSS)
app.use(xss());

// general middleware to log the request
app.use((req: Request, res: Response, next: NextFunction) => {
	// See the Authorization header
	next();
});

// Routes

app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/gift-for', giftForRoutes);
app.use('/api/home-sliders', homeSliderRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user-rates', userRateRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/carts', cartRoutes);

// Unhandled Routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error Handle Middleware
app.use(errorController);

// Initialize connection
async function main() {
	try {
		await prisma.$connect();
		console.info('Database connected via Prisma');
	} catch (error) {
		console.error('Database connection error:', error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();

export { httpServer };
export default app;
