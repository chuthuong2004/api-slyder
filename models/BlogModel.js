import mongoose from 'mongoose';

import slug from 'mongoose-slug-generator';
import mongooseDelete from 'mongoose-delete';
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    attachment: String,
    likeCount: {
        type: Number,
        default: 0,
    },
    slug: { type: String, slug: 'title', unique: true },
}, { timestamps: true });

// Add plugin
mongoose.plugin(slug);
blogSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });
export const BlogModel = mongoose.model('Blog', blogSchema);