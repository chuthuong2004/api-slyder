import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        fullName: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },

        province: {
            type: String,
            required: true,
        },

        district: {
            type: String,
            required: true,
        },

        ward: {
            type: String,
            required: true,
        },

        address: {
            type: String,
            required: true,
        },
    },
    orderItems: [{
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        discount: {
            type: Number,
        },
        quantity: {
            type: Number,
            required: true,
        },
        size: {
            type: String,
            required: true,
        },
        color: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
    }, ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    orderStatus: {
        type: String,
        required: true,
        default: "Processing", // shipping, delivery, delivered, canceled
    },
    paid: {
        type: Boolean,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    shippingAt: {
        type: Date,
    },
    deliveryAt: {
        type: Date,
    },
    deliveredAt: {
        type: Date,
    },
    canceledAt: {
        type: Date,
    },
    canceledReason: { type: String },
}, { timestamps: true });
export const OrderModel = mongoose.model("Order", orderSchema);