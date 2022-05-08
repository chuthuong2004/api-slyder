import express from "express";
import categoryController from "../controllers/categoryController.js";
const router = express.Router();

// * GET ALL CATEGORY --- PAGINATION
router.get("/categories", categoryController.getAllCategoryV2);

// * GET CATEGORY DETAILS
router.get("/category/:id", categoryController.getCategoryDetailsV2);

export default router;