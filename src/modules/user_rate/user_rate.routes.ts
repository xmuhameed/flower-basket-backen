import { Router } from 'express';
import * as userRateController from './user_rate.controller';
import { CreateUserRateDto } from './dto/create-user-rate.dto';
import { UpdateUserRateDto } from './dto/update-user-rate.dto';
import { GetAllUserRatesDto } from './dto/get-all-user-rates.dto';
import { validationMiddleware } from '../../shared/middleware/validation.middleware';
import { GlobalPaginationDto, IdentifierDto } from '../../shared/global-dto';
import { protect, restrictTo } from '../auth/auth.middleware';
import { UserType } from '../auth/dto';

const router = Router();

router.use(protect);

router
	.route('/')
	.post(
		restrictTo(UserType.USER),
		validationMiddleware({ body: [CreateUserRateDto] }),
		userRateController.createUserRate,
	)
	.get(
		restrictTo(UserType.ADMIN, UserType.USER),
		validationMiddleware({ query: [GetAllUserRatesDto, GlobalPaginationDto] }),
		userRateController.getAllUserRates,
	);

router
	.route('/:id')
	.get(
		restrictTo(UserType.ADMIN, UserType.USER),
		validationMiddleware({ params: [IdentifierDto] }),
		userRateController.getUserRateById,
	)
	.put(
		restrictTo(UserType.USER),
		validationMiddleware({ body: [UpdateUserRateDto], params: [IdentifierDto] }),
		userRateController.updateUserRate,
	)
	.delete(
		restrictTo(UserType.USER),
		validationMiddleware({ params: [IdentifierDto] }),
		userRateController.deleteUserRate,
	);

export const userRateRoutes = router;
