import { Document, Schema } from 'mongoose';
import { comparePasswordFunction } from '@/common/middleware/jwtAndPasswordHandler';

export interface IAuthToken {
    accessToken: string;
    kind: string;
}

export interface IUserLangList {
    lang: string;
    val: string;
}

export interface IUserName {
    lang: string;
    val: string;
}

export interface IFinancialData {
    currency: string;
    val: number;
}

export interface IBankСardsList {
    numberCard: string;
    date: string;
    cvv: string;
    name: string;
}

export interface ITransactionList {
    val: string;
    currency: string;
    date: Schema.Types.Date;
    info: string;
}

export const userNameSchema = new Schema({
    lang: String,
    val: String,
});

export const langSchema = new Schema({
    lang: String,
    val: String,
});

export const transactionList = new Schema({
    val: String,
    currency: String,
    date: Schema.Types.Date,
    info: String,
});

export const financialData = new Schema({
    currency: String,
    val: Number,
});

export interface IUser extends Document {
    _id: string | undefined;
    email: string[];
    phone: string[];
    langList: IUserLangList[];
    defaultLang: string;
    photo: string;
    hashPassword: string;
    name: IUserName[];
    country: string;
    city: string;
    specializationList: string[];
    emailList: string[];
    phoneList: string[];
    siteList: string[];
    chatsIdList: [Schema.Types.ObjectId];
    financialAccount: IFinancialData;
    transactionList: ITransactionList;
    activeAccount: string;
    settingsSite: string;
    role: 'customer' | 'freelancer' | 'none';
    auth_token: IAuthToken[];
    comparePassword: comparePasswordFunction;
    isActive: boolean;
    password: string;
    passwordResetToken: string;
    tokenCheckedEmail: string;
    passwordResetExpires: Date;
    facebook_id: string;
    google_id: string;
    toAuth: any;
    nameCompany: string;
    reviewsList: [Schema.Types.ObjectId];
    customerProjectList: [Schema.Types.ObjectId];
    customerChatList: [Schema.Types.ObjectId];
    customerRating: number;
    customerCommentsList: [Schema.Types.ObjectId];
    freelancerProjectList: [Schema.Types.ObjectId];
    freelancerCommentsList: [Schema.Types.ObjectId];
    freelancerPortfolio: string;
    freelancerResume: string;
    freelancerRating: number;
    ratesList: [Schema.Types.ObjectId];
    userData: string;
    address: string;
    lastVisit?: Date | undefined;
    tags: string[];
    languages: string[];
    activityArea: any;
    createdAt?: Date;
    updatedAt?: Date;
    isDelete: boolean;
    generateJWT: any;
    getUserByToken: any;
}
