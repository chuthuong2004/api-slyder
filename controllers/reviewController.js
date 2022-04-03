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
            res.status(200).json(reviews);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    getAReview: async(req, res) => {
        try {
            const review = await ReviewModel.findById(req.params.id).populate('product').populate('user');
            if (!review) {
                res.status(404).json('Không tim thấy nhận xét');
            }
            res.status(200).json(review);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    addReview: async(req, res) => {
        try {
            const { content, product, start } = req.body;

            const review = new ReviewModel({
                content: content,
                product: product,
                start: start,
                user: req.user.id
            });
            await review.save();
            if (req.body.product) {
                const product = await ProductModel.findById(req.body.product);
                await product.updateOne({ $push: { reviews: review._id } });
            }
            if (req.user.id) {
                const user = await UserModel.findById(req.user.id);
                await user.updateOne({ $push: { reviews: review._id } })
            }
            res.status(200).json(review);
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

    // [DELETE] /course/:,
    destroyReview: async(req, res, next) => {
        try {
            const destroyReview = await ReviewModel.delete({ _id: req.params.id });
            if (!destroyReview) {
                res.status(404).json('Không tìm thấy review để xử lý xóa mềm')
            } else {
                res.status(200).json('Xóa mềm thành công !')
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // [DELETE] /course/:id/for,
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
                res.status(404).json('Không tìm thấy review để xử lý xóa hẳn')
            } else {
                res.status(200).json('Deleted successfully')
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
                res.status(404).json('Không tìm thấy review để khôi phục')
            } else {
                res.status(200).json('Khôi phục review thành công')
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
}

export default reviewController;