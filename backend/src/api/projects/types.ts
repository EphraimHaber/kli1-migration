import { Document, Schema } from 'mongoose';

export interface IProject extends Document {
    _id: string;
    title: string;
    description: string;
    date: Schema.Types.Date;
    dateDeadline: Schema.Types.Date;
    idProducts: Schema.Types.ObjectId[];
    idCategory: Schema.Types.ObjectId[];
    idMainCategory: Schema.Types.ObjectId[];
    idСustomer: Schema.Types.ObjectId;
    idFreelancer: Schema.Types.ObjectId;
    specs: string[];
    data: string[];
    status: string;
    approximateBudget: number;
    actualBudget: number;
    currency: string;
    lang: string;
    deliveryAddress: string;
    listFiltersFreelancers: string;
    listInvitedFreelancers: Schema.Types.ObjectId[];
    typeProject: string;
    usersProjectRatio: number;
    chatsIdList: Schema.Types.ObjectId[];
    ratesIdList: Schema.Types.ObjectId[];
    commentsIdList: Schema.Types.ObjectId;
    workChatIdList: Schema.Types.ObjectId;
    filesList: string[];
    workFilesList: string[];
    createdAt?: Date;
    updatedAt?: Date;
    dislikeUsers: Schema.Types.ObjectId[];
    phasedProject: boolean;
    stages: [
        {
            data: string;
            price: number;
            finished: boolean;
            paid: boolean;
        },
    ];
}
