import express from 'express';
import * as homeSliderController from './home_slider.controller';
import { CreateHomeSliderDto } from './dto/create-home-slider.dto';
import { UpdateHomeSliderDto } from './dto/update-home-slider.dto';
import { GetAllHomeSlidersDto } from './dto/get-all-home-sliders.dto';
import { validationMiddleware } from '../../shared/middleware/validation.middleware';
import { GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { protect, restrictTo } from '../auth/auth.middleware';
import { UserType } from '../auth/dto';

const router = express.Router();

router
	.route('/')
	.get(
		validationMiddleware({ query: [GetAllHomeSlidersDto, GlobalPaginationDto, GlobalSearchDto] }),
		homeSliderController.getAllHomeSliders,
	);

router.route('/:id').get(validationMiddleware({ params: [IdentifierDto] }), homeSliderController.getHomeSliderById);

router.use(protect);

router
	.route('/')
	.post(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ body: [CreateHomeSliderDto] }),
		homeSliderController.createHomeSlider,
	);

router
	.route('/:id')
	.put(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ body: [UpdateHomeSliderDto], params: [IdentifierDto] }),
		homeSliderController.updateHomeSlider,
	)
	.delete(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ params: [IdentifierDto] }),
		homeSliderController.deleteHomeSlider,
	);

export const homeSliderRoutes = router;
