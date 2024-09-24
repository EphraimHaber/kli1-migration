// import { userFinancialAccounts } from '../models/UserFinancialAccount'
// import { getDateTime } from '../util/gettingDate'
// import { sendMessage } from '../util/socket_io'
// import { loggingTransactions } from '../models/LoggingTransactions'
import mongoose, { Model } from 'mongoose';
import { getDateTime } from './dateUtils';
import { logger } from './logger';
import { userFinancialAccounts } from '@/api/userFinancialAccount/userFinancialAccountModel';
import { loggingTransactions } from '@/api/loggingTransation/loggingTransactionModel';

export const makePaymentAndReserv = async (data: any) => {
    try {
        console.log('makePayment: ', data);

        const userWallet = await userFinancialAccounts
            .findOne({ userId: data.userId })
            .sort({ createdAt: -1 })
            .limit(1);

        if (!userWallet) {
            const newWallet = new userFinancialAccounts({
                userId: data.userId,
                currentFunds: data.price,
                reservedFunds: 0,
                fundsRequestedForWithdrawal: 0,
                currencyType: 'USD',
                lastOperationDate: getDateTime(),
            });

            try {
                await newWallet.save();
            } catch (e) {
                logger.error('ERR save newWallet: ' + e);
                return { type: 'error', message: e };
            }
            await loggOperation('added', 0, data.price, 0, 0, data.userId);
            console.log('save new wallet');

            return { type: 'success', data: userWallet };
        } else {
            console.log('get wallet');

            return { type: 'success', data: userWallet };
        }
    } catch (err) {
        logger.error('ERR makePayment: ' + err);
        return { type: 'error', message: err };
    }
};

async function reserveFunds(userId: string, funds: number) {
    try {
        console.log('userId: ', userId);
        // @ts-ignore
        const wallet = await userFinancialAccounts.findOne({ userId: userId });

        console.log('wallet: ', wallet);

        if (!wallet) {
            console.log('err not get user wallet');
            return { type: 'error', message: 'err not get user wallet' };
        }

        if (wallet.currentFunds > funds) {
            // @ts-ignore
            const newWallet = await userFinancialAccounts.updateOne(
                { userId: userId },
                {
                    $set: [
                        { currentFunds: wallet.currentFunds - funds },
                        { reservedFunds: wallet.reservedFunds + funds },
                    ],
                },
            );

            console.log('newWallet: ', newWallet);

            if (!newWallet) {
                return { type: 'error', message: 'err reserve funds in user ' + userId + ' wallet' };
            }

            const logged = await loggOperation(
                'reserv',
                wallet.currentFunds,
                wallet.currentFunds - funds,
                0,
                funds,
                userId,
            );

            return { type: 'success', data: newWallet };
        } else {
            return { type: 'error', message: 'insufficient funds' };
        }
    } catch (err) {
        console.log('err reserver funds: ', err);
        return { type: 'error', message: err };
    }
}

async function loggOperation(
    type: string,
    userFundsBeforeChange: number,
    amountCredited: number,
    writeOffAmount: number,
    reservedAmount: number,
    userId: string,
) {
    try {
        let newAmount = 0;

        if (type == 'added') {
            newAmount = userFundsBeforeChange + amountCredited;
        } else if (type == 'reserv') {
            newAmount = userFundsBeforeChange - reservedAmount;
        } else if (type == 'writeOff') {
            newAmount = userFundsBeforeChange - writeOffAmount;
        } else if (type == 'refund') {
            newAmount = userFundsBeforeChange + reservedAmount;
        } else if (type == 'transfer') {
            reservedAmount = reservedAmount - writeOffAmount;
        }

        const loggs = new loggingTransactions({
            userId: userId,
            typeOperation: type,
            userFundsBeforeChange: userFundsBeforeChange,
            amountCredited: newAmount,
            writeOffAmount: writeOffAmount,
            reservedAmount: reservedAmount,
            userFundsAfterChange: newAmount,
            currencyType: 'USD',
            lastOperationDate: getDateTime(),
        });

        await loggs.save().catch((err) => {
            logger.error('ERR save loggs: ' + err);
            return { type: 'error', message: err };
        });

        logger.info('added log for wallet user ' + userId);

        return { type: 'success', data: 'added log' };
    } catch (err) {
        logger.error('err reserver funds: ', err);
        return { type: 'error', message: err };
    }
}
