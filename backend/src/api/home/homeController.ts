import { logger } from '@/common/utils/logger';
import { Request, Response } from 'express';

export const index = (req: Request, res: Response) => {
    logger.info('sending index.html');
};

export const getProject = (req: Request, res: Response) => {
    logger.info('sending dist/index.html');
};
