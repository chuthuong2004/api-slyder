import express from "express";
import productController from "../controllers/productController.js";
const router = express.Router();

// * GET ALL PRODUCTS ---- PAGINATION ---DONE---
router.get("/products", productController.getAllProductV2);

// * GET PRODUCT DETAIL
router.get("/product/:id", productController.getProductDetailsV2);

// * GET ALL PRODUCT BY CATEGORY
router.get("/products/:idCate", productController.getAllProductByCategory);

// * SEARCH PRODUCTS
router.get("/products/search", productController.searchV2);
export default router;