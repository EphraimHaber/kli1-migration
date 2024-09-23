import mongoose, { Schema, Document } from 'mongoose';

import langSchema, { langInterface } from './langSchema';

export interface addressInterface {
    country: string;
    city: string;
    location: string | null;
}

export interface geocodeAddressComponentInterface {
    longName: langInterface[];
    shortName: langInterface[];
    types: string[];
}

export interface locationInterface extends Document {
    _id: string;
    countryCode: string;
    addressTexts: string[];

    placeId: string;
    types: string[];
    formattedAddress: langInterface[];
    addressComponents: geocodeAddressComponentInterface[];
    geometry: any;

    createdAt?: Date;
    updatedAt?: Date;
}

export const addressSchema: Schema = new Schema({
    country: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: '',
    },
    location: {
        type: Schema.Types.ObjectId,
        ref: 'Location',
        default: null,
    },
});

const geocodeAddressComponentSchema: Schema = new Schema({
    longName: [langSchema],
    shortName: [langSchema],
    types: [String],
});

const geocodeLatLngSchema: Schema = new Schema({
    lat: {
        type: Number,
        required: true,
    },
    lng: {
        type: Number,
        required: true,
    },
});

export const geocodeBoundsSchema: Schema = new Schema({
    northeast: geocodeLatLngSchema,
    southwest: geocodeLatLngSchema,
});

const locationSchema: Schema = new Schema({
    // search data
    countryCode: {
        type: String,
        required: true,
    },
    addressTexts: [String],

    // google maps geocode data
    placeId: {
        type: String,
        required: true,
    },
    types: [String],
    addressComponents: [geocodeAddressComponentSchema],
    formattedAddress: [langSchema],
    geometry: {
        bounds: geocodeBoundsSchema,
        location: geocodeLatLngSchema,
        locationType: String,
        viewport: geocodeBoundsSchema,
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

// delete model to fix OverwriteModelError
// delete mongoose.connection.models.Location
export default mongoose.model<locationInterface>('Location', locationSchema);
