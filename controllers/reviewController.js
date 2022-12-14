import { OrderModel } from "../models/OrderModel.js";
import { ProductModel } from "../models/ProductModel.js";
import { ReviewModel } from "../models/ReviewModel.js";
import { UserModel } from "../models/UserModel.js";
import { APIFeatures } from "../utils/APIFeatures.js";
const reviewController = {
    getAllReview: async(req, res) => {
        try {
            const features = await APIFeatures(
                ReviewModel.find({ enable: true })
                .populate({
                    path: "user",
                    populate: { path: "blogs" },
                })
                .populate("product"),
                req.query
            );

            const reviews = await features.query;
            res.status(200).json({
                success: true,
                countDocument: reviews.length,
                resultPerPage: req.query.limit * 1 || 0,
                data: reviews,
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
                data: reviews,
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
                    message: "Kh??ng t??m th???y nh???n x??t !",
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
            let message = "Nh???n x??t c???a b???n ??ang ch??? ???????c ki???m duy???t !";
            if (req.isDelivered && productsOrder.includes(product)) {
                console.log(137);
                newReview.enable = true;
                message = "Nh???n x??t s???n ph???m th??nh c??ng !";
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
                    message: "Kh??ng t??m th???y ????n ?????t h??ng !",
                });
            }
            const { content, product, star } = req.body;

            var infoProduct = order.orderItems.find(
                (item) => item.product == product
            );
            if (!infoProduct) {
                return res
                    .status(404)
                    .json({ success: false, message: "Kh??ng t??m th???y order item !" });
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
            order.commented = true;
            await order.save();
            res.status(200).json({
                success: true,
                message: "????nh gi?? s???n ph???m th??nh c??ng !",
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
                    message: "Kh??ng t??m th???y nh???n x??t !",
                });
            }
            res.status(200).json({
                success: true,
                message: "C???p nh???t ????nh gi?? th??nh c??ng !",
                review,
            });
        } catch (err) {
            res.status(500).json({ error: error });
        }
    },
    getMyReview: async(req, res) => {
        try {
            const features = new APIFeatures(
                ReviewModel.find({ user: req.user.id }),
                req.query
            );
            const reviews = await features.query;
            if (!reviews) {
                return res.status(404).json({
                    success: false,
                    message: "Kh??ng t??m th???y c??c ????nh gi?? c???a b???n !",
                });
            }
            res.status(200).json({
                success: true,
                countDocument: reviews.length,
                resultPerPage: req.query.limit * 1 || 0,
                reviews,
            });
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
                    message: "Kh??ng t??m th???y nh???n x??t ????? x??? l?? x??a m???m !",
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "X??a nh???n x??t th??nh c??ng !",
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
                    message: "Kh??ng t??m th???y nh???n x??t ????? x??? l?? x??a h???n !",
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "X??a nh???n x??t th??nh c??ng !",
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
                    message: "Kh??ng t??m th???y nh???n x??t ????? kh??i ph???c !",
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "Kh??i ph???c nh???n x??t th??nh c??ng !",
                });
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
};

export default reviewController;