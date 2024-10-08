import { imageInterface, imageSchema } from '@/common/models/imageModel';
import { langInterface } from '@/common/models/langModel';
import mongoose, { Schema, Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { langSchema } from '../user/types';

export interface productInterface extends Document {
    _id: string;
    category?: string | null;
    name: langInterface[];
    shortDesc: langInterface[];
    longDesc: langInterface[];
    metaTitle: langInterface[];
    metaDesc: langInterface[];
    metaKeywords: langInterface[];
    icon: imageInterface;
    images: imageInterface[];
    isVisible: boolean;
    isAvailable: boolean;
    isQuantable: boolean;
    sort: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const productSchema: Schema = new Schema({
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    name: [langSchema],
    shortDesc: [langSchema],
    longDesc: [langSchema],
    metaTitle: [langSchema],
    metaDesc: [langSchema],
    metaKeywords: [langSchema],
    icon: imageSchema,
    images: [imageSchema],
    isVisible: {
        type: Boolean,
        default: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    isQuantable: {
        type: Boolean,
        default: false,
    },
    sort: {
        type: String,
        default: '0',
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

productSchema.plugin(mongoosePaginate);

// delete model to fix OverwriteModelError
// delete mongoose.connection.models.Product
export const Product = mongoose.model<productInterface>('Product', productSchema);
