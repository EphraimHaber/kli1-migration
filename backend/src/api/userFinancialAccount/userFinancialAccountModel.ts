import mongoose, { Schema } from 'mongoose';
import { IUserFinancialAccount } from './types';

const userFinancialAccount = new Schema<IUserFinancialAccount>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    currentFunds: {
        type: Number,
    },
    reservedFunds: {
        type: Number,
    },
    fundsRequestedForWithdrawal: {
        type: Number,
    },
    currencyType: {
        type: String,
    },
    lastOperationDate: {
        type: Date,
    },
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
    },
});

userFinancialAccount.pre('save', function (next) {
    const now = new Date();
    this.updatedAt = now;
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

export const userFinancialAccounts = mongoose.model<IUserFinancialAccount>(
    'userFinancialAccounts',
    userFinancialAccount,
);
