import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';
const reviewSchema = new mongoose.Schema({
    content: {
        type: String,
        trim: true,
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    star: {
        type: Number,
        maxLength: 5,
        minlength: 1,
        default: 5,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

}, { timestamps: true });
// Add plugin
reviewSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });
export const ReviewModel = mongoose.model('Review', reviewSchema);