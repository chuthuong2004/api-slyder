import { CatalogModel } from "../models/CatalogModel.js";
import { CategoryModel } from "../models/CategoryModel.js";
import { ProductModel } from "../models/ProductModel.js";
const categoryController = {

    // ! GET ALL CATEGORIES --- PAGINATION
    getAllCategory: async(req, res) => {
        try {
            const resultPerPage = 8;
            const categoriesCount = await CategoryModel.countDocuments();
            const categories = await CategoryModel.find().populate({
                path: 'catalog'
            }).populate({
                path: 'products',
                populate: { path: 'reviews' }
            });
            res.status(200).json({
                success: true,
                categoriesCount,
                resultPerPage,
                categories
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * GET CATEGORY DETAILS
    getCategoryDetails: async(req, res) => {
        try {
            const category = await CategoryModel.findById(req.params.id).populate({
                path: 'catalog'
            }).populate({
                path: 'products',
                populate: { path: 'reviews' }
            });
            if (!category) return res.status(404).json({
                success: false,
                message: 'Category not found'
            })
            res.status(200).json({
                success: true,
                category
            })
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * GET ALL CATEGORIES --- ADMIN
    getAdminCategories: async(req, res) => {
        try {
            const categories = await CategoryModel.find();
            res.status(200).json({
                success: true,
                categories
            })
        } catch (error) {
            res.status(500).json({ error: error })
        }
    },

    // * CREATE CATEGORY --- ADMIN
    createCategory: async(req, res) => {
        try {
            let categoryUrl;
            if (req.file) {
                categoryUrl = process.env.API + 'public/categories/' + req.file.filename;
            }
            const newCategory = {
                name: req.body.name,
                catalog: req.body.catalog,
                imageCate: categoryUrl,
            };
            const category = new CategoryModel(newCategory);
            await category.save();
            if (req.body.catalog) {
                const catalog = await CatalogModel.findById(req.body.catalog);
                if (catalog) await catalog.updateOne({ $push: { categories: category._id } });
            }
            res.status(200).json({
                success: true,
                category
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * UPDATE CATEGORY 
    updateCategory: async(req, res) => {
        try {
            const newCategory = req.body;
            if (req.file) {
                newCategory.imageCate = process.env.API + 'public/categories/' + req.file.filename;
            }
            const category = await CategoryModel.findOne({ _id: req.params.id });
            if (req.body.catalog) { // nếu có catalog
                var currentCatalog = category.catalog;
                // xóa category khỏi catalog cũ
                await CategoryModel.findOneAndUpdate({ _id: currentCatalog }, { $pull: { categories: category._id } })

                // và đẩy category vào catalog mới
                const catalog = await CatalogModel.findById(req.body.catalog);
                await catalog.updateOne({ $push: { categories: category._id } })
                    // await catalog.updateOne({ $addToSet: { categories: category._id } })
            }
            await category.updateOne({ _id: req.params.id }, newCategory, { new: true });

            res.status(200).json({
                success: true,
                category
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // ! handle delete image
    deleteCategory: async(req, res) => {
        try {
            await CatalogModel.updateMany({
                categories: req.params.id
            }, {
                $pull: { categories: req.params.id }
            })
            await ProductModel.updateOne({
                category: req.params.id,
            }, { category: null })
            await CategoryModel.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: 'Deleted category successfully' })
        } catch (err) {
            res.status(500).json({ error: err });
        }
    }
}
export default categoryController;