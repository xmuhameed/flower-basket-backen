import { Router } from 'express';
import * as favoriteController from './favorite.controller';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { validationMiddleware } from '../../shared/middleware/validation.middleware';
import { IdentifierDto } from '../../shared/global-dto';
import { protect, restrictTo } from '../auth/auth.middleware';
import { UserType } from '../auth/dto';

const router = Router();

router.use(protect);

router
	.route('/')
	.post(
		restrictTo(UserType.USER),
		validationMiddleware({ body: [CreateFavoriteDto] }),
		favoriteController.createFavorite,
	)
	.get(restrictTo(UserType.USER), favoriteController.getAllFavorites)
	.delete(restrictTo(UserType.USER), favoriteController.clearFavorites);

router
	.route('/:id')
	.delete(
		restrictTo(UserType.USER),
		validationMiddleware({ params: [IdentifierDto] }),
		favoriteController.deleteFavorite,
	);

export const favoriteRoutes = router;
