import mongoose, { Schema } from 'mongoose';
import { IProject } from './types';

const projects = new Schema<IProject>({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    dateDeadline: {
        type: Date,
        required: true,
    },
    idProducts: [
        {
            type: Schema.Types.ObjectId,
            required: true,
        },
    ],
    idCategory: [
        {
            type: Schema.Types.ObjectId,
            required: true,
        },
    ],
    idMainCategory: [
        {
            type: Schema.Types.ObjectId,
            required: true,
        },
    ],
    idСustomer: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    idFreelancer: {
        type: Schema.Types.ObjectId,
    },
    specs: [
        {
            type: Array,
        },
    ],
    data: [
        {
            type: String,
            required: true,
        },
    ],
    status: {
        type: String,
        required: true,
        default: 'selectFreelancer',
    },
    approximateBudget: {
        type: Number,
        required: true,
    },
    actualBudget: {
        type: Number,
        required: true,
        default: 0,
    },
    currency: {
        type: String,
        required: true,
        default: 'usd',
    },
    lang: {
        type: String,
        required: true,
    },
    deliveryAddress: {
        type: String,
        required: false,
    },
    listFiltersFreelancers: {
        type: String,
        required: false,
    },
    listInvitedFreelancers: [
        {
            type: Schema.Types.ObjectId,
            required: false,
        },
    ],
    typeProject: {
        type: String,
        required: false,
    },
    usersProjectRatio: {
        type: Number,
        required: false,
    },
    chatsIdList: [
        {
            type: Schema.Types.ObjectId,
            required: false,
        },
    ],
    ratesIdList: [
        {
            type: Schema.Types.ObjectId,
            required: false,
        },
    ],
    commentsIdList: {
        type: Schema.Types.ObjectId,
        required: false,
    },
    workChatIdList: {
        type: Schema.Types.ObjectId,
        required: false,
    },
    filesList: [
        {
            type: String,
            required: false,
        },
    ],
    workFilesList: [
        {
            type: String,
            required: false,
        },
    ],
    phasedProject: Boolean,
    stages: [
        {
            data: String,
            price: Number,
            finished: Boolean,
            paid: Boolean,
        },
    ],
    createdAt: {
        type: Date,
        required: false,
    },
    updatedAt: {
        type: Date,
        required: false,
    },
    dislikeUsers: [
        {
            type: Schema.Types.ObjectId,
            required: false,
        },
    ],
});

export const Projects = mongoose.model<IProject>('Project', projects);
