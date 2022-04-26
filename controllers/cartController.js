import { CartModel } from "../models/CartModel.js";
import { ProductModel } from "../models/ProductModel.js";
import { UserModel } from "../models/UserModal.js";

const cartController = {
    // * GET ALL CART
    getAllCart: async(req, res) => {
        try {
            const carts = await CartModel.find()
                .populate({
                    path: "user",
                    select: "_id username email isAdmin ",
                })
                .populate({
                    path: "cartItems",
                    populate: { path: "product" }, // select: '_id name price discount'
                });
            res.status(200).json({
                success: true,
                carts,
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
                        select: "_id name price discount images",
                    },
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
            const cart = await CartModel.findOne({ user: req.user.id });
            if (cart) {
                // nếu cart tồn tại thì update số lượng product trong cart
                const product = cartItems.product;
                const color = cartItems.color;
                const size = cartItems.size;
                const item = cart.cartItems.find(
                    (cartItem) =>
                    cartItem.product == product &&
                    cartItem.color == color &&
                    cartItem.size == size
                );
                let condition, update;
                if (item) {
                    condition = {
                        user: req.user.id,
                        "cartItems._id": item._id,
                    };
                    update = {
                        $set: {
                            "cartItems.$.product": item.product,
                            "cartItems.$.color": item.color,
                            "cartItems.$.size": item.size,
                            "cartItems.$.quantity": item.quantity + cartItems.quantity,
                        },
                    };
                } else {
                    condition = { user: req.user.id };
                    update = {
                        $push: { cartItems: cartItems },
                    };
                }
                CartModel.findOneAndUpdate(condition, update, { new: true }).exec(
                    (error, _cart) => {
                        if (error) return res.status(400).json({ error: error });
                        if (_cart) {
                            return res.status(200).json({
                                success: true,
                                message: "Cập nhật giỏ hàng thành công !",
                                cart: _cart,
                            });
                        }
                    }
                );
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
                res.status(200).json({
                    success: true,
                    cart: newCart,
                });
            }
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },

    // * UPDATE CART
    updateCart: async(req, res) => {
        try {
            const cart = await CartModel.findOne({ user: req.user.id });
            if (cart) {
                // nếu cart tồn tại thì update số lượng product trong cart
                const cartItemId = req.params.id;
                const cartItem = cart.cartItems.find((c) => (c._id = cartItemId));
                if (cartItem) {
                    if (req.body.quantity) {
                        // return res.status(200).json(cartItem);
                        var condition = {
                            user: req.user.id,
                            "cartItems._id": cartItem._id,
                        };
                        var update = {
                            $set: {
                                "cartItems.$.quantity": req.body.quantity,
                            },
                        };
                        CartModel.findOneAndUpdate(condition, update, { new: true }).exec(
                            (error, _cart) => {
                                if (error) return res.status(400).json({ error: error });
                                if (_cart) {
                                    return res.status(200).json({
                                        success: true,
                                        message: "Cập nhật giỏ hàng thành công !",
                                        cart: _cart,
                                    });
                                }
                            }
                        );
                    }
                }
            }
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },

    // * REMOVE ITEM FORM CART
    removeItemFromCart: async(req, res) => {
        try {
            const cart = await CartModel.findOne({ user: req.user.id });
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
                    CartModel.findOneAndUpdate(condition, update, { new: true }).exec(
                        (error, _cart) => {
                            if (error) return res.status(400).json({ error: error });
                            if (_cart) {
                                return res.status(200).json({
                                    success: true,
                                    message: "Updated cart item successfully",
                                    cart: _cart,
                                });
                            }
                        }
                    );
                } else {
                    return res.status(200).json({
                        success: false,
                        error: "Không tìm thấy cart item !",
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