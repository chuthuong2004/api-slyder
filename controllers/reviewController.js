import { ProductModel } from "../models/ProductModel.js";
import { ReviewModel } from "../models/ReviewModel.js";
import { UserModel } from "../models/UserModal.js";

const reviewController = {
    getAllReview: async(req, res) => {
        try {
            const reviews = await ReviewModel.find().populate({
                path: 'user',
                populate: { path: 'blogs' }
            }).populate('product');
            res.status(200).json({
                success: true,
                reviews
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    getAReview: async(req, res) => {
        try {
            const review = await ReviewModel.findById(req.params.id).populate('product').populate('user');
            if (!review) {
                res.status(404).json({
                    success: false,
                    message: 'Không tim thấy review'
                });
            }
            res.status(200).json({
                success: true,
                review
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
                user: req.user.id
            }
            let message = 'Nhận xét của bạn đang chờ được kiểm duyệt'
            if (req.isDelivered && req.products.includes(product)) {
                newReview.enable = true;
                message = 'Nhận xét sản phẩm thành công !'
            }
            const review = new ReviewModel(newReview);
            console.log('1');
            await review.save();

            console.log('5');
            if (product) {
                const prod = await ProductModel.findById(product);
                console.log('2');
                await prod.updateOne({ $push: { reviews: review._id } });
            }
            if (req.user.id) {

                console.log('3');
                const user = await UserModel.findById(req.user.id);
                await user.updateOne({ $push: { reviews: review._id } })
            }
            res.status(200).json({
                success: true,
                message,
                review
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    updateReview: async(req, res) => {
        try {
            const updateReview = req.body;
            const review = await ReviewModel.findOneAndUpdate({ _id: req.params.id }, updateReview, { new: true });
            if (!review) {
                return res.status(404).json({ message: 'Không tìm thấy review !' });
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
                    message: 'Không tìm thấy review để xử lý xóa mềm'
                })
            } else {
                res.status(200).json({
                    success: true,
                    message: 'Xóa mềm thành công !'
                })
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // [DELETE] delete review from database
    forceDestroyReview: async(req, res, next) => {
        try {
            await UserModel.updateMany({
                reviews: req.params.id
            }, {
                $pull: { reviews: req.params.id }
            })
            await ProductModel.updateMany({
                reviews: req.params.id
            }, {
                $pull: { reviews: req.params.id }
            })
            const deleteReview = await ReviewModel.deleteOne({ _id: req.params.id })
            if (!deleteReview) {
                res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy review để xử lý xóa hẳn'
                })
            } else {
                res.status(200).json({
                    success: true,
                    message: 'Xóa review thành công'
                })
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // [PATCH] /course/:id/resto,
    restoreReview: async(req, res, next) => {
        try {
            const restoreReview = await ReviewModel.restore({ _id: req.params.id })
            if (!restoreReview) {
                res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy review để khôi phục'
                })
            } else {
                res.status(200).json({
                    success: true,
                    message: 'Khôi phục review thành công'
                })
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
}

export default reviewController;