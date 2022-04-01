import mongoose from 'mongoose';
const productInCartSchema = new mongoose.Schema({
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    quantity: {
        type: Number,

    },
    size: {
        type: String,

    },
    color: {
        type: String,
    }
}, { timestamps: true });
export const ProductInCartModel = mongoose.model('CartDetail', productInCartSchema);