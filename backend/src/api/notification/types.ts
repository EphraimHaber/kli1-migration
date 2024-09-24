import { Document, Schema } from 'mongoose';

export interface INotifications extends Document {
    _id: string | undefined;
    userId: Schema.Types.ObjectId;
    availability: boolean;
    newUsersMessage: Schema.Types.ObjectId[];
    newNotificationsProjects: Schema.Types.ObjectId[];
    newSystemMessages: Schema.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
