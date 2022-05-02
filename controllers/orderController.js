import e from "express";
import { CartModel } from "../models/CartModel.js";
import { OrderModel } from "../models/OrderModel.js";
import { ProductModel } from "../models/ProductModel.js";
import { UserModel } from "../models/UserModal.js";
import { sendEmail } from "../utils/sendMail.js";

const orderController = {
    // * CREATE ORDER WITH USER CART
    newOrder: async(req, res) => {
        try {
            const { fullName, phone, address } = req.body;
            let shippingPrice = req.body.shippingPrice;
            const shippingInfo = {
                fullName: fullName,
                phone: phone,
                address: address,
            };
            const cart = await CartModel.findOne({ user: req.user.id }).populate({
                path: "cartItems",
                populate: { path: "product" },
            });
            if (!cart)
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy giỏ hàng !",
                });
            let totalPrice = 0;

            // * GET PRODUCT DETAILS
            const orderItems = cart.cartItems.map((cartItem) => {
                totalPrice +=
                    (cartItem.product.price -
                        cartItem.product.price * (cartItem.product.discount / 100)) *
                    cartItem.quantity;
                return {
                    name: cartItem.product.name,
                    price: cartItem.product.price,
                    discount: cartItem.product.discount,
                    quantity: cartItem.quantity,
                    size: cartItem.size,
                    color: cartItem.color,
                    image: cartItem.product.images[0].img,
                    product: cartItem.product._id,
                };
            });
            // * Delete cart
            await cart.delete();

            // * Check price shipping
            if (!shippingPrice) shippingPrice = 30000;

            // * create new order model
            const newOrder = new OrderModel({
                shippingInfo: shippingInfo,
                orderItems: orderItems,
                user: req.user.id,
                shippingPrice: shippingPrice,
                totalPrice: totalPrice,
            });
            // * Save order
            await newOrder.save();

            // * Tìm User
            const user = await UserModel.findById(req.user.id);
            if (!user)
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy user !",
                });
            // * Push order vào user
            var html = "";
            orderItems.forEach((orderItem) => {
                html += `
                    <tr>
                    <td style=" border: 1px solid black; border-radius: 10px; text-align:center;">${orderItem.name}</td>
                    <td style=" border: 1px solid black; border-radius: 10px; text-align:center;">${orderItem.price}</td>
                    <td style=" border: 1px solid black; border-radius: 10px; text-align:center;">${orderItem.quantity}</td>
                    <tr>`;
            });
            await user.updateOne({ $push: { orders: newOrder._id } });
            const message = `<p>Đơn hàng #${
        newOrder._id
      } của ${fullName} đã đặt thành công</p>
                
                <table cellspacing="5" style=" border: 1px solid black; border-radius: 10px;">
                    <tr >
                        <th style=" border: 1px solid black; border-radius: 10px; text-align:center;">Tên</th>
                        <th style=" border: 1px solid black; border-radius: 10px; text-align:center;">Giá</th>
                        <th style=" border: 1px solid black; border-radius: 10px; text-align:center;">Số Lượng</th>
                    </tr> ${html}
                    <tr>
                        <td colspan = "2" style=" border: 1px solid black; border-radius: 10px; text-align:right;">Tổng tiền: </td>
                        <td style=" border: 1px solid black; border-radius: 10px; text-align:center;"><b> ${totalPrice} </b></td>
                    </tr> 
                    <tr>
                    <td colspan = "2" style=" border: 1px solid black; border-radius: 10px; text-align:right;">Phí vận chuyển: </td>
                    <td style=" border: 1px solid black; border-radius: 10px; text-align:center;"><b> ${shippingPrice} </b></td>
                    </tr> 
                    <tr>
                    <td colspan = "2" style=" border: 1px solid black; border-radius: 10px; text-align:right;">Tổng thanh toán</td>
                    <td style=" border: 1px solid black; border-radius: 10px; text-align:center;"><b> ${
                      shippingPrice + totalPrice
                    } </b></td>
                    </tr> 
                    </table>
                    `;
            try {
                await sendEmail({
                    email: user.email,
                    subject: "THÔNG BÁO TỪ SLYDER",
                    message: message,
                });
            } catch (error) {
                res.status(500).json({ error: error });
            }
            return res.status(200).json({ success: true, order: newOrder });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * GET SINGLE ORDER
    getSingleOrder: async(req, res) => {
        try {
            const order = await OrderModel.findById(req.params.id).populate(
                "user",
                "username email"
            );
            if (!order)
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn đặt hàng với ID này !",
                });
            res.status(200).json({
                success: true,
                order,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * GET MY ORDER
    myOrder: async(req, res) => {
        try {
            const orders = await OrderModel.find({ user: req.user.id });
            if (!orders)
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn đặt hàng !",
                });
            // tổng tiền tất cả đơn hàng
            const totalAmount = orders.reduce(
                (total, order) => total + order.totalPrice,
                0
            );
            res.status(200).json({
                success: true,
                totalAmount,
                orders,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * GET ALL ORDERS
    getAllOrders: async(req, res) => {
        try {
            var page = req.query.page * 1;
            var limit = req.query.limit * 1;
            if ((limit && !page) || (page == 0 && limit == 0)) {
                page = 1;
            }
            if (!page && !limit) {
                page = 1;
                limit = 0;
            }
            var skip = (page - 1) * limit;
            const orders = await OrderModel.find()
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "orderItems",
                    populate: { path: "product" },
                })
                .populate("user");
            // tổng tiền tất cả đơn hàng
            const totalAmount = orders.reduce(
                (total, order) => total + (order.totalPrice + order.shippingPrice),
                0
            );
            const countDocument = await OrderModel.countDocuments();
            res.status(200).json({
                success: true,
                totalAmount,
                countDocument,
                resultPerPage: limit,
                orders,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // ! UPDATE ORDER - UPDATE AMOUNT PRODUCT ---- handle send email
    updateOrder: async(req, res) => {
        try {
            const order = await OrderModel.findById(req.params.id).populate(
                "user",
                "username email"
            );
            if (!order)
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn đặt hàng với ID trên",
                });
            if (order.orderStatus === "Delivered")
                return res.status(400).json({
                    success: false,
                    message: "Bạn đã giao đơn đặt hàng này",
                });
            if (req.body.orderStatus === "Shipping") {
                order.orderItems.forEach(async(order) => {
                    await updateAmount(
                        order.product,
                        order.size,
                        order.color,
                        order.quantity
                    );
                });
                sendEmail({
                    email: order.user.email,
                    subject: "ĐƠN HÀNG CỦA BẠN ĐANG VẬN CHUYỂN",
                    message: "đơn hàng của bạn đang vận chuyển",
                });
            }
            if (req.body.orderStatus === "Delivery") {
                sendEmail({
                    email: order.user.email,
                    subject: "ĐƠN HÀNG CỦA BẠN ĐANG GIAO",
                    message: "đơn hàng của bạn đang giao",
                });
            }
            order.orderStatus = req.body.orderStatus;
            if (req.body.orderStatus === "Delivered") {
                order.deliveredAt = Date.now();
                sendEmail({
                    email: order.user.email,
                    subject: "ĐƠN HÀNG CỦA BẠN ĐÃ GIAO",
                    message: "đơn hàng của bạn đã được giao thành công",
                });
            }
            await order.save({ validateBeforeSave: false });
            res.status(200).json({
                success: true,
                message: "Đã cập nhật đơn hàng thành công !",
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * DELETE ORDER --- DONE
    deleteOrder: async(req, res) => {
        try {
            const order = await OrderModel.findById(req.params.id);
            if (!order)
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn đặt hàng với ID được chỉ định !",
                });
            await UserModel.updateMany({
                orders: req.params.id,
            }, {
                $pull: { orders: req.params.id },
            });
            await order.remove();

            res.status(200).json({
                success: true,
                message: "Đã xóa đơn hàng thành công !",
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
};

// * UPDATE AMOUNT PRODUCT WITH SIZE COLOR --- DONE
const updateAmount = async(idProduct, size, color, quantity) => {
    try {
        console.log(idProduct, size, color, quantity);
        const product = await ProductModel.findById(idProduct);
        product.detail.forEach((item) => {
            if (item.size === size) {
                item.detailColor.forEach((itemDetailColor) => {
                    if (itemDetailColor.color.toLowerCase() === color.toLowerCase()) {
                        itemDetailColor.amount -= quantity;
                    }
                });
            }
        });
        await product.save();
    } catch (error) {
        res.status(500).json({ error: error });
    }
};

export default orderController;