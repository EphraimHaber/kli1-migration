import { fetchUserFromToken } from '@/common/middleware/passport';
import express, { Router } from 'express';
import { loadSearchPage, searchQuestions, advanceSearchQuestions, getQuestions } from './productController';
const productRouter: Router = express.Router();

productRouter.use(fetchUserFromToken);
productRouter.get(['/services/search'], loadSearchPage);
productRouter.post(['/services/search'], searchQuestions);
productRouter.post(['/services/advance_search'], advanceSearchQuestions);
productRouter.post(['/services/:id'], getQuestions);

export default productRouter;
