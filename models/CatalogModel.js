import mongoose from 'mongoose';
import slug from 'mongoose-slug-generator';
const catalogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        unique: true,
    }],
    slug: {
        type: String,
        slug: 'name',
        unique: true
    },
}, { timestamps: true });

mongoose.plugin(slug);
export const CatalogModel = mongoose.model('Catalog', catalogSchema);