import { CartModel } from "../models/CartModel.js";
import { OrderModel } from "../models/OrderModel.js";
import { ProductModel } from "../models/ProductModel.js";
import { UserModel } from "../models/UserModel.js";
import { sendEmail } from "../utils/sendMail.js";
import { APIFeatures } from "../utils/APIFeatures.js";
import msg from "../utils/messageEmail.js";
import moment from "moment";
const orderController = {
  // * CREATE ORDER WITH USER CART
  newOrder: async (req, res) => {
    try {
      const { fullName, phone, province, district, ward, address } = req.body;
      const shippingInfo = {
        fullName,
        phone,
        province,
        district,
        ward,
        address,
      }; // fullName, phone, province, district, wards, address
      const paid = req.body.paid;
      let shippingPrice = req.body.shippingPrice;
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
      if (!shippingPrice) {
        if (province.includes("Thành phố Hồ Chí Minh")) {
          if (ward.includes("Phường Hiệp Bình Phước")) shippingPrice = 0;
          else {
            shippingPrice = 10000;
          }
        } else {
          shippingPrice = 30000;
        }
      }
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

      if (paid) {
        newOrder.paid = true;
        newOrder.paidAt = Date.now();
        await newOrder.save();
      }
      // * Tìm User
      const user = await UserModel.findById(req.user.id);
      if (!user)
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user !",
        });

      await user.updateOne({
        $push: { orders: newOrder._id },
      });

      var message = msg(
        newOrder,
        "Cảm ơn bạn đã đặt hàng !",
        "đã được đặt thành công và chúng tôi đang xử lý.",
        user.email
      );
      try {
        await sendEmail({
          email: user.email,
          subject: "Đơn hàng tại LTH Store đã được đặt thành công !",
          message: message,
        });
      } catch (error) {
        res.status(500).json({ error: error });
      }
      return res.status(200).json({
        success: true,
        message: "Đơn hàng của bạn đã đặt thành công !",
        newOrder,
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // * GET SINGLE ORDER
  getSingleOrder: async (req, res) => {
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

  // * GET SINGLE ORDER
  getSingleOrderV2: async (req, res) => {
    try {
      const order = await OrderModel.findOne({
        _id: req.params.id,
        user: req.user.id,
      });
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
  myOrder: async (req, res) => {
    try {
      const features = new APIFeatures(
        OrderModel.find({ user: req.user.id }),
        req.query
      )
        .paginating()
        .sorting()
        .filtering();
      const orders = await features.query;
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
        countDocument: orders.length,
        totalAmount,
        resultPerPage: req.query.limit * 1 || 0,
        data: orders,
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // * GET ALL ORDERS
  getAllOrders: async (req, res) => {
    try {
      const features = new APIFeatures(
        OrderModel.find()
          .populate({
            path: "orderItems",
            populate: { path: "product" },
          })
          .populate("user"),
        req.query
      );
      const orders = await features.query;
      // tổng tiền tất cả đơn hàng
      const totalAmount = orders.reduce(
        (total, order) => total + (order.totalPrice + order.shippingPrice),
        0
      );
      const countDocument = await OrderModel.countDocuments();
      res.status(200).json({
        success: true,
        totalAmount,
        countDocument: orders.length,
        resultPerPage: req.query.limit * 1 || 0,
        data: orders,
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // * UPDATE ORDER - UPDATE AMOUNT PRODUCT ---- handle send email
  updateOrder: async (req, res) => {
    try {
      const order = req.order;
      var options = {
        email: order.user.email,
      };
      if (req.body.orderStatus === "Shipping") {
        order.orderItems.forEach(async (order) => {
          await updateAmount(
            order.product,
            order.size,
            order.color,
            order.quantity
          );
        });
        order.shippingAt = Date.now();
        options.subject = "Đơn hàng tại LTH Store đang được vận chuyển";
        options.message = msg(
          order,
          "Đơn hàng của bạn đang được vận chuyển",
          "đang được vận chuyển"
        );
      }
      if (req.body.orderStatus === "Delivery") {
        order.deliveryAt = Date.now();
        options.subject = "Đơn hàng tại LTH Store đang giao đến bạn !";
        options.message = "đơn hàng của bạn đang giao";
        options.message = msg(
          order,
          "Đơn hàng của bạn đang được giao",
          `đang được giao đến địa chỉ <b>${order.shippingInfo.address}, ${order.shippingInfo.ward}, ${order.shippingInfo.district}, ${order.shippingInfo.province}</b>`
        );
      }
      order.orderStatus = req.body.orderStatus;
      if (req.body.orderStatus === "Delivered") {
        order.orderItems.forEach(async (orderItem) => {
          const product = await ProductModel.findById(orderItem.product);
          if (product) {
            product.quantitySold += 1;
            await product.save();
          }
        });
        order.deliveredAt = Date.now();
        options.subject = "Đơn hàng tại LTH Store đã được giao thành công !";
        options.message = msg(
          order,
          "Đơn hàng của bạn đã giao thành công !",
          `đã được giao thành công ngày ${moment(order.deliveredAt).format(
            "DD/MM/YYYY HH:mm:ss"
          )}`
        );
      }
      await order.save({ validateBeforeSave: false });
      await sendEmail(options);
      res.status(200).json({
        success: true,
        message: "Đã cập nhật đơn hàng thành công !",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // * CANCEL ORDER
  cancelOrder: async (req, res) => {
    try {
      var order = await OrderModel.findOne({
        _id: req.params.id,
        user: req.user.id,
      }).populate("user", "username email");
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn đặt hàng của bạn",
        });
      }
      var options = {
        email: order.user.email,
      };
      if (order.orderStatus === "Processing") {
        order.orderStatus = "Canceled";
        order.canceledReason = req.body.reason;
        order.canceledAt = Date.now();
        options.subject = "Đơn hàng tại LTH Store đã được hủy thành công !";
        options.message = msg(
          order,
          "Đơn hàng của bạn đã hủy thành công !",
          `đã được hủy thành công ngày ${moment(order.canceledAt).format(
            "DD/MM/YYYY HH:mm:ss"
          )}`
        );
        try {
          await sendEmail(options);
        } catch (error) {
          return res.status(500).json({ error: error });
        }
        await order.save({ validateBeforeSave: false });

        return res.status(200).json({
          success: true,
          message: "Đã hủy đơn hàng thành công !",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Không thể hủy đơn hàng, đơn đặt hàng của bạn đã được xử lý !",
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  // * DELETE ORDER --- DONE
  deleteOrder: async (req, res) => {
    try {
      const order = await OrderModel.findById(req.params.id);
      if (!order)
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn đặt hàng với ID được chỉ định !",
        });
      await UserModel.updateOne(
        {
          orders: req.params.id,
        },
        {
          $pull: { orders: req.params.id },
        }
      );
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
const updateAmount = async (idProduct, size, color, quantity) => {
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
