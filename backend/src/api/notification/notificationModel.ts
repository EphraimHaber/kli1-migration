import mongoose, { Schema } from 'mongoose';
import { INotifications } from './types';

const notification = new Schema<INotifications>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    availability: {
        type: Boolean,
        required: true,
    },
    newUsersMessage: [
        {
            type: Schema.Types.ObjectId,
        },
    ],
    newNotificationsProjects: [
        {
            type: Schema.Types.ObjectId,
        },
    ],
    newSystemMessages: [
        {
            type: Schema.Types.ObjectId,
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
});

notification.pre('save', function (next) {
    const now = new Date();
    this.updatedAt = now;
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

export const notifications = mongoose.model<INotifications>('notification', notification);
