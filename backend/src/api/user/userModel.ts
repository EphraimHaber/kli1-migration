import mongoose, { Schema } from 'mongoose';
//import passportLocalMongoose from 'passport-local-mongoose'
import bcrypt from 'bcrypt';
import {
    comparePassword,
    comparePasswordFunction,
    generateToken,
    generateJWT,
    decodeJWT,
} from '@/common/middleware/jwtAndPasswordHandler';
import { IUser, financialData, transactionList, langSchema, userNameSchema } from './types';
import { addressSchema, geocodeBoundsSchema } from '@/common/models/admin/Location';

const activityAreaSchema: Schema = new Schema({
    isOnline: {
        type: Boolean,
        default: false,
    },
    isWorldwide: {
        type: Boolean,
        default: false,
    },
    addresses: [addressSchema],
    addressesBoundsList: [geocodeBoundsSchema],
});

const user = new Schema<IUser>({
    name: [userNameSchema],
    email: [
        {
            type: String,
            required: true,
            unique: true,
        },
    ],
    password: {
        type: String,
        required: true,
    },
    hashPassword: {
        type: String,
        default: '',
    },
    phone: [
        {
            type: String,
            required: false,
        },
    ],
    langList: [langSchema],
    defaultLang: {
        type: String,
        required: false,
    },
    photo: {
        type: String,
        required: true,
        default: '/image/profile-photo.jpg',
    },
    country: {
        type: String,
        required: false,
    },
    city: {
        type: String,
        required: false,
    },
    specializationList: [
        {
            type: String,
            required: false,
        },
    ],
    emailList: [
        {
            type: String,
            required: false,
        },
    ],
    phoneList: [
        {
            type: String,
            required: false,
        },
    ],
    siteList: [
        {
            type: String,
            required: false,
        },
    ],
    chatsIdList: [
        {
            type: Schema.Types.ObjectId,
            required: false,
        },
    ],
    financialAccount: financialData,
    transactionList: [transactionList],
    activeAccount: {
        type: String,
        required: true,
    },
    settingsSite: {
        type: String,
        required: false,
    },
    nameCompany: {
        type: String,
        required: false,
    },
    customerProjectList: [
        {
            type: Schema.Types.ObjectId,
            required: false,
        },
    ],
    customerChatList: [
        {
            type: Schema.Types.ObjectId,
            required: false,
        },
    ],
    // customerReviewsAboutFreelancerList: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         required: false,
    //     },
    // ],
    customerRating: {
        type: Number,
        default: 0,
    },
    // customerReviewsList: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         required: false,
    //     },
    // ],
    customerCommentsList: [
        {
            type: Schema.Types.ObjectId,
            required: false,
        },
    ],
    freelancerProjectList: [
        {
            type: Schema.Types.ObjectId,
            required: false,
        },
    ],
    freelancerCommentsList: [
        {
            type: Schema.Types.ObjectId,
            required: false,
        },
    ],
    // freelancerReviewsList: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         required: false,
    //     },
    // ],
    // freelancerReviewsAboutCustomerList: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         required: false,
    //     },
    // ],
    freelancerPortfolio: {
        type: String,
        required: false,
    },
    freelancerResume: {
        type: String,
        required: false,
    },
    freelancerRating: {
        type: Number,
        default: 0,
    },
    ratesList: [
        {
            type: Schema.Types.ObjectId,
            required: false,
        },
    ],
    userData: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        required: false,
    },
    // auth_token: {
    //     type: String,
    //     required: false,
    // },
    tokenCheckedEmail: {
        type: String,
        default: 'false',
    },
    passwordResetToken: {
        type: String,
        default: 'false',
    },
    google_id: {
        type: String,
        default: 'false',
    },
    facebook_id: {
        type: String,
        default: 'false',
    },
    passwordResetExpires: {
        type: Date,
        required: false,
    },
    lastVisit: {
        type: Date || undefined,
        required: false,
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: false,
    },
    tags: [
        {
            type: String,
        },
    ],
    // languages: {
    //     type: String,
    //     default: "",
    // },
    address: {
        type: String || null,
        default: '',
    },
    activityArea: {
        type: activityAreaSchema,
        default: () => ({}),
    },
    createdAt: {
        type: Date,
        required: false,
    },
    updatedAt: {
        type: Date,
        required: false,
    },
});

user.pre('save', function save(next) {
    try {
        console.log('aaaaaaaaaaaaaaaaaaaaaa');
        const user = this as any as IUser;
        if (!user.isModified('password')) {
            return next();
        }
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                return next(err); // Pass error to the next middleware
            }
            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) {
                    return next(err); // Pass error to the next middleware
                }
                user.password = hash; // Set hashed password
                next(); // Proceed with saving the user
            });
        });
    } catch (err) {
        console.log('ERR user.pre: ', err);
    }
});

// user.pre('save', function save(next) {
//     try {
//         const user = this as any as IUser;
//         console.log(typeof user.google_id);
//         if (user.google_id != 'false' || user.facebook_id != 'false') {
//             console.log('user.google_id: ', user.google_id);
//             user.tokenCheckedEmail = 'true';
//         } else {
//             let hash: string = generateToken();
//             user.tokenCheckedEmail = hash;
//         }
//         next();
//     } catch (err) {
//         console.log('ERR user.pre create confirm email link: ', err);
//     }
// });

user.methods.comparePassword = comparePassword;

user.methods.toAuth = function () {
    return {
        _id: this._id,
        email: this.email,
        token: generateToken(),
    };
};

user.methods.generateJWT = async (id: mongoose.Types.ObjectId, dateExpired: string) => {
    return generateJWT(id, dateExpired);
};

user.statics.getUserByToken = async function (token: string) {
    try {
        const decodeData: any = await decodeJWT(token);
        if (decodeData) {
            // @ts-ignore
            const decodeUser = await this.findOne({ _id: decodeData._id });
            return decodeUser;
        } else {
            return null;
        }
    } catch (e) {
        console.log(e);
    }
};

//user.plugin(passportLocalMongoose)

export const Users = mongoose.model<IUser>('User', user);
