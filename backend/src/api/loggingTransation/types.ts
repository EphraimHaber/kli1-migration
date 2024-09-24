import { Document, Schema } from 'mongoose';

export interface ILoggingTransactions extends Document {
    _id: Schema.Types.ObjectId | undefined;
    typeOperation: string;
    userFundsBeforeChange: number;
    amountCredited: number;
    reservedAmount: number;
    writeOffAmount: number;
    userFundsAfterChange: number;
    currencyType: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}
