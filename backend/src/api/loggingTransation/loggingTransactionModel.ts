import mongoose, { Schema } from 'mongoose';
import { ILoggingTransactions } from './types';

const loggingTransaction = new Schema<ILoggingTransactions>({
    typeOperation: {
        type: String,
    },
    userFundsBeforeChange: {
        type: Number,
    },
    amountCredited: {
        type: Number,
    },
    writeOffAmount: {
        type: Number,
    },
    reservedAmount: {
        type: Number,
    },
    userFundsAfterChange: {
        type: Number,
    },
    currencyType: {
        type: String,
    },
    date: {
        type: Date,
    },
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
    },
});

loggingTransaction.pre('save', function (next) {
    const now = new Date();
    this.updatedAt = now;
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

export const loggingTransactions = mongoose.model<ILoggingTransactions>('loggingTransactions', loggingTransaction);
