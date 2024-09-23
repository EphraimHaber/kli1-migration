import mongoose, { Schema } from 'mongoose';
import { IPayments } from './types';

const payment = new Schema<IPayments>({
    paymentID: {
        type: String,
    },
    projectID: {
        type: String,
    },
    freelancerName: {
        type: String,
    },
    freelancerEmail: {
        type: String,
    },
    price: {
        type: String,
    },
    ownerID: {
        type: String,
    },
    paymentStatus: {
        type: String,
    },
    date: {
        type: Date,
    },
    notes: {
        type: String,
    },
    isFreelencerAccept: {
        type: String,
        default: 'underСonsideration',
    },
});
export const Payment = mongoose.model<IPayments>('Payment', payment);
export default Payment;
