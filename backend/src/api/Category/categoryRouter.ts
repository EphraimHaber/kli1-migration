import { fetchUserFromToken } from '@/common/middleware/passport';
import express, { Router } from 'express';
import {
    getMainCategories,
    getAllCategories,
    loadCategories,
    getTopCategories,
    getCategories,
    getSubcategories,
} from './categoryController';
import { postUserData } from '../user/userController';

export const categoryRouter: Router = express.Router();

categoryRouter.use(fetchUserFromToken);

categoryRouter.post('/categories', getMainCategories);
categoryRouter.post('/allcategories', getAllCategories);
categoryRouter.get('/categories/:id', loadCategories);
categoryRouter.post('/categories/top', getTopCategories);
categoryRouter.post('/categories/:id', getCategories);
categoryRouter.get('/subcategories/:id', loadCategories);
categoryRouter.post('/subcategories/:id', getSubcategories);
categoryRouter.post('/services/list', postUserData);
