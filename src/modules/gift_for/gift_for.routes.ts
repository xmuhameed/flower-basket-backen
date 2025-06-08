import express from 'express';
import * as giftForController from './gift_for.controller';
import { CreateGiftForDto } from './dto/create-gift-for.dto';
import { UpdateGiftForDto } from './dto/update-gift-for.dto';
import { GetAllGiftForDto } from './dto/get-all-gift-for.dto';
import { validationMiddleware } from '../../shared/middleware/validation.middleware';
import { GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { protect, restrictTo } from '../auth/auth.middleware';
import { UserType } from '../auth/dto';

const router = express.Router();

router
	.route('/')
	.get(
		validationMiddleware({ query: [GetAllGiftForDto, GlobalPaginationDto, GlobalSearchDto] }),
		giftForController.getAllGiftFor,
	);

router.route('/:id').get(validationMiddleware({ params: [IdentifierDto] }), giftForController.getGiftForById);

router.use(protect);

router
	.route('/')
	.post(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ body: [CreateGiftForDto] }),
		giftForController.createGiftFor,
	);

router
	.route('/:id')
	.put(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ body: [UpdateGiftForDto], params: [IdentifierDto] }),
		giftForController.updateGiftFor,
	)
	.delete(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ params: [IdentifierDto] }),
		giftForController.deleteGiftFor,
	);

export const giftForRoutes = router;
