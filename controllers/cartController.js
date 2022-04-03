import { CartModel } from "../models/CartModel.js";
import { UserModel } from "../models/UserModal.js";


const cartController = {
    getAllCart: async(req, res) => {
        try {
            const carts = await CartModel.find().populate({
                path: 'user',
                populate: { path: 'reviews' }
            }).populate({
                path: 'user',
                populate: { path: 'blogs' }
            }).populate({
                path: 'cartItems',
                populate: { path: 'product' }
            });
            res.status(200).json(carts);
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    getCart: async(req, res) => {
        try {
            const cart = await CartModel.findById(req.params.id).populate('user').populate('cartItems.product');
            res.status(200).json(cart);
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    addItemToCart: async(req, res) => {
        try {
            // tìm cart nào mà user này đã đăng nhập xem có tồn tại cart hay chưa
            const cart = await CartModel.findOne({ user: req.user.id })
            if (cart) { // nếu cart tồn tại thì update số lượng product trong cart
                const product = req.body.cartItems.product;
                const color = req.body.cartItems.color;
                const size = req.body.cartItems.size;
                const item = cart.cartItems.find(c => (c.product == product && c.color == color) && (c.product == product && c.size == size) && (c.color == color && c.size == size));
                let condition, update;
                if (item) {
                    condition = {
                        'user': req.user.id,
                        'cartItems._id': item._id,
                    };
                    update = {
                        '$set': {
                            'cartItems.$.product': item.product,
                            'cartItems.$.color': item.color,
                            'cartItems.$.size': item.size,
                            'cartItems.$.quantity': item.quantity + req.body.cartItems.quantity
                        }
                    };

                    // condition = {
                    //     'user': req.user.id,
                    //     'cartItems.product': product,
                    //     'cartItems.color': color,
                    //     'cartItems.size': size
                    // };
                    // update = {
                    //     '$set': {
                    //         'cartItems.$': {
                    //             ...req.body.cartItems,
                    //             quantity: item.quantity + req.body.cartItems.quantity
                    //         }
                    //     }
                    // };

                } else {
                    condition = { user: req.user.id };
                    update = {
                        $push: { cartItems: req.body.cartItems }
                    };
                }
                CartModel.findOneAndUpdate(condition, update, { new: true })
                    .exec((error, _cart) => {
                        if (error) return res.status(400).json({ error: error })
                        if (_cart) {
                            return res.status(200).json({ message: "Updated cart successfully", _cart })
                        }
                    })

            } else { // nếu user chưa có cart thì thêm mới 1 cart cho user
                const newCart = await new CartModel({
                    user: req.user.id,
                    cartItems: [req.body.cartItems],
                });
                await newCart.save();
                if (req.user.id) {
                    const user = await UserModel.findById(req.user.id);
                    await user.updateOne({ cart: newCart._id });
                }
                res.status(200).json(newCart);
            }
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    deleteProductToCart: async(req, res) => {
        // try {
        //     const cart = await CartModel.findById(req.params.id);
        //     if

        // } catch (error) {
        //     res.status(500).json({ error: error })
        // }
    },
    updateCart: async(req, res) => {
        try {
            const productId = req.body.products[0].product;
            const quantity = req.body.products[0].quantity;
            const cart = await CartModel.findById(req.params.id);
            await cart.updateOne({ quantity: quantity });
            res.status(200).json({ success: true, message: 'Cart updated successfully' });
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    deleteCart: async(req, res) => {
        try {
            // await UserModel.updateMany({
            //     blogs: req.params.id
            // }, {
            //     $pull: { blogs: req.params.id }
            // })
            // await BlogModel.findByIdAndDelete(req.params.id);
            // res.status(200).json({ message: 'Deleted blog successfully' })
        } catch (error) {
            res.status(500).json({ error: error })
        }
    }
}

export default cartController;