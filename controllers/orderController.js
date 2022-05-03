import { CartModel } from "../models/CartModel.js";
import { OrderModel } from "../models/OrderModel.js";
import { ProductModel } from "../models/ProductModel.js";
import { UserModel } from "../models/UserModal.js";
import { sendEmail } from "../utils/sendMail.js";
import moment from "moment";
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
            await user.updateOne({ $push: { orders: newOrder._id } });
            var html = "";
            orderItems.forEach((orderItem) => {
                html += `  
                        <tr>
                            <td>
                                <img style="width:50px; height:80px; object-fit: cover;" src="${
                                  orderItem.image
                                }" alt="">
                            </td>
                            <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;">${
                              orderItem.name
                            } - ${orderItem.color} - ${orderItem.size}</td>
                            <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;">${
                              orderItem.quantity
                            }</td>
                            <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;">${(
                              orderItem.price -
                              orderItem.price * (orderItem.discount / 100)
                            )
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}đ</td>
                        </tr>
                        `;
            });
            const message = `<div style="background: #00796b; display: flex;flex-direction: row;">
                                        <div style="margin: 50px auto 0px auto;background: #fff;max-width: 500px;">
                                        <h2 style=" text-align: center;background: #00bfa5;margin: 0;padding: 0;line-height: 70px;font-weight: 600;">
                                        Cảm ơn bạn đã đặt hàng !
                                        </h2>
                                        <div style="padding: 20px 20px 0 20px;">
                                        <p>Xin chào <b>${
                                          newOrder.shippingInfo.fullName
                                        }</b>,</p>
                                        <p>Đơn hàng <b>#${
                                          newOrder._id
                                        }</b> đã được đặt thành công và chúng tôi đang xử lý</p>
                                        <h4>[Đơn hàng #${
                                          newOrder._id
                                        }] (${moment(newOrder.createdAt).format(
        "DD/MM/YYYY HH:mm:ss"
      )})</h4>
                                        <table style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;">
                                            <tr>
                                                <th style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px; " width="20%" >Hình ảnh</th>
                                                <th style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px; " width="50%" >Sản phẩm</th>
                                                <th style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px; " width="10%" >Số lượng</th>
                                                <th style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px; " width="20%" >Giá</th>
                                            </tr>
                                            ${html}
                                            <tr>
                                                <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;" colspan="3" style="text-align:left">Tổng số phụ:
                                                </td>
                                                <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;"><b>${newOrder.totalPrice
                                                  .toString()
                                                  .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ","
                                                  )}đ</b></td>
                                            </tr>
                                            <tr>
                                                <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;" colspan="3" style="text-align:left">Phí vận chuyển:
                                                </td>
                                                <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;"><b>${newOrder.shippingPrice
                                                  .toString()
                                                  .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ","
                                                  )}đ</b></td>
                                            </tr>
                                            <tr>
                                                <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;" colspan="3" style="text-align:left">Phương thức thanh toán:
                                                </td>
                                                <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;"><b>Thanh toán khi nhận hàng (COD)</b></td>
                                            </tr>
                                            <tr>
                                                <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;" colspan="3" style="text-align:left">Tổng cộng:
                                                </td>
                                                <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;"><b>${(
                                                  newOrder.totalPrice +
                                                  newOrder.shippingPrice
                                                )
                                                  .toString()
                                                  .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ","
                                                  )}đ</b></td>
                                            </tr>
                                        </table>

                                        <h4>Địa chỉ nhận hàng</h4>
                                        <div style="border: 1px solid #bdbdbd; padding:10px 20px;">
                                        <p>${
                                          newOrder.shippingInfo.fullName
                                        } <br>${
        newOrder.shippingInfo.address.split(",")[0]
      }<br>${newOrder.shippingInfo.address.split(",")[1]}<br>${
        newOrder.shippingInfo.address.split(",")[2]
      }<br>${newOrder.shippingInfo.address.split(",")[3]}<br>${
        newOrder.shippingInfo.phone
      }<br>${user.email}                </p>
                                        </div>
                                        <p>Thanks for using LTH Store !</p>
                                    </div>
                                    <p style="margin:0; padding:20px; color:#9e9e9e; text-align:center; background: #00796b;">LTH Store – chúng tôi chân thành cảm ơn bạn đã tin tưởng và ủng hộ chúng tôi</p>
                                </div>
                            </div>`;
            try {
                await sendEmail({
                    email: user.email,
                    subject: "Đơn hàng tại LTH Store đã được đặt thành công !",
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
            const order = req.order;
            var options = {
                email: order.user.email,
            };
            if (req.body.orderStatus === "Shipping") {
                order.orderItems.forEach(async(order) => {
                    await updateAmount(
                        order.product,
                        order.size,
                        order.color,
                        order.quantity
                    );
                });
                options.subject = "Đơn hàng tại LTH Store đang được vận chuyển";
                options.message = "đơn hàng của bạn đang vận chuyển";
            }
            if (req.body.orderStatus === "Delivery") {
                options.subject = "Đơn hàng tại LTH Store đang giao đến bạn !";
                options.message = "đơn hàng của bạn đang giao";
            }
            order.orderStatus = req.body.orderStatus;
            if (req.body.orderStatus === "Delivered") {
                order.deliveredAt = Date.now();
                options.subject = "Đơn hàng tại LTH Store đã được giao thành công !";
                options.message = "đơn hàng của bạn đã được giao thành công";
            }
            await order.save({ validateBeforeSave: false });
            sendEmail(options);
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