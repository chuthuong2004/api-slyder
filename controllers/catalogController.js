import { CatalogModel } from "../models/CatalogModel.js";
import { CategoryModel } from "../models/CategoryModel.js";
import { APIFeatures } from "../utils/APIFeatures.js";

const catalogController = {
    // * GET ALL CATALOG --- PAGINATION
    getAllCatalog: async(req, res) => {
        try {
            const features = new APIFeatures(
                CatalogModel.find().populate({
                    path: "categories",
                    populate: {
                        path: "products",
                        populate: {
                            path: "reviews",
                            populate: { path: "user" },
                        },
                    },
                }),
                req.query
            );
            const catalogs = await features.query;
            res.status(200).json({
                success: true,
                countDocument: catalogs.length,
                resultPerPage: req.query.limit * 1 || 0,
                data: catalogs,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    getAllCatalogV2: async(req, res) => {
        try {
            const features = new APIFeatures(CatalogModel.find(), req.query);
            const catalogs = await features.query;
            res.status(200).json({
                success: true,
                countDocument: catalogs.length,
                resultPerPage: req.query.limit * 1 || 0,
                data: catalogs,
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

    getCatalogV2: async(req, res) => {
        try {
            const catalog = await CatalogModel.findById(req.params.id);
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
            await CategoryModel.updateMany({ catalog: req.params.id }, { catalog: null });
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