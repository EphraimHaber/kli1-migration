import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { env } from '@/common/utils/envConfig';

export const generateToken = (): string => {
    const rand = () => {
        return Math.random().toString(36).substr(2); // remove `0.`
    };
    const token = () => {
        return rand() + rand(); // to make it longer
    };
    return token();
};

export const generateJWT = (userId: mongoose.Types.ObjectId, expiresIn: string): string => {
    const { SESSION_SECRET } = env;
    return jwt.sign({ _id: userId }, SESSION_SECRET, { algorithm: 'HS256', expiresIn: `${expiresIn}d` });
};

export const decodeJWT = async (token: string) => {
    const { SESSION_SECRET } = env;

    try {
        return jwt.verify(token, SESSION_SECRET, { complete: false });
    } catch (err) {
        console.log('err: ', err);
        return null;
    }
};

export type comparePasswordFunction = (
    candidatePassword: string,
    hashPassword: string,
    cb: (err: any, isMatch: any) => void,
) => void;

export const comparePassword: comparePasswordFunction = (candidatePassword, hashPassword, cb) => {
    bcrypt.compare(candidatePassword, hashPassword, (err, isMatch) => {
        cb(err, isMatch);
    });
};
