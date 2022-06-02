import { CartModel } from "../models/CartModel.js";
import { CategoryModel } from "../models/CategoryModel.js";
import { ProductModel } from "../models/ProductModel.js";
import { ReviewModel } from "../models/ReviewModel.js";
import { UserModel } from "../models/UserModel.js";
import { APIFeatures } from "../utils/APIFeatures.js";
const productController = {
    // ! GET ALL PRODUCT ----- PAGINATION
    getAllProduct: async(req, res) => {
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
            const products = await ProductModel.find()
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "category",
                    populate: { path: "catalog" },
                })
                .populate({
                    path: "reviews",
                    populate: { path: "user" },
                });
            const productsCount = await ProductModel.countDocuments();
            res.status(200).json({
                success: true,
                countDocument: productsCount,
                resultPerPage: limit,
                products,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // GET ALL PRODUCT V2 APP
    getAllProductV2: async(req, res) => {
        try {
            const features = new APIFeatures(ProductModel.find(), req.query)
                .paginating()
                .sorting()
                .searching()
                .filtering();

            var products = await features.query;
            res.status(200).json({
                success: true,
                countDocuments: products.length,
                resultPerPage: req.query.limit * 1 || 0,
                products,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    getAllProductByCategory: async(req, res) => {
        try {
            const features = new APIFeatures(
                    ProductModel.find({ category: req.params.idCate }),
                    req.query
                )
                .paginating()
                .sorting()
                .filtering();
            var products = await features.query;
            res.status(200).json({
                success: true,
                countDocuments: products.length,
                resultPerPage: req.query.limit * 1 || 0,
                products,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * GET ALL PRODUCT ---- ADMIN
    // getAdminProducts: async(req, res) => {
    //     try {
    //         const products = await ProductModel.find();
    //         res.status(200).json({
    //             success: true,
    //             products,
    //         });
    //     } catch (error) {
    //         res.status(500).json({ error: error });
    //     }
    // },

    // * GET PRODUCT DETAILS
    getProductDetails: async(req, res) => {
        try {
            const product = await ProductModel.findById(req.params.id)
                .populate("category")
                .populate({
                    path: "reviews",
                    match: { enable: true },
                });
            if (!product)
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm !",
                });
            res.status(200).json({
                success: true,
                product,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    getProductDetailsV2: async(req, res) => {
        try {
            const product = await ProductModel.findById(req.params.id);
            if (!product)
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm !",
                });
            res.status(200).json({
                success: true,
                product,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // ! CREATE PRODCUCT --- HANDLE IMAGES ---DONE--- ----handle add many size, color and amount
    createProduct: async(req, res) => {
        return res.status(200).json(req.body);
        try {
            const { color, size, amount, ...other } = req.body;
            let images = [];
            if (req.files.length > 0) {
                images = req.files.map((file) => {
                    return { img: process.env.API + "public/products/" + file.filename };
                });
            }
            let detail = [];
            let detailColor = [];
            detailColor.push({ color: color, amount: amount });
            detail.push({ size: size, detailColor: detailColor });
            const newProduct = other;
            newProduct.detail = detail;
            newProduct.images = images;
            const product = new ProductModel(newProduct);
            await product.save();
            await CategoryModel.updateOne({
                _id: newProduct.category,
            }, {
                $push: { products: product._id },
            });
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
            if (!product)
                return res
                    .status(404)
                    .json({ success: false, message: "Không tìm thấy sản phẩm !" });

            const updateProduct = req.body;
            let images = [];
            if (req.files.length > 0) {
                images = req.files.map((file) => {
                    return { img: process.env.API + "public/products/" + file.filename };
                });
                updateProduct.images = images;
            }
            product = await ProductModel.findByIdAndUpdate(
                req.params.id,
                updateProduct, {
                    new: true,
                    runValidators: true,
                    useFindAndModify: false,
                }, { new: true }
            );
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
                    message: "Không tìm thấy product để xử lý xóa mềm !",
                });
            } else {
                res.status(200).json({
                    success: false,
                    message: "Xóa mềm thành công !",
                });
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // ! DELETE PRODUCT --- HANDLE DELETE IMAGES
    forceDestroyProduct: async(req, res) => {
        try {
            // Tìm tất cả các carts có chứa product này
            const carts = await CartModel.find({
                "cartItems.$.product": req.params.id,
            });

            // * DELETE ITEM FROM CART SUCCESSFULLY
            if (carts)
            //
                carts.forEach(async(cart) => {
                if (cart.cartItems.length == 1) {
                    await UserModel.updateOne({ cart: cart._id }, { cart: null });
                    await CartModel.findByIdAndDelete(cart._id);
                } else {
                    await CartModel.updateMany({ "cartItems.$.product": req.params.id }, { $pull: { cartItems: { product: req.params.id } } });
                }
            });

            // xóa product khỏi danh mục
            await CategoryModel.updateMany({
                products: req.params.id,
            }, {
                $pull: { products: req.params.id },
            });

            // Tìm review của product này và xóa review
            await ReviewModel.findOneAndDelete({ product: req.params.id });
            const deleteProduct = await ProductModel.deleteOne({
                _id: req.params.id,
            });
            if (!deleteProduct) {
                res.status(404).json({
                    success: false,
                    message: "Không tìm thấy product để xử lý xóa hẳn !",
                });
            } else {
                res.status(200).json({
                    success: false,
                    message: "Đã xóa sản phẩm thành công !",
                });
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * RESTORE PRODUCT
    restoreProduct: async(req, res, next) => {
        try {
            const deleteProduct = await ProductModel.restore({ _id: req.params.id });
            if (!deleteProduct) {
                res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm để khôi phục !",
                });
            } else {
                res.status(200).json({
                    success: false,
                    message: "Khôi phục sản phẩm thành công !",
                });
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    search: async(req, res) => {
        try {
            var page = req.query.page * 1;
            var limit = req.query.limit * 1;
            let search = req.query.q;
            if ((limit && !page) || (page == 0 && limit == 0)) {
                page = 1;
            }
            if (!page && !limit) {
                page = 1;
                limit = 0;
            }
            var skip = (page - 1) * limit;
            const products = await ProductModel.find({
                    $or: [
                        { name: { $regex: new RegExp(".*" + search + ".*", "i") } },
                        {
                            keywords: {
                                $regex: new RegExp(".*" + search + ".*", "i"),
                            },
                        },
                    ],
                })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "category",
                    populate: { path: "catalog" },
                })
                .populate({
                    path: "reviews",
                    populate: { path: "user" },
                });
            const countDocument = await ProductModel.countDocuments({
                $or: [
                    { name: { $regex: new RegExp(".*" + search + ".*", "i") } },
                    {
                        keywords: {
                            $regex: new RegExp(".*" + search + ".*", "i"),
                        },
                    },
                ],
            });
            res.status(200).json({
                success: true,
                countDocument,
                resultPerPage: limit,
                products: products,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    searchV2: async(req, res) => {
        try {
            var page = req.query.page * 1;
            var limit = req.query.limit * 1;
            let search = req.query.q;
            if ((limit && !page) || (page == 0 && limit == 0)) {
                page = 1;
            }
            if (!page && !limit) {
                page = 1;
                limit = 0;
            }
            var skip = (page - 1) * limit;
            const products = await ProductModel.find({
                    $or: [
                        { name: { $regex: new RegExp(".*" + search + ".*", "i") } },
                        {
                            keywords: {
                                $regex: new RegExp(".*" + search + ".*", "i"),
                            },
                        },
                    ],
                })
                .skip(skip)
                .limit(limit);
            const countDocument = await ProductModel.countDocuments({
                $or: [
                    { name: { $regex: new RegExp(".*" + search + ".*", "i") } },
                    {
                        keywords: {
                            $regex: new RegExp(".*" + search + ".*", "i"),
                        },
                    },
                ],
            });
            res.status(200).json({
                success: true,
                countDocument,
                resultPerPage: limit,
                products: products,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    updateAllProduct: async(req, res) => {
        try {
            const product = await ProductModel.findByIdAndUpdate(
                req.params.id, { detail: req.body.detail }, { new: true }
            );
            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    addFavorites: async(req, res) => {
        try {
            var product = await ProductModel.findById(req.params.id);
            if (!product)
                return res
                    .status(404)
                    .json({ success: false, message: "Không tìm thấy product" });
            const prod = await ProductModel.findByIdAndUpdate(
                req.params.id, { $addToSet: { favorites: req.user.id } }, { new: true }
            );
            console.log(prod.favorites.length);
            prod.likeCount = prod.favorites.length;
            await prod.save();
            // product.update({ $push: { favorites: req.user.id } }, { new: true });
            // product.save();
            const user = await UserModel.findByIdAndUpdate(
                req.user.id, { $addToSet: { favorites: req.params.id } }, { new: true }
            );
            res.status(200).json({
                success: true,
                message: "Cập nhật sở thích thành công !",
                product: prod,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    removeFavorites: async(req, res) => {
        try {
            var product = await ProductModel.findById(req.params.id);
            if (!product)
                return res
                    .status(404)
                    .json({ success: false, message: "Không tìm thấy product" });
            const prod = await ProductModel.findByIdAndUpdate(
                req.params.id, { $pull: { favorites: req.user.id } }, { new: true }
            );
            prod.likeCount = prod.favorites.length;
            await prod.save();
            const user = await UserModel.findByIdAndUpdate(
                req.user.id, { $pull: { favorites: req.params.id } }, { new: true }
            );
            res.status(200).json({
                success: true,
                message: "Cập nhật sở thích thành công !",
                product: prod,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
};

export default productController;