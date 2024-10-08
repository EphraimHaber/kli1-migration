import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { type Router } from 'express';
// import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { fetchUserFromToken, isAuthenticated } from '@/common/middleware/passport';
import {
    addPayment,
    checkAuth,
    getConfirmMail,
    login,
    getPayments,
    logout,
    signup,
    roleCheck,
    serviceAuthFacebook,
    serviceAuthGoogle,
    updatePaymentCustomerStatus,
} from './authController';
import { authenticate } from 'passport';

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

// authRouter.use(fetchUserFromToken);

// authRegistry.registerPath({})

authRouter.post('/addpayment', addPayment);
authRouter.post('/getPayments/:id', getPayments);
authRouter.post('/updatePaymentCustomerStatus/:id', updatePaymentCustomerStatus);
authRouter.post('/login', login);
authRouter.post('/signup', signup);
authRouter.get('/reg/checkEmail/:checkID', getConfirmMail);
authRouter.get(['/google-login', '/google-reg'], () => authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get(['/facebook-login', '/facebook-reg'], () => authenticate('facebook'));
authRouter.get(['/facebook/:callback'], serviceAuthFacebook);
authRouter.get(['/google/:callback'], serviceAuthGoogle);
authRouter.post('/checkAuth', checkAuth);
authRouter.get('/logout', logout);
authRouter.get('/completion', isAuthenticated, roleCheck);
