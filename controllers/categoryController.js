import { CatalogModel } from "../models/CatalogModel.js";
import { CategoryModel } from "../models/CategoryModel.js";
const categoryController = {
    getAllCategory: async(req, res) => {
        try {
            const categories = await CategoryModel.find();
            console.log('Category', categories);
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    getCategory: async(req, res) => {
        try {
            const category = await CategoryModel.findById(req.params.id).populate('products').populate('catalog');
            res.status(200).json(category);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    addCategory: async(req, res) => {
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
            // return res.status(200).json(newCategory)
            const category = new CategoryModel(newCategory);
            await category.save();
            if (req.body.catalog) {
                const catalog = await CatalogModel.findById(req.body.catalog);
                if (catalog) await catalog.updateOne({ $push: { categories: category._id } });

            }
            res.status(200).json(category);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    updateCategory: async(req, res) => {
        try {
            const updateCategory = req.body;
            if (req.file) {
                categoryUrl = process.env.API + 'public/categories/' + req.file.filename;
            }
            const category = await CategoryModel.findOneAndUpdate({ _id: req.params.id }, updateCategory, { new: true });
            await category.save();
            if (req.body.catalog) {
                const catalog = await CatalogModel.findById(req.body.catalog);
                await catalog.updateOne({ $push: { categories: category._id } })
            }
            res.status(200).json(category);
        } catch (err) {
            res.status(500).json({ error: error });
        }
    },
    deleteCategory: async(req, res) => {
        try {
            await CatalogModel.updateMany({
                categories: req.params.id
            }, {
                $pull: { categories: req.params.id }
            })
            await CategoryModel.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: 'Deleted category successfully' })
        } catch (err) {
            res.status(500).json({ error: error });
        }
    }
}
export default categoryController;