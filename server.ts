/* eslint-disable no-console */
const dotenv = require('dotenv');
import prisma from './src/lib/prisma';
import { httpServer } from './app';

process.on('uncaughtException', (err) => {
	console.error(err);
	console.error(err.name, ':', err.message);
	console.error('Uncaught Exception 💥 : Shutting Down...');

	// Recommended Termination
	process.exit(1);
});

dotenv.config({
	path: './config.env',
});

const port = process.env.PORT || 5000;

httpServer.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

process.on('unhandledRejection', (err: any) => {
	console.error(err.name);
	console.error(err.name, ':', err.message);
	console.error('Unhandled Rejection 💥 : Shutting Down...');
	// Optional Terminating
	httpServer.close(() => {
		process.exit(1);
	});
});

process.on('SIGINT', async () => {
	await prisma.$disconnect();
	process.exit();
});

process.on('SIGTERM', async () => {
	await prisma.$disconnect();
	process.exit();
});
