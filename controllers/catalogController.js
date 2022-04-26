import { CatalogModel } from "../models/CatalogModel.js";
import { CategoryModel } from "../models/CategoryModel.js";

const catalogController = {
    // ! GET ALL CATALOG --- PAGINATION
    getAllCatalog: async(req, res) => {
        try {
            const resultPerPage = 8;
            const catalogsCount = await CatalogModel.countDocuments();
            const catalogs = await CatalogModel.find().populate({
                path: "categories",
                populate: {
                    path: "products",
                    populate: {
                        path: "reviews",
                        populate: { path: "user" },
                    },
                },
            });
            res.status(200).json({
                success: true,
                catalogsCount,
                resultPerPage,
                catalogs,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * GET ALL CATALOGS --- ADMIN
    getAdminCatalogs: async(req, res) => {
        try {
            const catalogs = await CatalogModel.find();
            res.status(200).json({
                success: true,
                catalogs,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * GET CATALOG DETAILS
    getCatalog: async(req, res) => {
        try {
            const catalog = await CatalogModel.findById(req.params.id).populate({
                path: "categories",
                populate: {
                    path: "products",
                    populate: { path: "reviews", populate: { path: "user" } },
                },
            });
            res.status(200).json({
                success: true,
                catalog,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * CREATE CATALOG
    addCatalog: async(req, res) => {
        try {
            const newCatalog = req.body;
            const catalog = new CatalogModel(newCatalog);
            await catalog.save();
            return res.status(200).json({
                success: true,
                catalog,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * UPDATE CATALOG
    updateCatalog: async(req, res) => {
        try {
            const updateCatalog = req.body;
            const catalog = await CatalogModel.findOneAndUpdate({ _id: req.params.id },
                updateCatalog, { new: true }
            );
            res.status(200).json({
                success: true,
                catalog,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * DELETE CATALOG
    deleteCatalog: async(req, res) => {
        try {
            await CategoryModel.updateOne({ catalog: req.params.id }, { catalog: null });
            await CatalogModel.findByIdAndDelete(req.params.id);
            res.status(200).json({
                success: true,
                message: "Đã xóa mục lục thành công !",
            });
        } catch (err) {
            res.status(500).json({ error: error });
        }
    },
};
export default catalogController;