import e from "express";
import { CartModel } from "../models/CartModel.js";
import { OrderModel } from "../models/OrderModel.js";
import { ProductModel } from "../models/ProductModel.js";
import { UserModel } from "../models/UserModal.js";

const orderController = {

    // * CREATE ORDER WITH USER CART
    newOrder: async(req, res) => {
        try {
            const { fullName, phone, address } = req.body;
            let shippingPrice = req.body.shippingPrice;
            const shippingInfo = {
                fullName: fullName,
                phone: phone,
                address: address
            }
            const cart = await CartModel.findOne({ user: req.user.id }).populate({
                path: 'cartItems',
                populate: { path: 'product' }
            });
            if (!cart) return res.status(404).json({
                success: false,
                message: 'Không tìm thấy cart !'
            })
            let totalPrice = 0;

            // * GET PRODUCT DETAILS
            const orderItems = cart.cartItems.map((cartItem) => {
                    totalPrice += (cartItem.product.price * cartItem.quantity);
                    return {
                        name: cartItem.product.name,
                        price: cartItem.product.price,
                        quantity: cartItem.quantity,
                        size: cartItem.size,
                        color: cartItem.color,
                        image: cartItem.product.images[0].img,
                        product: cartItem.product._id
                    };
                })
                // * Delete cart
            await cart.delete();

            // * Check price shipping
            if (!shippingPrice) shippingPrice = 30000;
            totalPrice += shippingPrice;

            // * create new order model
            const newOrder = new OrderModel({
                    shippingInfo: shippingInfo,
                    orderItems: orderItems,
                    user: req.user.id,
                    shippingPrice: shippingPrice,
                    totalPrice: totalPrice,
                })
                // * Save order
            await newOrder.save();

            // * Tìm User
            const user = await UserModel.findById(req.user.id);
            if (!user) return res.status(404).json({
                    success: false,
                    message: 'User not found'
                })
                // * Push order vào user
            await user.updateOne({ $push: { orders: newOrder._id } })

            return res.status(200).json({ success: true, order: newOrder });
        } catch (error) {
            res.status(500).json({ error: error })
        }
    },

    // * GET SINGLE ORDER
    getSingleOrder: async(req, res) => {
        const order = await OrderModel.findById(req.params.id).populate(
            "user",
            "username email"
        );
        if (!order) return res.status(404).json({ error: 'Order not found with this ID' })
        res.status(200).json({
            success: true,
            order,
        });
    },

    // * GET MY ORDER
    myOrder: async(req, res) => {
        const orders = await OrderModel.find({ user: req.user.id });

        // tổng tiền tất cả đơn hàng
        const totalAmount = orders.reduce((total, order) => total + order.totalPrice, 0);
        res.status(200).json({
            success: true,
            totalAmount,
            orders
        });
    },

    // * GET ALL ORDERS
    getAllOrders: async(req, res) => {
        const orders = await OrderModel.find();
        // tổng tiền tất cả đơn hàng
        const totalAmount = orders.reduce((total, order) => total + order.totalPrice, 0);
        res.status(200).json({
            success: true,
            totalAmount,
            orders,
        });
    },

    // ! UPDATE ORDER - UPDATE AMOUNT PRODUCT
    updateOrder: async(req, res) => {
        const order = await OrderModel.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn đặt hàng với ID trên' })
        if (order.orderStatus === 'Delivered') return res.status(400).json({ error: 'Bạn đã giao đơn đặt hàng này' })
        if (req.body.status === 'Shipped') {
            order.orderItems.forEach(async(order) => {
                await updateAmount(order.product, order.size, order.color, order.quantity);
            })
        }
        order.orderStatus = req.body.status;
        if (req.body.status === 'Delivered') {
            order.deliveredAt = Date.now();
        }
        await order.save({ validateBeforeSave: false });
        res.status(200).json({
            success: true,
        });
    },

    // * DELETE ORDER 
    deleteOrder: async(req, res) => {
        const order = await OrderModel.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn đặt hàng với ID được chỉ định' })
        await UserModel.updateMany({
            orders: req.params.id
        }, {
            $pull: { orders: req.params.id }
        })
        await order.remove();

        res.status(200).json({
            success: true,
            message: 'Delete order successfully'
        });
    }
}

// ! UPDATE AMOUNT PRODUCT WITH SIZE COLOR
async function updateAmount(idProduct, size, color, quantity) {
    const product = await ProductModel.findById(idProduct);
    const detail = product.detail.find(prod => prod.size === size);
    let updateAmount = 0;
    if (!detail) return res.status(404).json({ error: `Không tìm thấy size ${size} trong sản phẩm` });

    const detailColor = detail.detailColor.find(item => item.color === color);
    if (!detailColor) return res.status(404).json({ error: `Không tìm thấy màu [${color}] trong size [${size}]` })
    updateAmount = detailColor.amount - quantity;
    let condition = {
        '_id': idProduct,
        'detail.$.size': detail.size,
    }
    let update = {
        '$set': {
            'detail.$.size': detail.size,
            'detail.$.detailColor.$.color': detailColor.color,
            'detail.$.detailColor.$.amount': updateAmount
        }
    }
    await ProductModel.findOneAndUpdate(condition, update, { new: true });

}

export default orderController;