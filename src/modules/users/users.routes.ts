import express from 'express';

import * as userController from './users.controller';
import { validationMiddleware } from '../../shared/middleware/validation.middleware';
import { GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { protect, restrictTo } from '../auth/auth.middleware';
import { UserType } from '../auth/dto';

const router = express.Router();

router.use(protect);

router
	.route('/')
	.get(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ query: [GlobalPaginationDto, GlobalSearchDto] }),
		userController.getAllUsers,
	);

router
.route('/:id')
.delete(restrictTo(UserType.ADMIN), validationMiddleware({ params: [IdentifierDto] }), userController.deleteUser)



export const userRoutes = router;
