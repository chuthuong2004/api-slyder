import { CartModel } from "../models/CartModel.js";
import { UserModel } from "../models/UserModel.js";
import { APIFeatures } from "../utils/APIFeatures.js";

const cartController = {
    // * GET ALL CART
    getAllCart: async(req, res) => {
        try {
            const features = new APIFeatures(
                CartModel.find()
                .populate({
                    path: "user",
                    select: "_id username email isAdmin ",
                })
                .populate({
                    path: "cartItems",
                    populate: { path: "product" }, // select: '_id name price discount'
                }),
                req.query
            );
            const carts = await features.query;
            res.status(200).json({
                success: true,
                countDocument: carts.length,
                resultPerPage: req.query.limit * 1 || 0,
                data: carts,
            });
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    // * GET A CART
    getCart: async(req, res) => {
        try {
            const cart = await CartModel.findById(req.params.id)
                .populate({
                    path: "user",
                    select: "_id username email isAdmin",
                })
                .populate({
                    path: "cartItems",
                    populate: {
                        path: "product",
                        select: "_id name price discount images",
                    },
                });
            res.status(200).json({ success: true, cart });
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    getMyCart: async(req, res) => {
        try {
            const cart = await CartModel.findOne({ user: req.user.id })
                .populate({
                    path: "user",
                    select: "_id username email isAdmin",
                })
                .populate({
                    path: "cartItems",
                    populate: {
                        path: "product",
                        select: "_id name price discount images detail",
                    },
                });
            if (!cart)
                return res.status(404).json({
                    success: true,
                    message: "Không tìm thấy giỏ hàng",
                });
            res.status(200).json({ success: true, cart });
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    // * ADD ITEM TO CART
    addItemToCart: async(req, res) => {
        try {
            const cartItems = req.body;
            // tìm cart nào mà user này đã đăng nhập xem có tồn tại cart hay chưa
            const cart = await CartModel.findOne({ user: req.user.id })
                .populate({
                    path: "user",
                    select: "_id username email isAdmin",
                })
                .populate({
                    path: "cartItems",
                    populate: {
                        path: "product",
                        select: "_id name price discount images detail",
                    },
                });
            if (cart) {
                // nếu cart tồn tại thì update số lượng product trong cart
                const product = cartItems.product;
                const color = cartItems.color;
                const size = cartItems.size;
                const item = cart.cartItems.find(
                    (cartItem) =>
                    cartItem.product._id == product &&
                    cartItem.color == color &&
                    cartItem.size == size
                );
                let condition, update;

                if (item) {
                    const detail = item.product.detail.find(
                        (detail) => detail.size === size
                    );
                    const maxQuantity = detail.detailColor.find(
                        (detailColor) =>
                        detailColor.color.toLowerCase() === color.toLowerCase()
                    ).amount;
                    if (item.quantity >= maxQuantity) {
                        return res.status(400).json({
                            success: false,
                            message: "Số lượng sản phẩm không đủ !",
                        });
                    }
                    condition = {
                        user: req.user.id,
                        "cartItems._id": item._id,
                    };
                    update = {
                        $set: {
                            "cartItems.$.product": item.product,
                            "cartItems.$.color": item.color,
                            "cartItems.$.size": item.size,
                            "cartItems.$.quantity": item.quantity + cartItems.quantity * 1,
                        },
                    };
                } else {
                    condition = { user: req.user.id };
                    update = {
                        $push: { cartItems: cartItems },
                    };
                }
                const newCart = await CartModel.findOneAndUpdate(condition, update, {
                        new: true,
                    })
                    .populate({
                        path: "user",
                        select: "_id username email isAdmin",
                    })
                    .populate({
                        path: "cartItems",
                        populate: {
                            path: "product",
                            select: "_id name price discount images detail",
                        },
                    });
                return res.status(200).json({
                    success: true,
                    message: "Thêm giỏ hàng thành công !",
                    cart: newCart,
                });
            } else {
                // nếu user chưa có cart thì thêm mới 1 cart cho user
                const newCart = await new CartModel({
                    user: req.user.id,
                    cartItems: [cartItems],
                });
                await newCart.save();
                if (req.user.id) {
                    const user = await UserModel.findById(req.user.id);
                    await user.updateOne({ cart: newCart._id });
                }
                var cartResponse = await CartModel.findOne({ user: req.user.id })
                    .populate({
                        path: "user",
                        select: "_id username email isAdmin",
                    })
                    .populate({
                        path: "cartItems",
                        populate: {
                            path: "product",
                            select: "_id name price discount images detail",
                        },
                    });
                res.status(200).json({
                    success: true,
                    message: "Thêm giỏ hàng thành công !",
                    cart: cartResponse,
                });
            }
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },

    // * UPDATE CART
    updateCart: async(req, res) => {
        try {
            const quantityUpdate = req.body.quantity;
            if (quantityUpdate < 0) {
                return res.status(401).json({
                    success: false,
                    message: "Số lượng cập nhật phải lớn hơn 0 !",
                });
            }
            const cart = await CartModel.findOne({ user: req.user.id });
            if (cart) {
                // nếu cart tồn tại thì update số lượng product trong cart
                const cartItemId = req.params.id;
                const cartItem = cart.cartItems.find((c) => c._id == cartItemId);
                if (cartItem) {
                    let condition, update;
                    if (quantityUpdate == 0) {
                        // xử lý xóa item khỏi cart
                        if (cart.cartItems.length == 1) {
                            await UserModel.updateOne({ cart: cart._id }, { cart: null });
                            await cart.remove();
                            return res.status(200).json({
                                success: true,
                                message: "Đã xóa giỏ hàng thành công !",
                            });
                        }
                        condition = {
                            user: req.user.id,
                            "cartItems._id": cartItem._id,
                        };
                        update = {
                            $pull: { cartItems: { _id: cartItem._id } },
                        };
                    } else {
                        condition = {
                            user: req.user.id,
                            "cartItems._id": cartItem._id,
                        };
                        update = {
                            $set: {
                                "cartItems.$.quantity": quantityUpdate,
                            },
                        };
                    }
                    const newCart = await CartModel.findOneAndUpdate(condition, update, {
                            new: true,
                        })
                        .populate({
                            path: "user",
                            select: "_id username email isAdmin",
                        })
                        .populate({
                            path: "cartItems",
                            populate: {
                                path: "product",
                                select: "_id name price discount images detail",
                            },
                        });
                    return res.status(200).json({
                        success: true,
                        message: "Cập nhật giỏ hàng thành công !",
                        cart: newCart,
                    });
                }
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy cart item !",
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy giỏ hàng của bạn !",
                });
            }
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },

    // * REMOVE ITEM FORM CART
    removeItemFromCart: async(req, res) => {
        try {
            const cart = await CartModel.findOne({ user: req.user.id })
                .populate({
                    path: "user",
                    select: "_id username email isAdmin",
                })
                .populate({
                    path: "cartItems",
                    populate: {
                        path: "product",
                        select: "_id name price discount images detail",
                    },
                });
            if (cart) {
                // nếu cart tồn tại thì update số lượng product trong cart
                const cartItemId = req.params.id;
                const cartItem = cart.cartItems.find((c) => (c._id = cartItemId));
                if (cartItem) {
                    // CHECK SỐ LƯỢNG ITEM TRONG CART
                    if (cart.cartItems.length == 1) {
                        await UserModel.updateOne({ cart: cart._id }, { cart: null });
                        await CartModel.findByIdAndDelete(cart._id);
                        return res.status(200).json({
                            success: true,
                            message: "Đã xóa giỏ hàng thành công !",
                        });
                    }
                    let condition = {
                        user: req.user.id,
                        "cartItems._id": cartItem._id,
                    };
                    let update = {
                        $pull: { cartItems: { _id: cartItem._id } },
                    };
                    const newCart = await CartModel.findOneAndUpdate(condition, update, {
                            new: true,
                        })
                        .populate({
                            path: "user",
                            select: "_id username email isAdmin",
                        })
                        .populate({
                            path: "cartItems",
                            populate: {
                                path: "product",
                                select: "_id name price discount images detail",
                            },
                        });
                    return res.status(200).json({
                        success: true,
                        message: "Cập nhật giỏ hàng thành công !",
                        cart: newCart,
                    });
                } else {
                    return res.status(200).json({
                        success: false,
                        message: "Không tìm thấy cart item !",
                    });
                }
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * DELETE CART
    deleteCart: async(req, res) => {
        try {
            await UserModel.updateOne({ cart: req.params.id }, { cart: null });
            await CartModel.findByIdAndDelete(req.params.id);
            res.status(200).json({
                success: true,
                message: "Xóa giỏ hàng thành công !",
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
};

export default cartController;