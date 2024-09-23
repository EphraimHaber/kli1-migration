import { Schema } from 'mongoose';

export interface langInterface {
    _id?: string;
    lang: string;
    val: string;
}

const langSchema = new Schema({
    lang: String,
    val: String,
});

export default langSchema;
