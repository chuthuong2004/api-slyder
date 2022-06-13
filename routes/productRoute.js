import express from "express";
import productController from "../controllers/productController.js";
import middlewareController from "../middlewares/middlewareController.js";
const router = express.Router();

// * GET ALL PRODUCTS ---- PAGINATION ---DONE---
router.get("/products", productController.getAllProductV2);

// * GET PRODUCT DETAIL
router.get("/product/:id", productController.getProductDetailsV2);

// * GET ALL PRODUCT BY CATEGORY
router.get("/products/:idCate", productController.getAllProductByCategory);

// * UPDATE PRODUCTS FAVORITES
router.put(
    "/products/favorite/add/:id",
    middlewareController.verifyToken,
    productController.addFavorites
);
router.put(
    "/products/favorite/remove/:id",
    middlewareController.verifyToken,
    productController.removeFavorites
);
export default router;