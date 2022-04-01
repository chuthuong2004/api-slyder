import mongoose from 'mongoose';
import slug from 'mongoose-slug-generator';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    imageCate: {
        type: String,
        required: true,
    },
    catalog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Catalog',
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }, ],

    slug: {
        type: String,
        slug: 'name',
        unique: true
    },
}, { timestamps: true });
mongoose.plugin(slug);

export const CategoryModel = mongoose.model('Category', categorySchema);