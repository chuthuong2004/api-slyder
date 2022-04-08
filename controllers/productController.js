import { CategoryModel } from "../models/CategoryModel.js";
import { ProductModel } from "../models/ProductModel.js";
import { ReviewModel } from "../models/ReviewModel.js";
const productController = {
    // ! GET ALL PRODUCT ----- PAGINATION
    getAllProduct: async(req, res) => {
        try {
            const resultPerPage = 8;
            const productsCount = await ProductModel.countDocuments();
            const products = await ProductModel.find().populate({
                path: 'category',
                populate: { path: 'catalog', }
            }).populate({
                path: 'reviews',
                populate: { path: 'user' }
            });
            res.status(200).json({
                success: true,
                productsCount,
                resultPerPage,
                products
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // * GET ALL PRODUCT ---- ADMIN
    getAdminProducts: async(req, res) => {
        try {
            const products = await ProductModel.find();
            res.status(200).json({
                success: true,
                products
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * GET PRODUCT DETAILS
    getProductDetails: async(req, res) => {
        try {
            const product = await ProductModel.findById(req.params.id).populate('category').populate('reviews');
            if (!product) return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
            res.status(200).json({
                success: true,
                product,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // ! CREATE PRODCUCT --- HANDLE IMAGES
    createProduct: async(req, res) => {

        try {
            const { color, size, amount, ...other } = req.body;
            let images = [];
            if (req.files.length > 0) {
                images = req.files.map(file => {
                    return { img: process.env.API + 'public/products/' + file.filename };
                })
            }
            let detail = [];
            let detailColor = [];
            detailColor.push({ color: color, amount: amount })
            detail.push({ size: size, detailColor: detailColor })
            const newProduct = other;
            newProduct.detail = detail;
            newProduct.images = images;
            const product = new ProductModel(newProduct);
            await product.save();
            await CategoryModel.updateOne({
                _id: newProduct.category
            }, {
                $push: { products: product._id }
            })
            res.status(201).json({
                success: true,
                product: product,
            });

        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // ! UPDATE PRODUCT -- kiểm tra size color amount khi update
    updateProduct: async(req, res) => {
        try {
            let product = await ProductModel.findById(req.params.id);
            if (!product) return res.status(404).json({ success: false, message: 'Product not found' })

            const updateProduct = req.body;
            let images = [];
            if (req.files.length > 0) {
                images = req.files.map(file => {
                    return { img: process.env.API + 'public/products/' + file.filename };
                })
                updateProduct.images = images;
            }
            product = await ProductModel.findByIdAndUpdate(req.params.id, updateProduct, {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            });
            res.status(200).json({
                success: true,
                product,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * SOFT DELETE PRODUCT
    destroyProduct: async(req, res, next) => {
        try {
            const deleteProduct = await ProductModel.delete({ _id: req.params.id });
            if (!deleteProduct) {
                res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy product để xử lý xóa mềm'
                })
            } else {
                res.status(200).json({
                    success: false,
                    message: 'Xóa mềm thành công !'
                })
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // ! DELETE PRODUCT kiểm tra sản phẩm xóa có nằm trong cart không, nếu có thì hủy cart đó
    forceDestroyProduct: async(req, res, next) => {
        try {
            await CategoryModel.updateMany({
                products: req.params.id
            }, {
                $pull: { products: req.params.id }
            });
            await ReviewModel.updateOne({ product: req.params.id }, { product: null });
            const deleteProduct = await ProductModel.deleteOne({ _id: req.params.id })
            if (!deleteProduct) {
                res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy product để xử lý xóa hẳn'
                })
            } else {
                res.status(200).json({
                    success: false,
                    message: 'Deleted successfully'
                })
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // * RESTORE PRODUCT
    restoreProduct: async(req, res, next) => {
        try {
            const deleteProduct = await ProductModel.restore({ _id: req.params.id })
            if (!deleteProduct) {
                res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy product để khôi phục'
                })
            } else {
                res.status(200).json({
                    success: false,
                    message: 'Khôi phục product thành công'
                })
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
}

export default productController;