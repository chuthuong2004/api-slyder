import { ProductModel } from "../models/ProductModel.js";
import formidable from 'formidable';
import multer from 'multer';
import shortid from "shortid";

import { CategoryModel } from "../models/CategoryModel.js";
const productController = {
    getAllProduct: async(req, res) => {
        try {
            const products = await ProductModel.find();
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    getProduct: async(req, res) => {
        try {
            // const product = await ProductModel.findOne({ slug: req.params.slug });
            const product = await ProductModel.findById(req.params.id).populate('category').populate('reviews');
            if (!product) {
                res.status(404).json('Không tim thấy product');
            }
            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    addProduct: async(req, res) => {
        try {
            // const newProduct = req.body;
            // const product = new ProductModel(newProduct);
            // await product.save();
            // if (req.body.category) {
            //     const category = await CategoryModel.findById(req.body.category);
            //     await category.updateOne({ $push: { products: product._id } })
            // }
            const { name, title, price, discount, desProduct, category, color, size, amount, keywords } = req.body;
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
                // return res.status(200).json({ keywords: keywords })
            const product = new ProductModel({
                name: name,
                title: title,
                price: price,
                discount: discount,
                desProduct: desProduct,
                detail: detail,
                category: category,
                images: images,
                keywords: keywords,
            });
            product.save();
            res.status(200).json(product);

        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    updateProduct: async(req, res) => {
        try {
            const updateProduct = req.body;
            let imagess = [];
            if (req.files.length > 0) {
                imagess = req.files.map(file => {
                    return { img: process.env.API + 'public/products/' + file.filename };
                })
                updateProduct.images = imagess;
            }
            const product = await ProductModel.findOneAndUpdate({ _id: req.params.id }, updateProduct, { new: true });
            // if (!product) {
            //     res.status(404).json({ message: 'Không tìm thấy product !' });
            // } else {
            //     await product.save();
            // }
            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // deleteProduct: async(req, res) => {
    //     try {
    //         const deleteProduct = await ProductModel.findByIdAndDelete(req.params.id);
    //         if (!deleteProduct) {
    //             res.status(404).json('Không tìm thấy product')
    //         } else {
    //             res.status(200).json('Deleted successfully')
    //         }
    //     } catch (err) {
    //         res.status(500).json({ error: error });
    //     }
    // },

    // [DELETE] /course/:,
    destroyProduct: async(req, res, next) => {
        try {
            const deleteProduct = await ProductModel.delete({ _id: req.params.id });
            if (!deleteProduct) {
                res.status(404).json('Không tìm thấy product để xử lý xóa mềm')
            } else {
                res.status(200).json('Xóa mềm thành công !')
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // [DELETE] /course/:id/for,
    forceDestroyProduct: async(req, res, next) => {
        try {
            const deleteProduct = await ProductModel.deleteOne({ _id: req.params.id })
            if (!deleteProduct) {
                res.status(404).json('Không tìm thấy product để xử lý xóa hẳn')
            } else {
                res.status(200).json('Deleted successfully')
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // [PATCH] /course/:id/resto,
    restoreProduct: async(req, res, next) => {
        try {
            const deleteProduct = await ProductModel.restore({ _id: req.params.id })
            if (!deleteProduct) {
                res.status(404).json('Không tìm thấy product để khôi phục')
            } else {
                res.status(200).json('Khôi phục product thành công')
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
}

export default productController;