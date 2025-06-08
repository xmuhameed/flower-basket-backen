import express from 'express';
import * as collectionController from './collection.controller';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { GetAllCollectionsDto } from './dto/get-all-collections.dto';
import { validationMiddleware } from '../../shared/middleware/validation.middleware';
import { GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { protect, restrictTo } from '../auth/auth.middleware';
import { UserType } from '../auth/dto';

const router = express.Router();

router.use(protect);

router
	.route('/')
	.post(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ body: [CreateCollectionDto] }),
		collectionController.createCollection,
	)
	.get(
		restrictTo(UserType.ADMIN, UserType.USER),
		validationMiddleware({ query: [GetAllCollectionsDto, GlobalPaginationDto, GlobalSearchDto] }),
		collectionController.getAllCollections,
	);

router
	.route('/:id')
	.get(
		restrictTo(UserType.ADMIN, UserType.USER),
		validationMiddleware({ params: [IdentifierDto] }),
		collectionController.getCollectionById,
	)
	.put(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ body: [UpdateCollectionDto], params: [IdentifierDto] }),
		collectionController.updateCollection,
	)
	.delete(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ params: [IdentifierDto] }),
		collectionController.deleteCollection,
	);

export const collectionRoutes = router;
