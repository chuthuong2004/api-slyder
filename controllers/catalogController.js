import { CatalogModel } from "../models/CatalogModel.js";
import { CategoryModel } from "../models/CategoryModel.js";

const catalogController = {
    getAllCatalog: async(req, res) => {
        try {
            const catalogs = await CatalogModel.find().populate({
                path: 'categories',
                populate: {
                    path: 'products',
                    populate: {
                        path: 'reviews',
                        populate: { path: 'user' }
                    }
                }
            });
            console.log('Catalog', catalogs);
            res.status(200).json(catalogs);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    getCatalog: async(req, res) => {
        try {
            const catalog = await CatalogModel.findById(req.params.id).populate('categories');
            res.status(200).json(catalog);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    addCatalog: async(req, res) => {
        try {
            const newCatalog = req.body;
            const catalog = new CatalogModel(newCatalog);
            await catalog.save();
            return res.status(200).json(catalog);

        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    updateCatalog: async(req, res) => {
        try {
            const updateCatalog = req.body;
            const catalog = await CatalogModel.findOneAndUpdate({ _id: req.params.id }, updateCatalog, { new: true });
            await catalog.save();
            res.status(200).json(catalog);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    deleteCatalog: async(req, res) => {
        try {
            await CategoryModel.updateOne({ catalog: req.params.id }, { catalog: null });
            await CatalogModel.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: 'Deleted catalog successfully' })
        } catch (err) {
            res.status(500).json({ error: error });
        }
    }
}
export default catalogController;