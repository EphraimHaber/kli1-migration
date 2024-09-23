import { Schema } from 'mongoose';

export interface langInterface {
    _id?: string;
    lang: string;
    val: string;
}

export const langSchema = new Schema({
    lang: String,
    val: String,
});
