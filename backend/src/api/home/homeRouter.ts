import express from 'express';
const router = express.Router();
import path from 'path';
import { fetchUserFromToken } from '@/common/middleware/passport';
import { getProject, index } from './homeController';
import { logger } from '@/common/utils/logger';

router.use(fetchUserFromToken);
router.get('/', index);
router.get('/projects', getProject);

router.get('/error-confirm-mail', function (req, res) {
    res.status(200).send();
    logger.info('sending dist/index.html');
});
router.use(function (req, res) {
    res.status(404).send();
    logger.info('sending dist/index.html');
});

export default router;
