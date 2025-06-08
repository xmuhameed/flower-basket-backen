import { Router } from 'express';
import * as favoriteController from './favorite.controller';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { GetAllFavoritesDto } from './dto/get-all-favorites.dto';
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
		validationMiddleware({ body: [CreateFavoriteDto] }),
		favoriteController.createFavorite,
	)
	.get(
		restrictTo(UserType.USER),
		validationMiddleware({ query: [GetAllFavoritesDto, GlobalPaginationDto] }),
		favoriteController.getAllFavorites,
	);

router
	.route('/:id')
	.delete(
		restrictTo(UserType.USER),
		validationMiddleware({ params: [IdentifierDto] }),
		favoriteController.deleteFavorite,
	);

export const favoriteRoutes = router;
