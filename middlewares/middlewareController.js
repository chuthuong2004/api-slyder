import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import { OrderModel } from "../models/OrderModel.js";
import { ProductModel } from "../models/ProductModel.js";
const middlewareController = {
    // verifyToken
    verifyToken: (req, res, next) => {
        const token = req.headers.token;
        if (token) {
            // Bearer ẻgfwherfwerfwf
            const accessToken = token.split(" ")[1];
            jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
                if (err) {
                    return res.status(403).json({
                        success: false,
                        message: "Token này đã hết hạn !",
                    });
                }
                req.user = user;
                next();
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Vui lòng đăng nhập !",
            });
        }
    },
    verifyTokenAndAdminAuth: (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            if (req.user.isAdmin) {
                next();
            } else {
                return res.status(403).json({
                    success: false,
                    message: "Bạn không có quyền Admin",
                });
            }
        });
    },
    validateSignupRequest: [
        check("email")
        .notEmpty()
        .withMessage("Vui lòng nhập địa chỉ email !")
        .isEmail()
        .withMessage("Địa chỉ email không hợp lệ !"),
        check("username")
        .notEmpty()
        .withMessage("Vui lòng nhập tên đăng nhập !")
        .isLength({ min: 6 })
        .withMessage("Tên đăng nhập phải có ít nhất 6 kí tự !"),
        check("password")
        .notEmpty()
        .withMessage("Vui lòng nhập mật khẩu !")
        .isLength({ min: 6 })
        .withMessage("Mật khẩu phải ít nhất 6 kí tự !"),
    ],
    validateSigninRequest: [
        check("username").notEmpty().withMessage("Vui lòng nhập tên đăng nhập !"),
        check("password")
        .notEmpty()
        .withMessage("Vui lòng nhập mật khẩu !")
        .isLength({ min: 6 })
        .withMessage("Mật khẩu phải ít nhất 6 kí tự !"),
    ],
    validateCatalogRequest: [
        check("name").notEmpty().withMessage("Vui lòng nhập tên mục lục !"),
    ],
    validateEmail: [
        check("email")
        .notEmpty()
        .withMessage("Vui lòng nhập địa chỉ email !")
        .isEmail()
        .withMessage("Địa chỉ email không hợp lệ !"),
    ],
    validateChangePassword: [
        check("currentPassword")
        .notEmpty()
        .withMessage("Vui lòng nhập mật khẩu hiện tại !"),
        check("newPassword")
        .notEmpty()
        .withMessage("Vui lòng nhập mật khẩu mới !")
        .isLength({ min: 6 })
        .withMessage("Mật khẩu mới phải có ít nhất 6 kí tự !"),
        check("confirmPassword")
        .notEmpty()
        .withMessage("Vui lòng nhập lại mật khẩu !")
        .isLength({ min: 6 })
        .withMessage("Mật khẩu nhập lại phải có ít nhất 6 kí tự !"),
    ],
    validateUpdateCart: [
        check("quantity").notEmpty().withMessage("Vui lòng nhập số lượng !"),
    ],
    validateAddToCart: [
        check("product").notEmpty().withMessage("Vui lòng nhập ID product !"),
        check("size").notEmpty().withMessage("Vui lòng chọn kích thước !"),
        check("color").notEmpty().withMessage("Vui lòng chọn màu sắc !"),
        check("quantity")
        .notEmpty()
        .withMessage("Vui lòng chọn số lượng !")
        .isNumeric({ min: 1 })
        .withMessage("Quantity is at least 1"),
    ],
    validateOrder: [
        check("fullName").notEmpty().withMessage("Vui lòng nhập họ và tên !"),
        check("phone")
        .notEmpty()
        .withMessage("Vui lòng nhập số điện thoại !")
        .isNumeric()
        .withMessage("Số điện thoại phải là kí tự số !")
        .isLength({ min: 10 })
        .withMessage("Số điện thoại tối thiếu 10 số !")
        .isLength({ max: 10 })
        .withMessage("Số điện thoại tối đa 10 số !"),
        check("province")
        .notEmpty()
        .withMessage("Vui lòng chọn tỉnh / thành phố !"),
        check("district").notEmpty().withMessage("Vui lòng chọn quận / huyện !"),
        check("ward").notEmpty().withMessage("Vui lòng chọn xã / phường !"),
        check("address").notEmpty().withMessage("Vui lòng nhập địa chỉ !"),
    ],
    isRequestValidated: (req, res, next) => {
        const errors = validationResult(req);
        if (errors.array().length > 0) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
            });
        } else {
            next();
        }
    },
    verifyOrderDelivered: async(req, res, next) => {
        try {
            const order = await OrderModel.findOne({
                user: req.user.id,
            });
            if (!order) {
                console.log("Không có order");
                req.isOrdered = false;
            }
            if (order.orderStatus === "Delivered") {
                console.log("order đã được giao hàng");
                req.orderItems = order.orderItems;
                req.isDelivered = true;
            } else {
                console.log("Order chưa giao hàng");
                req.isDelivered = false;
            }
            next();
        } catch (error) {
            return res.status(500).json({ error: error });
        }
    },
    checkStatusOrder: async(req, res, next) => {
        try {
            const order = await OrderModel.findById(req.params.id).populate(
                "user",
                "username email"
            );
            if (!order)
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn đặt hàng với ID trên !",
                });

            if (order.orderStatus === "Delivered")
                return res.status(400).json({
                    success: false,
                    message: "Bạn đã giao đơn đặt hàng này !",
                });
            if (
                (order.orderStatus === "Processing" &&
                    req.body.orderStatus === "Shipping") ||
                (order.orderStatus === "Shipping" &&
                    req.body.orderStatus === "Delivery") ||
                (order.orderStatus === "Delivery" &&
                    req.body.orderStatus === "Delivered")
            ) {
                req.order = order;
                next();
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Đơn đặt hàng cập nhật không hợp lệ !",
                });
            }
        } catch (error) {
            return res.status(500).json({ error: error });
        }
    },

    // Kiểm tra số lượng product này còn hay không
    checkQuantityProduct: async(req, res, next) => {
        try {
            const cartItem = req.body;
            const product = await ProductModel.findOne({ _id: cartItem.product });
            let isSuccess = false;
            product.detail.forEach((item) => {
                if (item.size === cartItem.size) {
                    item.detailColor.forEach((item) => {
                        if (item.color.toLowerCase() === cartItem.color.toLowerCase()) {
                            if (item.amount > 0 && item.amount >= cartItem.quantity)
                                isSuccess = true;
                        }
                    });
                }
            });
            if (!isSuccess)
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng kiểm tra lại sản phẩm ! có thể số lượng sản phẩm không hợp lệ",
                });
            next();
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
};
export default middlewareController;