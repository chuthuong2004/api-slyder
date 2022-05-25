import { OrderModel } from "../models/OrderModel.js";
import { ProductModel } from "../models/ProductModel.js";
import { ReviewModel } from "../models/ReviewModel.js";
import { UserModel } from "../models/UserModel.js";
import { APIFeatures } from "../utils/APIFeatures.js";
const reviewController = {
    getAllReview: async(req, res) => {
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

            const reviews = await ReviewModel.find({ enable: true })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "user",
                    populate: { path: "blogs" },
                })
                .populate("product");
            const countDocument = await ReviewModel.countDocuments();
            res.status(200).json({
                success: true,
                countDocument: countDocument,
                resultPerPage: limit,
                reviews,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    getAllReviewV2ByProduct: async(req, res) => {
        try {
            const features = new APIFeatures(
                    ReviewModel.find({ product: req.params.idProduct, enable: true })
                    .populate("user")
                    .populate("product"),
                    req.query
                )
                .paginating()
                .sorting()
                .filtering();
            var reviews = await features.query;
            res.status(200).json({
                success: true,
                counDocuments: reviews.length,
                resultPerPage: req.query.limit * 1 || 0,
                reviews,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    getAdminReviews: async(req, res) => {
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

            const reviews = await ReviewModel.find()
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "user",
                    populate: { path: "blogs" },
                })
                .populate("product");
            const countDocument = await ReviewModel.countDocuments();
            res.status(200).json({
                success: true,
                countDocument: countDocument,
                resultPerPage: limit,
                reviews,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    getAReview: async(req, res) => {
        try {
            const review = await ReviewModel.findById(req.params.id)
                .populate("product")
                .populate("user");
            if (!review) {
                res.status(404).json({
                    success: false,
                    message: "Không tìm thấy nhận xét !",
                });
            }
            res.status(200).json({
                success: true,
                review,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    addReview: async(req, res) => {
        try {
            return res.status(200).json(req.orderItems);

            var productsOrder = req.orderItems.map((item) => item.product.toString());
            const { content, product, star } = req.body;
            var infoProduct = req.orderItems.find(
                (item) => item.product.toString() == product
            );
            const infoProductOrdered = {
                color: infoProduct.color,
                size: infoProduct.size,
                quantity: infoProduct.quantity,
            };
            console.log(127);
            const newReview = {
                content: content,
                product: product,
                star: star,
                user: req.user.id,
                infoProductOrdered: infoProductOrdered,
            };
            console.log(134);
            let message = "Nhận xét của bạn đang chờ được kiểm duyệt !";
            if (req.isDelivered && productsOrder.includes(product)) {
                console.log(137);
                newReview.enable = true;
                message = "Nhận xét sản phẩm thành công !";
            }
            const review = new ReviewModel(newReview);
            await review.save();
            console.log(143);
            if (product) {
                const prod = await ProductModel.findById(product);
                const prodOfReview = await ReviewModel.find({
                    product: product,
                    enable: true,
                });
                const totalAmount = prodOfReview.reduce(
                    (total, item) => total + item.star,
                    0
                );
                const rate = totalAmount / prodOfReview.length;
                await prod.updateOne({
                    $push: { reviews: review._id },
                    $set: { rate: rate },
                });
            }
            if (req.user.id) {
                const user = await UserModel.findById(req.user.id);
                await user.updateOne({ $push: { reviews: review._id } });
            }
            res.status(200).json({
                success: true,
                message,
                review,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    addReviewV2: async(req, res) => {
        try {
            const order = await OrderModel.findOne({
                user: req.user.id,
                "orderItems._id": req.params.id,
                orderStatus: "Delivered",
            });
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn đặt hàng !",
                });
            }
            const { content, product, star } = req.body;

            var infoProduct = order.orderItems.find(
                (item) => item.product == product
            );
            if (!infoProduct) {
                return res
                    .status(404)
                    .json({ success: false, message: "Không tìm thấy order item !" });
            }
            const infoProductOrdered = {
                color: infoProduct.color,
                size: infoProduct.size,
                quantity: infoProduct.quantity,
            };

            const newReview = {
                content: content,
                product: product,
                star: star,
                user: req.user.id,
                infoProductOrdered: infoProductOrdered,
                enable: true,
            };
            const review = new ReviewModel(newReview);
            await review.save();
            if (product) {
                const prod = await ProductModel.findById(product);
                const prodOfReview = await ReviewModel.find({
                    product: product,
                    enable: true,
                });

                const totalAmount = prodOfReview.reduce(
                    (total, item) => total + item.star,
                    0
                );
                const rate = totalAmount / prodOfReview.length;

                await prod.updateOne({
                    $push: { reviews: review._id },
                    $set: { rate: rate },
                });
            }

            if (req.user.id) {
                const user = await UserModel.findById(req.user.id);
                await user.updateOne({ $push: { reviews: review._id } });
            }
            res.status(200).json({
                success: true,
                message: "Đánh giá sản phẩm thành công !",
                review,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    updateReview: async(req, res) => {
        try {
            const updateReview = req.body;
            const review = await ReviewModel.findOneAndUpdate({ _id: req.params.id },
                updateReview, { new: true }
            );
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy nhận xét !",
                });
            }
            await review.save();
            res.status(200).json(review);
        } catch (err) {
            res.status(500).json({ error: error });
        }
    },
    getMyReview: async(req, res) => {
        try {
            const reviews = await ReviewModel.find({ user: req.user.id });
            if (!reviews) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy các đánh giá của bạn !",
                });
            }
            res.status(200).json(reviews);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // [DELETE] soft delete review
    destroyReview: async(req, res, next) => {
        try {
            // const review =await ReviewModel.findOne();
            // if()
            const destroyReview = await ReviewModel.delete({ _id: req.params.id });
            if (!destroyReview) {
                res.status(404).json({
                    success: false,
                    message: "Không tìm thấy nhận xét để xử lý xóa mềm !",
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "Xóa nhận xét thành công !",
                });
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // [DELETE] delete review from database
    forceDestroyReview: async(req, res, next) => {
        try {
            await UserModel.updateMany({
                reviews: req.params.id,
            }, {
                $pull: { reviews: req.params.id },
            });
            await ProductModel.updateMany({
                reviews: req.params.id,
            }, {
                $pull: { reviews: req.params.id },
            });
            const deleteReview = await ReviewModel.deleteOne({ _id: req.params.id });
            if (!deleteReview) {
                res.status(404).json({
                    success: false,
                    message: "Không tìm thấy nhận xét để xử lý xóa hẳn !",
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "Xóa nhận xét thành công !",
                });
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // [PATCH] /course/:id/resto,
    restoreReview: async(req, res, next) => {
        try {
            const restoreReview = await ReviewModel.restore({ _id: req.params.id });
            if (!restoreReview) {
                res.status(404).json({
                    success: false,
                    message: "Không tìm thấy nhận xét để khôi phục !",
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "Khôi phục nhận xét thành công !",
                });
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
};

export default reviewController;