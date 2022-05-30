import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 25,
        lowercase: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 50,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    avatar: {
        type: String,
        default: "https://w7.pngwing.com/pngs/223/244/png-transparent-computer-icons-avatar-user-profile-avatar-heroes-rectangle-black-thumbnail.png",
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart",
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
    }, ],
    blogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
    }, ],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
    }, ],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    }, ],
    shipmentDetails: [{
        fullName: {
            type: String,
        },
        phone: { type: String },
        province: { type: String },
        district: { type: String },
        ward: { type: String },
        address: { type: String },
        isDefault: { type: Boolean, default: false },
    }, ],
}, { timestamps: true });

export const UserModel = mongoose.model("User", userSchema);