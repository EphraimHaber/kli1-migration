import { Document, Schema } from 'mongoose';

export interface IUserFinancialAccount extends Document {
    _id: Schema.Types.ObjectId | undefined;
    userId: Schema.Types.ObjectId;
    currentFunds: number;
    reservedFunds: number;
    fundsRequestedForWithdrawal: number;
    currencyType: string;
    lastOperationDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
