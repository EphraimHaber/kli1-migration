import express from 'express';
import { addPayment, getPayments } from '../auth/authController';
const router = express.Router();

router.post('/payments/addpayment', addPayment);
router.post('/payments/getPayments/:id', getPayments);

export default router;
