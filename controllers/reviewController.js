import { ProductModel } from "../models/ProductModel.js";
import { ReviewModel } from "../models/ReviewModel.js";
import { UserModel } from "../models/UserModal.js";

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
            const { content, product, star } = req.body;
            const newReview = {
                content: content,
                product: product,
                star: star,
                user: req.user.id,
            };
            let message = "Nhận xét của bạn đang chờ được kiểm duyệt !";
            if (req.isDelivered && req.products.includes(product)) {
                newReview.enable = true;
                message = "Nhận xét sản phẩm thành công !";
            }
            const review = new ReviewModel(newReview);
            await review.save();
            if (product) {
                const prod = await ProductModel.findById(product);
                await prod.updateOne({ $push: { reviews: review._id } });
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

    // [DELETE] soft delete review
    destroyReview: async(req, res, next) => {
        try {
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